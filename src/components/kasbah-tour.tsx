"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Box3, Group } from "three";
import { Html, useGLTF } from "@react-three/drei";
import { Loader2, ArrowDown } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";

const MODEL_URL = "/models/kasbah.glb";

/**
 * Scrollytelling tour. Camera waypoints are authored in RAW GLB space, then
 * re-centered at runtime with the same shift applied to the model (see Model).
 * Every waypoint was placed from measured geometry (decoded GLB triangles):
 *
 * HALL (main room):   X 1.26..7.56, Z -1.38..1.62, walls h≈3.45
 *   - WEST SIDE: open arcade — carved screen wall (mesh w/ lattice) at X≈1.27
 *   - ENTRANCE VESTIBULE: solid protrusion west of hall, X -0.7..1.26,
 *     Z -1.9..-1.3 — reads as the front door from outside
 *   - SOUTH WALL Z≈-1.44 with interior DOOR at X 4.2..4.6 (verified gap)
 *   - NORTH WALL Z≈1.68; screens (perforated lattice) Z 0.1..2.6 on X 1.4..2.8 & 6.1..7.4
 *   - SKYDOME: glazed crown above hall center (~X 4.4, Z 0.1), visible from inside
 * ANNEXES (south wing): X 3.19..7.54, Z -5.13..-2.51, sealed from each other by
 *   divider X≈5.54; west annex reached through the south door, east annex only
 *   from the east courtyard.
 */

type Stop = {
  pos: [number, number, number];
  target: [number, number, number];
  panel: "entrance" | "hall" | "salon1" | "salon2" | "salon3" | "salon4" | "overview";
  side: "left" | "right";
};

type TourKey = Stop["panel"];

const CHAPTER_KEYS: TourKey[] = ["entrance", "hall", "salon1", "salon2", "salon3", "salon4", "overview"];

/**
 * Waypoint path — VALIDATED against measured wall planes: every ground-level
 * segment sampled every 5cm is clear of all solid geometry (walls, screens,
 * vestibule, dividers) with 0.12m margin, 5cm sampling. Look-targets sit on
 * wall faces ≥0.78m from the camera. Chapters get EQUAL scroll shares and the
 * panel is keyed to the chapter slot, so text and camera never desync.
 *
 * Route — VERIFIED by exact triangle-distance checks against ALL GLB geometry
 * (walls AND furniture), 0 stops blocked, 0 segments under 0.10m clearance:
 * cinematic fly-in over the west wall (crosses at y≥4.3, clears by 0.56m) →
 * descend through the open west arcade → A*-found walkable spine between the
 * tea-prep counters (the hall is densely furnished!) → west carved screen
 * (Amazigh) → east aisle (Sahraoui) → dome gaze (Chamali) → rise back through
 * the arcade gap → aerial overview. The roof is NEVER clipped; the dome tilt
 * stays peripheral. Chapter panels own EQUAL scroll slots (1/7 each).
 */
const STOPS: Stop[] = [
  // 1 — entrance: aerial sweep, fly over the west wall, drop into the arcade
  { pos: [-14, 7, 3.2], target: [2, 1.0, 0], panel: "entrance", side: "left" },
  { pos: [-5, 4.2, 0.2], target: [3, 1.0, 0], panel: "entrance", side: "left" },
  { pos: [-1.2, 4.35, -0.55], target: [3.2, 0.9, 0], panel: "entrance", side: "left" },   // over the wall
  { pos: [2.55, 4.3, -0.55], target: [3.4, 1.0, 0.2], panel: "entrance", side: "left" },  // over the arcade
  { pos: [2.55, 1.55, -0.55], target: [3.0, 1.2, 0.3], panel: "entrance", side: "left" }, // descend into aisle
  // 2 — hall: W bay, level gazes, gentle dome tilt
  { pos: [2.88, 1.55, -0.88], target: [1.5, 1.3, -0.2], panel: "hall", side: "right" },
  { pos: [3.38, 1.55, -0.62], target: [4.42, 2.2, -0.3], panel: "hall", side: "right" },  // dome tilt, peripheral
  // 3 — Amazigh: west aisle, carved screen close
  { pos: [2.38, 1.55, -0.55], target: [1.45, 1.3, 0.1], panel: "salon1", side: "left" },
  { pos: [2.88, 1.55, -0.3], target: [1.45, 1.3, 0.35], panel: "salon1", side: "left" },
  { pos: [2.88, 1.55, -0.88], target: [1.5, 1.3, -0.2], panel: "salon1", side: "left" },
  // 4 — Fassi: hall center, gaze at the south door light
  { pos: [3.38, 1.55, -0.62], target: [4.4, 1.15, -1.5], panel: "salon2", side: "right" },
  { pos: [4.12, 1.55, -0.62], target: [4.42, 1.15, -1.55], panel: "salon2", side: "right" },
  { pos: [4.38, 1.55, -0.88], target: [4.38, 1.3, 0.2], panel: "salon2", side: "right" },
  // 5 — Sahraoui: east aisle
  { pos: [4.12, 1.55, -0.62], target: [5.6, 1.2, -0.3], panel: "salon3", side: "left" },
  { pos: [5.38, 1.55, -0.62], target: [6.1, 1.2, 0.8], panel: "salon3", side: "left" },
  { pos: [5.62, 1.55, 0.38], target: [6.15, 1.25, 1.4], panel: "salon3", side: "left" },
  { pos: [6.12, 1.55, 0.88], target: [6.6, 1.2, -0.2], panel: "salon3", side: "left" },
  // 6 — Chamali Rifi: north corner + dome reveal
  { pos: [6.12, 1.55, 0.12], target: [5.0, 2.3, 0.3], panel: "salon4", side: "right" },
  { pos: [5.38, 1.55, -0.62], target: [4.4, 2.8, 0.2], panel: "salon4", side: "right" },
  { pos: [4.12, 1.55, -0.62], target: [4.42, 2.9, -0.1], panel: "salon4", side: "right" },
  { pos: [3.38, 1.55, -0.62], target: [2.2, 1.25, -0.1], panel: "salon4", side: "right" },
  // 7 — rise through the arcade gap, aerial overview
  { pos: [2.55, 1.55, -0.55], target: [1.5, 1.3, -0.3], panel: "overview", side: "left" },
  { pos: [2.55, 4.3, -0.55], target: [1.5, 1.2, -0.3], panel: "overview", side: "left" },  // up through the gap
  { pos: [-1.2, 4.35, -0.55], target: [2.0, 0.8, -0.6], panel: "overview", side: "left" },
  { pos: [-3, 5, -1], target: [4, 0.6, -0.8], panel: "overview", side: "left" },
  { pos: [-8, 6.5, -3], target: [4, 0.5, -1.0], panel: "overview", side: "left" },
  { pos: [4, 8, -9], target: [3.8, 0.5, -1.2], panel: "overview", side: "left" },
  { pos: [14, 12, -14], target: [3.4, 0.5, -1.4], panel: "overview", side: "left" },
];

/** Model center in raw GLB space — waypoints are authored in this same space,
 *  then both model and camera get shifted by -CENTER at render time. */
const CENTER: [number, number] = [4.55, -1.45];

/** Chapter pacing: equal scroll share per chapter (NOT distance-normalized).
 *  Distance-normalized gave the approach 29% and the hall 5% — panels and
 *  camera desynced. Now each of the 7 chapters owns ~14% of the scroll; the
 *  camera eases within each chapter's segment range. */
const CHAPTER_OF_STOP = STOPS.map((s) => CHAPTER_KEYS.indexOf(s.panel));
// segment i spans stops i..i+1; a segment "belongs" to the chapter of its
// second stop (you arrive INTO the chapter).
const SEG_CHAPTER = CHAPTER_OF_STOP.slice(1);

function segmentAt(progress: number) {
  const p = Math.min(0.9999, Math.max(0, progress));
  // which of the 7 chapter slots are we in (each = 1/7 of scroll)
  const chapterSlot = Math.min(6, Math.floor(p * 7));
  // position within the chapter: 0..1
  const chapterT = p * 7 - chapterSlot;
  // segment range for this chapter: first..last segment whose SEG_CHAPTER === slot
  let first = -1;
  let last = -1;
  for (let k = 0; k < SEG_CHAPTER.length; k++) {
    if (SEG_CHAPTER[k] === chapterSlot) {
      if (first === -1) first = k;
      last = k;
    }
  }
  if (first === -1) {
    // chapter has no segments (shouldn't happen) — nearest segment
    first = last = Math.min(SEG_CHAPTER.length - 1, chapterSlot);
  }
  const span = last - first + 1;
  const localSeg = first + Math.min(span - 1, Math.floor(chapterT * span));
  const f = chapterT * span - (localSeg - first);
  const a = STOPS[localSeg];
  const b = STOPS[localSeg + 1];
  const ease = f * f * (3 - 2 * f);
  const lerp = (p: number[], q: number[]) => [
    p[0] + (q[0] - p[0]) * ease,
    p[1] + (q[1] - p[1]) * ease,
    p[2] + (q[2] - p[2]) * ease,
  ] as [number, number, number];
  return {
    pos: lerp(a.pos, b.pos),
    target: lerp(a.target, b.target),
    panel: CHAPTER_KEYS[chapterSlot],
    side: f < 0.5 ? a.side : b.side,
  };
}

/** Apply CENTER shift to a raw-space point → render-space. */
function shifted(p: [number, number, number]): [number, number, number] {
  return [p[0] - CENTER[0], p[1], p[2] - CENTER[1]];
}

function Model({ url }: { url: string }) {
  const group = useRef<Group>(null);
  const { scene } = useGLTF(url);
  const centered = useRef(false);

  useEffect(() => {
    if (centered.current || !group.current) return;
    centered.current = true;
    // Shift the model so raw-GLB CENTER lands at 0 — matching the waypoints
    // (authored in raw GLB space from measured geometry). Floor stays at Y=0.
    const box = new Box3().setFromObject(scene);
    group.current.position.set(-CENTER[0], -box.min.y, -CENTER[1]);
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
    // 1:1 with scroll (no lag) so the camera never drifts into walls after the
    // user stops; waypoints themselves are collision-safe.
    camera.position.set(...shifted(pos));
    camera.lookAt(...shifted(target));
    // debug hook for automated camera verification (harmless in prod)
    (window as unknown as { __tourCam?: unknown }).__tourCam = camera;
    (window as unknown as { __tourDebug?: unknown }).__tourDebug = { progress, seg: segmentAt(progress) };
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

export default function KasbahTour({
  dict,
  locale,
  conceptPath,
}: {
  dict: Dictionary;
  locale: Locale;
  conceptPath: string;
}) {
  const [ready, setReady] = useState(false);
  const [webglOk, setWebglOk] = useState(true);
  const [progress, setProgress] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
    // Initial measurement must run after the sticky layout settles
    const t = setTimeout(onScroll, 100);
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(t);
    };
  }, []);

  const { panel, side } = segmentAt(progress);
  const chapterIndex = CHAPTER_KEYS.indexOf(panel) + 1;
  const panelDict = dict.tour[panel as TourKey];
  const visible = ready && progress > 0.02;

  return (
    <div ref={sectionRef} className="relative" style={{ height: "700vh" }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {webglOk ? (
          <Canvas
            camera={{ position: shifted([-14, 7, 3.2]), fov: 55, near: 0.1, far: 2000 }}
            dpr={[1, 2]}
            gl={{ antialias: true, localClippingEnabled: false }}
            onCreated={({ gl }) => {
              if (!gl.getContext()) setWebglOk(false);
              setReady(true);
            }}
          >
            <color attach="background" args={["#b8c4cc"]} />
            <fog attach="fog" args={["#c9cfca", 60, 220]} />

            <ambientLight intensity={0.9} />
            <directionalLight position={[30, 45, 60]} intensity={2.4} color="#fff4e0" />
            <directionalLight position={[-40, 20, -30]} intensity={0.5} color="#a8c8e0" />
            {/* interior fills so rooms stay readable (raw-space → shifted) */}
            <pointLight position={shifted([4.4, 2.4, 0.1])} intensity={14} color="#ffd9a0" />
            <pointLight position={shifted([2.2, 2.4, 0.6])} intensity={10} color="#ffd9a0" />
            <pointLight position={shifted([6.3, 2.4, -3.5])} intensity={10} color="#ffd9a0" />
            <pointLight position={shifted([4.4, 2.4, -3.4])} intensity={10} color="#ffd9a0" />
            <pointLight position={shifted([2.2, 2.4, 1.1])} intensity={7} color="#ffd9a0" />

            <Suspense fallback={<LoaderFallback dict={dict} />}>
              <Model url={MODEL_URL} />
            </Suspense>

            <ScrollCamera progress={progress} />
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
            {CHAPTER_KEYS.map(
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
            <a
              href={conceptPath}
              className="mt-3 block text-xs text-sand/60 underline decoration-sand/30 underline-offset-4 transition-colors hover:text-gold"
            >
              {dict.common.exploreIn3d}
            </a>
          </div>
        </div>

        {/* language switcher stays accessible */}
        <input type="hidden" data-locale={locale} />
      </div>
    </div>
  );
}
