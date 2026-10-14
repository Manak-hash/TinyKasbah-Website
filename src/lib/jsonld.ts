import { SITE_URL } from "@/lib/seo";

/**
 * Structured data (schema.org) rendered as JSON-LD in the [lang] layout.
 *
 * Organization, NOT LocalBusiness/CafeOrCoffeeShop: the tea salon is a
 * "Bientôt" teaser with no walk-in venue of its own. The postal address is
 * the Terrevolution head office (shared with ETS Consult). When a real
 * salon location opens with public hours, add a CafeOrCoffeeShop node
 * with that address + geo + openingHours — not this office.
 *
 * sameAs consolidates the entity's known profiles for the Knowledge Graph.
 */
export function buildJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "Terrevolution",
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/img/terrevolution-mark.png`,
          width: 512,
          height: 512,
        },
        description:
          "Terrevolution conçoit des concepts architecturaux immersifs célébrant le patrimoine vivant du Maroc, dont Tiny Tea Kasbah.",
        address: {
          "@type": "PostalAddress",
          streetAddress: "38, Boulevard Moulay Hassan 1er",
          addressLocality: "Casablanca",
          postalCode: "20070",
          addressCountry: "MA",
        },
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+212661315158",
          contactType: "customer service",
          availableLanguage: ["fr", "ar", "en"],
        },
        sameAs: ["https://www.instagram.com/terrevolution.ma/"],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "Tiny Tea Kasbah",
        publisher: { "@id": `${SITE_URL}/#organization` },
        inLanguage: ["fr", "en", "de"],
      },
    ],
  };
}
