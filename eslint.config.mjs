import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // three.js renderers are mutation-based by design: updating the global
    // clippingPlanes array slot is the documented pattern. The React hooks
    // immutability rule can't model this and also reports its own
    // eslint-disable directives as "unused" non-deterministically, so the
    // rule is switched off for the two 3D components that touch renderer
    // state directly.
    files: ["src/components/kasbah-viewer.tsx", "src/components/kasbah-interior.tsx"],
    rules: { "react-hooks/immutability": "off" },
  },
]);

export default eslintConfig;
