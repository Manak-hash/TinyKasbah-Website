/**
 * Desert-night sky dome for the scroll tour — dark, textured, alive.
 *
 * Why a shader dome instead of a flat `<color>`: the site mood is dark and
 * premium, but a flat dark fill reads as "canvas not loading". This dome
 * layers THREE slow, subtle motions that keep the sky from feeling dead
 * while staying far quieter than the building (effects augment, never
 * replace — the kasbah stays the hero):
 *
 *   1. Stars — tiny points that twinkle at different phases (hash-based,
 *      no texture). 60s for a full drift is intentional: felt, not seen.
 *   2. Aurora ribbons — faint warm (gold/clay) bands flowing over the
 *      dunes, echoing the site's gold accent. Sine-warped, so they read
 *      as wind on desert haze, not neon.
 *   3. Grain — per-pixel dither noise so dark gradients never band.
 *
 * Colors derive from the site palette: deep brown-black base (#0e0a06 body
 * tone), sand horizon, gold/clay aurora. uMood lets the camera chapter
 * tint the sky (dusk → deep night) without touching materials.
 */

const SKY_VERT = /* glsl */ `
  varying vec3 vWorldPos;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorldPos = world.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const SKY_FRAG = /* glsl */ `
  varying vec3 vWorldPos;
  uniform float uTime;
  uniform float uMood;      // 0 = dusk (warmer, lighter), 1 = deep night
  uniform vec3  uBase;      // zenith color
  uniform vec3  uHorizon;   // horizon glow
  uniform vec3  uAuroraA;   // gold ribbon
  uniform vec3  uAuroraB;   // clay ribbon

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  void main() {
    // view direction from the camera-facing dome
    vec3 dir = normalize(vWorldPos - cameraPosition);
    float h = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);   // 0 = down, 1 = up

    // vertical gradient: horizon glow -> zenith
    float grad = pow(clamp(1.0 - h, 0.0, 1.0), 2.2);
    vec3 col = mix(uBase, uHorizon, grad * (0.85 - 0.25 * uMood));

    // ---- stars (above horizon only, twinkle) ----
    float starMask = smoothstep(0.08, 0.35, h);
    vec2 cell = floor(dir.xz / max(dir.y, 0.02) * 60.0);
    vec2 f = fract(dir.xz / max(dir.y, 0.02) * 60.0) - 0.5;
    float rnd = hash(cell);
    float star = step(0.985, rnd) * smoothstep(0.12, 0.0, length(f));
    float tw = 0.55 + 0.45 * sin(uTime * (0.6 + rnd * 2.4) + rnd * 40.0);
    col += star * starMask * tw * 0.5;

    // ---- aurora ribbons (flowing warm bands near the horizon) ----
    float band1 = sin(dir.x * 2.4 + sin(dir.z * 1.7 + uTime * 0.11) * 1.3 + uTime * 0.05);
    float band2 = sin(dir.x * 1.1 - dir.z * 2.2 + uTime * 0.07 + 2.1);
    float horizonBand = exp(-pow((h - 0.42) * 4.5, 2.0));
    float a1 = pow(max(band1, 0.0), 3.0) * horizonBand;
    float a2 = pow(max(band2, 0.0), 4.0) * horizonBand * 0.7;
    col += uAuroraA * a1 * (0.10 - 0.04 * uMood);
    col += uAuroraB * a2 * (0.08 - 0.03 * uMood);

    // ---- grain: kills banding on the dark gradient ----
    float grain = (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) * 0.012;
    col += grain;

    gl_FragColor = vec4(col, 1.0);
  }
`;

export { SKY_VERT, SKY_FRAG };
