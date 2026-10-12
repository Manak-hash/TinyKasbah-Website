const en = {
  common: {
    brandTagline: "The art of Moroccan tea as living architecture",
    contact: "Contact us",
    languageLabel: "Language",
    loading3d: "Loading 3D model…",
    webglMissing:
      "Your browser cannot display 3D (WebGL).",
    webglMissingHint:
      "Try a recent browser with hardware acceleration enabled.",
    scrollHint: "Scroll to walk through",
    exploreIn3d: "Explore the concept",
    discover: "Discover the concept",
    dragToExplore: "Drag to explore",
    cutLabel: "Interior view",
    daylightLabel: "Daylight study",
    timeLabel: "Time of day",
  },
  hero: {
    badge: "Coming soon, a Terrevolution concept",
    title1: "Tiny Tea",
    title2: "Kasbah",
    subtitle:
      "A 6.00 × 6.60 m tea salon, four Moroccan universes under one kasbah. Architecture like tea: slow, precise, alive.",
    scrollCta: "Scroll to visit",
    stats: [
      { value: "4", label: "cultural universes" },
      { value: "6.00 × 6.60 m", label: "compact concept" },
      { value: "100%", label: "renewable energy" },
    ],
  },
  concept: {
    backToTour: "3D tour",
  },
  universes: {
    kicker: "Cultural themes",
    title: "Four universes, one soul",
    hint: "Swipe to explore the 4 universes",
    description:
      "Visitors choose their universe and fully immerse themselves in it: decor, cultural projections, tea flavours and sensory atmosphere. A central hall under a skydome connects the four salons, a tea-flavour exhibition space.",
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
        text: "Pointed arches, moucharabiehs and zellige fountains: every salon is a cultural projection.",
      },
      {
        title: "Bioclimatic",
        text: "Zenithal skydome and photovoltaic pergola: passive shading, designed for energy autonomy.",
      },
      {
        title: "Passive comfort",
        text: "Natural ventilation, a wall fountain and misting to cool the air, for silent thermal regulation.",
      },
      {
        title: "Compact & replicable",
        text: "6.00 × 6.60 m, 3.60 m total height. Earthen-panel walls on a modular, demountable structure, designed for hotels, airports, cultural venues and event stands: trade shows, fairs, festivals.",
      },
    ],
    specs: [
      { value: "6.00 × 6.60 m", label: "footprint" },
      { value: "3.60 m", label: "total height" },
      { value: "4 + 1", label: "salons + skydome hall" },
      { value: "Preparation area", label: "with private restrooms" },
    ],
  },
  tour: {
    chapter: "Chapter",
    entrance: {
      kicker: "The entrance",
      title: "A kasbah miniature, a total experience",
      text: "The Tiny Kasbah is not just a café. It is an immersive architectural device that transposes the soul of Moroccan medinas into a compact, replicable, premium format. Each space is a cultural projection: pointed arches, moucharabiehs, wall fountains, authentic zellige.",
    },
    hall: {
      kicker: "The central hall",
      title: "Beneath the skydome",
      text: "A bioclimatic zenithal skydome floods the central exhibition hall with living light that changes with the hours. All four salons connect through it, a tea-flavour tasting space where visitors choose their universe.",
    },
    salon1: {
      kicker: "Salon: Theme I",
      title: "Amazigh",
      text: "The Berber essence: ancestral geometry, woven rugs, mint tea from the High Atlas mountains. A cultural projection of Amazigh art.",
    },
    salon2: {
      kicker: "Salon: Theme II",
      title: "Fassi",
      text: "The elegance of Fez: cobalt-blue zellige, carved stucco, orange-blossom tea. The refined soul of the spiritual capital.",
    },
    salon3: {
      kicker: "Salon: Theme III",
      title: "Sahraoui",
      text: "The infinity of the desert: ochre minimalism, nomad textiles, camel-milk tea. The serenity of open spaces.",
    },
    salon4: {
      kicker: "Salon: Theme IV",
      title: "Chamali Rifi",
      text: "The liveliness of the North: contrasted colours, sculpted moucharabiehs, wild-thyme tea. Mediterranean maritime culture.",
    },
    overview: {
      kicker: "Built to travel",
      title: "Compact & replicable",
      text: "6.00 × 6.60 m footprint, 3.60 m total height, 4 thematic salons + skydome hall, preparation area with private restrooms. Earthen-panel walls on a modular, demountable structure. Bioclimatic solar pergola: passive shading, designed for energy autonomy. Designed for hotels, airports, cultural venues and event stands: trade shows, fairs, festivals.",
    },
    cta: {
      title: "Follow the launch",
      text: "Preserve Morocco's living heritage by making it accessible, contemporary and economically viable.",
      button: "Contact us",
    },
  },
  footer: {
    quote:
      "“Preserve Morocco's living heritage by making it accessible, contemporary and economically viable.”",
    byline:
      "A Terrevolution concept. Follow the launch.",
    copyright: "Terrevolution",
    bureauEtude: "Engineering",
    maitreOuvrage: "Maître d'ouvrage",
    partenaire: "Architect",
  },
  controls: {
    viewAmazigh: "Amazigh salon",
    viewSahraoui: "Sahraoui salon",
    viewDome: "Under the dome",
    viewOverview: "Overview",
    resetView: "Reset view",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    rotateLeft: "Rotate left",
    rotateRight: "Rotate right",
    rotateDrag: "Drag to rotate",
  },
  music: {
    title: "Ambiance: Moroccan tea music",
    expand: "Show music controls",
    collapse: "Hide music controls",
    play: "Play music",
    pause: "Pause music",
    mute: "Mute",
    unmute: "Unmute",
    volume: "Volume",
    seek: "Seek",
  },
  menu: {
    label: "Menu",
    open: "Open menu",
    close: "Close",
    ctaConcept: "Discover the concept",
    ctaTour: "3D tour",
    music: "Music",
    language: "Language",
  },
};

export type Messages = typeof en;
export default en;
