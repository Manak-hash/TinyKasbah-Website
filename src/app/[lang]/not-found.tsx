import NotFoundContent from "@/components/not-found-content";

/**
 * Locale-scoped 404 — rendered inside [lang]/layout.tsx (which owns the
 * <html>/<body> shell, the fonts and the SiteMenu) when a [lang] page calls
 * notFound() on an unknown locale. Content is locale-neutral on purpose
 * (not-found cannot read route params) — see not-found-content.tsx.
 */
export default function LangNotFound() {
  return <NotFoundContent />;
}
