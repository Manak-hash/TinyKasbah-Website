"use client";

import KasbahTour from "@/components/kasbah-tour";
import LanguageSwitcher from "@/components/language-switcher";
import PartnerCredits from "@/components/partner-credits";
import { CarouselSlider, type UniverseSlide } from "@/components/watermelon-ui/carousel-slider";
import { Croissant, Droplets, Sun, Wind } from "lucide-react";
import { Globe } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";

const FEATURE_ICONS = [Croissant, Sun, Droplets, Wind];

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

  const universes: UniverseSlide[] = dict.universes.items.map((u, i) => ({
    id: i + 1,
    img: ["/img/amazigh.jpg", "/img/fassi.jpg", "/img/sahraoui.jpg", "/img/chamali.jpg"][i],
    title: u.title,
    subtitle: u.subtitle,
    accent: ["text-[#d9a441]", "text-[#7fb4d9]", "text-[#e0956b]", "text-[#8fd0c9]"][i],
  }));

  return (
    <main className="zellige-bg min-h-dvh" lang={locale}>
      {/* ---------- Language switcher (fixed, always reachable) ---------- */}
      <div className="fixed top-5 right-6 z-50">
        <LanguageSwitcher current={locale} currentName={localeName} paths={LOCALE_PATHS} />
      </div>

      {/* ---------- The tour IS the hero ---------- */}
      <KasbahTour dict={dict} locale={locale} conceptPath={conceptPath} />

      {/* ---------- Universes carousel (moved from the concept page) ---------- */}
      <section id="univers" className="max-w-6xl mx-auto px-5 sm:px-6 py-16 md:py-28">
        <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-center">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-teal">
              {dict.universes.kicker}
            </p>
            <h2 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-bold">
              {dict.universes.title}
            </h2>
            <p className="mt-5 text-sand/75 leading-relaxed">
              {dict.universes.description}
            </p>
            <ul className="mt-8 space-y-4">
              {dict.universes.items.map((u, i) => (
                <li key={u.title} className="flex items-baseline gap-3">
                  <span className={`font-semibold ${["text-[#d9a441]", "text-[#7fb4d9]", "text-[#e0956b]", "text-[#8fd0c9]"][i]}`}>
                    {u.title}
                  </span>
                  <span className="text-sm text-sand/60">{u.subtitle}</span>
                </li>
              ))}
            </ul>
          </div>

          <CarouselSlider slides={universes} hint={dict.universes.hint} />
        </div>
      </section>

      {/* ---------- Features (moved from the concept page) ---------- */}
      <section className="border-t border-sand/10">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-16 md:py-24">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center">
            {dict.features.title}
          </h2>
          <div className="mt-10 md:mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {dict.features.items.map((f, i) => {
              const Icon = FEATURE_ICONS[i];
              return (
                <div
                  key={f.title}
                  className="rounded-3xl border border-sand/12 bg-white/[0.03] p-6 hover:border-gold/40 transition-colors"
                >
                  <Icon className="w-7 h-7 text-gold" strokeWidth={1.5} />
                  <h3 className="mt-4 font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-sand/65 leading-relaxed">
                    {f.text}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Specs strip */}
          <div className="mt-10 md:mt-12 rounded-3xl border border-sand/12 bg-white/[0.02] px-4 sm:px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {dict.features.specs.map((s) => (
              <div key={s.label}>
                <p className="font-semibold text-sand">{s.value}</p>
                <p className="text-xs text-sand/55 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="border-t border-sand/10">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-12 md:py-14 text-center">
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

          <PartnerCredits dict={dict} />
        </div>
      </footer>
    </main>
  );
}
