import Link from "next/link";

/**
 * Shared 404 content. Rendered in TWO places:
 *  - src/app/[lang]/not-found.tsx  (inside the [lang] layout shell, with SiteMenu)
 *  - src/app/not-found.tsx         (own <html>/<body>: the root layout is a
 *                                   pass-through, so paths that match no locale
 *                                   segment still get a valid document)
 *
 * The copy is intentionally the SAME for every locale (not-found cannot read
 * route params/dictionaries): one line per site language, FR first.
 * globals.css is imported here so the ROOT 404 route — whose layout tree
 * contains no import of it — still gets the Tailwind build.
 */
import "@/app/globals.css";

export default function NotFoundContent() {
  return (
    <main className="zellige-bg flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <p
        className="font-display text-[7rem] leading-none font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold via-clay to-teal sm:text-[10rem]"
        aria-hidden
      >
        404
      </p>

      <div className="mt-6 mx-auto h-px w-24 bg-gradient-to-r from-transparent via-gold/80 to-transparent" aria-hidden />

      <div className="mt-8 space-y-1.5 text-sand/85">
        <p>Cette page n&apos;existe pas ou a été déplacée.</p>
        <p className="text-sand/60">This page doesn&apos;t exist or has moved.</p>
        <p className="text-sand/60">Diese Seite existiert nicht oder wurde verschoben.</p>
      </div>

      <Link
        href="/"
        className="mt-10 inline-block rounded-full bg-clay px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-clay/90"
      >
        terrevolution.ma
      </Link>
    </main>
  );
}
