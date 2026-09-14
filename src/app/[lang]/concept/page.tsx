import { notFound } from "next/navigation";
import { AVAILABLE_LOCALES, isAvailableLocale, LOCALE_NAMES, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import ConceptContent from "@/components/concept-content";

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
  return <ConceptContent dict={dict} locale={lang as Locale} localeName={LOCALE_NAMES[lang as Locale]} />;
}
