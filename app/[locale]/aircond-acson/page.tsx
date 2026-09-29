import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { localeHref } from '@/lib/localeHref';
import { ogImages } from '@/lib/ogImage';
import { siteConfig } from '@/config/site';
import { locationsInState, states } from '@/config/locations';
import SiteHeader from '@/components/SiteHeader';
import ContactNumber from '@/components/ContactNumber';
import SiteFooter from '@/components/SiteFooter';
import FomoBanner from '@/components/FomoBanner';
import PageStyles from '@/components/PageStyles';
import StickyWhatsApp from '@/components/StickyWhatsApp';
import FinalCta from '@/components/sections/FinalCta';
import { withSeoOverride } from '@/lib/webcoreSeo';

const PATH = `/${siteConfig.productSlug}`;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta.coverage' });
  const languages: Record<string, string> = Object.fromEntries(
    routing.locales.map((l) => [l, `${localeHref(l)}${PATH}`]),
  );
  languages['x-default'] = `${localeHref(routing.defaultLocale)}${PATH}`;
  return withSeoOverride(locale, PATH, {
    title: t('title'),
    description: t('description'),
    alternates: { canonical: `${localeHref(locale)}${PATH}`, languages },
    openGraph: {
      type: 'website',
      url: `${localeHref(locale)}${PATH}`,
      siteName: siteConfig.brandName,
      title: t('title'),
      description: t('description'),
      images: ogImages(locale),
    },
    twitter: { card: 'summary_large_image', images: ogImages(locale) },
  });
}

export default async function CoverageIndex({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'coverage' });
  const navT = await getTranslations({ locale, namespace: 'nav' });

  return (
    <>
      <PageStyles />
      <FomoBanner />
      <SiteHeader contact={<ContactNumber locale={locale} page={`/${siteConfig.productSlug}`} />} />

      <main>
        <section className="py-14 md:py-20 bg-[var(--color-gray-50)] border-b border-[var(--color-border)]">
          <div className="container-page section-body text-center">
            <nav className="breadcrumb justify-center" aria-label="Breadcrumb">
              <Link href={`/${locale}`}>{navT('home')}</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{navT('locations')}</span>
            </nav>
            <h1 className="font-heading text-4xl md:text-5xl text-[var(--color-text-dark)]">
              {t('indexTitle')}
            </h1>
            <h2 className="text-base md:text-lg font-normal text-[var(--color-text-body)] mt-3 max-w-2xl mx-auto">
              {t('indexSubtitle')}
            </h2>
          </div>
        </section>

        <section className="py-14 md:py-20 bg-white">
          <div className="container-page section-body">
            {states.map((state) => {
              const towns = locationsInState(state.slug);
              return (
                <div key={state.slug} id={state.slug} className="state-block">
                  <h3 className="state-block__heading">
                    {state.name}
                    <span className="state-block__count">
                      {t('townsLabel', { count: towns.length })}
                    </span>
                  </h3>
                  <div className="loc-grid">
                    {towns.map((town) => (
                      <Link
                        key={town.slug}
                        href={`/${locale}/${siteConfig.productSlug}/${town.slug}`}
                      >
                        {town.name}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <FinalCta locale={locale} />
      </main>

      <SiteFooter locale={locale} page={`/${siteConfig.productSlug}`} />
      <StickyWhatsApp />
    </>
  );
}
