// The bare root is negotiated by src/proxy.ts (saved-locale cookie -> /fr,
// /en, /de; no cookie falls through to /fr which serves at /). This file
// must exist so the route resolves; it never renders because the proxy
// rewrites/redirects first.
import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/fr");
}
