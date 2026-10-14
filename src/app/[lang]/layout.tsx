import type { Metadata } from "next";
import { Geist, Geist_Mono, Marhey } from "next/font/google";
import "../globals.css";
import { AVAILABLE_LOCALES, isAvailableLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import SiteMenu from "@/components/site-menu";
import { HOME_DESCRIPTIONS, HOME_TITLES } from "@/lib/seo";
import { buildJsonLd } from "@/lib/jsonld";

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
  const locale = isAvailableLocale(lang) ? lang : "fr";
  // Fallback copy only — canonical/hreflang/OG live in each page's
  // generateMetadata (see src/lib/seo.ts).
  return { title: HOME_TITLES[locale], description: HOME_DESCRIPTIONS[locale] };
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd()) }}
        />
        {children}
        <SiteMenu dict={dict} />
      </body>
    </html>
  );
}
