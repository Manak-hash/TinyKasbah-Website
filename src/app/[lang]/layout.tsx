import type { Metadata } from "next";
import { Geist, Geist_Mono, Marhey } from "next/font/google";
import "../globals.css";
import { AVAILABLE_LOCALES, isAvailableLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import MusicPlayer from "@/components/music-player";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const marhey = Marhey({
  variable: "--font-marhey",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
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
    fr: "Tiny Tea Kasbah : Un salon de thé, quatre univers du Maroc",
    en: "Tiny Tea Kasbah: One tea salon, four Moroccan universes",
    de: "Tiny Tea Kasbah: Ein Teesalon, vier marokkanische Welten",
  };
  const descriptions: Record<string, string> = {
    fr: "Un salon de thé de 6,00 × 6,60 m : quatre univers du Maroc sous une seule kasbah. Amazigh, Fassi, Chamali Rifi, Sahraoui. Bientôt.",
    en: "A 6.00 × 6.60 m tea salon: four Moroccan universes under one kasbah. Amazigh, Fassi, Chamali Rifi, Sahraoui. Coming soon.",
    de: "Ein Teesalon auf 6,00 × 6,60 m: vier marokkanische Welten unter einer einzigen Kasbah. Amazigh, Fassi, Chamali Rifi, Sahraoui. Bald.",
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
  const dict = await getDictionary(locale);
  // This is the ONLY <html> in the tree (root layout is a pass-through) —
  // the lang attribute must live here, not in app/layout.tsx.
  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${marhey.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        <MusicPlayer dict={dict.music} />
      </body>
    </html>
  );
}
