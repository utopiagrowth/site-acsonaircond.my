import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { localeHref } from '@/lib/localeHref';
import { ogImages } from '@/lib/ogImage';
import { siteConfig } from '@/config/site';
import { getProducts } from '@/lib/webcore';
import { waRedirect } from '@/lib/waRedirect';
import { WhatsAppButton, WaIcon } from '@/components/WhatsAppButton';
import SiteHeader from '@/components/SiteHeader';
import ContactNumber from '@/components/ContactNumber';
import SiteFooter from '@/components/SiteFooter';
import FomoBanner from '@/components/FomoBanner';
import PageStyles from '@/components/PageStyles';
import StickyWhatsApp from '@/components/StickyWhatsApp';
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
import CoverageSection from '@/components/sections/CoverageSection';
import FaqSection from '@/components/sections/FaqSection';
import FinalCta from '@/components/sections/FinalCta';
import { withSeoOverride } from '@/lib/webcoreSeo';

const HERO_CHIP_TARGETS = ['#produk', '#servis', '#sewa-beli'];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta.home' });
  const languages: Record<string, string> = Object.fromEntries(
    routing.locales.map((l) => [l, localeHref(l)]),
  );
  languages['x-default'] = localeHref(routing.defaultLocale);
  return withSeoOverride(locale, '', {
    title: t('title'),
    description: t('description'),
    alternates: { canonical: localeHref(locale), languages },
    openGraph: {
      type: 'website',
      url: localeHref(locale),
      siteName: siteConfig.brandName,
      title: t('title'),
      description: t('description'),
      images: ogImages(locale),
    },
    twitter: { card: 'summary_large_image', images: ogImages(locale) },
  });
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'hero' });
  const faqT = await getTranslations({ locale, namespace: 'faq' });
  const { core, additional } = await getProducts();
  const products = [...core, ...additional];
  const chips = t.raw('chips') as string[];
  const stats = t.raw('stats') as { value: string; label: string }[];
  const faqItems = faqT.raw('items') as { q: string; a: string }[];

  return (
    <>
      <PageStyles />
      <FomoBanner />
      <SiteHeader contact={<ContactNumber locale={locale} page={'/'} />} />
      <FAQSchema items={faqItems.map((f) => ({ q: f.q, a: f.a }))} />
      <LocalBusinessSchema
        locale={locale}
        locationName="Malaysia"
        locationSlug=""
        state="Malaysia"
      />

      <main>
        {/* ---- Hero: the page's only h1 + h2 ---- */}
        <section className="hero relative min-h-[70vh] md:min-h-[78vh] flex items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/hero/technician-install.png')" }}
            role="img"
            aria-label={t('bgAlt')}
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-black/50"
            aria-hidden="true"
          />

          <div className="relative z-10 container-page section-body max-w-4xl text-center pt-16 pb-32">
            <h6 className="body-text text-white/70 text-sm font-semibold tracking-widest uppercase mb-4">
              {t('eyebrow')}
            </h6>

            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white mb-6">
              {t('title')}
            </h1>

            <h2 className="text-white/80 text-lg md:text-xl font-normal max-w-2xl mx-auto mb-8">
              {t('subtitle')}
            </h2>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
              <WhatsAppButton href={waRedirect(locale)} label="hero" className="btn-wa text-base">
                <WaIcon size={20} /> {t('ctaPrimary')}
              </WhatsAppButton>
              <a href="#produk" className="btn-secondary border-white/40 bg-transparent text-white">
                {t('ctaSecondary')}
              </a>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {chips.map((chip, i) => (
                <a
                  key={chip}
                  href={HERO_CHIP_TARGETS[i]}
                  className="bg-white/10 backdrop-blur-sm text-white/90 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/20 transition-colors"
                >
                  {chip}
                </a>
              ))}
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 z-10">
            <div className="container-page max-w-5xl">
              <div className="bg-white/92 backdrop-blur-md rounded-t-2xl shadow-lg px-6 py-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                  {stats.map((stat) => (
                    <div key={stat.label} className="text-center">
                      <div className="text-xl md:text-2xl font-bold text-[var(--color-brand)]">
                        {stat.value}
                      </div>
                      <div className="text-xs text-[var(--color-text-muted)] font-medium">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <UspBar locale={locale} />
        <TrustStrip locale={locale} />
        <ProductGrid products={products} />
        <ProcessSteps locale={locale} />
        <RentToOwn locale={locale} />
        <ServicesRows locale={locale} />
        <WhyAcson locale={locale} />
        <BeforeAfter />
        <Gallery locale={locale} />
        <TeamSection locale={locale} />
        <Reviews locale={locale} />
        <CoverageSection locale={locale} />
        <FaqSection />
        <FinalCta locale={locale} />
      </main>

      <SiteFooter locale={locale} page={'/'} />
      <StickyWhatsApp />
    </>
  );
}
