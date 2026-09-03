"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import type { Group } from "three";
import { Box3, Plane, Vector3 } from "three";
import { Html, OrbitControls, useGLTF } from "@react-three/drei";
import { Loader2, Scissors } from "lucide-react";

const MODEL_URL = "/models/kasbah.glb";

/**
 * Section-cut slider mapping (model X span is roughly ±22.5 m after centering):
 *   slider 0   -> plane constant  25  (nothing cut)
 *   slider 100 -> plane constant  -6  (building sliced open past its center)
 */
const NO_CUT = 25;
const FULL_CUT = -6;

function Model({ url, onCentered }: { url: string; onCentered?: () => void }) {
  const group = useRef<Group>(null);
  const { scene } = useGLTF(url);
  const centered = useRef(false);

  useEffect(() => {
    if (centered.current || !group.current) return;
    centered.current = true;
    // Recenter the model so its bounding-box center sits at the origin,
    // then lower it slightly so it feels grounded in frame.
    const box = new Box3().setFromObject(scene);
    const center = box.getCenter(new Vector3());
    group.current.position.set(-center.x, -box.min.y - (box.max.y - box.min.y) * 0.08, -center.z);
    onCentered?.();
  }, [scene, onCentered]);

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
    // three.js API is mutation-based (renderer state), which the React
    // hooks immutability lint can't model — same situation as Google Maps
    // marker objects. Mutating the renderer's own array slot is the
    // documented pattern for global clipping planes.
    // eslint-disable-next-line react-hooks/immutability
    gl.clippingPlanes[0] = plane;
    gl.clippingPlanes.length = 1;
  }, [gl, plane]);

  return null;
}

function WebGlFallback() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-sand/70 text-center px-8">
      <p className="text-sm">Votre navigateur ne peut pas afficher la 3D (WebGL).</p>
      <p className="text-xs text-sand/50">
        Essayez un navigateur récent avec l&apos;accélération matérielle activée.
      </p>
    </div>
  );
}

function LoaderFallback() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3 text-sand/70">
        <Loader2 className="w-7 h-7 animate-spin text-gold" />
        <p className="text-xs tracking-widest uppercase">Chargement du modèle 3D…</p>
      </div>
    </Html>
  );
}

export default function KasbahViewer() {
  const [cut, setCut] = useState(0);
  const [webglOk, setWebglOk] = useState(true);

  // slider 0..100 -> plane constant
  const cutValue = NO_CUT - (cut / 100) * (NO_CUT - FULL_CUT);

  return (
    <div className="relative h-[420px] md:h-[560px] rounded-3xl border border-sand/12 bg-white/[0.02] overflow-hidden">
      {webglOk ? (
      <Canvas
        camera={{ position: [26, 20, 26], fov: 45, near: 0.1, far: 2000 }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
        onCreated={({ gl }) => {
          if (!gl.getContext()) setWebglOk(false);
        }}
      >
        <color attach="background" args={["#0d0f0e"]} />
        <fog attach="fog" args={["#0d0f0e", 120, 350]} />

        <ambientLight intensity={0.7} />
        <directionalLight
          position={[40, 60, 30]}
          intensity={2.2}
          color="#fff4e0"
          castShadow
        />
        <directionalLight position={[-40, 25, -40]} intensity={0.6} color="#a8c8e0" />

        <Suspense fallback={<LoaderFallback />}>
          <Model url={MODEL_URL} />
        </Suspense>

        <OrbitControls
          makeDefault
          enablePan={false}
          minDistance={12}
          maxDistance={90}
          maxPolarAngle={Math.PI / 2.05}
          target={[0, 2, 0]}
        />
        <SectionCut cut={cutValue} />
      </Canvas>
      ) : (
        <WebGlFallback />
      )}

      {/* Slider: coupe du modèle */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center gap-4">
        <Scissors className="w-4 h-4 text-sand/40 shrink-0" />
        <span className="text-[10px] tracking-[0.25em] uppercase text-sand/50 whitespace-nowrap">
          Vue intérieure
        </span>
        <input
          type="range"
          min={0}
          max={100}
          value={cut}
          onChange={(e) => setCut(Number(e.target.value))}
          aria-label="Coupe du modèle pour voir l'intérieur"
          className="w-full accent-[#d9a441]"
        />
      </div>
    </div>
  );
}
