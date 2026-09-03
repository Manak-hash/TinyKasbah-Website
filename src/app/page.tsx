"use client";

import { CarouselSlider, type UniverseSlide } from "@/components/watermelon-ui/carousel-slider";
import KasbahViewer from "@/components/kasbah-viewer";
import { Croissant, Droplets, Sun, Wind } from "lucide-react";
import Image from "next/image";

const UNIVERSES: UniverseSlide[] = [
  {
    id: 1,
    img: "/img/amazigh.jpg",
    title: "Amazigh",
    subtitle: "Géométrie ancestrale, thé à la menthe du Haut Atlas",
    accent: "text-[#d9a441]",
  },
  {
    id: 2,
    img: "/img/fassi.jpg",
    title: "Fassi",
    subtitle: "Zellige bleu cobalt, stuc ciselé, fleur d'oranger",
    accent: "text-[#7fb4d9]",
  },
  {
    id: 3,
    img: "/img/sahraoui.jpg",
    title: "Sahraoui",
    subtitle: "Minimalisme ocre, nomadisme, thé au lait de chamelle",
    accent: "text-[#e0956b]",
  },
  {
    id: 4,
    img: "/img/chamali.jpg",
    title: "Chamali Rifi",
    subtitle: "Bleu de Chefchaouen, thym sauvage, Méditerranée",
    accent: "text-[#8fd0c9]",
  },
];

const FEATURES = [
  {
    icon: Croissant,
    title: "Architecture vivante",
    text: "Arcs brisés, moucharabiehs et fontaines en zellige — chaque salon est une projection culturelle.",
  },
  {
    icon: Sun,
    title: "Bioclimatique",
    text: "Skydome zénithal et pergola photovoltaïque : ombrage passif et autonomie énergétique totale.",
  },
  {
    icon: Droplets,
    title: "Confort passif",
    text: "Ventilation naturelle et pièces d'eau intégrées pour une régulation thermique silencieuse.",
  },
  {
    icon: Wind,
    title: "Compact & réplicable",
    text: "6×6 m pensés pour les hôtels, aéroports, souks premium et espaces culturels.",
  },
];

export default function Home() {
  return (
    <main className="zellige-bg min-h-dvh">
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/img/hero.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-16 md:pt-32 md:pb-24 text-center">
          <p className="animate-fade-up text-xs tracking-[0.35em] uppercase text-gold/90">
            Bientôt — un concept Terrevolution
          </p>

          <h1 className="animate-fade-up animation-delay-200 mt-6 text-5xl md:text-7xl font-bold tracking-tight">
            Tiny Tea{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-clay to-teal">
              Kasbah
            </span>
          </h1>

          <p className="animate-fade-up animation-delay-400 mt-6 text-lg md:text-xl text-sand/90 max-w-2xl mx-auto">
            L&apos;art du thé marocain réinventé en architecture vivante. Un
            salon de thé modulaire de 6×6 m, quatre cultures, une même âme.
          </p>

          <div className="animate-fade-up animation-delay-600 mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#univers"
              className="px-7 py-3 rounded-full bg-clay hover:bg-clay/90 text-white font-medium transition-colors"
            >
              Découvrir le concept
            </a>
            <a
              href="#contact"
              className="px-7 py-3 rounded-full border border-sand/25 hover:border-sand/60 text-sand/90 font-medium transition-colors"
            >
              Nous contacter
            </a>
          </div>

          {/* Key numbers */}
          <div className="animate-fade-up animation-delay-600 mt-14 grid grid-cols-3 gap-6 max-w-md mx-auto">
            {[
              { n: "4", l: "univers culturels" },
              { n: "6×6 m", l: "concept compact" },
              { n: "100%", l: "énergie renouvelable" },
            ].map((s) => (
              <div key={s.l}>
                <p className="text-2xl md:text-3xl font-bold text-gold">{s.n}</p>
                <p className="text-xs text-sand/60 mt-1">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Universes carousel ---------- */}
      <section id="univers" className="max-w-6xl mx-auto px-6 py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-14 items-center">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-teal">
              Les thèmes culturels
            </p>
            <h2 className="mt-4 text-3xl md:text-4xl font-bold">
              Quatre cultures, une même âme
            </h2>
            <p className="mt-5 text-sand/75 leading-relaxed">
              Le visiteur choisit son univers et s&apos;y immerge pleinement :
              décor, projections culturelles, saveurs de thé et atmosphère
              sensorielle. Un hall central sous skydome relie les quatre
              salons — un espace d&apos;exposition des saveurs de thé.
            </p>
            <ul className="mt-8 space-y-4">
              {UNIVERSES.map((u) => (
                <li key={u.id} className="flex items-baseline gap-3">
                  <span className={`font-semibold ${u.accent}`}>{u.title}</span>
                  <span className="text-sm text-sand/60">{u.subtitle}</span>
                </li>
              ))}
            </ul>
          </div>

          <CarouselSlider slides={UNIVERSES} />
        </div>
      </section>

      {/* ---------- 3D model ---------- */}
      <section className="max-w-6xl mx-auto px-6 pb-4">
        <KasbahViewer />
      </section>

      {/* ---------- Features ---------- */}
      <section className="border-t border-sand/10">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-24">
          <h2 className="text-3xl md:text-4xl font-bold text-center">
            Bâtir l&apos;authenticité avec précision
          </h2>
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-3xl border border-sand/12 bg-white/[0.03] p-6 hover:border-gold/40 transition-colors"
              >
                <f.icon className="w-7 h-7 text-gold" strokeWidth={1.5} />
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-sand/65 leading-relaxed">
                  {f.text}
                </p>
              </div>
            ))}
          </div>

          {/* Specs strip */}
          <div className="mt-12 rounded-3xl border border-sand/12 bg-white/[0.02] px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { n: "6,00 × 6,60 m", l: "emprise au sol" },
              { n: "3,60 m", l: "hauteur totale" },
              { n: "4 + 1", l: "salons + hall skydome" },
              { n: "WC H/F", l: "espace préparation" },
            ].map((s) => (
              <div key={s.l}>
                <p className="font-semibold text-sand">{s.n}</p>
                <p className="text-xs text-sand/55 mt-1">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Footer / contact ---------- */}
      <footer id="contact" className="border-t border-sand/10">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <Image
            src="/img/tea.jpg"
            alt="Thé à la menthe marocain"
            width={160}
            height={208}
            className="arch-mask w-40 h-52 object-cover mx-auto opacity-90"
          />
          <p className="mt-8 text-lg font-medium">
            « Préserver le patrimoine vivant du Maroc en le rendant accessible,
            contemporain et économiquement viable. »
          </p>
          <p className="mt-6 text-sm text-sand/60">
            Un concept <span className="text-gold">Terrevolution</span> — suivez
            le lancement.
          </p>
          <p className="mt-8 text-xs text-sand/40">
            © {new Date().getFullYear()} Tiny Tea Kasbah. Coming soon.
          </p>
        </div>
      </footer>
    </main>
  );
}
