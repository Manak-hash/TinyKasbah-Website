"use client";

import KasbahTour from "@/components/kasbah-tour";
import BrandMark from "@/components/brand-mark";
import PartnerCredits from "@/components/partner-credits";
import { Mail, MessageCircle } from "lucide-react";
import { INSTAGRAM_URL, WHATSAPP_URL } from "@/lib/contacts";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";

/**
 * The homepage IS the 7-chapter scroll. Chapters 1-4 live inside KasbahTour
 * (3D, exterior); chapters 5-7 are DOM editorial sections passed in as
 * children — they scroll over the parked, fading scene at the handoff.
 * The old universes carousel, features grid and footer are absorbed here.
 */
export default function HomeContent({
  dict,
  locale,
}: {
  dict: Dictionary;
  locale: Locale;
}) {
  const conceptPath = locale === "fr" ? "/concept" : `/${locale}/concept`;

  return (
    <main className="zellige-bg min-h-dvh" lang={locale}>
      {/* ---------- Brand mark (top-left) ---------- */}
      <BrandMark href={conceptPath} />

      <KasbahTour dict={dict} locale={locale} conceptPath={conceptPath}>
        {/* ---------- Chapter 5 — Usages ---------- */}
        <section data-chapter-dom className="border-t border-sand/10">
          <div className="max-w-6xl mx-auto px-5 sm:px-6 py-20 md:py-32">
            <p className="text-xs tracking-[0.3em] uppercase text-teal">{dict.usages.kicker}</p>
            <h2 className="mt-4 font-display text-3xl md:text-5xl font-semibold tracking-tight">
              {dict.usages.title}
            </h2>
            <div className="mt-4 h-px w-16 bg-gold/70" aria-hidden />
            <p className="mt-6 max-w-xl text-sand/75 leading-relaxed">{dict.usages.intro}</p>

            <ol className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-2 gap-x-14 gap-y-10">
              {dict.usages.items.map((item, i) => (
                <li key={item.title} className="flex items-start gap-5">
                  <span className="font-display text-2xl md:text-3xl leading-none text-gold/85" aria-hidden>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-sand/65">{item.text}</p>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------- Chapter 6 — Partenaires ---------- */}
        <section data-chapter-dom className="border-t border-sand/10">
          <div className="max-w-6xl mx-auto px-5 sm:px-6 py-20 md:py-32">
            <p className="text-xs tracking-[0.3em] uppercase text-teal">{dict.partners.kicker}</p>
            <h2 className="mt-4 font-display text-3xl md:text-5xl font-semibold tracking-tight">
              {dict.partners.title}
            </h2>
            <div className="mt-4 h-px w-16 bg-gold/70" aria-hidden />
            <p className="mt-6 font-semibold text-lg">{dict.partners.intro}</p>
            <p className="mt-4 max-w-xl text-sand/75 leading-relaxed">{dict.partners.body}</p>

            <div className="mt-12">
              <PartnerCredits dict={dict} />
            </div>
          </div>
        </section>

        {/* ---------- Chapter 7 — Contact (the old footer is folded in) ---------- */}
        <section data-chapter-dom className="border-t border-sand/10">
          <div className="max-w-6xl mx-auto px-5 sm:px-6 pt-20 md:pt-32 pb-14 md:pb-16">
            <p className="text-xs tracking-[0.3em] uppercase text-teal">{dict.contact.kicker}</p>
            <h2 className="mt-4 font-display text-3xl md:text-5xl font-semibold tracking-tight">
              {dict.contact.title}
            </h2>
            <div className="mt-4 h-px w-16 bg-gold/70" aria-hidden />
            <p className="mt-6 max-w-xl text-sand/75 leading-relaxed">{dict.contact.intro}</p>

            <div className="mt-10 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              <a
                href="mailto:contact@terrevolution.ma"
                className="inline-flex items-center gap-3 rounded-full bg-clay hover:bg-clay/90 px-7 py-3.5 text-white text-sm font-medium transition-colors"
              >
                <Mail className="w-4 h-4" aria-hidden />
                {dict.contact.emailCta}
              </a>
              <div className="flex items-center gap-6">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-sand/80 transition-colors hover:text-gold"
                >
                  <MessageCircle className="w-4 h-4" aria-hidden />
                  {dict.contact.whatsapp}
                </a>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-sand/80 transition-colors hover:text-gold"
                >
                  {/* Instagram glyph (lucide dropped brand icons — inline SVG,
                      same rounded-square mark the site menu draws) */}
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                  {dict.contact.instagram}
                </a>
              </div>
            </div>

            <div className="mt-16 border-t border-sand/10 pt-8">
              <p className="text-xs text-sand/50">{dict.common.brandTagline}</p>
              <p className="mt-3 text-xs text-sand/40">{dict.contact.followLaunch}</p>
              <p className="mt-3 text-xs text-sand/40">
                <a
                  href={conceptPath}
                  className="underline decoration-sand/30 underline-offset-4 transition-colors hover:text-gold"
                >
                  {dict.common.exploreIn3d}
                </a>
              </p>
              <p className="mt-3 text-xs text-sand/40">© {new Date().getFullYear()} {dict.footer.copyright}</p>
            </div>
          </div>
        </section>
      </KasbahTour>
    </main>
  );
}
