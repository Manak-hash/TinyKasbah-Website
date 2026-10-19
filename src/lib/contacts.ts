/**
 * Shared external contact points. ONE definition each — the site menu and
 * the JSON-LD structured data must never drift apart (the Instagram handle
 * and the WhatsApp number are hardcoded nowhere else).
 */
export const INSTAGRAM_URL = "https://www.instagram.com/terrevolution.ma/";

export const WHATSAPP_URL = "https://wa.me/212661315158";

export const WHATSAPP_PHONE = "+212661315158";

/** Denkmal Leipzig 2026 (5–7 Nov, Hall 2 / F09-1). The fair mentions on the
 *  site (hero badge + contact line) auto-hide once the fair is over. */
export const DENKMAL_LIVE = Date.now() < new Date("2026-11-08T00:00:00+01:00").getTime();
