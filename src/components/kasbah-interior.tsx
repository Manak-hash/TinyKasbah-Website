"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { Group } from "three";
import { Box3, Color, Plane, Spherical, Vector3 } from "three";
import { Html, MapControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import {
  Loader2,
  Move3d,
  Scissors,
  Sun,
  SunDim,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RotateCw,
  Armchair,
  Tent,
  Mountain,
} from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries";

const MODEL_URL = "/models/kasbah.glb";

/**
 * Full-viewport free-explore interior viewer for /concept.
 * Controls: drag = look around, right-drag / two-finger = pan the floor plan,
 * wheel / pinch = approach. Viewpoint buttons fly the camera along eased
 * paths between waypoints validated against the model's wall geometry
 * (same coordinate space as the scroll tour: raw GLB space minus hall
 * center). Camera flights cancel the instant the user grabs the scene.
 *
 * Daylight study: a time-of-day slider drives a continuous sun path over the
 * kasbah — direction, color temperature and intensity all derive from ONE
 * time value, so the skydome hall reads differently at each hour (the
 * bioclimatic story, shown instead of told). Render-space sun arc: east is
 * +X (the long 12.8 m facade axis), +Z is the southern tilt, elevation peaks
 * near Casablanca's high noon sun. The interior fill lights stay fixed so
 * the model never goes fully dark at the day's edges.
 */

/** Hall center in raw GLB space — the model is shifted so this lands at 0. */
const HALL_CENTER: [number, number] = [4.3, 0.1];

/** Section-cut slider mapping (model X span is roughly ±22.5 m after centering):
 *  slider 0 -> nothing cut, slider 100 -> sliced past the hall center. */
const NO_CUT = 25;
const FULL_CUT = -6;

/** Camera viewpoints in RENDER space (raw minus HALL_CENTER). Every position
 *  is a scroll-tour waypoint that was validated collision-free. */
const VIEWS = {
  amazigh: { pos: [-2.6, 1.6, -0.75], target: [-2.85, 1.3, 0.25] },
  sahraoui: { pos: [1.7, 1.6, -1.15], target: [1.8, 1.2, 0.7] },
  dome: { pos: [1.08, 1.15, -0.72], target: [0.1, 2.6, 0.1] },
  overview: { pos: [9.7, 12, -14.1], target: [-0.9, 0.5, -1.5] },
} as const;

/** Home/reset view: outside the main doors with the door itself at the
 *  CENTER of the frame, camera offset to the right (south) for the
 *  "portrait de côté" 3/4 read. The camera STARTS here on page load
 *  (Canvas camera prop) and the reset button returns here. Render space =
 *  raw minus HALL_CENTER; door/vestibule render ≈ X -5..-3, Z -2..-1.4. */
const RESET_VIEW = {
  pos: [-4.13, 2.16, 5.09],
  target: [1.84, 1.4, -0.43],
} as const;

/** Camera height clamp in render space — the user never goes under the
 *  floor or above the roofline while orbiting/panning. */
const MIN_CAM_Y = 0.35;
const MAX_CAM_Y = 6.5;

type Vec3 = readonly [number, number, number];
type ViewRequest = { pos: Vec3; target: Vec3; duration: number; seq: number };
type ZoomRequest = { factor: number; seq: number };
type RotateRequest = { delta: number; seq: number };

const smooth = (t: number) => t * t * (3 - 2 * t);
const lerp3 = (a: Vec3, b: Vec3, f: number): [number, number, number] => [
  a[0] + (b[0] - a[0]) * f,
  a[1] + (b[1] - a[1]) * f,
  a[2] + (b[2] - a[2]) * f,
];

/* ------------------------------ daylight ------------------------------ */

/** Day arc: 6:00 -> 20:00 mapped to t 0..1. */
const DAY_START_H = 6;
const DAY_END_H = 20;

function timeFromT(t: number) {
  return DAY_START_H + t * (DAY_END_H - DAY_START_H);
}

function formatClock(t: number) {
  const h = Math.floor(timeFromT(t));
  const m = Math.floor((timeFromT(t) - h) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Sun direction in render space for day-fraction t (0=sunrise, 1=sunset).
 *  East = +X, noon = high with a southern (+Z) tilt, west = -X. */
function sunDirection(t: number): Vec3 {
  const arc = Math.PI * t;
  const elev = Math.sin(arc); // 0 at edges, 1 at noon
  const x = -Math.cos(arc); // +1 east morning -> -1 west evening
  const z = 0.45 * elev; // southern tilt, strongest at noon
  const y = 0.18 + 0.82 * elev; // grazing light at the day's edges
  const len = Math.hypot(x, y, z);
  return [x / len, y / len, z / len];
}

const NOON_SUN = new Color("#fff6e8");
const LOW_SUN = new Color("#ff9d5c");

function sunColor(t: number): Color {
  // warm golden at the edges, near-white at noon
  return LOW_SUN.clone().lerp(NOON_SUN, Math.pow(Math.sin(Math.PI * t), 0.6));
}

function sunIntensity(t: number): number {
  return 0.25 + 2.15 * Math.pow(Math.sin(Math.PI * t), 0.7);
}

/** Interior fill scale — lanterns carry more of the scene at the day's
 *  edges, so the daylight change stays unmistakable from inside. */
function fillScale(t: number): number {
  return 0.45 + 0.55 * Math.sin(Math.PI * t);
}

function skyColor(t: number): Color {
  // page keeps its dark premium mood; the sky warms toward dawn/dusk
  const noon = new Color("#161b1e");
  const edge = new Color("#1b140f");
  return edge.clone().lerp(noon, Math.pow(Math.sin(Math.PI * t), 0.5));
}

function ambientIntensity(t: number): number {
  return 0.3 + 0.35 * Math.sin(Math.PI * t);
}

function SunLight({ time }: { time: number }) {
  const dir = sunDirection(time);
  const SUN_DIST = 40;
  return (
    <directionalLight
      position={[dir[0] * SUN_DIST, dir[1] * SUN_DIST, dir[2] * SUN_DIST]}
      intensity={sunIntensity(time)}
      color={sunColor(time)}
    />
  );
}

/* ------------------------------ model ------------------------------ */

function Model({ url }: { url: string }) {
  const group = useRef<Group>(null);
  const { scene } = useGLTF(url);
  const centered = useRef(false);

  useEffect(() => {
    if (!group.current) return;
    if (!centered.current) {
      centered.current = true;
      // Floor at Y=0, hall center of the floor plan at XZ origin.
      const box = new Box3().setFromObject(scene);
      group.current.position.set(-HALL_CENTER[0], -box.min.y, -HALL_CENTER[1]);
    }
    // The home tour's HeroDim ghosts these SAME cached GLB materials
    // (transparent + opacity 0.18) and three's module-level cache shares
    // them across pages. Navigating home -> /concept must restore full
    // opacity or the interior renders see-through until a hard refresh.
    scene.traverse((obj) => {
      const mesh = obj as { material?: { opacity?: number; transparent?: boolean } };
      if (mesh.material) {
        mesh.material.opacity = 1;
        mesh.material.transparent = false;
      }
    });
  }, [scene]);

  return (
    <group ref={group}>
      <primitive object={scene} />
    </group>
  );
}

/** Global clipping plane along X — slider right slices deeper into the model. */
function SectionCut({ cut }: { cut: number }) {
  const gl = useThree((s) => s.gl);
  const plane = useMemo(() => new Plane(new Vector3(-1, 0, 0), cut), [cut]);

  useEffect(() => {
    // three.js API is mutation-based (renderer state) — mutating the
    // renderer's own clippingPlanes array slot is the documented pattern
    // for global clipping planes. (Rule off for this file in
    // eslint.config.mjs: the immutability rule can't model renderer state.)
    gl.clippingPlanes[0] = plane;
    gl.clippingPlanes.length = 1;
  }, [gl, plane]);

  return null;
}

/**
 * Drives eased camera flights and zoom dollying from intent requests.
 * Start/end state is read from the LIVE camera at request time; any user
 * grab of the controls cancels the animation mid-flight.
 */
function CameraRig({
  viewReq,
  zoomReq,
  rotateReq,
}: {
  viewReq: ViewRequest | null;
  zoomReq: ZoomRequest | null;
  rotateReq: RotateRequest | null;
}) {
  const { camera } = useThree();
  const controls = useThree((s) => s.controls) as React.ComponentRef<typeof MapControls> | null;
  const flight = useRef<{ fromPos: Vector3; toPos: Vec3; fromTarget: Vector3; toTarget: Vec3; t0: number; duration: number } | null>(null);
  const zoom = useRef<{ from: number; to: number; t0: number } | null>(null);
  const orbit = useRef<{ remaining: number; step: number } | null>(null);
  const lastViewSeq = useRef(0);
  const lastZoomSeq = useRef(0);
  const lastRotateSeq = useRef(0);

  // New flight request — capture live camera state as the start point
  useEffect(() => {
    if (!viewReq || !controls || viewReq.seq === lastViewSeq.current) return;
    lastViewSeq.current = viewReq.seq;
    flight.current = {
      fromPos: camera.position.clone(),
      toPos: viewReq.pos,
      fromTarget: controls.target.clone(),
      toTarget: viewReq.target,
      t0: performance.now(),
      duration: viewReq.duration,
    };
  }, [viewReq, controls, camera]);

  // New zoom request — convert to a distance lerp around the current target
  useEffect(() => {
    if (!zoomReq || !controls || zoomReq.seq === lastZoomSeq.current) return;
    lastZoomSeq.current = zoomReq.seq;
    const dist = camera.position.distanceTo(controls.target);
    const clamped = Math.min(38, Math.max(0.4, dist * zoomReq.factor));
    zoom.current = { from: dist, to: clamped, t0: performance.now() };
  }, [zoomReq, controls, camera]);

  // New orbit request — dolly around the target at ~120°/s, animated per frame
  useEffect(() => {
    if (!rotateReq || rotateReq.seq === lastRotateSeq.current) return;
    lastRotateSeq.current = rotateReq.seq;
    orbit.current = { remaining: rotateReq.delta, step: rotateReq.delta };
  }, [rotateReq]);

  // User grab cancels any in-flight animation
  useEffect(() => {
    if (!controls) return;
    const cancel = () => {
      flight.current = null;
      zoom.current = null;
      orbit.current = null;
    };
    controls.addEventListener("start", cancel);
    return () => controls.removeEventListener("start", cancel);
  }, [controls]);

  // Height clamp: whatever the controls do, the camera never dips under the
  // floor plane or over the roofline.
  useFrame(() => {
    if (orbit.current && controls) {
      const o = orbit.current;
      const step = Math.sign(o.remaining) * Math.min(Math.abs(o.step) / 60, Math.abs(o.remaining));
      const offset = camera.position.clone().sub(controls.target);
      const spherical = new Spherical().setFromVector3(offset);
      spherical.theta -= step;
      offset.setFromSpherical(spherical);
      camera.position.copy(controls.target).add(offset);
      controls.update();
      o.remaining -= step;
      if (Math.abs(o.remaining) < 0.0005) orbit.current = null;
    }

    if (camera.position.y < MIN_CAM_Y) {
      camera.position.y = MIN_CAM_Y;
      controls?.update();
    } else if (camera.position.y > MAX_CAM_Y) {
      camera.position.y = MAX_CAM_Y;
      controls?.update();
    }

    if (flight.current && controls) {
      const f = flight.current;
      const t = Math.min(1, (performance.now() - f.t0) / f.duration);
      const e = smooth(t);
      camera.position.set(...lerp3(f.fromPos.toArray() as Vec3, f.toPos, e));
      controls.target.set(...lerp3(f.fromTarget.toArray() as Vec3, f.toTarget, e));
      controls.update();
      if (t >= 1) flight.current = null;
    } else if (zoom.current && controls) {
      const z = zoom.current;
      const t = Math.min(1, (performance.now() - z.t0) / 350);
      const e = smooth(t);
      const dist = z.from + (z.to - z.from) * e;
      const dir = camera.position.clone().sub(controls.target).normalize();
      camera.position.copy(controls.target).add(dir.multiplyScalar(dist));
      controls.update();
      if (t >= 1) zoom.current = null;
    }
  });

  return null;
}

/** Sky + fog follow the daylight state (same t as the sun). */
function SkyMood({ time }: { time: number }) {
  const sky = useMemo(() => skyColor(time), [time]);
  return (
    <>
      <color attach="background" args={[sky.getHex()]} />
      <fog attach="fog" args={[sky.getHex(), 40, 160]} />
    </>
  );
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

const pill =
  "inline-flex shrink-0 items-center gap-1.5 rounded-full border border-sand/20 bg-[#101312]/80 backdrop-blur-md px-2 text-[10px] py-1.5 text-sand/85 transition-colors hover:border-gold/60 hover:text-gold active:scale-95 sm:px-3 sm:text-[11px]";
const iconBtn =
  "flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full border border-sand/20 bg-[#101312]/80 backdrop-blur-md text-sand/85 transition-colors hover:border-gold/60 hover:text-gold active:scale-95";

export default function KasbahInterior({ dict }: { dict: Dictionary }) {
  const [cut, setCut] = useState(0);
  const [time, setTime] = useState(0.5); // noon by default
  const [webglOk, setWebglOk] = useState(true);
  const [viewReq, setViewReq] = useState<ViewRequest | null>(null);
  const [zoomReq, setZoomReq] = useState<ZoomRequest | null>(null);
  const [rotateReq, setRotateReq] = useState<RotateRequest | null>(null);
  const [hintVisible, setHintVisible] = useState(true);
  const [ringActive, setRingActive] = useState(false);
  const seq = useRef(0);

  const cutValue = NO_CUT - (cut / 100) * (NO_CUT - FULL_CUT);

  const flyTo = (pos: Vec3, target: Vec3, duration = 1400) => {
    setHintVisible(false);
    seq.current += 1;
    setViewReq({ pos, target, duration, seq: seq.current });
  };

  const doZoom = (factor: number) => {
    setHintVisible(false);
    seq.current += 1;
    setZoomReq({ factor, seq: seq.current });
  };

  const doRotate = (delta: number) => {
    setHintVisible(false);
    seq.current += 1;
    setRotateReq({ delta, seq: seq.current });
  };

  // Drag ring: pointer angle around the ring center -> continuous orbit.
  // Robustness for pads + touch:
  // - track the PREVIOUS pointer position instead of absolute angles: near
  //   the ring center (finger on a small ring) atan2 angles jump wildly.
  // - accumulate tiny deltas (pad micro-moves) and only apply above a
  //   threshold, so jitter doesn't spin the camera.
  // - movement is applied relative to the ring radius: drags measured at the
  //   ring edge and at the center produce the same rotation speed.
  const ringRef = useRef<HTMLDivElement>(null);
  const ringLast = useRef<{ x: number; y: number } | null>(null);
  const ringAccum = useRef(0);
  const onRingMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!ringActive || !ringRef.current || !ringLast.current) return;
    const r = ringRef.current.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    // Tangential movement = projection of the pointer delta onto the
    // direction perpendicular to the vector (center -> pointer).
    const dx = e.clientX - ringLast.current.x;
    const dy = e.clientY - ringLast.current.y;
    const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
    if (dist > 4) {
      // tangent direction (counterclockwise positive)
      const tx = -(e.clientY - cy) / dist;
      const ty = (e.clientX - cx) / dist;
      // positive dot = counterclockwise around the screen (y down flips sign)
      ringAccum.current += -(dx * tx + dy * ty) / Math.max(dist, r.width / 2);
    } else {
      // pointer near the center: fall back to horizontal drag as rotation
      ringAccum.current += dx / 120;
    }
    ringLast.current = { x: e.clientX, y: e.clientY };
    // apply in small chunks so the camera animation stays smooth
    const threshold = 0.02;
    while (Math.abs(ringAccum.current) > threshold) {
      const chunk = Math.sign(ringAccum.current) * threshold;
      doRotate(chunk);
      ringAccum.current -= chunk;
    }
  };

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-[#0d0f0e]">
      {webglOk ? (
        <Canvas
          camera={{ position: [...RESET_VIEW.pos] as [number, number, number], fov: 70, near: 0.05, far: 500 }}
          dpr={[1, 2]}
          gl={{ antialias: true, localClippingEnabled: true }}
          onPointerDown={() => setHintVisible(false)}
          onCreated={({ gl }) => {
            if (!gl.getContext()) setWebglOk(false);
          }}
        >
          <SkyMood time={time} />

          {/* daylight through the openings */}
          <ambientLight intensity={ambientIntensity(time)} />
          <SunLight time={time} />
          <directionalLight position={[-40, 25, -40]} intensity={0.4} color="#a8c8e0" />
          {/* interior fills — hall + annexes, warm lantern tones; they take
              over as the sun drops so edges of day read clearly inside */}
          <pointLight position={[0, 2.4, 0]} intensity={18 * fillScale(time)} color="#ffd9a0" />
          <pointLight position={[-2.2, 2.4, -2.5]} intensity={12 * fillScale(time)} color="#ffd9a0" />
          <pointLight position={[2.2, 2.4, 2.2]} intensity={12 * fillScale(time)} color="#ffd9a0" />
          <pointLight position={[1, 2.4, -4]} intensity={10 * fillScale(time)} color="#ffd9a0" />

          <Suspense fallback={<LoaderFallback dict={dict} />}>
            <Model url={MODEL_URL} />
          </Suspense>

          <MapControls
            makeDefault
            enableDamping
            dampingFactor={0.08}
            screenSpacePanning={false}
            minDistance={0.4}
            maxDistance={38}
            maxPolarAngle={Math.PI / 2.02}
            target={[0, 1.4, 0]}
            // Industry-standard mapping: left-drag = ROTATE (the gesture
            // people expect everywhere), right-drag / shift+drag = pan,
            // wheel/pinch = dolly. One finger rotates, two pan + pinch.
            mouseButtons={{ LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN }}
            touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
          />
          <CameraRig viewReq={viewReq} zoomReq={zoomReq} rotateReq={rotateReq} />
          <SectionCut cut={cutValue} />
        </Canvas>
      ) : (
        <WebGlFallback dict={dict} />
      )}

      {/* ---------- Overlays ---------- */}

      {/* Interaction hint — fades on first touch */}
      <div
        className={`pointer-events-none absolute bottom-40 md:bottom-28 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase text-sand/45 transition-opacity duration-700 ${
          hintVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <Move3d className="w-3.5 h-3.5" aria-hidden />
        {dict.common.dragToExplore}
      </div>

      {/* ---------- Central control dock (flat toolbar, bottom center).
          FULLY VISIBLE at every width — no horizontal scrolling (a hidden
          scrollable toolbar is undiscoverable). Everything wraps onto up to
          three centered rows on narrow screens; wide screens get one row. ---------- */}
      <div className="absolute bottom-2 sm:bottom-3 inset-x-1 sm:inset-x-2 z-40 flex justify-center">
        <div className="flex max-w-full flex-wrap items-center justify-center gap-1 rounded-2xl border border-sand/20 bg-[#101312]/85 px-1.5 py-1.5 backdrop-blur-md sm:px-2.5 sm:py-2 md:gap-1.5">
          {/* Salons — each with its own color identity */}
          <button
            type="button"
            onClick={() => flyTo(VIEWS.amazigh.pos, VIEWS.amazigh.target)}
            className={`${pill} !border-[#d9a441]/50 !bg-[#d9a441]/10 !text-[#e8b54b] hover:!border-[#d9a441]`}
          >
            <Armchair className="w-3.5 h-3.5" aria-hidden />
            {dict.controls.viewAmazigh}
          </button>
          <button
            type="button"
            onClick={() => flyTo(VIEWS.sahraoui.pos, VIEWS.sahraoui.target)}
            className={`${pill} !border-[#c96f3b]/60 !bg-[#c96f3b]/12 !text-[#e0956b] hover:!border-[#c96f3b]`}
          >
            <Tent className="w-3.5 h-3.5" aria-hidden />
            {dict.controls.viewSahraoui}
          </button>

          <span className="h-6 w-px shrink-0 bg-sand/15" aria-hidden />

          {/* Coupole + overview — neutral dock styling */}
          <button type="button" className={pill} onClick={() => flyTo(VIEWS.dome.pos, VIEWS.dome.target)}>
            <Sun className="w-3.5 h-3.5 text-gold" aria-hidden />
            {dict.controls.viewDome}
          </button>
          <button type="button" className={pill} onClick={() => flyTo(VIEWS.overview.pos, VIEWS.overview.target, 1800)}>
            <Mountain className="w-3.5 h-3.5 text-gold" aria-hidden />
            <span className="md:inline">{dict.controls.viewOverview}</span>
          </button>
          {/* Reset: wide pill with door icon + WORD — no icon-guessing for
              less pointer-savvy visitors. The door = the front-door view. */}
          <button
            type="button"
            onClick={() => flyTo(RESET_VIEW.pos, RESET_VIEW.target, 1600)}
            title={dict.controls.resetView}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-sand/20 bg-[#101312]/80 px-2 py-1.5 text-[10px] text-sand/85 backdrop-blur-md transition-colors hover:border-gold/60 hover:text-gold active:scale-95 sm:px-3 sm:text-[11px]"
          >
            {/* kasbah door glyph: horseshoe arch in a wall */}
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M9 21v-7a3 3 0 0 1 6 0v7" />
            </svg>
            <span>{dict.controls.resetViewShort}</span>
          </button>

          <span className="h-6 w-px shrink-0 bg-sand/15" aria-hidden />

          {/* Rotate: orbit buttons + drag ring for fine control */}
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              className={iconBtn}
              aria-label={dict.controls.rotateLeft}
              onClick={() => doRotate(-Math.PI / 3)}
            >
              <RotateCcw className="w-4 h-4" aria-hidden />
            </button>
            <div
              ref={ringRef}
              role="slider"
              aria-label={dict.controls.rotateDrag}
              aria-valuemin={0}
              aria-valuemax={360}
              aria-valuenow={0}
              tabIndex={0}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                setRingActive(true);
                setHintVisible(false);
                ringLast.current = { x: e.clientX, y: e.clientY };
                ringAccum.current = 0;
              }}
              onPointerMove={onRingMove}
              onPointerUp={() => {
                setRingActive(false);
                ringLast.current = null;
              }}
              onPointerCancel={() => {
                setRingActive(false);
                ringLast.current = null;
              }}
              className={`relative flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 cursor-grab touch-none items-center justify-center rounded-full border-2 transition-colors active:cursor-grabbing ${
                ringActive ? "border-gold" : "border-sand/25 hover:border-gold/60"
              }`}
            >
              <span className="absolute top-1/2 left-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold" />
              <Move3d className="w-4 h-4 text-sand/70" aria-hidden />
            </div>
            <button
              type="button"
              className={iconBtn}
              aria-label={dict.controls.rotateRight}
              onClick={() => doRotate(Math.PI / 3)}
            >
              <RotateCw className="w-4 h-4" aria-hidden />
            </button>
          </div>

          <span className="h-6 w-px shrink-0 bg-sand/15" aria-hidden />

          {/* Zoom */}
          <button type="button" className={iconBtn} aria-label={dict.controls.zoomIn} onClick={() => doZoom(0.72)}>
            <ZoomIn className="w-4 h-4" aria-hidden />
          </button>
          <button type="button" className={iconBtn} aria-label={dict.controls.zoomOut} onClick={() => doZoom(1.38)}>
            <ZoomOut className="w-4 h-4" aria-hidden />
          </button>

          <span className="h-6 w-px shrink-0 bg-sand/15" aria-hidden />

          {/* Sliders: cut + daylight, always in the dock. Widths scale with
              viewport (foldables/odd widths included) instead of fixed px. */}
          <label className="flex shrink-0 items-center gap-1 sm:gap-1.5" title={dict.common.cutLabel}>
            <Scissors className="w-3.5 h-3.5 text-sand/40" aria-hidden />
            <input
              type="range"
              min={0}
              max={100}
              value={cut}
              onChange={(e) => setCut(Number(e.target.value))}
              aria-label={dict.common.cutLabel}
              className="menu-range w-14 sm:w-20"
            />
          </label>
          <label className="flex shrink-0 items-center gap-1 sm:gap-1.5" title={dict.common.daylightLabel}>
            <SunDim className="w-3.5 h-3.5 text-gold" aria-hidden />
            <span className="text-[10px] tabular-nums text-sand/60">{formatClock(time)}</span>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(time * 100)}
              onChange={(e) => setTime(Number(e.target.value) / 100)}
              aria-label={`${dict.common.timeLabel} — ${formatClock(time)}`}
              className="menu-range w-16 sm:w-24"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
