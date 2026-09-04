const en = {
  common: {
    brandTagline: "Moroccan tea art reinvented as living architecture",
    discover: "Discover the concept",
    contact: "Contact us",
    languageLabel: "Language",
    dragToExplore: "Drag to explore",
    cutLabel: "Interior view",
    loading3d: "Loading 3D model…",
    webglMissing:
      "Your browser cannot display 3D (WebGL).",
    webglMissingHint:
      "Try a recent browser with hardware acceleration enabled.",
  },
  hero: {
    badge: "Coming soon — a Terrevolution concept",
    title1: "Tiny Tea",
    title2: "Kasbah",
    subtitle:
      "The art of Moroccan tea reinvented as living architecture. A modular 6×6 m tea salon — four cultures, one soul.",
    stats: [
      { value: "4", label: "cultural universes" },
      { value: "6×6 m", label: "compact concept" },
      { value: "100%", label: "renewable energy" },
    ],
  },
  universes: {
    kicker: "Cultural themes",
    title: "Four cultures, one soul",
    description:
      "Visitors choose their universe and fully immerse themselves in it: decor, cultural projections, tea flavours and sensory atmosphere. A central hall under a skydome connects the four salons — a tea-flavour exhibition space.",
    items: [
      {
        title: "Amazigh",
        subtitle:
          "Ancestral geometry, mint tea from the High Atlas",
      },
      {
        title: "Fassi",
        subtitle: "Cobalt-blue zellige, carved stucco, orange blossom",
      },
      {
        title: "Sahraoui",
        subtitle: "Ochre minimalism, nomadism, camel-milk tea",
      },
      {
        title: "Chamali Rifi",
        subtitle: "Chefchaouen blue, wild thyme, the Mediterranean",
      },
    ],
  },
  viewer: {
    title: "Explore the kasbah in 3D",
  },
  features: {
    title: "Building authenticity with precision",
    items: [
      {
        title: "Living architecture",
        text: "Pointed arches, moucharabiehs and zellige fountains — every salon is a cultural projection.",
      },
      {
        title: "Bioclimatic",
        text: "Zenithal skydome and photovoltaic pergola: passive shading and total energy autonomy.",
      },
      {
        title: "Passive comfort",
        text: "Natural ventilation and integrated water features for silent thermal regulation.",
      },
      {
        title: "Compact & replicable",
        text: "6×6 m designed for hotels, airports, premium souks and cultural venues.",
      },
    ],
    specs: [
      { value: "6.00 × 6.60 m", label: "footprint" },
      { value: "3.60 m", label: "total height" },
      { value: "4 + 1", label: "salons + skydome hall" },
      { value: "M/F WC", label: "preparation area" },
    ],
  },
  footer: {
    quote:
      "“Preserve Morocco's living heritage by making it accessible, contemporary and economically viable.”",
    byline:
      "A Terrevolution concept — follow the launch.",
    copyright: "Tiny Tea Kasbah. Coming soon.",
  },
};

export type Messages = typeof en;
export default en;
