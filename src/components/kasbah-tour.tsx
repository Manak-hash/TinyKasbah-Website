"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { BackSide, Box3, Color, Group } from "three";
import type { ShaderMaterial } from "three";
import { Html, useGLTF } from "@react-three/drei";
import { ArrowDown, Loader2 } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { SKY_VERT, SKY_FRAG } from "@/components/sky-shader";

const MODEL_URL = "/models/kasbah.glb";

/**
 * Exterior scroll tour — 7 chapters, one page.
 *
 * Chapters 1-4 are the 3D journey: the camera NEVER enters the building.
 * Waypoints are authored in RAW GLB space and re-centered at runtime with
 * the same shift applied to the model (see Model). Every waypoint was
 * placed from measured geometry (all 345k decoded GLB triangles) and
 * validated at 5cm sampling: 0 collisions, min clearance 2.7m, roof
 * (max Y 3.75), dome and ground (min Y -0.15) never clipped.
 *
 * Measured GLB geometry (raw space):
 *   terrain:        X -1.84..10.93, Z -7.83..4.86
 *   hall walls:     X 1.26..7.56, Z -1.38..1.62, roofline Y≈3.15, parapets 3.75
 *   west vestibule: X -0.7..1.26, Z -1.9..-1.3 (the front door)
 *   south annexes:  X 3.19..7.54, Z -5.13..-2.51
 *   skydome crown:  ~(4.4, ·, 0.1)
 *
 * Chapters get EQUAL scroll shares (never distance-normalized — it
 * desynced text/camera before). Slot 5 of the journey is the parked high
 * aerial: the handoff beat where dusk deepens into night before the DOM
 * chapters (5-7) scroll over the fading canvas.
 */

type Waypoint = {
  pos: [number, number, number];
  target: [number, number, number];
  chapter: number; // 0-3 journey chapters + 4 = aerial park
};

const STOPS: Waypoint[] = [
  // ── Chapter 1 — L'entrée: distant dusk three-quarter → dolly to west entrance
  { pos: [-13.0, 5.5, -11.0], target: [3.8, 1.4, -1.4], chapter: 0 },
  { pos: [-9.5, 4.2, -7.5], target: [3.6, 1.4, -1.5], chapter: 0 },
  { pos: [-7.0, 2.9, -4.6], target: [2.6, 1.3, -1.6], chapter: 0 },
  { pos: [-5.2, 2.0, -1.6], target: [0.4, 1.3, -1.6], chapter: 0 },
  // ── Chapter 2 — Compact & réplicable: pull back to a straight-on elevation
  { pos: [-7.4, 2.6, -1.6], target: [1.4, 1.2, -1.45], chapter: 1 },
  { pos: [-11.8, 4.6, -1.45], target: [3.4, 0.9, -1.45], chapter: 1 },
  { pos: [-13.5, 5.6, -1.45], target: [3.6, 0.7, -1.45], chapter: 1 },
  // ── Chapter 3 — Système constructif et bioclimatique: rise to the crown
  { pos: [-11.0, 5.2, -5.0], target: [1.6, 2.0, -1.0], chapter: 2 },
  { pos: [-8.6, 7.4, -6.6], target: [3.4, 2.2, -0.4], chapter: 2 },
  { pos: [-6.4, 9.6, -8.2], target: [4.2, 2.4, 0.1], chapter: 2 },
  // ── Chapter 4 — Les quatre cultures: ONE continuous orbit, θ 100°→380°
  //    ellipse rx 9.5 / rz 8.5 around the model centre (4.55, ·, -1.45);
  //    20° steps keep the path on the arc. 4 text stops: θ 100/180/260/340.
  { pos: [2.90, 2.7, 6.92], target: [3.4, 1.3, -1.3], chapter: 3 },  // θ 100° S  — Amazigh
  { pos: [-0.20, 2.7, 5.91], target: [3.4, 1.3, -1.3], chapter: 3 }, // θ 120°
  { pos: [-2.73, 2.7, 4.01], target: [3.4, 1.3, -1.3], chapter: 3 }, // θ 140°
  { pos: [-4.38, 2.7, 1.46], target: [3.4, 1.3, -1.3], chapter: 3 }, // θ 160°
  { pos: [-4.95, 2.7, -1.45], target: [3.4, 1.3, -1.3], chapter: 3 }, // θ 180° W — Fassi
  { pos: [-4.38, 2.7, -4.36], target: [3.4, 1.3, -1.3], chapter: 3 }, // θ 200°
  { pos: [-2.73, 2.7, -6.91], target: [3.4, 1.3, -1.3], chapter: 3 }, // θ 220°
  { pos: [-0.20, 2.7, -8.81], target: [3.4, 1.3, -1.3], chapter: 3 }, // θ 240°
  { pos: [2.90, 2.7, -9.82], target: [3.4, 1.3, -1.3], chapter: 3 }, // θ 260° N — Sahraoui
  { pos: [6.20, 2.7, -9.82], target: [3.4, 1.3, -1.3], chapter: 3 }, // θ 280°
  { pos: [9.30, 2.7, -8.81], target: [3.4, 1.3, -1.3], chapter: 3 }, // θ 300°
  { pos: [11.83, 2.7, -6.91], target: [3.4, 1.3, -1.3], chapter: 3 }, // θ 320°
  { pos: [13.48, 2.7, -4.36], target: [3.4, 1.3, -1.3], chapter: 3 }, // θ 340° E — Chamali
  { pos: [14.05, 2.7, -1.45], target: [3.4, 1.3, -1.3], chapter: 3 }, // θ 360°
  { pos: [13.48, 2.7, 1.46], target: [3.4, 1.3, -1.3], chapter: 3 }, // θ 380° E-NE
  // ── Aerial park — the handoff beat (dusk → night, camera rests)
  { pos: [12.4, 6.4, 5.6], target: [4.2, 0.8, -1.2], chapter: 4 },
  { pos: [11.2, 12.0, 5.0], target: [4.4, 0.4, -1.2], chapter: 4 },
  { pos: [10.4, 15.0, 4.2], target: [4.5, 0.2, -1.2], chapter: 4 },
];

/** Model centre in raw GLB space — waypoints are authored in this same space,
 *  then both model and camera get shifted by -CENTER at render time. */
const CENTER: [number, number] = [4.55, -1.45];

const JOURNEY_CHAPTERS = 5; // 4 narrative chapters + the aerial park
const CHAPTER_TEXT_SIDES = ["right", "left", "right", "left"] as const;

/**
 * Chapter pacing: equal scroll share per chapter (NOT distance-normalized).
 * Each of the 5 journey slots owns 1/5 of the 3D scroll; the camera eases
 * within each chapter's segment range.
 */
// segment i spans stops i..i+1; a segment "belongs" to the chapter of its
// second stop (you arrive INTO the chapter).
const SEG_CHAPTER = STOPS.slice(1).map((s) => s.chapter);

function segmentAt(progress: number) {
  const p = Math.min(0.9999, Math.max(0, progress));
  const slot = Math.min(JOURNEY_CHAPTERS - 1, Math.floor(p * JOURNEY_CHAPTERS));
  const chapterT = p * JOURNEY_CHAPTERS - slot;
  let first = -1;
  let last = -1;
  for (let k = 0; k < SEG_CHAPTER.length; k++) {
    if (SEG_CHAPTER[k] === slot) {
      if (first === -1) first = k;
      last = k;
    }
  }
  if (first === -1) {
    first = last = Math.min(SEG_CHAPTER.length - 1, slot);
  }
  const span = last - first + 1;
  const localSeg = first + Math.min(span - 1, Math.floor(chapterT * span));
  const f = chapterT * span - (localSeg - first);
  const a = STOPS[localSeg];
  const b = STOPS[localSeg + 1];
  const ease = f * f * (3 - 2 * f);
  const lerp = (pp: number[], q: number[]) => [
    pp[0] + (q[0] - pp[0]) * ease,
    pp[1] + (q[1] - pp[1]) * ease,
    pp[2] + (q[2] - pp[2]) * ease,
  ] as [number, number, number];
  return {
    pos: lerp(a.pos, b.pos),
    target: lerp(a.target, b.target),
    chapter: slot,
    chapterT,
  };
}

/** Apply CENTER shift to a raw-space point → render-space. */
function shifted(p: [number, number, number]): [number, number, number] {
  return [p[0] - CENTER[0], p[1], p[2] - CENTER[1]];
}

function smoothstep(x: number, a: number, b: number) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

/**
 * Desert-night sky dome. Backside-rendered shader sphere big enough to
 * contain every camera waypoint, aerial included. uMood carries the
 * dusk→night arc of the tour (the visit ends under the stars), matched
 * to the exposure fall so the DOM chapters arrive on a night scene.
 */
function DesertNightSky({ progress }: { progress: number }) {
  const mat = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMood: { value: 0 },
      uBase: { value: new Color("#16110b") },
      uHorizon: { value: new Color("#3d2c18") },
      uAuroraA: { value: new Color("#d9a441") },
      uAuroraB: { value: new Color("#c96f3b") },
    }),
    [],
  );

  useFrame((state) => {
    if (!mat.current) return;
    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uMood.value = smoothstep(progress, 0.55, 0.95);
  });

  return (
    <>
      <fog attach="fog" args={["#231a10", 60, 220]} />
      <mesh scale={480} frustumCulled={false} renderOrder={-1}>
        <sphereGeometry args={[1, 48, 32]} />
        <shaderMaterial
          ref={mat}
          side={BackSide}
          depthWrite={false}
          uniforms={uniforms}
          vertexShader={SKY_VERT}
          fragmentShader={SKY_FRAG}
        />
      </mesh>
    </>
  );
}

function Model({ url, progress }: { url: string; progress: number }) {
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

  // The model recedes into the night during the aerial park (chapter 4):
  // a scene-side dim, the same philosophy as HeroDim — never scrims.
  useFrame(() => {
    if (!group.current) return;
    const night = smoothstep(progress, 0.55, 0.98);
    const dim = 1 - 0.5 * smoothstep(night, 0.5, 1);
    group.current.traverse((obj) => {
      const mesh = obj as { material?: { opacity?: number; transparent?: boolean } };
      if (mesh.material) {
        mesh.material.transparent = true;
        mesh.material.opacity = dim;
      }
    });
  });

  return (
    <group ref={group}>
      <primitive object={scene} />
    </group>
  );
}

/**
 * HeroDim — scene-side readability for the hero text.
 * While the hero overlay is up (progress ~ 0) the MODEL is dimmed.
 * Scroll restores everything progressively, so the text stays bare
 * (no scrim boxes) yet high-contrast, and the kasbah "wakes up".
 */
function HeroDim({ progress, children }: { progress: number; children: React.ReactNode }) {
  const group = useRef<Group>(null);
  // 1 = fully dimmed (hero), 0 = fully lit (tour). Smoothstep kills the seam.
  const t = Math.min(1, progress / 0.06);
  const dim = 1 - t * t * (3 - 2 * t);

  useFrame(() => {
    if (group.current) {
      group.current.traverse((obj) => {
        const mesh = obj as { material?: { opacity?: number; transparent?: boolean } };
        if (mesh.material) {
          mesh.material.transparent = true;
          mesh.material.opacity = 1 - 0.82 * dim;
        }
      });
    }
  });

  return (
    <>
      <group ref={group}>{children}</group>
      <ambientLight intensity={0.9 - 0.72 * dim} />
    </>
  );
}

/** Exposure follows the chapter arc: bright through the approach, warmer on
 *  the crown, falling into night across the orbit and the aerial park. */
function ExposureRig({ progress }: { progress: number }) {
  const { gl } = useThree();
  useFrame(() => {
    const night = smoothstep(progress, 0.55, 0.98);
    gl.toneMappingExposure = 1.05 - 0.5 * night;
  });
  return null;
}

function ScrollCamera({ progress }: { progress: number }) {
  const { camera, size } = useThree();

  useFrame(() => {
    const { pos, target } = segmentAt(progress);
    // Narrow viewports see a much smaller horizontal slice of the same
    // vertical FOV, so the camera dollies out from its look-target. The
    // scaled path is re-validated against the GLB triangles for the
    // 390x844 aspect (0.46 -> k≈1.49); desktop (aspect >= 1) is unchanged.
    const aspect = size.width / Math.max(1, size.height);
    const k = aspect >= 1 ? 1 : Math.min(1.7, 1 + (1 - aspect) * 0.9);
    const p = shifted(pos);
    const t = shifted(target);
    camera.position.set(t[0] + (p[0] - t[0]) * k, t[1] + (p[1] - t[1]) * k, t[2] + (p[2] - t[2]) * k);
    camera.lookAt(t[0], t[1], t[2]);
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

/** Universe photos for chapter 4 — small insets, the model stays the hero. */
const UNIVERSE_IMGS = ["/img/amazigh.jpg", "/img/fassi.jpg", "/img/sahraoui.jpg", "/img/chamali.jpg"];

/**
 * Editorial text layer for chapters 1-4. Bare typography over the scene:
 * large chapter index, display title, thin rule, short body. No boxes, no
 * backdrop-blur pills — legibility comes from the scene side (HeroDim,
 * exposure, sky). Side alternates per chapter and never covers the
 * building; on mobile the text docks bottom with the model above it.
 */
function ChapterText({
  dict,
  chapter,
  chapterT,
  progress,
  conceptPath,
}: {
  dict: Dictionary;
  chapter: number;
  chapterT: number;
  progress: number;
  conceptPath: string;
}) {
  const reduce = useReducedMotion();
  const visible = progress > 0.025 && progress < 0.985 && chapter < 4;
  const side = CHAPTER_TEXT_SIDES[Math.min(3, chapter)];
  const chapterDicts = [dict.tour.ch1, dict.tour.ch2, dict.tour.ch3];
  const isOrbit = chapter === 3;
  const universe = Math.min(3, Math.floor(chapterT * 4));
  const ch4 = dict.tour.ch4;

  const motionPreset = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 28 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
      };

  return (
    <div
      className={`pointer-events-none absolute inset-x-4 bottom-14 z-10 md:inset-x-auto md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:w-[min(80vw,420px)] transition-opacity duration-500 ${
        side === "left" ? "md:left-14" : "md:right-14"
      } ${visible ? "opacity-100" : "opacity-0"}`}
    >
      <AnimatePresence mode="wait">
        {visible && !isOrbit && (
          <motion.div
            key={`ch-${chapter}`}
            {...motionPreset}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <p className="font-display text-5xl md:text-7xl leading-none text-gold/85 select-none" aria-hidden>
              {String(chapter + 1).padStart(2, "0")}
            </p>
            <h2 className="mt-3 font-display text-2xl md:text-4xl font-semibold tracking-tight drop-shadow-[0_1px_12px_rgba(0,0,0,0.7)]">
              {chapterDicts[chapter].title}
            </h2>
            <div className="mt-3 h-px w-16 bg-gold/70 drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)]" aria-hidden />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-sand/95 md:text-base [text-shadow:0_1px_6px_rgba(0,0,0,0.75)]">
              {chapterDicts[chapter].body}
            </p>
          </motion.div>
        )}
        {visible && isOrbit && (
          <motion.div
            key={`ch4-${universe}`}
            {...motionPreset}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <p className="font-display text-5xl md:text-7xl leading-none text-gold/85 select-none" aria-hidden>
              04
            </p>
            <h2 className="mt-3 font-display text-2xl md:text-4xl font-semibold tracking-tight drop-shadow-[0_1px_12px_rgba(0,0,0,0.7)]">
              {ch4.items[universe].name}
            </h2>
            <div className="mt-3 h-px w-16 bg-gold/70 drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)]" aria-hidden />
            <div className="mt-4 flex items-start gap-4">
              <span className="block h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-sand/20 shadow-[0_4px_24px_rgba(0,0,0,0.55)] md:h-24 md:w-24">
                <Image
                  src={UNIVERSE_IMGS[universe]}
                  alt={ch4.items[universe].name}
                  width={96}
                  height={96}
                  sizes="96px"
                  className="h-full w-full object-cover"
                />
              </span>
              <p className="max-w-xs text-sm leading-relaxed text-sand/95 md:text-base [text-shadow:0_1px_6px_rgba(0,0,0,0.75)]">
                {ch4.items[universe].subtitle}
              </p>
            </div>
            <p className="mt-4 max-w-xs text-xs leading-relaxed text-sand/75 [text-shadow:0_1px_6px_rgba(0,0,0,0.75)]">
              {ch4.body}{" "}
              <a
                href={conceptPath}
                className="pointer-events-auto underline decoration-gold/50 underline-offset-4 transition-colors hover:text-gold"
              >
                {dict.common.exploreIn3d}
              </a>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Progress rail: 7 markers — 4 journey chapters, 3 DOM chapters. */
function ProgressRail({
  active,
  fade,
  hint,
}: {
  active: number; // 0-6
  fade: number; // handoff: rail dies with the canvas
  hint: string;
}) {
  return (
    <div
      className="pointer-events-none absolute top-20 left-1/2 -translate-x-1/2 md:top-auto md:bottom-8 flex flex-col items-center gap-3 transition-opacity duration-500"
      style={{ opacity: Math.max(0, 1 - fade) }}
    >
      <div className="flex gap-1.5">
        {Array.from({ length: 7 }, (_, i) => (
          <span
            key={i}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === active ? "w-8 bg-gold" : "w-3 bg-sand/25"
            }`}
          />
        ))}
      </div>
      <p
        className={`rounded-full text-[10px] tracking-[0.3em] uppercase transition-all duration-500 ${
          active > 0
            ? "px-4 py-1.5 text-sand/90"
            : "text-sand/50"
        }`}
      >
        {hint}
      </p>
    </div>
  );
}

export default function KasbahTour({
  dict,
  locale,
  conceptPath,
  children,
}: {
  dict: Dictionary;
  locale: Locale;
  conceptPath: string;
  children: React.ReactNode; // DOM chapters 5-7, scrolled over the faded scene
}) {
  const [webglOk, setWebglOk] = useState(true);
  const [progress, setProgress] = useState(0);
  const [fade, setFade] = useState(0);
  const [domChapter, setDomChapter] = useState(0); // 0-2 → rail slots 4-6
  const sectionRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const chaptersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const sp = spacerRef.current;
      const ch = chaptersRef.current;
      if (!sp || !ch) return;
      const vh = window.innerHeight;
      const rect = sp.getBoundingClientRect();
      // The spacer sits one viewport down in flow (after the sticky hero
      // slot). The journey runs from scrollY=0 until the spacer bottom
      // reaches the viewport bottom, i.e. scrollY = docTop + height - vh.
      const finish = rect.top + window.scrollY + rect.height - vh;
      if (finish > 0) {
        setProgress(Math.min(1, Math.max(0, window.scrollY / finish)));
      }
      // Handoff: as the DOM chapters rise from the viewport edge the canvas
      // fades into the site background. Both directions stay smooth because
      // the value is derived purely from scroll position.
      const chTop = ch.getBoundingClientRect().top;
      const f = Math.min(1, Math.max(0, 1 - chTop / vh));
      setFade(f * f * (3 - 2 * f));
      // Which DOM chapter owns the viewport centre (for the rail)
      const sections = ch.querySelectorAll("[data-chapter-dom]");
      let found = 0;
      sections.forEach((el, i) => {
        const r = el.getBoundingClientRect();
        if (r.top <= vh / 2) found = i;
      });
      setDomChapter(found);
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

  const { chapter, chapterT } = segmentAt(progress);
  const railActive = fade > 0.5 ? 4 + domChapter : Math.min(chapter, 3);
  const fullyFaded = fade > 0.995;

  return (
    <div ref={sectionRef} className="relative">
      <div
        className="sticky top-0 h-screen w-full overflow-hidden"
        style={{ opacity: 1 - fade, visibility: fullyFaded ? "hidden" : "visible" }}
      >
        {webglOk ? (
          <Canvas
            className="pointer-events-none"
            camera={{ position: shifted([-13.0, 5.5, -11.0]), fov: 55, near: 0.1, far: 2000 }}
            dpr={[1, 2]}
            frameloop={fullyFaded ? "never" : "always"}
            gl={{ antialias: true, localClippingEnabled: false }}
            onCreated={({ gl }) => {
              if (!gl.getContext()) setWebglOk(false);
            }}
          >
            <DesertNightSky progress={progress} />

            {/* HeroDim owns ambient while the hero is up (0.9 -> 0.18).
                Directional + interior lights fade with the same curve. */}
            <HeroDim progress={progress}>
              <directionalLight position={[30, 45, 60]} intensity={2.4} color="#fff4e0" />
              <directionalLight position={[-40, 20, -30]} intensity={0.5} color="#a8c8e0" />
              {/* interior fills keep windows/screens alive from outside */}
              <pointLight position={shifted([4.4, 2.4, 0.1])} intensity={14} color="#ffd9a0" />
              <pointLight position={shifted([2.2, 2.4, 0.6])} intensity={10} color="#ffd9a0" />
              <pointLight position={shifted([6.3, 2.4, -3.5])} intensity={10} color="#ffd9a0" />
              <pointLight position={shifted([4.4, 2.4, -3.4])} intensity={10} color="#ffd9a0" />
              <pointLight position={shifted([2.2, 2.4, 1.1])} intensity={7} color="#ffd9a0" />

              <Suspense fallback={<LoaderFallback dict={dict} />}>
                <Model url={MODEL_URL} progress={progress} />
              </Suspense>
            </HeroDim>

            <ExposureRig progress={progress} />
            <ScrollCamera progress={progress} />
          </Canvas>
        ) : (
          <WebGlFallback dict={dict} />
        )}

        {/* Scene-side vignette: readability without text-side bands */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 90% 75% at 50% 45%, transparent 55%, rgba(10,7,4,0.55) 100%)",
          }}
        />

        <ChapterText
          dict={dict}
          chapter={chapter}
          chapterT={chapterT}
          progress={progress}
          conceptPath={conceptPath}
        />

        <ProgressRail active={railActive} fade={fade} hint={dict.common.scrollHint} />

        {/* Hero — only before the tour starts (chapter 1's opening beat).
            Readability comes from the SCENE (HeroDim dims the model while
            the hero is up), so the text stays completely bare. */}
        <div
          className={`transition-opacity duration-700 ${
            progress < 0.02 ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="absolute top-[44%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full px-6 text-center">
            <p className="text-[11px] md:text-xs tracking-[0.45em] uppercase text-gold/90 drop-shadow-[0_1px_10px_rgba(0,0,0,0.8)]">
              {dict.hero.kicker}
            </p>
            <h1 className="mt-4 text-6xl md:text-8xl font-bold tracking-tight font-display drop-shadow-[0_2px_20px_rgba(0,0,0,0.85)]">
              {dict.hero.title1}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-clay to-teal">
                {dict.hero.title2}
              </span>
            </h1>
            <div className="mt-6 mx-auto h-px w-24 bg-gradient-to-r from-transparent via-gold/80 to-transparent" aria-hidden />
            <p className="mt-6 text-base md:text-xl text-sand/95 leading-relaxed max-w-lg md:max-w-xl mx-auto drop-shadow-[0_1px_10px_rgba(0,0,0,0.9)] [text-shadow:0_1px_4px_rgba(0,0,0,0.7)]">
              {dict.hero.subtitle}
            </p>
          </div>
          <div className="absolute bottom-6 inset-x-0 flex justify-center md:bottom-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-sand/15 bg-[#0e0a06]/70 px-5 py-2.5 text-sand/90 text-xs tracking-[0.25em] uppercase animate-bounce backdrop-blur-sm drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]">
              <ArrowDown className="w-4 h-4" />
              {dict.hero.scrollCta}
            </div>
          </div>
        </div>

        {/* language switcher stays accessible */}
        <input type="hidden" data-locale={locale} />
      </div>

      {/* 3D scroll range: 5 journey slots × ~92vh each. Deliberate pacing
          without stalls: chapters are equal, segments ease within each. */}
      <div ref={spacerRef} style={{ height: "460vh" }} aria-hidden />

      {/* Chapters 5-7: DOM editorial scrolling OVER the parked, fading scene.
          Solid site background so the handoff reads as one continuous page. */}
      <div ref={chaptersRef} className="relative z-10 bg-background">
        {children}
      </div>
    </div>
  );
}
