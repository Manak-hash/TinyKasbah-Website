"use client";

import { useEffect, useRef, useState } from "react";
import { Globe, ChevronDown } from "lucide-react";
import Link from "next/link";
import type { Locale } from "@/i18n/config";

const LOCALE_LABELS: Record<Locale, string> = {
  fr: "Français",
  en: "English",
  de: "Deutsch",
};

export default function LanguageSwitcher({
  current,
  currentName,
  paths,
}: {
  current: Locale;
  currentName: string;
  paths: Record<Locale, string>;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${currentName} — change language`}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-sand/25 bg-black/30 backdrop-blur text-sand/80 text-xs hover:border-sand/60 transition-colors"
      >
        <Globe className="w-3.5 h-3.5" />
        <span className="uppercase tracking-wider">{current}</span>
        <ChevronDown
          className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-36 rounded-xl border border-sand/15 bg-[#141715]/95 backdrop-blur shadow-xl overflow-hidden"
        >
          {(Object.keys(paths) as Locale[]).map((loc) => (
            <Link
              key={loc}
              href={paths[loc]}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={`flex items-center justify-between px-3 py-2 text-xs transition-colors ${
                loc === current
                  ? "bg-gold/15 text-gold font-medium"
                  : "text-sand/75 hover:bg-white/5 hover:text-sand"
              }`}
            >
              <span>{LOCALE_LABELS[loc]}</span>
              <span className="uppercase tracking-wider text-[10px] opacity-60">
                {loc}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
