"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import type { Group } from "three";
import { Box3, Plane, Vector3 } from "three";
import { Html, MapControls, useGLTF } from "@react-three/drei";
import { Loader2, Move3d, Scissors } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries";

const MODEL_URL = "/models/kasbah.glb";

/**
 * Full-viewport free-explore interior viewer for /concept.
 * Camera spawns inside the main hall; drag = look around, right-drag /
 * two-finger = pan across the floor plan, wheel / pinch = approach.
 * The orbit target stays near hall height so the camera never ends up
 * under the floor.
 */

/** Hall center in raw GLB space — model is shifted so this lands at origin. */
const HALL_CENTER: [number, number] = [4.3, 0.1];

/** Section-cut slider mapping (model X span is roughly ±22.5 m after centering):
 *  slider 0 -> nothing cut, slider 100 -> sliced past the hall center. */
const NO_CUT = 25;
const FULL_CUT = -6;

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
    // for global clipping planes.
    gl.clippingPlanes[0] = plane;
    gl.clippingPlanes.length = 1;
  }, [gl, plane]);

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

export default function KasbahInterior({ dict }: { dict: Dictionary }) {
  const [cut, setCut] = useState(0);
  const [webglOk, setWebglOk] = useState(true);

  const cutValue = NO_CUT - (cut / 100) * (NO_CUT - FULL_CUT);

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-[#0d0f0e]">
      {webglOk ? (
        <Canvas
          camera={{ position: [-1.75, 1.55, -0.65], fov: 70, near: 0.05, far: 500 }}
          dpr={[1, 2]}
          gl={{ antialias: true, localClippingEnabled: true }}
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

          {/* Orbit = look around, pan = walk the floor plan, dolly = approach */}
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
          <SectionCut cut={cutValue} />
        </Canvas>
      ) : (
        <WebGlFallback dict={dict} />
      )}

      {/* ---------- Overlays ---------- */}
      {/* Interaction hint */}
      <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase text-sand/45">
        <Move3d className="w-3.5 h-3.5" aria-hidden />
        {dict.common.dragToExplore}
      </div>

      {/* Roof-cut slider (vertical, right edge) */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-3">
        <Scissors className="w-4 h-4 text-sand/40 shrink-0" />
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
