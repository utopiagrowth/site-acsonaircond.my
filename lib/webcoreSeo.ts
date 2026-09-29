// Per-page SEO overrides from webcore.
//
// Webcore's SEO page lets an editor set a page's meta title, description and
// share image without touching this repo. Each row is keyed by the page's
// public path — `/` for the Malay homepage and `/en/aircond-acson/klcc` for an
// English location page — plus the language. A page with no row keeps the metadata it builds itself.
//
// Read through webcore's public API rather than Supabase REST: the anon key
// this site holds gets nothing back from `seo_overrides`. That GET is cached
// on webcore's CDN for 5 minutes, so the request carries a unique buster and
// the freshness comes from Next's cache instead — tagged `webcore-seo`, which
// /api/revalidate flushes when webcore pings. No time-based ISR.

import type { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import { siteConfig } from '@/config/site';
import { routing } from '@/i18n/routing';

const WEBCORE_BASE = 'https://webcore.utopiagroup.com.my';
const FETCH_TIMEOUT_MS = 6000;

interface Override {
  path: string;
  language: string;
  title: string | null;
  description: string | null;
  og_image: string | null;
  is_pattern: boolean;
}

// Throws on any failure so an outage is never cached as "no overrides".
async function fetchOverrides(): Promise<Override[]> {
  const url =
    `${WEBCORE_BASE}/api/public/seo?website=${encodeURIComponent(siteConfig.domain)}` +
    `&_=${Date.now()}`;
  const res = await Promise.race([
    fetch(url, { cache: 'no-store' }),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('webcore seo timeout')), FETCH_TIMEOUT_MS),
    ),
  ]);
  if (!res.ok) throw new Error(`webcore seo ${res.status}`);
  const rows = (await res.json()) as Override[];
  return rows.filter((r) => !r.is_pattern);
}

// Concurrent callers share one request in flight. Without this, a build
// prerendering hundreds of pages sent hundreds of simultaneous requests (a
// failure is not cached, so every page retried) and some timed out, baking
// those pages with their built-in copy. Cleared on settle, so freshness is
// still Next's cache and the webcore-seo tag, not this.
let inflight: Promise<Override[]> | null = null;

function fetchOverridesShared(): Promise<Override[]> {
  if (!inflight) {
    inflight = fetchOverrides().finally(() => {
      inflight = null;
    });
  }
  return inflight;
}

const getOverrides = unstable_cache(fetchOverridesShared, ['webcore-seo-overrides'], {
  tags: ['webcore-seo'],
});

/**
 * Layer the webcore override for this page over the metadata the page built.
 * Only fields the override sets are replaced; Open Graph and Twitter copy
 * follow so a shared link says the same as the search result.
 */
export async function withSeoOverride(
  locale: string,
  path: string,
  meta: Metadata,
): Promise<Metadata> {
  let rows: Override[];
  try {
    rows = await getOverrides();
  } catch (err) {
    console.error('[webcore] seo overrides unavailable:', err);
    return meta;
  }
  const key = (locale === routing.defaultLocale ? '' : `/${locale}`) + path || '/';
  const o = rows.find((r) => r.path === key && r.language === locale);
  if (!o) return meta;

  const merged: Metadata = { ...meta };
  const og = { ...(meta.openGraph ?? {}) } as NonNullable<Metadata['openGraph']>;
  const tw = { ...(meta.twitter ?? {}) } as NonNullable<Metadata['twitter']>;
  // A share card only follows when the editor actually changed the copy: blog
  // articles deliberately share the article title rather than the SEO title.
  if (o.title) {
    merged.title = { absolute: o.title };
    if (o.title !== meta.title) {
      og.title = o.title;
      tw.title = o.title;
    }
  }
  if (o.description) {
    merged.description = o.description;
    if (o.description !== meta.description) {
      og.description = o.description;
      tw.description = o.description;
    }
  }
  if (o.og_image) {
    og.images = [o.og_image];
    tw.images = [o.og_image];
  }
  // Next replaces a parent's openGraph/twitter wholesale instead of merging, so
  // a page that sets none of its own (home, /blog) must not return
  // one, or the layout's image, url and site name vanish from the share card.
  if (meta.openGraph || o.og_image) merged.openGraph = og;
  if (meta.twitter || o.og_image) merged.twitter = tw;
  return merged;
}
