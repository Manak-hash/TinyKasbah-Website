import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tiny Tea Kasbah — Un salon de thé, quatre univers du Maroc",
  description:
    "Un salon de thé de 6,00 × 6,60 m : quatre univers du Maroc sous une seule kasbah. Amazigh, Fassi, Chamali Rifi, Sahraoui — bientôt.",
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
