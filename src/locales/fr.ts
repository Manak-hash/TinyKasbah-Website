import type { Messages } from "./en";

const fr: Messages = {
  common: {
    brandTagline: "L'art du thé marocain réinventé en architecture vivante",
    contact: "Nous contacter",
    languageLabel: "Langue",
    loading3d: "Chargement du modèle 3D…",
    webglMissing:
      "Votre navigateur ne peut pas afficher la 3D (WebGL).",
    webglMissingHint:
      "Essayez un navigateur récent avec l'accélération matérielle activée.",
    scrollHint: "Défilez pour avancer",
    exploreIn3d: "Explorer le concept",
    discover: "Découvrir le concept",
    dragToExplore: "Glisser pour explorer",
    cutLabel: "Vue intérieure",
  },
  hero: {
    badge: "Bientôt — un concept Terrevolution",
    title1: "Tiny Tea",
    title2: "Kasbah",
    subtitle:
      "L'art du thé marocain réinventé en architecture vivante. Un salon de thé modulaire de 6×6 m, quatre cultures, une même âme.",
    scrollCta: "Défilez pour entrer",
    stats: [
      { value: "4", label: "univers culturels" },
      { value: "6×6 m", label: "concept compact" },
      { value: "100%", label: "énergie renouvelable" },
    ],
  },
  concept: {
    backToTour: "Visite 3D",
  },
  universes: {
    kicker: "Les thèmes culturels",
    title: "Quatre cultures, une même âme",
    hint: "Glissez pour explorer les 4 univers",
    description:
      "Le visiteur choisit son univers et s'y immerge pleinement : décor, projections culturelles, saveurs de thé et atmosphère sensorielle. Un hall central sous skydome relie les quatre salons — un espace d'exposition des saveurs de thé.",
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
  viewer: {
    title: "Explorer la kasbah en 3D",
  },
  features: {
    title: "Bâtir l'authenticité avec précision",
    items: [
      {
        title: "Architecture vivante",
        text: "Arcs brisés, moucharabiehs et fontaines en zellige — chaque salon est une projection culturelle.",
      },
      {
        title: "Bioclimatique",
        text: "Skydome zénithal et pergola photovoltaïque : ombrage passif et autonomie énergétique totale.",
      },
      {
        title: "Confort passif",
        text: "Ventilation naturelle et pièces d'eau intégrées pour une régulation thermique silencieuse.",
      },
      {
        title: "Compact & réplicable",
        text: "6×6 m pensés pour les hôtels, aéroports, souks premium et espaces culturels.",
      },
    ],
    specs: [
      { value: "6,00 × 6,60 m", label: "emprise au sol" },
      { value: "3,60 m", label: "hauteur totale" },
      { value: "4 + 1", label: "salons + hall skydome" },
      { value: "WC H/F", label: "espace préparation" },
    ],
  },
  tour: {
    chapter: "Chapitre",
    entrance: {
      kicker: "L'entrée",
      title: "Une kasbah miniature, une expérience totale",
      text: "Le Tiny Kasbah n'est pas un simple café. C'est un dispositif architectural immersif qui transpose l'âme des médinas marocaines dans un format compact, réplicable et premium. Chaque espace est une projection culturelle — arcs brisés, moucharabiehs, fontaines murales, zelliges authentiques.",
    },
    hall: {
      kicker: "Le hall central",
      title: "Sous le skydome",
      text: "Un skydome zénithal bioclimatique inonde le hall central d'exposition d'une lumière vivante qui change au fil des heures. Les quatre salons s'y rejoignent — un espace de dégustation où le visiteur choisit son univers.",
    },
    salon1: {
      kicker: "Salon — Thème I",
      title: "Amazigh",
      text: "L'essence berbère — géométrie ancestrale, tapis tissés, thé à la menthe des montagnes du Haut Atlas. Une projection culturelle de l'art amazigh.",
    },
    salon2: {
      kicker: "Salon — Thème II",
      title: "Fassi",
      text: "L'élégance de Fès — zellige bleu cobalt, stuc ciselé, thé à la fleur d'oranger. L'âme raffinée de la capitale spirituelle.",
    },
    salon3: {
      kicker: "Salon — Thème III",
      title: "Sahraoui",
      text: "L'infini du désert — minimalisme ocre, textiles nomades, thé au lait de chamelle. La sérénité des espaces ouverts.",
    },
    salon4: {
      kicker: "Salon — Thème IV",
      title: "Chamali Rifi",
      text: "La vivacité du Nord — couleurs contrastées, moucharabiehs sculptés, thé au thym sauvage. La culture maritime méditerranéenne.",
    },
    overview: {
      kicker: "Conçu pour voyager",
      title: "Compact & réplicable",
      text: "Emprise au sol 6,00 × 6,60 m, hauteur totale 3,60 m, 4 salons thématiques + hall skydome, WC H/F et espace préparation. Pergola solaire bioclimatique : ombrage passif et autonomie énergétique totale. Conçu pour les hôtels, aéroports, souks premium et espaces culturels.",
    },
    cta: {
      title: "Suivez le lancement",
      text: "Préserver le patrimoine vivant du Maroc en le rendant accessible, contemporain et économiquement viable.",
      button: "Nous contacter",
    },
  },
  footer: {
    quote:
      "« Préserver le patrimoine vivant du Maroc en le rendant accessible, contemporain et économiquement viable. »",
    byline:
      "Un concept Terrevolution — suivez le lancement.",
    copyright: "Tiny Tea Kasbah. Coming soon.",
    bureauEtude: "Bureau d'étude",
    maitreOuvrage: "Maître d'ouvrage",
    partenaire: "Partenaire",
  },
  controls: {
    viewAmazigh: "Salon Amazigh",
    viewSahraoui: "Salon Sahraoui",
    viewDome: "Sous la coupole",
    viewOverview: "Vue d'ensemble",
    resetView: "Réinitialiser la vue",
    zoomIn: "Zoom avant",
    zoomOut: "Zoom arrière",
  },
};

export default fr;
