"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { Group } from "three";
import { Box3, Plane, Vector3 } from "three";
import { Html, MapControls, useGLTF } from "@react-three/drei";
import {
  Loader2,
  Move3d,
  Scissors,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Armchair,
  Tent,
  Sun,
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
 */

/** Hall center in raw GLB space — the model is shifted so this lands at 0. */
const HALL_CENTER: [number, number] = [4.3, 0.1];

/** Section-cut slider mapping (model X span is roughly ±22.5 m after centering):
 *  slider 0 -> nothing cut, slider 100 -> sliced past the hall center. */
const NO_CUT = 25;
const FULL_CUT = -6;

/** Camera viewpoints in RENDER space (raw minus HALL_CENTER). Every position
 *  is a scroll-tour waypoint that was validated collision-free. */
const SPAWN = { pos: [-1.75, 1.55, -0.65], target: [0, 1.4, 0] } as const;
const VIEWS = {
  amazigh: { pos: [-1.42, 1.55, -0.4], target: [-2.85, 1.3, 0.25] },
  sahraoui: { pos: [1.08, 1.55, -0.72], target: [1.8, 1.2, 0.7] },
  dome: { pos: [1.08, 1.55, -0.72], target: [0.1, 2.8, 0.1] },
  overview: { pos: [9.7, 12, -14.1], target: [-0.9, 0.5, -1.5] },
} as const;

type Vec3 = readonly [number, number, number];
type ViewRequest = { pos: Vec3; target: Vec3; duration: number; seq: number };
type ZoomRequest = { factor: number; seq: number };

const smooth = (t: number) => t * t * (3 - 2 * t);
const lerp3 = (a: Vec3, b: Vec3, f: number): [number, number, number] => [
  a[0] + (b[0] - a[0]) * f,
  a[1] + (b[1] - a[1]) * f,
  a[2] + (b[2] - a[2]) * f,
];

function Model({ url }: { url: string }) {
  const group = useRef<Group>(null);
  const { scene } = useGLTF(url);
  const centered = useRef(false);

  useEffect(() => {
    if (centered.current || !group.current) return;
    centered.current = true;
    // Floor at Y=0, hall center of the floor plan at XZ origin.
    const box = new Box3().setFromObject(scene);
    group.current.position.set(-HALL_CENTER[0], -box.min.y, -HALL_CENTER[1]);
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
}: {
  viewReq: ViewRequest | null;
  zoomReq: ZoomRequest | null;
}) {
  const { camera } = useThree();
  const controls = useThree((s) => s.controls) as React.ComponentRef<typeof MapControls> | null;
  const flight = useRef<{ fromPos: Vector3; toPos: Vec3; fromTarget: Vector3; toTarget: Vec3; t0: number; duration: number } | null>(null);
  const zoom = useRef<{ from: number; to: number; t0: number } | null>(null);
  const lastViewSeq = useRef(0);
  const lastZoomSeq = useRef(0);

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

  // User grab cancels any in-flight animation
  useEffect(() => {
    if (!controls) return;
    const cancel = () => {
      flight.current = null;
      zoom.current = null;
    };
    controls.addEventListener("start", cancel);
    return () => controls.removeEventListener("start", cancel);
  }, [controls]);

  useFrame(() => {
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
  "inline-flex shrink-0 items-center gap-1.5 rounded-full border border-sand/20 bg-[#101312]/80 backdrop-blur-md px-3 py-1.5 text-[11px] text-sand/85 transition-colors hover:border-gold/60 hover:text-gold active:scale-95";
const iconBtn =
  "flex h-9 w-9 items-center justify-center rounded-full border border-sand/20 bg-[#101312]/80 backdrop-blur-md text-sand/85 transition-colors hover:border-gold/60 hover:text-gold active:scale-95";

export default function KasbahInterior({ dict }: { dict: Dictionary }) {
  const [cut, setCut] = useState(0);
  const [webglOk, setWebglOk] = useState(true);
  const [viewReq, setViewReq] = useState<ViewRequest | null>(null);
  const [zoomReq, setZoomReq] = useState<ZoomRequest | null>(null);
  const [hintVisible, setHintVisible] = useState(true);
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

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-[#0d0f0e]">
      {webglOk ? (
        <Canvas
          camera={{ position: [...SPAWN.pos] as [number, number, number], fov: 70, near: 0.05, far: 500 }}
          dpr={[1, 2]}
          gl={{ antialias: true, localClippingEnabled: true }}
          onPointerDown={() => setHintVisible(false)}
          onCreated={({ gl }) => {
            if (!gl.getContext()) setWebglOk(false);
          }}
        >
          <color attach="background" args={["#0d0f0e"]} />
          <fog attach="fog" args={["#0d0f0e", 40, 160]} />

          {/* daylight through the openings */}
          <ambientLight intensity={0.55} />
          <directionalLight position={[40, 60, 30]} intensity={1.8} color="#fff4e0" />
          <directionalLight position={[-40, 25, -40]} intensity={0.4} color="#a8c8e0" />
          {/* interior fills — hall + annexes, warm lantern tones */}
          <pointLight position={[0, 2.4, 0]} intensity={18} color="#ffd9a0" />
          <pointLight position={[-2.2, 2.4, -2.5]} intensity={12} color="#ffd9a0" />
          <pointLight position={[2.2, 2.4, 2.2]} intensity={12} color="#ffd9a0" />
          <pointLight position={[1, 2.4, -4]} intensity={10} color="#ffd9a0" />

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
          />
          <CameraRig viewReq={viewReq} zoomReq={zoomReq} />
          <SectionCut cut={cutValue} />
        </Canvas>
      ) : (
        <WebGlFallback dict={dict} />
      )}

      {/* ---------- Overlays ---------- */}

      {/* Interaction hint — fades on first touch */}
      <div
        className={`pointer-events-none absolute bottom-32 left-1/2 -translate-x-1/2 md:bottom-8 z-30 flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase text-sand/45 transition-opacity duration-700 ${
          hintVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <Move3d className="w-3.5 h-3.5" aria-hidden />
        {dict.common.dragToExplore}
      </div>

      {/* Viewpoint presets — scrollable pill row on mobile, docked bottom-left on desktop */}
      <div className="absolute bottom-4 inset-x-3 md:inset-x-auto md:left-6 z-40">
        <div className="flex gap-2 overflow-x-auto md:overflow-visible py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button type="button" className={pill} onClick={() => flyTo(VIEWS.amazigh.pos, VIEWS.amazigh.target)}>
            <Armchair className="w-3.5 h-3.5 text-gold" aria-hidden />
            {dict.controls.viewAmazigh}
          </button>
          <button type="button" className={pill} onClick={() => flyTo(VIEWS.sahraoui.pos, VIEWS.sahraoui.target)}>
            <Tent className="w-3.5 h-3.5 text-gold" aria-hidden />
            {dict.controls.viewSahraoui}
          </button>
          <button type="button" className={pill} onClick={() => flyTo(VIEWS.dome.pos, VIEWS.dome.target)}>
            <Sun className="w-3.5 h-3.5 text-gold" aria-hidden />
            {dict.controls.viewDome}
          </button>
          <button type="button" className={pill} onClick={() => flyTo(VIEWS.overview.pos, VIEWS.overview.target, 1800)}>
            <Mountain className="w-3.5 h-3.5 text-gold" aria-hidden />
            {dict.controls.viewOverview}
          </button>
          <button
            type="button"
            className={pill}
            aria-label={dict.controls.resetView}
            onClick={() => flyTo(SPAWN.pos, SPAWN.target)}
          >
            <RotateCcw className="w-3.5 h-3.5 text-sand/60" aria-hidden />
            <span className="md:hidden">{dict.controls.resetView}</span>
          </button>
        </div>
      </div>

      {/* Zoom — right edge, above the mobile slider / beside the desktop one */}
      <div className="absolute right-4 md:right-6 bottom-40 md:bottom-10 z-40 flex flex-col gap-2">
        <button type="button" className={iconBtn} aria-label={dict.controls.zoomIn} onClick={() => doZoom(0.72)}>
          <ZoomIn className="w-4 h-4" aria-hidden />
        </button>
        <button type="button" className={iconBtn} aria-label={dict.controls.zoomOut} onClick={() => doZoom(1.38)}>
          <ZoomOut className="w-4 h-4" aria-hidden />
        </button>
      </div>

      {/* Roof-cut slider — horizontal above presets on touch, vertical right edge on desktop */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-40 flex md:hidden items-center gap-3 w-56">
        <Scissors className="w-4 h-4 text-sand/40 shrink-0" aria-hidden />
        <input
          type="range"
          min={0}
          max={100}
          value={cut}
          onChange={(e) => setCut(Number(e.target.value))}
          aria-label={dict.common.cutLabel}
          className="w-full accent-[#d9a441]"
        />
      </div>
      <div className="absolute right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center gap-3">
        <Scissors className="w-4 h-4 text-sand/40 shrink-0" aria-hidden />
        <input
          type="range"
          min={0}
          max={100}
          value={cut}
          onChange={(e) => setCut(Number(e.target.value))}
          aria-label={dict.common.cutLabel}
          className="h-44 w-auto accent-[#d9a441] [writing-mode:vertical-lr] [direction:rtl]"
        />
      </div>
    </div>
  );
}
