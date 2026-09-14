"use client";

import KasbahTour from "@/components/kasbah-tour";
import LanguageSwitcher from "@/components/language-switcher";
import { Globe } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";

const LOCALE_PATHS: Record<Locale, string> = {
  fr: "/",
  en: "/en",
  de: "/de",
};

export default function HomeContent({
  dict,
  locale,
  localeName,
}: {
  dict: Dictionary;
  locale: Locale;
  localeName: string;
}) {
  const conceptPath = locale === "fr" ? "/concept" : `/${locale}/concept`;

  return (
    <main className="zellige-bg min-h-dvh" lang={locale}>
      {/* ---------- Language switcher (fixed, always reachable) ---------- */}
      <div className="fixed top-5 right-6 z-50">
        <LanguageSwitcher current={locale} currentName={localeName} paths={LOCALE_PATHS} />
      </div>

      {/* ---------- The whole page IS the tour ---------- */}
      <KasbahTour dict={dict} locale={locale} conceptPath={conceptPath} />

      {/* ---------- Footer ---------- */}
      <footer className="border-t border-sand/10">
        <div className="max-w-6xl mx-auto px-6 py-14 text-center">
          <p className="inline-flex items-center gap-2 text-xs text-sand/40">
            <Globe className="w-3 h-3" aria-hidden />
            {dict.common.brandTagline}
          </p>
          <p className="mt-4 text-xs text-sand/40">
            <a href={conceptPath} className="underline decoration-sand/30 underline-offset-4 transition-colors hover:text-gold">
              {dict.common.exploreIn3d}
            </a>
          </p>
          <p className="mt-4 text-xs text-sand/40">© {new Date().getFullYear()} {dict.footer.copyright}</p>
          <p className="mt-1 text-xs text-sand/30">{dict.footer.byline}</p>
        </div>
      </footer>
    </main>
  );
}
