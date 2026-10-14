import type { MetadataRoute } from "next";
import { AVAILABLE_LOCALES, DEFAULT_LOCALE } from "@/i18n/config";
import { SITE_URL, localeHomePath } from "@/lib/seo";

/**
 * FR is served at the bare root (see src/proxy.ts), other locales at /{lang}.
 * The FR home entry therefore uses "/" as its canonical URL.
 */
function homeAlternates(): MetadataRoute.Sitemap[number]["alternates"] {
  return {
    languages: {
      ...Object.fromEntries(
        AVAILABLE_LOCALES.map((l) => [l, `${SITE_URL}${localeHomePath(l)}`]),
      ),
      "x-default": `${SITE_URL}${localeHomePath(DEFAULT_LOCALE)}`,
    },
  };
}

function conceptAlternates(): MetadataRoute.Sitemap[number]["alternates"] {
  return {
    languages: {
      ...Object.fromEntries(
        AVAILABLE_LOCALES.map((l) => [l, `${SITE_URL}/${l}/concept`]),
      ),
      "x-default": `${SITE_URL}/${DEFAULT_LOCALE}/concept`,
    },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    {
      url: `${SITE_URL}/`,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
      alternates: homeAlternates(),
    },
    {
      url: `${SITE_URL}/fr/concept`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: conceptAlternates(),
    },
  ];
}
