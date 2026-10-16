import type { Messages } from "./en";

const fr: Messages = {
  common: {
    brandTagline: "L'art du thé marocain en architecture vivante",
    contact: "Nous contacter",
    loading3d: "Chargement du modèle 3D…",
    webglMissing:
      "Votre navigateur ne peut pas afficher la 3D (WebGL).",
    webglMissingHint:
      "Essayez un navigateur récent avec l'accélération matérielle activée.",
    scrollHint: "Défilez pour avancer",
    exploreIn3d: "Explorer le concept",
    dragToExplore: "Glisser pour explorer",
    cutLabel: "Vue intérieure",
    daylightLabel: "Étude lumineuse",
    timeLabel: "Heure de la journée",
  },
  hero: {
    kicker: "Un concept Terrevolution",
    title1: "Tiny Tea",
    title2: "Kasbah",
    subtitle:
      "Un salon de thé de 6,00 × 6,60 m, quatre univers du Maroc sous une seule kasbah. L'architecture comme le thé : lente, précise, vivante.",
    scrollCta: "Défilez pour visiter",
  },
  concept: {
    backToTour: "Visite 3D",
  },
  universes: {
    kicker: "Les thèmes culturels",
    title: "Quatre univers, une même âme",
    hint: "Glissez pour explorer les 4 univers",
    description:
      "Le visiteur choisit son univers et s'y immerge pleinement : décor, projections culturelles, saveurs de thé et atmosphère sensorielle. Un hall central sous skydome relie les quatre salons, un espace d'exposition des saveurs de thé.",
    items: [
      {
        title: "Amazigh",
        subtitle:
          "Géométrie ancestrale, thé à la menthe du Haut Atlas",
      },
      {
        title: "Fassi",
        subtitle: "Zellige bleu cobalt, stuc ciselé, fleur d'oranger",
      },
      {
        title: "Sahraoui",
        subtitle: "Minimalisme ocre, nomadisme, thé au lait de chamelle",
      },
      {
        title: "Chamali Rifi",
        subtitle: "Bleu de Chefchaouen, thym sauvage, Méditerranée",
      },
    ],
  },
  features: {
    title: "Bâtir l'authenticité avec précision",
    items: [
      {
        title: "Architecture vivante",
        text: "Arcs brisés, moucharabiehs et fontaines en zellige : chaque salon est une projection culturelle.",
      },
      {
        title: "Bioclimatique",
        text: "Skydome zénithal et pergola photovoltaïque : ombrage passif, conçu pour l'autonomie énergétique.",
      },
      {
        title: "Confort passif",
        text: "Ventilation naturelle, fontaine murale et brumisation pour rafraîchir l'air, pour une régulation thermique silencieuse.",
      },
      {
        title: "Compact & réplicable",
        text: "6,00 × 6,60 m, hauteur totale 3,60 m. Panneaux en terre crue sur structure modulaire et démontable, pensé pour les hôtels, aéroports, espaces culturels et les stands événementiels : salons, foires, festivals.",
      },
    ],
    specs: [
      { value: "6,00 × 6,60 m", label: "emprise au sol" },
      { value: "3,60 m", label: "hauteur totale" },
      { value: "4 + 1", label: "salons + hall skydome" },
      { value: "Espace préparation", label: "avec sanitaires privatifs" },
    ],
  },
  tour: {
    chapter: "Chapitre",
    entrance: {
      kicker: "L'entrée",
      title: "Une kasbah miniature, une expérience totale",
      text: "Le Tiny Kasbah n'est pas un simple café. C'est un dispositif architectural immersif qui transpose l'âme des médinas marocaines dans un format compact, réplicable et premium. Chaque espace est une projection culturelle : arcs brisés, moucharabiehs, fontaines murales, zelliges authentiques.",
    },
    hall: {
      kicker: "Le hall central",
      title: "Sous le skydome",
      text: "Un skydome zénithal bioclimatique inonde le hall central d'exposition d'une lumière vivante qui change au fil des heures. Les quatre salons s'y rejoignent en un espace de dégustation où le visiteur choisit son univers.",
    },
    salon1: {
      kicker: "Salon : thème I",
      title: "Amazigh",
      text: "L'essence berbère : géométrie ancestrale, tapis tissés, thé à la menthe des montagnes du Haut Atlas. Une projection culturelle de l'art amazigh.",
    },
    salon2: {
      kicker: "Salon : thème II",
      title: "Fassi",
      text: "L'élégance de Fès : zellige bleu cobalt, stuc ciselé, thé à la fleur d'oranger. L'âme raffinée de la capitale spirituelle.",
    },
    salon3: {
      kicker: "Salon : thème III",
      title: "Sahraoui",
      text: "L'infini du désert : minimalisme ocre, textiles nomades, thé au lait de chamelle. La sérénité des espaces ouverts.",
    },
    salon4: {
      kicker: "Salon : thème IV",
      title: "Chamali Rifi",
      text: "La vivacité du Nord : couleurs contrastées, moucharabiehs sculptés, thé au thym sauvage. La culture maritime méditerranéenne.",
    },
    overview: {
      kicker: "Conçu pour voyager",
      title: "Compact & réplicable",
      text: "Emprise au sol 6,00 × 6,60 m, hauteur totale 3,60 m, 4 salons thématiques + hall skydome, espace préparation avec sanitaires privatifs. Panneaux en terre crue sur structure modulaire et démontable. Pergola solaire bioclimatique : ombrage passif, conçu pour l'autonomie énergétique. Conçu pour les hôtels, aéroports, espaces culturels et les stands événementiels : salons, foires, festivals.",
    },
    cta: {
      title: "Suivez le lancement",
      text: "Préserver le patrimoine vivant du Maroc en le rendant accessible, contemporain et économiquement viable.",
      button: "Nous contacter",
    },
  },
  footer: {
    byline:
      "Un concept Terrevolution. Suivez le lancement.",
    copyright: "Terrevolution",
    bureauEtude: "Ingénierie",
    maitreOuvrage: "Maître d'ouvrage",
    partenaire: "Architecte",
  },
  controls: {
    viewAmazigh: "Salon Amazigh",
    viewSahraoui: "Salon Sahraoui",
    viewDome: "Sous la coupole",
    viewOverview: "Vue d'ensemble",
    resetView: "Réinitialiser la vue",
    resetViewShort: "Début",
    zoomIn: "Zoom avant",
    zoomOut: "Zoom arrière",
    rotateLeft: "Pivoter à gauche",
    rotateRight: "Pivoter à droite",
    rotateDrag: "Glisser pour pivoter",
  },
  music: {
    title: "Ambiance : musique de thé marocaine",
    play: "Lancer la musique",
    pause: "Mettre en pause",
    mute: "Couper le son",
    unmute: "Réactiver le son",
    volume: "Volume",
    seek: "Position de lecture",
  },
  menu: {
    label: "Menu",
    open: "Ouvrir le menu",
    close: "Fermer",
    ctaConcept: "Découvrir le concept",
    ctaTour: "Visite 3D",
    whatsapp: "WhatsApp",
    instagram: "Instagram",
    music: "Musique",
    language: "Langue",
  },
};

export default fr;
