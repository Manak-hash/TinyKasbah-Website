"use client";

import { CarouselSlider, type UniverseSlide } from "@/components/watermelon-ui/carousel-slider";
import KasbahViewer from "@/components/kasbah-viewer";
import LanguageSwitcher from "@/components/language-switcher";
import { Croissant, Droplets, Sun, Wind } from "lucide-react";
import Image from "next/image";
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
  const universes: UniverseSlide[] = dict.universes.items.map((u, i) => ({
    id: i + 1,
    img: ["/img/amazigh.jpg", "/img/fassi.jpg", "/img/sahraoui.jpg", "/img/chamali.jpg"][i],
    title: u.title,
    subtitle: u.subtitle,
    accent: ["text-[#d9a441]", "text-[#7fb4d9]", "text-[#e0956b]", "text-[#8fd0c9]"][i],
  }));

  return (
    <main className="zellige-bg min-h-dvh" lang={locale}>
      {/* ---------- Language switcher ---------- */}
      <div className="absolute top-5 right-6 z-50">
        <LanguageSwitcher current={locale} currentName={localeName} paths={LOCALE_PATHS} />
      </div>

      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/img/hero.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-16 md:pt-32 md:pb-24 text-center">
          <p className="animate-fade-up text-xs tracking-[0.35em] uppercase text-gold/90">
            {dict.hero.badge}
          </p>

          <h1 className="animate-fade-up animation-delay-200 mt-6 text-5xl md:text-7xl font-bold tracking-tight">
            {dict.hero.title1}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-clay to-teal">
              {dict.hero.title2}
            </span>
          </h1>

          <p className="animate-fade-up animation-delay-400 mt-6 text-lg md:text-xl text-sand/90 max-w-2xl mx-auto">
            {dict.hero.subtitle}
          </p>

          <div className="animate-fade-up animation-delay-600 mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#univers"
              className="px-7 py-3 rounded-full bg-clay hover:bg-clay/90 text-white font-medium transition-colors"
            >
              {dict.common.discover}
            </a>
            <a
              href="#contact"
              className="px-7 py-3 rounded-full border border-sand/25 hover:border-sand/60 text-sand/90 font-medium transition-colors"
            >
              {dict.common.contact}
            </a>
          </div>

          {/* Key numbers */}
          <div className="animate-fade-up animation-delay-600 mt-14 grid grid-cols-3 gap-6 max-w-md mx-auto">
            {dict.hero.stats.map((s) => (
              <div key={s.label}>
                <p className="text-2xl md:text-3xl font-bold text-gold">{s.value}</p>
                <p className="text-xs text-sand/60 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Universes carousel ---------- */}
      <section id="univers" className="max-w-6xl mx-auto px-6 py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-14 items-center">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-teal">
              {dict.universes.kicker}
            </p>
            <h2 className="mt-4 text-3xl md:text-4xl font-bold">
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

          <CarouselSlider slides={universes} />
        </div>
      </section>

      {/* ---------- 3D model ---------- */}
      <section className="max-w-6xl mx-auto px-6 pb-4">
        <KasbahViewer dict={dict} />
      </section>

      {/* ---------- Features ---------- */}
      <section className="border-t border-sand/10">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-24">
          <h2 className="text-3xl md:text-4xl font-bold text-center">
            {dict.features.title}
          </h2>
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
          <div className="mt-12 rounded-3xl border border-sand/12 bg-white/[0.02] px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {dict.features.specs.map((s) => (
              <div key={s.label}>
                <p className="font-semibold text-sand">{s.value}</p>
                <p className="text-xs text-sand/55 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Footer / contact ---------- */}
      <footer id="contact" className="border-t border-sand/10">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <Image
            src="/img/tea.jpg"
            alt={dict.common.brandTagline}
            width={160}
            height={208}
            className="arch-mask w-40 h-52 object-cover mx-auto opacity-90"
          />
          <p className="mt-8 text-lg font-medium">{dict.footer.quote}</p>
          <p className="mt-6 text-sm text-sand/60">{dict.footer.byline}</p>
          <p className="mt-8 text-xs text-sand/40">
            © {new Date().getFullYear()} {dict.footer.copyright}
          </p>
        </div>
      </footer>
    </main>
  );
}
