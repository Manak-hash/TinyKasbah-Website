import type { Metadata } from "next";
import { AVAILABLE_LOCALES, DEFAULT_LOCALE, type AvailableLocale } from "@/i18n/config";

export const SITE_URL = "https://www.terrevolution.ma";

/**
 * Path (starting with "/") for the canonical home of a locale.
 * FR is served at the bare root (see src/proxy.ts), the others at /{lang}.
 */
export function localeHomePath(locale: AvailableLocale): string {
  return locale === DEFAULT_LOCALE ? "/" : `/${locale}`;
}

/**
 * hreflang alternates map for a given route family.
 * FR canonicalizes to the bare root; x-default points at the default locale.
 */
function languageAlternates(pathFor: (locale: AvailableLocale) => string) {
  return {
    ...Object.fromEntries(
      AVAILABLE_LOCALES.map((l) => [l, `${SITE_URL}${pathFor(l)}`]),
    ),
    "x-default": `${SITE_URL}${pathFor(DEFAULT_LOCALE)}`,
  };
}

const OG_LOCALE: Record<AvailableLocale, string> = {
  fr: "fr_FR",
  en: "en_US",
  de: "de_DE",
};

/** Per-locale site copy used by both the layout fallback and page metadata. */
export const HOME_TITLES: Record<AvailableLocale, string> = {
  fr: "Tiny Tea Kasbah : Un salon de thé, quatre univers du Maroc",
  en: "Tiny Tea Kasbah: One tea salon, four Moroccan universes",
  de: "Tiny Tea Kasbah: Ein Teesalon, vier marokkanische Welten",
};

export const HOME_DESCRIPTIONS: Record<AvailableLocale, string> = {
  fr: "Un salon de thé de 6,00 × 6,60 m : quatre univers du Maroc sous une seule kasbah. Amazigh, Fassi, Chamali Rifi, Sahraoui. Bientôt.",
  en: "A 6.00 × 6.60 m tea salon: four Moroccan universes under one kasbah. Amazigh, Fassi, Chamali Rifi, Sahraoui. Coming soon.",
  de: "Ein Teesalon auf 6,00 × 6,60 m: vier marokkanische Welten unter einer einzigen Kasbah. Amazigh, Fassi, Chamali Rifi, Sahraoui. Bald.",
};

export const CONCEPT_TITLES: Record<AvailableLocale, string> = {
  fr: "Concept — Tiny Tea Kasbah : la kasbah immersive en 3D",
  en: "Concept — Tiny Tea Kasbah: the immersive 3D kasbah",
  de: "Konzept — Tiny Tea Kasbah: die immersive 3D-Kasbah",
};

export const CONCEPT_DESCRIPTIONS: Record<AvailableLocale, string> = {
  fr: "Visitez la kasbah en 3D : quatre salons thématiques (Amazigh, Fassi, Sahraoui, Chamali Rifi) sous un skydome zénithal bioclimatique.",
  en: "Explore the kasbah in 3D: four themed salons (Amazigh, Fassi, Sahraoui, Chamali Rifi) under a bioclimatic zenithal skydome.",
  de: "Erkunden Sie die Kasbah in 3D: vier thematische Salons (Amazigh, Fassi, Sahraoui, Chamali Rifi) unter einer bioklimatischen Skydome.",
};

/**
 * Full per-locale page metadata: canonical, hreflang alternates and
 * OpenGraph. Called from each page's generateMetadata (NOT the [lang]
 * layout) so the canonical always matches the actual route.
 */
export function buildPageMetadata(options: {
  locale: AvailableLocale;
  /** Canonical path of THIS page in the given locale, e.g. "/" or "/fr/concept". */
  canonicalPath: string;
  /** Path factory for the same page in every locale (for hreflang). */
  pathFor: (locale: AvailableLocale) => string;
  title: string;
  description: string;
}): Metadata {
  const { locale, canonicalPath, pathFor, title, description } = options;
  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}${canonicalPath}`,
      languages: languageAlternates(pathFor),
    },
    openGraph: {
      type: "website",
      siteName: "Tiny Tea Kasbah",
      url: `${SITE_URL}${canonicalPath}`,
      locale: OG_LOCALE[locale],
      alternateLocale: AVAILABLE_LOCALES.filter((l) => l !== locale).map(
        (l) => OG_LOCALE[l],
      ),
      title,
      description,
      images: [{ url: "/img/og-tiny-tea-kasbah.jpg", width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/img/og-tiny-tea-kasbah.jpg"],
    },
  };
}
