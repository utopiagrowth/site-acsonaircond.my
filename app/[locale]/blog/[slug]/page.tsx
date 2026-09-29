import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { siteConfig } from '@/config/site';
import { routing } from '@/i18n/routing';
import { localeHref } from '@/lib/localeHref';
import { ogImages } from '@/lib/ogImage';
import { getBlogPost, getBlogPostSlugs, getRecentBlogPosts } from '@/lib/webcore';
import { waRedirect } from '@/lib/waRedirect';
import { ArticleSchema } from '@/components/schema/ArticleSchema';
import { BreadcrumbSchema } from '@/components/schema/BreadcrumbSchema';
import { WhatsAppButton, WaIcon } from '@/components/WhatsAppButton';
import SiteHeader from '@/components/SiteHeader';
import ContactNumber from '@/components/ContactNumber';
import SiteFooter from '@/components/SiteFooter';
import FomoBanner from '@/components/FomoBanner';
import PageStyles from '@/components/PageStyles';
import StickyWhatsApp from '@/components/StickyWhatsApp';
import { withSeoOverride } from '@/lib/webcoreSeo';

export async function generateStaticParams() {
  const slugs = await getBlogPostSlugs();
  return slugs.flatMap((s) => routing.locales.map((locale) => ({ locale, slug: s.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getBlogPost(slug, locale);
  if (!post) return {};
  const tr = post.blog_translations[0];
  const path = `/blog/${slug}`;
  const languages: Record<string, string> = Object.fromEntries(
    routing.locales.map((l) => [l, `${localeHref(l)}${path}`]),
  );
  languages['x-default'] = `${localeHref(routing.defaultLocale)}${path}`;
  // The article's own cover wins; the locale hero card is the fallback so a
  // shared post never renders as a bare text link.
  const images = post.cover_image_url
    ? [{ url: post.cover_image_url, width: 1200, height: 630 }]
    : ogImages(locale);
  return withSeoOverride(locale, path, {
    title: tr.meta_title || `${tr.title} | ${siteConfig.brandName}`,
    description: tr.meta_description || tr.excerpt,
    alternates: { canonical: `${localeHref(locale)}${path}`, languages },
    openGraph: {
      type: 'article',
      title: tr.title,
      description: tr.excerpt,
      url: `${localeHref(locale)}${path}`,
      siteName: siteConfig.brandName,
      images,
      publishedTime: post.published_at,
    },
    twitter: { card: 'summary_large_image', images },
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const post = await getBlogPost(slug, locale);
  if (!post) notFound();
  const tr = post.blog_translations[0];
  const t = await getTranslations({ locale, namespace: 'blog' });
  const recent = await getRecentBlogPosts(locale, slug, 4);

  const wordCount = (tr.content || '').replace(/<[^>]+>/g, ' ').trim().split(/\s+/).length;
  const readingTime = Math.max(1, Math.round(wordCount / 220));

  return (
    <>
      <PageStyles />
      <FomoBanner />
      <SiteHeader contact={<ContactNumber locale={locale} page={`/blog/${slug}`} />} />
      <ArticleSchema
        locale={locale}
        slug={slug}
        title={tr.title}
        excerpt={tr.excerpt}
        coverImage={post.cover_image_url}
        publishedAt={post.published_at}
      />
      <BreadcrumbSchema
        items={[
          { name: t('breadcrumbHome'), url: localeHref(locale) },
          { name: t('breadcrumbBlog'), url: `${localeHref(locale)}/blog` },
          { name: tr.title, url: `${localeHref(locale)}/blog/${slug}` },
        ]}
      />

      <article>
        <header className="post-header">
          <div className="container-page section-body">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <Link href={`/${locale}`}>{t('breadcrumbHome')}</Link>
              <span aria-hidden="true">/</span>
              <Link href={`/${locale}/blog`}>{t('breadcrumbBlog')}</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{tr.title}</span>
            </nav>
            <h1 className="post-title">{tr.title}</h1>
            <h2 className="post-excerpt font-normal">{tr.excerpt}</h2>
            <h6 className="post-meta body-text">
              <span>
                {t('publishedOn')}{' '}
                {new Date(post.published_at).toLocaleDateString(locale, {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {readingTime} {t('minRead')}
              </span>
            </h6>
          </div>
        </header>

        {post.cover_image_url && (
          <div className="container-page" style={{ paddingTop: 28 }}>
            <Image
              src={post.cover_image_url}
              alt={tr.title}
              width={1200}
              height={630}
              priority
              style={{ width: '100%', height: 'auto', borderRadius: 'var(--r-card)' }}
            />
          </div>
        )}

        <div className="container-page post-body-wrap">
          <div className="post-body">
            <div className="blog-content" dangerouslySetInnerHTML={{ __html: tr.content }} />
            <div className="blog-cta-banner">
              <h3 className="blog-cta-banner__title">{t('ctaBannerTitle')}</h3>
              <h6 className="blog-cta-banner__body body-text">{t('ctaBannerBody')}</h6>
              <WhatsAppButton
                href={waRedirect(locale, undefined, undefined, 'blog')}
                label={`blog-${slug}`}
                className="btn-wa"
              >
                <WaIcon /> {t('ctaBannerLabel')}
              </WhatsAppButton>
            </div>
          </div>

          {recent.length > 0 && (
            <aside className="post-sidebar">
              <h4 className="post-sidebar__heading">{t('recentPosts')}</h4>
              <ul>
                {recent.map((r) => (
                  <li key={r.slug}>
                    <Link href={`/${locale}/blog/${r.slug}`}>{r.blog_translations[0]?.title}</Link>
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </div>
      </article>

      <SiteFooter locale={locale} page={`/blog/${slug}`} />
      <StickyWhatsApp />
    </>
  );
}
