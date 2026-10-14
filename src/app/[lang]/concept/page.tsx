import { notFound } from "next/navigation";
import { AVAILABLE_LOCALES, isAvailableLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import KasbahInterior from "@/components/kasbah-interior";
import BrandMark from "@/components/brand-mark";
import { buildPageMetadata, CONCEPT_DESCRIPTIONS, CONCEPT_TITLES } from "@/lib/seo";
import type { AvailableLocale } from "@/i18n/config";

export async function generateStaticParams() {
  return AVAILABLE_LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isAvailableLocale(lang)) return {};
  const locale = lang as AvailableLocale;
  return buildPageMetadata({
    locale,
    // No bare /concept canonical: next.config 302s it to /fr/concept.
    canonicalPath: `/${locale}/concept`,
    pathFor: (l) => `/${l}/concept`,
    title: CONCEPT_TITLES[locale],
    description: CONCEPT_DESCRIPTIONS[locale],
  });
}

export default async function ConceptPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isAvailableLocale(lang)) notFound();
  const dict = await getDictionary(lang as Locale);

  const homePath = lang === "fr" ? "/" : `/${lang}`;

  return (
    <main className="zellige-bg relative h-dvh overflow-hidden" lang={lang}>
      {/* ---------- The whole page IS the free-explore 3D interior ---------- */}
      <KasbahInterior dict={dict} />

      {/* ---------- Brand + link back to the main page ---------- */}
      <BrandMark
        href={homePath}
        badge={
          <a
            href={homePath}
            className="max-md:hidden inline-flex items-center gap-2 rounded-full border border-sand/25 bg-background/60 px-4 py-2 text-xs uppercase tracking-[0.2em] text-sand/80 backdrop-blur-sm transition-colors hover:border-gold/60 hover:text-gold"
          >
            {dict.concept.backToTour}
          </a>
        }
      />
    </main>
  );
}
