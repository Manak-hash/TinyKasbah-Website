import type { Metadata } from "next";
import { Geist, Marhey } from "next/font/google";
import NotFoundContent from "@/components/not-found-content";

/**
 * Root 404 — catches paths that match NO route (e.g. /foo/bar). The root
 * layout is a pass-through, so this page renders its OWN <html>/<body>
 * shell, mirroring [lang]/layout.tsx. Never nest a second <html> anywhere
 * under [lang] — that shell lives there and only there.
 *
 * FR is the default site locale, hence lang="fr".
 */
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const marhey = Marhey({
  variable: "--font-marhey",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "404 : page introuvable : Tiny Tea Kasbah",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${marhey.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <NotFoundContent />
      </body>
    </html>
  );
}
