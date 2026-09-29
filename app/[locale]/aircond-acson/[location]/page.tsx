import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { localeHref } from '@/lib/localeHref';
import { ogImages } from '@/lib/ogImage';
import { siteConfig } from '@/config/site';
import { locationBySlug, locations, locationsInState, stateImage } from '@/config/locations';
import { getProducts } from '@/lib/webcore';
import { waRedirect } from '@/lib/waRedirect';
import { WhatsAppButton, WaIcon } from '@/components/WhatsAppButton';
import SiteHeader from '@/components/SiteHeader';
import ContactNumber from '@/components/ContactNumber';
import SiteFooter from '@/components/SiteFooter';
import FomoBanner from '@/components/FomoBanner';
import PageStyles from '@/components/PageStyles';
import StickyWhatsApp from '@/components/StickyWhatsApp';
import { BreadcrumbSchema } from '@/components/schema/BreadcrumbSchema';
import { FAQSchema } from '@/components/schema/FAQSchema';
import { LocalBusinessSchema } from '@/components/schema/LocalBusinessSchema';
import UspBar from '@/components/sections/UspBar';
import TrustStrip from '@/components/sections/TrustStrip';
import ProductGrid from '@/components/sections/ProductGrid';
import ProcessSteps from '@/components/sections/ProcessSteps';
import RentToOwn from '@/components/sections/RentToOwn';
import ServicesRows from '@/components/sections/ServicesRows';
import WhyAcson from '@/components/sections/WhyAcson';
import BeforeAfter from '@/components/sections/BeforeAfter';
import Gallery from '@/components/sections/Gallery';
import TeamSection from '@/components/sections/TeamSection';
import Reviews from '@/components/sections/Reviews';
import FaqSection from '@/components/sections/FaqSection';
import FinalCta from '@/components/sections/FinalCta';
import { withSeoOverride } from '@/lib/webcoreSeo';

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    locations.map((l) => ({ locale, location: l.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; location: string }>;
}): Promise<Metadata> {
  const { locale, location } = await params;
  const loc = locationBySlug(location);
  if (!loc) return {};
  const t = await getTranslations({ locale, namespace: 'meta.location' });
  const path = `/${siteConfig.productSlug}/${loc.slug}`;
  const languages: Record<string, string> = Object.fromEntries(
    routing.locales.map((l) => [l, `${localeHref(l)}${path}`]),
  );
  languages['x-default'] = `${localeHref(routing.defaultLocale)}${path}`;
  const vars = { location: loc.name, state: loc.state };
  return withSeoOverride(locale, path, {
    title: t('title', vars),
    description: t('description', vars),
    alternates: { canonical: `${localeHref(locale)}${path}`, languages },
    openGraph: {
      type: 'website',
      url: `${localeHref(locale)}${path}`,
      siteName: siteConfig.brandName,
      title: t('title', vars),
      description: t('description', vars),
      images: ogImages(locale),
    },
    twitter: { card: 'summary_large_image', images: ogImages(locale) },
  });
}

export default async function LocationPage({
  params,
}: {
  params: Promise<{ locale: string; location: string }>;
}) {
  const { locale, location } = await params;
  const loc = locationBySlug(location);
  if (!loc) notFound();

  const t = await getTranslations({ locale, namespace: 'location' });
  const navT = await getTranslations({ locale, namespace: 'nav' });
  const { core, additional } = await getProducts();
  const products = [...core, ...additional];
  const vars = { location: loc.name, state: loc.state };

  const faqItems = (t.raw('faq') as { q: string; a: string }[]).map((item) => ({
    q: item.q.replace(/\{location\}/g, loc.name).replace(/\{state\}/g, loc.state),
    a: item.a.replace(/\{location\}/g, loc.name).replace(/\{state\}/g, loc.state),
  }));

  const nearby = locationsInState(loc.stateSlug).filter((l) => l.slug !== loc.slug);

  return (
    <>
      <PageStyles />
      <FomoBanner />
      <SiteHeader contact={<ContactNumber locale={locale} page={`/${siteConfig.productSlug}/${loc.slug}`} />} />
      <LocalBusinessSchema
        locale={locale}
        locationName={loc.name}
        locationSlug={loc.slug}
        state={loc.state}
      />
      <FAQSchema items={faqItems} />
      <BreadcrumbSchema
        items={[
          { name: navT('home'), url: localeHref(locale) },
          { name: navT('locations'), url: `${localeHref(locale)}/${siteConfig.productSlug}` },
          { name: loc.name, url: `${localeHref(locale)}/${siteConfig.productSlug}/${loc.slug}` },
        ]}
      />

      <main>
        <section className="loc-hero">
          <div
            className="loc-hero__bg"
            style={{ backgroundImage: `url('${stateImage(loc.stateSlug)}')` }}
            role="img"
            aria-label={t('bgAlt', vars)}
          />
          <div className="loc-hero__scrim" aria-hidden="true" />
          <div className="container-page section-body loc-hero__inner">
            <nav className="breadcrumb breadcrumb--onDark justify-center" aria-label="Breadcrumb">
              <Link href={`/${locale}`}>{navT('home')}</Link>
              <span aria-hidden="true">/</span>
              <Link href={`/${locale}/${siteConfig.productSlug}`}>{t('breadcrumbCoverage')}</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{loc.name}</span>
            </nav>
            <h6 className="loc-hero__eyebrow body-text">{t('eyebrow', vars)}</h6>
            <h1 className="loc-hero__title">{t('title', vars)}</h1>
            <h2 className="loc-hero__subtitle">{t('subtitle', vars)}</h2>
            <WhatsAppButton
              href={waRedirect(locale, undefined, loc.slug)}
              label={`location-${loc.slug}`}
              className="btn-wa"
            >
              <WaIcon /> {t('ctaLabel')}
            </WhatsAppButton>
          </div>
        </section>

        <UspBar locale={locale} />
        <TrustStrip locale={locale} />

        <section className="py-12 bg-white">
          <div className="container-page section-body max-w-3xl">
            <h6 className="body-text text-[var(--color-text-body)] text-base md:text-lg">
              {t('intro', vars)}
            </h6>
          </div>
        </section>

        <ProductGrid products={products} locationSlug={loc.slug} />
        <ProcessSteps locale={locale} locationSlug={loc.slug} />
        <RentToOwn locale={locale} locationSlug={loc.slug} />
        <ServicesRows locale={locale} locationSlug={loc.slug} />
        <WhyAcson locale={locale} />
        <BeforeAfter />
        <Gallery locale={locale} locationSlug={loc.slug} />
        <TeamSection locale={locale} locationSlug={loc.slug} />
        <Reviews locale={locale} />

        {nearby.length > 0 && (
          <section className="py-14 md:py-20 bg-[var(--color-gray-50)]">
            <div className="container-page section-body">
              <h3 className="state-block__heading">{t('nearbyHeading', vars)}</h3>
              <div className="loc-grid">
                {nearby.map((town) => (
                  <Link
                    key={town.slug}
                    href={`/${locale}/${siteConfig.productSlug}/${town.slug}`}
                  >
                    {town.name}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <FaqSection heading={t('faqHeading', vars)} items={faqItems} />
        <FinalCta locale={locale} locationSlug={loc.slug} heading={t('ctaHeading', vars)} />
      </main>

      <SiteFooter locale={locale} page={`/${siteConfig.productSlug}/${loc.slug}`} />
      <StickyWhatsApp locationSlug={loc.slug} />
    </>
  );
}
