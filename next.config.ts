import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev-only: allow browsing the dev server from LAN/Tailscale machines.
  // Next 16's dev cross-origin gate blocks /_next/* (HMR websocket, chunks)
  // for any host that isn't localhost — the page renders static HTML and
  // hydration silently dies. Entries must be BARE hostnames (no protocol,
  // no port) or they never match.
  allowedDevOrigins: ["192.168.100.74", "100.116.159.47", "manak-debian"],
  // /concept only existed to redirect to the default locale. A server-level
  // redirect avoids the static redirect page whose mount triggered the
  // "ConceptRootPage cannot have a negative time stamp" performance.measure
  // error in dev.
  async redirects() {
    return [{ source: "/concept", destination: "/fr/concept", permanent: false }];
  },
};

export default nextConfig;
