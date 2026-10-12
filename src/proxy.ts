import { NextRequest, NextResponse } from "next/server";
import { AVAILABLE_LOCALES, DEFAULT_LOCALE } from "@/i18n/config";

const LOCALE_COOKIE = "ttk.locale";

/**
 * Next 16 Proxy (formerly middleware). Locale negotiation for /: SiteMenu
 * mirrors the visitor's language choice into a cookie (localStorage alone is
 * not readable server-side), and this proxy redirects / to that locale.
 * No cookie -> default FR (which serves / directly, no redirect).
 */
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only the bare root needs negotiating; locale-prefixed paths are explicit.
  if (pathname !== "/") return NextResponse.next();

  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale =
    saved && (AVAILABLE_LOCALES as readonly string[]).includes(saved)
      ? saved
      : DEFAULT_LOCALE;

  if (locale === DEFAULT_LOCALE) return NextResponse.next();
  return NextResponse.redirect(new URL(`/${locale}`, request.url));
}
