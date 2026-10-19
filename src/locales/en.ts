const en = {
  common: {
    brandTagline: "The art of Moroccan tea as living architecture",
    contact: "Contact us",
    loading3d: "Loading 3D model…",
    webglMissing:
      "Your browser cannot display 3D (WebGL).",
    webglMissingHint:
      "Try a recent browser with hardware acceleration enabled.",
    scrollHint: "Scroll to walk around",
    exploreIn3d: "Explore the interior in 3D",
    dragToExplore: "Drag to explore",
    cutLabel: "Interior view",
    daylightLabel: "Daylight study",
    timeLabel: "Time of day",
  },
  hero: {
    kicker: "A Terrevolution concept",
    title1: "Tiny Tea",
    title2: "Kasbah",
    subtitle:
      "A 6.00 × 6.60 m tea salon, four Moroccan universes under one kasbah. Architecture like tea: slow, precise, alive.",
    scrollCta: "Scroll to visit",
  },
  concept: {
    backToTour: "Exterior tour",
  },
  tour: {
    ch1: {
      title: "The entrance",
      body:
        "A compact kasbah, devoted to Moroccan tea. One building holds four universes of the country and a single ritual: the tea, poured slowly, in a setting built for it. This is the west entrance, where the visit begins.",
    },
    ch2: {
      title: "Compact and replicable",
      body:
        "A 6.00 × 6.60 m footprint, 3.60 m tall. Earthen panels on a modular, demountable structure: the kasbah travels, is raised in weeks and taken down without loss. One building, many sites.",
    },
    ch3: {
      title: "Construction and bioclimatic system",
      body:
        "The crown carries the climate. A zenithal skydome lights the hall, a photovoltaic pergola takes the sun, and passive cooling does the rest: natural ventilation, a wall fountain, misting. Energy autonomy by design.",
    },
    ch4: {
      title: "The four cultures",
      body:
        "One slow orbit around the building: four facades, four universes. Each salon is a cultural projection of Morocco, paired with its own tea. The interior can be visited in 3D.",
      items: [
        {
          name: "Amazigh",
          subtitle: "Ancestral geometry, High Atlas mint tea",
        },
        {
          name: "Fassi",
          subtitle: "Cobalt zellige, carved stucco, orange blossom",
        },
        {
          name: "Sahraoui",
          subtitle: "Ochre minimalism, camel-milk tea",
        },
        {
          name: "Chamali Rifi",
          subtitle: "Chefchaouen blue, wild thyme, the Mediterranean",
        },
      ],
    },
  },
  usages: {
    kicker: "Chapter 05",
    title: "Usages",
    intro:
      "The kasbah is built to be placed, not just imagined. Four settings where it already makes sense.",
    items: [
      {
        title: "Hotels",
        text: "A tea annex for the courtyard, the garden or the rooftop. An address within the address.",
      },
      {
        title: "Airports",
        text: "A last taste of Morocco before boarding, in a space that is calm by design.",
      },
      {
        title: "Events",
        text: "A stand that is a building: trade shows, fairs and festivals, raised and removed without loss.",
      },
      {
        title: "Cultural venues",
        text: "A living exhibit. Museums and cultural sites host the kasbah as both object and ritual.",
      },
    ],
  },
  partners: {
    kicker: "Chapter 06",
    title: "Partners",
    intro:
      "One flagship concept, carried by named partners.",
    body:
      "Terrevolution imagines the kasbah and carries the project. ETS Consult provides the engineering. Mada Architectes signs the architecture. Nothing more is claimed: one concept, and the people behind it.",
  },
  contact: {
    kicker: "Chapter 07",
    title: "Contact",
    intro:
      "A site, a venue, a launch: the conversation starts with a message.",
    emailCta: "Write to us",
    whatsapp: "WhatsApp",
    instagram: "Instagram",
    followLaunch: "A Terrevolution concept. Follow the launch.",
  },
  footer: {
    copyright: "Terrevolution",
    bureauEtude: "Engineering",
    maitreOuvrage: "Client",
    partenaire: "Architect",
  },
  controls: {
    viewAmazigh: "Amazigh salon",
    viewSahraoui: "Sahraoui salon",
    viewDome: "Under the dome",
    viewOverview: "Overview",
    resetView: "Reset view",
    resetViewShort: "Start",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    rotateLeft: "Rotate left",
    rotateRight: "Rotate right",
    rotateDrag: "Drag to rotate",
  },
  music: {
    title: "Ambiance: Moroccan tea music",
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
    whatsapp: "WhatsApp",
    instagram: "Instagram",
    music: "Music",
    language: "Language",
  },
};

export type Messages = typeof en;
export default en;
