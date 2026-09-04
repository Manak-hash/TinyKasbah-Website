import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { AVAILABLE_LOCALES, isAvailableLocale } from "@/i18n/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateStaticParams() {
  return AVAILABLE_LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const titles: Record<string, string> = {
    fr: "Tiny Tea Kasbah — L'art du thé marocain réinventé",
    en: "Tiny Tea Kasbah — Moroccan tea art reinvented",
    de: "Tiny Tea Kasbah — Die marokkanische Teekunst, neu gedacht",
  };
  const descriptions: Record<string, string> = {
    fr: "Un salon de thé modulaire de 6×6m : quatre cultures marocaines, une même âme. Amazigh, Fassi, Chamali Rifi, Sahraoui — bientôt.",
    en: "A modular 6×6m tea salon: four Moroccan cultures, one soul. Amazigh, Fassi, Chamali Rifi, Sahraoui — coming soon.",
    de: "Ein modularer Teesalon auf 6×6 m: vier marokkanische Kulturen, eine Seele. Amazigh, Fassi, Chamali Rifi, Sahraoui — bald.",
  };
  const locale = isAvailableLocale(lang) ? lang : "fr";
  return { title: titles[locale], description: descriptions[locale] };
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = isAvailableLocale(lang) ? lang : "fr";
  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
