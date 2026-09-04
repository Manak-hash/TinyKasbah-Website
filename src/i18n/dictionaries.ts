import type { Messages } from "@/locales/en";

export type Dictionary = Messages;

export async function getDictionary(locale: "fr" | "en" | "de") {
  switch (locale) {
    case "en":
      return (await import("@/locales/en")).default;
    case "de":
      return (await import("@/locales/de")).default;
    case "fr":
    default:
      return (await import("@/locales/fr")).default;
  }
}
