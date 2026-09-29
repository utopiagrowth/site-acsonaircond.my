import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { localeHref } from '@/lib/localeHref';
import { ogImages } from '@/lib/ogImage';
import { siteConfig } from '@/config/site';
import { getBlogPosts } from '@/lib/webcore';
import { waRedirect } from '@/lib/waRedirect';
import { WhatsAppButton, WaIcon } from '@/components/WhatsAppButton';
import SiteHeader from '@/components/SiteHeader';
import ContactNumber from '@/components/ContactNumber';
import SiteFooter from '@/components/SiteFooter';
import FomoBanner from '@/components/FomoBanner';
import PageStyles from '@/components/PageStyles';
import StickyWhatsApp from '@/components/StickyWhatsApp';
import BlogLinkTracker from '@/components/tracking/BlogLinkTracker';
import { withSeoOverride } from '@/lib/webcoreSeo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta.blogListing' });
  const languages: Record<string, string> = Object.fromEntries(
    routing.locales.map((l) => [l, `${localeHref(l)}/blog`]),
  );
  languages['x-default'] = `${localeHref(routing.defaultLocale)}/blog`;
  return withSeoOverride(locale, '/blog', {
    title: t('title'),
    description: t('description'),
    alternates: { canonical: `${localeHref(locale)}/blog`, languages },
    openGraph: {
      type: 'website',
      url: `${localeHref(locale)}/blog`,
      siteName: siteConfig.brandName,
      title: t('title'),
      description: t('description'),
      images: ogImages(locale),
    },
    twitter: { card: 'summary_large_image', images: ogImages(locale) },
  });
}

export default async function BlogListing({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'blog' });
  const posts = await getBlogPosts(locale);

  return (
    <>
      <PageStyles />
      <FomoBanner />
      <SiteHeader contact={<ContactNumber locale={locale} page={'/blog'} />} />

      <main>
        <section className="relative overflow-hidden py-14 md:py-20 bg-[var(--color-gray-50)] border-b border-[var(--color-border)]">
          <div className="container-page section-body text-center">
            <nav className="breadcrumb justify-center" aria-label="Breadcrumb">
              <Link href={`/${locale}`}>{t('breadcrumbHome')}</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{t('breadcrumbBlog')}</span>
            </nav>
            <h1 className="font-heading text-4xl md:text-5xl text-[var(--color-text-dark)]">
              {t('title')}
            </h1>
            <h2 className="text-base md:text-lg font-normal text-[var(--color-text-body)] mt-3 max-w-2xl mx-auto">
              {t('subtitle')}
            </h2>
          </div>
        </section>

        <section className="py-14 md:py-20 bg-white">
          <div className="container-page section-body">
            {posts.length === 0 ? (
              <h6 className="blog-empty body-text">{t('noPosts')}</h6>
            ) : (
              <div className="blog-grid">
                {posts.map((post) => {
                  const tr = post.blog_translations[0];
                  const href = `/${locale}/blog/${post.slug}`;
                  return (
                    <article key={post.id} className="blog-card">
                      {post.cover_image_url && (
                        <BlogLinkTracker slug={post.slug} href={href} className="blog-card__img">
                          <Image
                            src={post.cover_image_url}
                            alt={tr?.title ?? post.slug}
                            width={600}
                            height={338}
                          />
                        </BlogLinkTracker>
                      )}
                      <div className="blog-card__body">
                        <h6 className="blog-card__date body-text">
                          {new Date(post.published_at).toLocaleDateString(locale, {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </h6>
                        <h3 className="blog-card__title">
                          <BlogLinkTracker slug={post.slug} href={href}>
                            {tr?.title}
                          </BlogLinkTracker>
                        </h3>
                        <h6 className="blog-card__excerpt body-text">{tr?.excerpt}</h6>
                        <BlogLinkTracker slug={post.slug} href={href} className="blog-card__link">
                          {t('readMore')} →
                        </BlogLinkTracker>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section className="py-14 bg-[var(--color-gray-50)]">
          <div className="container-page section-body">
            <div className="blog-cta-banner">
              <h3 className="blog-cta-banner__title">{t('ctaBannerTitle')}</h3>
              <h6 className="blog-cta-banner__body body-text">{t('ctaBannerBody')}</h6>
              <WhatsAppButton href={waRedirect(locale, undefined, undefined, 'blog')} label="blog-listing" className="btn-wa">
                <WaIcon /> {t('ctaBannerLabel')}
              </WhatsAppButton>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter locale={locale} page={'/blog'} />
      <StickyWhatsApp />
    </>
  );
}
