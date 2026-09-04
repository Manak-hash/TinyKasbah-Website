export const LOCALES = ["fr", "en", "de"] as const;
export type Locale = (typeof LOCALES)[number];

export const AVAILABLE_LOCALES = ["fr", "en", "de"] as const;
export type AvailableLocale = (typeof AVAILABLE_LOCALES)[number];

export const DEFAULT_LOCALE = "fr" as const satisfies AvailableLocale;

export const LOCALE_HEADER = "x-ttk-locale";

export const LOCALE_NAMES: Record<Locale, string> = {
  fr: "Français",
  en: "English",
  de: "Deutsch",
};

export function isLocale(x: unknown): x is Locale {
  return typeof x === "string" && (LOCALES as readonly string[]).includes(x);
}

export function isAvailableLocale(x: unknown): x is AvailableLocale {
  return (
    typeof x === "string" &&
    (AVAILABLE_LOCALES as readonly string[]).includes(x)
  );
}
