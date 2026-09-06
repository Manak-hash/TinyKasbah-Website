"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Box3, Group, Plane, Vector3 } from "three";
import { Html, useGLTF } from "@react-three/drei";
import { Loader2, ArrowDown } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";

const MODEL_URL = "/models/kasbah.glb";

/**
 * Scrollytelling tour. Camera waypoints are authored against the re-centered
 * model (building bbox center = 0,0; floor = 0). Each segment pairs with an
 * info panel that fades in while the camera travels it.
 *
 * Geometry facts from the GLB:
 *  - main pavilion slab X -1.9..4.1, Y -3.0..3.6 (6.0 × 6.6 m), walls h≈3.5
 *  - west entrance: gaps in the west face around Y≈0
 *  - interior dividing wall X≈1.35, doorway gap at Y 1.4–1.5
 *  - east annex X 1.4..7.5, dividers X 3.3 / 5.5; north rooms Y 1.5..5.0
 */
type Stop = {
  pos: [number, number, number];
  target: [number, number, number];
  panel: "entrance" | "hall" | "salon1" | "salon2" | "salon3" | "salon4" | "overview";
  side: "left" | "right";
};

const STOPS: Stop[] = [
  // 1 — approach + entrance story
  { pos: [-16, 9, 2.8], target: [0.5, 0.5, 1.4], panel: "entrance", side: "left" },
  { pos: [-6, 2.5, 1.9], target: [0.5, 0.5, 1.2], panel: "entrance", side: "left" },
  { pos: [-2.6, 0.4, 1.6], target: [2.0, 0.4, 1.2], panel: "entrance", side: "left" },
  // 2 — through the door into the hall
  { pos: [-0.8, 0.35, 1.55], target: [3.5, 0.3, 1.1], panel: "hall", side: "right" },
  { pos: [0.7, 0.5, 1.5], target: [4.0, 0.3, 1.1], panel: "hall", side: "right" },
  { pos: [0.9, 1.0, 1.5], target: [0.5, 1.6, 1.2], panel: "hall", side: "right" }, // look up at dome
  // 3 — turn west: salon 1 (Amazigh)
  { pos: [0.6, 1.0, 1.3], target: [-1.5, 1.0, 0.5], panel: "salon1", side: "left" },
  { pos: [-0.6, 1.1, 0.2], target: [-1.6, 1.1, -1.2], panel: "salon1", side: "left" },
  // 4 — east through doorway: salon 2 (Fassi, annex)
  { pos: [0.9, 1.45, 1.45], target: [4.5, 1.45, 1.1], panel: "salon2", side: "right" },
  { pos: [1.9, 1.45, 1.4], target: [5.5, 1.2, 1.0], panel: "salon2", side: "right" },
  { pos: [3.4, 1.3, 1.2], target: [6.8, 1.1, 0.2], panel: "salon2", side: "right" },
  // 5 — north room: salon 3 (Sahraoui)
  { pos: [3.6, 1.3, 1.6], target: [4.2, 1.3, 4.0], panel: "salon3", side: "left" },
  { pos: [4.0, 1.35, 3.2], target: [4.6, 1.3, 4.8], panel: "salon3", side: "left" },
  // 6 — east corner: salon 4 (Chamali Rifi)
  { pos: [5.2, 1.3, 2.6], target: [7.0, 1.2, 0.6], panel: "salon4", side: "right" },
  { pos: [6.2, 1.35, 1.0], target: [7.3, 1.2, -1.0], panel: "salon4", side: "right" },
  // 7 — rise above roof: overview + specs
  { pos: [6.5, 3.0, 4.0], target: [1.5, 0.5, 1.0], panel: "overview", side: "left" },
  { pos: [9, -2, 9.0], target: [1.0, 0.5, 0.8], panel: "overview", side: "left" },
  { pos: [14, -10, 11], target: [1.0, 0.5, 1.0], panel: "overview", side: "left" },
];

const TOTAL = STOPS.length - 1;

function segmentAt(progress: number) {
  const scaled = Math.min(0.9999, Math.max(0, progress)) * TOTAL;
  const i = Math.min(TOTAL - 1, Math.floor(scaled));
  const f = scaled - i;
  const a = STOPS[i];
  const b = STOPS[i + 1];
  const ease = f * f * (3 - 2 * f);
  const lerp = (p: number[], q: number[]) => [
    p[0] + (q[0] - p[0]) * ease,
    p[1] + (q[1] - p[1]) * ease,
    p[2] + (q[2] - p[2]) * ease,
  ] as [number, number, number];
  return {
    pos: lerp(a.pos, b.pos),
    target: lerp(a.target, b.target),
    // visible panel = whichever stop the pair agrees on
    panel: f < 0.5 ? a.panel : b.panel,
    side: f < 0.5 ? a.side : b.side,
    index: i,
  };
}

function Model({ url }: { url: string }) {
  const group = useRef<Group>(null);
  const { scene } = useGLTF(url);
  const centered = useRef(false);

  useEffect(() => {
    if (centered.current || !group.current) return;
    centered.current = true;
    // Node transforms carry the IFC site placement — recenter the building
    // so the authored waypoints (building center = 0,0) line up.
    const box = new Box3().setFromObject(scene);
    const center = box.getCenter(new Vector3());
    group.current.position.set(-center.x, -box.min.y, -center.z);
  }, [scene]);

  return (
    <group ref={group}>
      <primitive object={scene} />
    </group>
  );
}

function ScrollCamera({ progress }: { progress: number }) {
  const { camera } = useThree();

  useFrame(() => {
    const { pos, target } = segmentAt(progress);
    camera.position.lerp(new Vector3(...pos), 0.14);
    camera.lookAt(new Vector3(...target));
  });

  return null;
}

/** Roof clip while inside; off outside. */
function InteriorReveal({ progress }: { progress: number }) {
  const gl = useThree((s) => s.gl);
  const plane = useMemo(() => new Plane(new Vector3(0, 0, -1), 40), []);

  useFrame(() => {
    if (progress > 0.12 && progress < 0.86) {
      plane.constant = 2.35;
      gl.clippingPlanes[0] = plane;
      gl.clippingPlanes.length = 1;
    } else if (gl.clippingPlanes.length !== 0) {
      gl.clippingPlanes.length = 0;
    }
  });

  return null;
}

function WebGlFallback({ dict }: { dict: Dictionary }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-sand/70 text-center px-8">
      <p className="text-sm">{dict.common.webglMissing}</p>
      <p className="text-xs text-sand/50">{dict.common.webglMissingHint}</p>
    </div>
  );
}

function LoaderFallback({ dict }: { dict: Dictionary }) {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3 text-sand/70">
        <Loader2 className="w-7 h-7 animate-spin text-gold" />
        <p className="text-xs tracking-widest uppercase">{dict.common.loading3d}</p>
      </div>
    </Html>
  );
}

type TourKey = Stop["panel"];

export default function KasbahTour({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const [ready, setReady] = useState(false);
  const [webglOk, setWebglOk] = useState(true);
  const [progress, setProgress] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ready) return;
    const onScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      if (scrollable <= 0) return;
      setProgress(Math.min(1, Math.max(0, -rect.top / scrollable)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [ready]);

  const { panel, side } = segmentAt(progress);
  const chapterIndex = ["entrance", "hall", "salon1", "salon2", "salon3", "salon4", "overview"].indexOf(panel) + 1;
  const panelDict = dict.tour[panel as TourKey];
  const visible = ready && progress > 0.02;

  return (
    <div ref={sectionRef} className="relative" style={{ height: "700vh" }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {webglOk ? (
          <Canvas
            camera={{ position: [-16, 9, 2.8], fov: 55, near: 0.1, far: 2000 }}
            dpr={[1, 2]}
            gl={{ antialias: true }}
            onCreated={({ gl }) => {
              if (!gl.getContext()) setWebglOk(false);
              setReady(true);
            }}
          >
            <color attach="background" args={["#0d0f0e"]} />
            <fog attach="fog" args={["#0d0f0e", 30, 140]} />

            <ambientLight intensity={0.9} />
            <directionalLight position={[30, 45, 60]} intensity={2.4} color="#fff4e0" />
            <directionalLight position={[-40, 20, -30]} intensity={0.5} color="#a8c8e0" />
            {/* interior fills so rooms stay readable */}
            <pointLight position={[0.5, 0, 2.6]} intensity={14} color="#ffd9a0" />
            <pointLight position={[3.5, 0, 2.4]} intensity={10} color="#ffd9a0" />
            <pointLight position={[5.5, 0, 1.0]} intensity={7} color="#ffd9a0" />
            <pointLight position={[4.4, 0, 3.5]} intensity={7} color="#ffd9a0" />

            <Suspense fallback={<LoaderFallback dict={dict} />}>
              <Model url={MODEL_URL} />
            </Suspense>

            <ScrollCamera progress={progress} />
            <InteriorReveal progress={progress} />
          </Canvas>
        ) : (
          <WebGlFallback dict={dict} />
        )}

        {/* Subtle vignette for panel readability */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-transparent" />

        {/* Info panel — alternates sides per chapter */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-[min(88vw,380px)] transition-all duration-500 ${
            side === "left" ? "left-6 md:left-14" : "right-6 md:right-14"
          } ${visible ? "opacity-100" : "opacity-0"}`}
        >
          <div
            key={panel}
            className="rounded-3xl border border-sand/15 bg-[#101312]/85 backdrop-blur-md p-6 md:p-7 shadow-2xl"
          >
            <p className="text-[10px] tracking-[0.3em] uppercase text-gold">
              {dict.tour.chapter} {chapterIndex}/7 — {panelDict.kicker}
            </p>
            <h3 className="mt-3 text-2xl md:text-3xl font-bold">{panelDict.title}</h3>
            <p className="mt-3 text-sm text-sand/70 leading-relaxed">{panelDict.text}</p>
          </div>
        </div>

        {/* Progress rail */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 pointer-events-none">
          <div className="flex gap-1.5">
            {(["entrance", "hall", "salon1", "salon2", "salon3", "salon4", "overview"] as TourKey[]).map(
              (k, i) => (
                <span
                  key={k}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === chapterIndex - 1 ? "w-8 bg-gold" : "w-3 bg-sand/25"
                  }`}
                />
              ),
            )}
          </div>
          <p className="text-[10px] tracking-[0.3em] uppercase text-sand/50">
            {dict.common.scrollHint}
          </p>
        </div>

        {/* Hero scroll CTA — only before the tour starts */}
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center transition-opacity duration-700 ${
            progress < 0.02 ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <p className="text-xs tracking-[0.35em] uppercase text-gold/90">{dict.hero.badge}</p>
          <h1 className="mt-4 text-5xl md:text-7xl font-bold tracking-tight">
            {dict.hero.title1}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-clay to-teal">
              {dict.hero.title2}
            </span>
          </h1>
          <p className="mt-5 text-lg text-sand/85 max-w-xl mx-auto">{dict.hero.subtitle}</p>
          <div className="mt-8 inline-flex items-center gap-2 text-sand/70 text-xs tracking-[0.25em] uppercase animate-bounce">
            <ArrowDown className="w-4 h-4" />
            {dict.hero.scrollCta}
          </div>
        </div>

        {/* Final CTA — at the overview */}
        <div
          className={`absolute bottom-10 right-6 md:right-14 w-[min(88vw,380px)] transition-all duration-700 ${
            progress > 0.9 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6 pointer-events-none"
          }`}
        >
          <div className="rounded-3xl border border-gold/30 bg-gradient-to-b from-gold/15 to-transparent backdrop-blur-md p-6 text-center">
            <p className="font-semibold">{dict.tour.cta.title}</p>
            <p className="mt-2 text-xs text-sand/70 leading-relaxed">{dict.tour.cta.text}</p>
            <a
              href="mailto:terrevolution@outlook.com"
              className="mt-4 inline-block px-6 py-2.5 rounded-full bg-clay hover:bg-clay/90 text-white text-sm font-medium transition-colors"
            >
              {dict.tour.cta.button}
            </a>
          </div>
        </div>

        {/* language switcher stays accessible */}
        <input type="hidden" data-locale={locale} />
      </div>
    </div>
  );
}
