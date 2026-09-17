import { notFound } from "next/navigation";
import { AVAILABLE_LOCALES, isAvailableLocale, LOCALE_NAMES, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import KasbahInterior from "@/components/kasbah-interior";
import LanguageSwitcher from "@/components/language-switcher";

export async function generateStaticParams() {
  return AVAILABLE_LOCALES.map((lang) => ({ lang }));
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

      {/* ---------- Language switcher ---------- */}
      <div className="absolute top-5 right-6 z-50">
        <LanguageSwitcher
          current={lang as Locale}
          currentName={LOCALE_NAMES[lang as Locale]}
          paths={{ fr: "/concept", en: "/en/concept", de: "/de/concept" }}
        />
      </div>

      {/* ---------- Link back to the main page ---------- */}
      <div className="absolute top-5 left-6 z-50">
        <a
          href={homePath}
          className="inline-flex items-center gap-2 rounded-full border border-sand/25 bg-background/60 px-4 py-2 text-xs uppercase tracking-[0.2em] text-sand/80 backdrop-blur-sm transition-colors hover:border-gold/60 hover:text-gold"
        >
          {dict.concept.backToTour}
        </a>
      </div>
    </main>
  );
}
