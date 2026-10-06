import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tiny Tea Kasbah — L'art du thé marocain réinventé",
  description:
    "Un salon de thé modulaire de 6×6m : quatre cultures marocaines, une même âme. Amazigh, Fassi, Chamali Rifi, Sahraoui — bientôt.",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/apple-icon.png",
  },
};

// Root layout is a PASS-THROUGH: the single <html>/<body> shell (with the real
// per-locale lang attribute AND the font variables) is rendered by
// [lang]/layout.tsx. A hardcoded lang="fr" here collided with lang="en"/"de"
// below and caused a React hydration mismatch on /en and /de. Root layouts
// that render no <html> are supported as long as exactly ONE layout in the
// tree renders the shell.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return children;
}
