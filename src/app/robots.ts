import type { MetadataRoute } from "next";

/**
 * Politique crawlers IA — même décision que cliniqueveterinairemaarif.com :
 * - moteurs de recherche IA autorisés (visibilité ChatGPT Search /
 *   Perplexity / Rufus / Siri),
 * - crawlers d'entraînement bloqués (aucune visibilité en contrepartie).
 * Un groupe listé explicitement n'hérite pas des règles « * » : Next.js
 * répète les règles pour chaque UA du groupe. Ordre : les groupes
 * d'entraînement en dernier, Disallow plein site.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      {
        userAgent: [
          "OAI-SearchBot",
          "ChatGPT-User",
          "PerplexityBot",
          "Amazonbot",
          "Applebot",
        ],
        allow: "/",
      },
      {
        userAgent: [
          "GPTBot",
          "ClaudeBot",
          "claude-web",
          "Google-Extended",
          "Bytespider",
          "CCBot",
          "Applebot-Extended",
          "Meta-ExternalAgent",
          "FacebookBot",
          "cohere-ai",
          "Diffbot",
        ],
        disallow: "/",
      },
    ],
    sitemap: "https://www.terrevolution.ma/sitemap.xml",
  };
}

