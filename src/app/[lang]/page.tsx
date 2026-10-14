import { notFound } from "next/navigation";
import { AVAILABLE_LOCALES, isAvailableLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import HomeContent from "@/components/home-content";
import { buildPageMetadata, HOME_DESCRIPTIONS, HOME_TITLES } from "@/lib/seo";
import { localeHomePath } from "@/lib/seo";
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
    // FR is served at the bare root (see src/proxy.ts) — that's the canonical.
    canonicalPath: localeHomePath(locale),
    pathFor: localeHomePath,
    title: HOME_TITLES[locale],
    description: HOME_DESCRIPTIONS[locale],
  });
}

export default async function LangHome({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isAvailableLocale(lang)) notFound();
  const dict = await getDictionary(lang as Locale);
  return <HomeContent dict={dict} locale={lang as Locale} />;
}
