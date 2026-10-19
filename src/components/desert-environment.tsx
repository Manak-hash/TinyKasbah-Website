"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BufferAttribute, IcosahedronGeometry, MeshStandardMaterial, PlaneGeometry } from "three";
import type { MeshStandardMaterial as MeshStandardMaterialT } from "three";

/**
 * DesertEnvironment — procedural dune terrain + scattered rocks shared by
 * the exterior tour (homepage) and the interior free-explore (/concept).
 *
 * - Terrain: 400 × 400 m plane displaced by value-noise dunes (long
 *   anisotropic ridges + detail octaves). A plaza is flattened under the
 *   building (r < 14 m, blended out by 36 m, height capped on a slow ramp
 *   so even the zoomed-out /concept camera at r = 38 m stays above the
 *   dunes) — nothing pokes through the model's floor and there is no
 *   see-through underneath. Opaque materials; scene fog swallows the
 *   horizon, so there is no visible edge.
 * - Rocks: 9 half-buried, jittered icosahedra at 22 m+ from the centre —
 *   outside every validated camera path (tour waypoints stay within
 *   r ≈ 15 m, y ≥ 1.9; /concept clamps its camera above the floor).
 * - Mood: `dim` scales terrain/rock color (NOT opacity — transparency
 *   here would cause sorting artifacts against the cutaway). The tour
 *   feeds it its wake/night curve; /concept keeps dim = 1 and lets its
 *   own day/night sun light the sand.
 *
 * `center` is the building centre in the page's render space ([0, 0] on
 * the tour; [0.25, -1.55] on /concept, which re-centres on the hall).
 */
const PLAZA_RADIUS = 14;
const PLAZA_BLEND = 36;

function hash2(i: number, j: number) {
  const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function vnoise(x: number, y: number) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi), b = hash2(xi + 1, yi), c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x: number, y: number) {
  let h = 0, amp = 0.5, f = 1;
  for (let o = 0; o < 4; o++) {
    h += amp * vnoise(x * f, y * f);
    amp *= 0.5;
    f *= 2.03;
  }
  return h; // ~0..1
}
/** Dune height at world (x, z): long ridges stretched along x + detail. */
export function duneHeight(x: number, z: number) {
  const d = Math.hypot(x, z);
  const t = Math.min(1, Math.max(0, (d - PLAZA_RADIUS) / (PLAZA_BLEND - PLAZA_RADIUS)));
  const blend = t * t * (3 - 2 * t);
  // ridge amplitude ramps in slowly with distance (full dunes past ~60 m)
  const ramp = Math.min(1, Math.max(0, (d - PLAZA_RADIUS) / 46));
  const ridges = (fbm(x * 0.032, z * 0.011) - 0.5) * 5.2 * ramp;
  const detail = (fbm(x * 0.09 + 7.3, z * 0.09 + 3.1) - 0.5) * 1.1 * blend;
  return 0.05 + (ridges + detail) * blend;
}

const ROCK_SPOTS: Array<[number, number, number]> = [
  // [x, z, radius] relative to `center` — all ≥ 22 m out, clear of cameras
  [24, 18, 1.5], [-30, 10, 2.0], [18, -28, 1.2], [-22, -26, 1.7],
  [40, -12, 2.4], [-14, 34, 1.3], [34, 30, 1.8], [-42, -18, 2.2], [8, 44, 1.6],
];

function sstep(x: number, a: number, b: number) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

export default function DesertEnvironment({
  dim = 1,
  center = [0, 0],
  progressRef,
}: {
  dim?: number;
  center?: [number, number];
  /** Live scroll progress (0..1). When given, `dim` is computed per frame
   *  from the tour's wake/night curve instead of the static prop. */
  progressRef?: { progress: number };
}) {
  const terrainMat = useRef<MeshStandardMaterialT>(null);

  const terrain = useMemo(() => {
    const geo = new PlaneGeometry(400, 400, 150, 150);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i) + center[0], z = pos.getZ(i) + center[1];
      const h = duneHeight(x - center[0], z - center[1]);
      pos.setY(i, h);
      // sun-kissed crests, dark hollows + per-vertex grain
      const crest = Math.min(1, Math.max(0, (h - 0.05) / 3));
      const g = hash2(Math.round(x * 10), Math.round(z * 10)) * 0.08;
      colors[i * 3] = 0.42 + crest * 0.30 + g;
      colors[i * 3 + 1] = 0.31 + crest * 0.22 + g;
      colors[i * 3 + 2] = 0.17 + crest * 0.11 + g;
    }
    geo.setAttribute("color", new BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, [center]);

  const rocks = useMemo(
    () =>
      ROCK_SPOTS.map(([x, z, r], i) => {
        const geo = new IcosahedronGeometry(r, 1);
        const pos = geo.attributes.position;
        for (let k = 0; k < pos.count; k++) {
          const j = 0.72 + hash2(k * 3.1 + i * 17.7, k * 1.7) * 0.55;
          pos.setXYZ(k, pos.getX(k) * j, pos.getY(k) * j * 0.62, pos.getZ(k) * j);
        }
        geo.computeVertexNormals();
        return { geo, x: center[0] + x, z: center[1] + z, y: duneHeight(x, z) + r * 0.18 };
      }),
    [center],
  );

  const rockMaterial = useMemo(
    () => new MeshStandardMaterial({ color: "#5d4930", roughness: 1, metalness: 0, flatShading: true }),
    [],
  );

  useFrame(() => {
    let d = dim;
    if (progressRef) {
      const p = progressRef.progress;
      const night = sstep(p, 0.55, 0.98);
      d = 1 - 0.45 * night;
    }
    if (terrainMat.current) terrainMat.current.color.setScalar(d);
    rockMaterial.color.setScalar(d);
  });

  return (
    <group>
      <mesh geometry={terrain} receiveShadow={false}>
        <meshStandardMaterial ref={terrainMat} vertexColors roughness={1} metalness={0} />
      </mesh>
      {rocks.map((r, i) => (
        <mesh key={i} geometry={r.geo} material={rockMaterial} position={[r.x, r.y, r.z]} />
      ))}
    </group>
  );
}
