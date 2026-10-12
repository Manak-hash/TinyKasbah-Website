"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  ChevronDown,
  Globe,
  Music,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries";
import {
  LOCALE_NAMES,
  isLocale,
  type Locale,
} from "@/i18n/config";

// Cross-panel exclusivity protocol: this component announces {id, open} via a
// window CustomEvent and closes itself when a foreign panel opens. Any future
// top overlay panel must join the same protocol.
export const UI_PANEL_EVENT = "tinykasbah:panel-open";
export const UI_PANEL_MENU = "menu";

const LOCALES: Locale[] = ["fr", "en", "de"];

// localStorage keys: the visitor's language choice and music state survive
// page reloads and navigation.
const LS_LOCALE = "ttk.locale";
const LS_MUSIC_ON = "ttk.music.on";
const LS_MUSIC_TIME = "ttk.music.time";
const LS_VOLUME = "ttk.volume";

// Broader than pointerdown/keydown alone: touch devices, scrolling, and
// clicks on other controls all count as "the visitor is here".
const INTERACTION_EVENTS = [
  "pointerdown",
  "keydown",
  "touchstart",
  "wheel",
] as const;

function formatTime(s: number) {
  if (!Number.isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

/**
 * Single piece of site chrome: trigger pill (top-right) opening the menu with
 * the concept/3D-tour CTA, the music controls, and the language accordion.
 * Replaces the old floating music disc + language switcher. The <audio>
 * element lives here, in [lang]/layout.tsx, so playback survives navigation.
 */
export default function SiteMenu({ dict }: { dict: Dictionary }) {
  const pathname = usePathname() ?? "/";

  // Derive locale + the page path under the locale prefix from the URL, so
  // language links preserve the current page (e.g. /en/concept). FR lives at
  // the root WITHOUT a prefix; EN/DE pages carry /en, /de.
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];
  const locale: Locale = isLocale(first) ? first : "fr";
  const rest = (isLocale(first) ? segments.slice(1) : segments).join("/");
  const homePath = locale === "fr" ? "/" : `/${locale}`;
  const conceptPath = locale === "fr" ? "/concept" : `/${locale}/concept`;
  const onConcept = rest === "concept";
  const pathFor = (loc: Locale) =>
    loc === "fr" ? (rest ? `/${rest}` : "/") : `/${loc}${rest ? `/${rest}` : ""}`;

  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // ----- audio state -----
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  // Close when a foreign panel opens; announce our own state.
  useEffect(() => {
    const onPanelOpen = (e: Event) => {
      const detail = (e as CustomEvent<{ id: string; open?: boolean }>).detail;
      if (detail?.id !== UI_PANEL_MENU && detail?.open) setOpen(false);
    };
    window.addEventListener(UI_PANEL_EVENT, onPanelOpen);
    return () => window.removeEventListener(UI_PANEL_EVENT, onPanelOpen);
  }, []);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent(UI_PANEL_EVENT, {
        detail: { id: UI_PANEL_MENU, open },
      }),
    );
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Collapse the language accordion first, then the menu itself.
        if (langOpen) setLangOpen(false);
        else setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    // Lock page scroll behind the mobile full-screen overlay.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, langOpen]);

  // The language accordion is open only while the menu is open: closing the
  // menu resets it. Derived during render, no effect needed.
  const langShown = open && langOpen;

  // Any interaction outside the menu closes it: click, wheel/scroll, or
  // touch-drag. Events targeting the menu itself (wrapRef) are ignored so
  // using the sliders never dismisses the menu.
  useEffect(() => {
    if (!open) return;
    const outside = (e: Event) =>
      !wrapRef.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", outside);
    window.addEventListener("wheel", outside, { passive: true });
    window.addEventListener("touchmove", outside, { passive: true });
    return () => {
      document.removeEventListener("mousedown", outside);
      window.removeEventListener("wheel", outside);
      window.removeEventListener("touchmove", outside);
    };
  }, [open]);

  // Attempt autoplay on mount; fall back to the first interaction anywhere.
  // Restored preferences: volume + music on/off + playback position come from
  // localStorage, so "where did the user stop" survives reloads. A user who
  // paused the music stays paused (no autoplay for them).
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const savedVolume = Number(localStorage.getItem(LS_VOLUME));
    const savedOn = localStorage.getItem(LS_MUSIC_ON);
    const savedTime = Number(localStorage.getItem(LS_MUSIC_TIME));
    const wantsMusic = savedOn === null ? true : savedOn === "1";
    const effectiveVolume =
      Number.isFinite(savedVolume) && savedVolume > 0 ? savedVolume : 0.4;
    audio.volume = effectiveVolume;
    // Defer the React state sync to a microtask: the effect body must stay
    // setState-free (the DOM/audio element is the source of truth here).
    Promise.resolve().then(() => setVolume(effectiveVolume));

    // preload="auto" can load metadata BEFORE React hydration attaches the
    // onLoadedMetadata handler — read the duration directly too.
    if (Number.isFinite(audio.duration)) setDuration(audio.duration);
    const resume = () => {
      if (Number.isFinite(savedTime) && savedTime > 1 && (!Number.isFinite(audio.duration) || savedTime < audio.duration - 1)) {
        audio.currentTime = savedTime;
      }
    };
    resume();
    audio.addEventListener("loadedmetadata", resume, { once: true });

    const startPlayback = () => {
      audio
        .play()
        .then(() => setPlaying(true))
        .catch(() => undefined);
    };

    if (wantsMusic) {
      const onFirstInteraction = () => {
        INTERACTION_EVENTS.forEach((ev) =>
          window.removeEventListener(ev, onFirstInteraction),
        );
        startPlayback();
      };
      audio
        .play()
        .then(() => setPlaying(true))
        .catch(() => {
          INTERACTION_EVENTS.forEach((ev) =>
            window.addEventListener(ev, onFirstInteraction, { passive: true }),
          );
        });
      return () => {
        INTERACTION_EVENTS.forEach((ev) =>
          window.removeEventListener(ev, onFirstInteraction),
        );
        audio.removeEventListener("loadedmetadata", resume);
      };
    }

    return () => audio.removeEventListener("loadedmetadata", resume);
  }, []);

  // Persist music state: on/off + position (throttled by timeupdate events).
  useEffect(() => {
    localStorage.setItem(LS_MUSIC_ON, playing ? "1" : "0");
  }, [playing]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTimeUpdate = () => {
      localStorage.setItem(LS_MUSIC_TIME, String(Math.floor(audio.currentTime)));
    };
    audio.addEventListener("timeupdate", onTimeUpdate);
    return () => audio.removeEventListener("timeupdate", onTimeUpdate);
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio
        .play()
        .then(() => setPlaying(true))
        .catch(() => undefined);
    } else {
      audio.pause();
      setPlaying(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setMuted(audio.muted);
  }, []);

  const onVolume = useCallback((v: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = v;
    setVolume(v);
    localStorage.setItem(LS_VOLUME, String(v));
    if (v === 0 && !audio.muted) {
      audio.muted = true;
      setMuted(true);
    } else if (v > 0 && audio.muted) {
      audio.muted = false;
      setMuted(false);
    }
  }, []);

  const onSeek = useCallback((t: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = t;
    setCurrent(t);
  }, []);

  // Chrome reports duration=Infinity for VBR mp3s until it has parsed the
  // whole file, which would leave the seek bar dead at "0:00". Nudging
  // currentTime forces Chrome to parse the tail and emit the real duration.
  const onLoadedMetadata = useCallback(
    (e: React.SyntheticEvent<HTMLAudioElement>) => {
      const audio = e.currentTarget;
      if (!Number.isFinite(audio.duration)) {
        const onTimeUpdate = () => {
          audio.removeEventListener("timeupdate", onTimeUpdate);
          audio.currentTime = 0;
          if (Number.isFinite(audio.duration)) setDuration(audio.duration);
        };
        audio.addEventListener("timeupdate", onTimeUpdate);
        audio.currentTime = 1e101;
      } else {
        setDuration(audio.duration);
      }
    },
    [],
  );

  const onDurationChange = useCallback(
    (e: React.SyntheticEvent<HTMLAudioElement>) => {
      const d = e.currentTarget.duration;
      if (Number.isFinite(d)) setDuration(d);
    },
    [],
  );

  // ----- shared menu content (desktop dropdown + mobile overlay) -----
  const menuContent = (
    <>
      {/* CTA: concept from home, 3D tour from the concept page */}
      <Link
        href={onConcept ? homePath : conceptPath}
        onClick={() => setOpen(false)}
        className="group flex items-center justify-between rounded-xl bg-gradient-to-r from-gold to-clay px-4 py-3 text-sm font-semibold text-[#211505] shadow-[0_2px_20px_rgba(217,164,65,0.25)] transition hover:brightness-110 active:scale-[0.99]"
      >
        <span>{onConcept ? dict.menu.ctaTour : dict.menu.ctaConcept}</span>
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>

      {/* Music */}
      <div className="border-t border-sand/10 pt-4">
        <div className="flex items-center gap-2">
          <Music className="h-4 w-4 text-gold" />
          <p className="flex-1 text-[11px] uppercase tracking-[0.2em] text-sand/70">
            {dict.menu.music}
          </p>
          <p className="text-[11px] tabular-nums text-sand/50">
            {formatTime(current)} / {formatTime(duration)}
          </p>
        </div>
        <p className="mt-2 truncate text-xs text-sand/55">{dict.music.title}</p>

        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={current}
          onChange={(e) => onSeek(Number(e.target.value))}
          aria-label={dict.music.seek}
          className="menu-range mt-3 w-full"
        />

        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? dict.music.pause : dict.music.play}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold text-black transition-transform hover:scale-105 active:scale-90"
          >
            {playing ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4 translate-x-[1px]" />
            )}
          </button>

          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? dict.music.unmute : dict.music.mute}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sand/70 transition-colors hover:bg-white/5 hover:text-sand active:scale-90"
          >
            {muted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>

          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={muted ? 0 : volume}
            onChange={(e) => onVolume(Number(e.target.value))}
            aria-label={dict.music.volume}
            className="menu-range w-full min-w-0"
          />
        </div>
      </div>

      {/* Language accordion (extra top margin = breathing room under the
          music controls) */}
      <div className="mt-2 border-t border-sand/10 pt-3">
        <button
          type="button"
          onClick={() => setLangOpen((v) => !v)}
          aria-expanded={langShown}
          className="flex w-full items-center gap-2 rounded-lg px-1 py-1.5 text-sand/80 transition-colors hover:text-sand"
        >
          <Globe className="h-4 w-4 text-gold" />
          <span className="flex-1 text-left text-[11px] uppercase tracking-[0.2em]">
            {dict.menu.language}
          </span>
          <span className="text-xs text-sand/60">
            {LOCALE_NAMES[locale]}
          </span>
          <ChevronDown
            className={`h-3.5 w-3.5 text-sand/50 transition-transform ${
              langShown ? "rotate-180" : ""
            }`}
          />
        </button>

        <div
          className={`grid transition-all duration-300 ease-in-out ${
            langShown ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="mt-1 flex flex-col pb-1">
              {LOCALES.map((loc) => (
                <Link
                  key={loc}
                  href={pathFor(loc)}
                  onClick={() => {
                    // localStorage drives nothing server-side; the cookie is
                    // what the middleware reads on the next visit to /.
                    localStorage.setItem(LS_LOCALE, loc);
                    document.cookie = `ttk.locale=${loc}; path=/; max-age=31536000; samesite=lax`;
                    setOpen(false);
                  }}
                  className={`flex min-h-11 items-center justify-between rounded-lg px-3 text-xs transition-colors active:bg-white/10 ${
                    loc === locale
                      ? "bg-gold/15 font-medium text-gold"
                      : "text-sand/75 hover:bg-white/5 hover:text-sand"
                  }`}
                >
                  <span>{LOCALE_NAMES[loc]}</span>
                  <span className="text-[10px] uppercase tracking-wider opacity-60">
                    {loc}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <audio
        ref={audioRef}
        src="/audio/kasbah-theme.mp3"
        loop
        preload="auto"
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onLoadedMetadata={onLoadedMetadata}
        onDurationChange={onDurationChange}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      {/* Trigger + desktop dropdown */}
      <div ref={wrapRef} className="fixed top-5 right-6 z-[70] print:hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={open ? dict.menu.close : dict.menu.open}
          className="flex items-center gap-2.5 rounded-full border border-sand/25 bg-black/40 px-4 py-2.5 text-sand backdrop-blur transition-colors hover:border-gold/60"
        >
          {/* two lines that morph into an X */}
          <span className="flex flex-col gap-[5px]">
            <span
              className={`block h-[1.5px] w-[18px] bg-current transition-transform duration-300 ${
                open ? "translate-y-[3.25px] rotate-45" : ""
              }`}
            />
            <span
              className={`block h-[1.5px] w-[18px] bg-current transition-transform duration-300 ${
                open ? "-translate-y-[3.25px] -rotate-45" : ""
              }`}
            />
          </span>
          <span className="text-[11px] uppercase tracking-[0.22em]">
            {open ? dict.menu.close : dict.menu.label}
          </span>
          {/* live equalizer while the music plays */}
          <span className="flex h-3 items-end gap-[2px]" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`eq-bar w-[2.5px] rounded-sm ${
                  playing ? "bg-gold" : "bg-gold/40"
                }`}
                style={{
                  height: `${[5, 11, 7][i]}px`,
                  animationDelay: `${i * 0.22}s`,
                  animationPlayState: playing ? "running" : "paused",
                }}
              />
            ))}
          </span>
        </button>

        {/* Desktop dropdown */}
        <div
          role="dialog"
          aria-modal="false"
          aria-label={dict.menu.label}
          inert={!open}
          className={`absolute top-[3.4rem] right-0 hidden w-80 origin-top rounded-2xl border border-sand/15 bg-[#141715]/95 p-5 shadow-2xl backdrop-blur transition-all duration-300 md:block ${
            open
              ? "translate-y-0 scale-100 opacity-100"
              : "-translate-y-1 scale-[0.98] opacity-0"
          }`}
        >
          {menuContent}
        </div>
      </div>

      {/* Mobile: top sheet dropping from under the trigger. Not full-screen —
          the 3D scene stays visible below; drag/tap the handle to close. */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={dict.menu.label}
        inert={!open}
        className={`fixed inset-x-0 top-0 z-[60] md:hidden ${
          open ? "menu-open" : "pointer-events-none"
        }`}
      >
        {/* dim backdrop below the sheet (tap to close) */}
        <button
          type="button"
          aria-label={dict.menu.close}
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity duration-400 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`relative rounded-b-3xl border-b border-gold/15 bg-[#0d0a07]/95 pt-14 pb-5 shadow-[0_18px_50px_rgba(0,0,0,0.55)] backdrop-blur-xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            open ? "translate-y-0" : "-translate-y-[110%]"
          }`}
        >
          {/* zellige-inspired gold hairline ornament, centered above the rows */}
          <div
            aria-hidden
            className="absolute top-11 left-1/2 h-px w-24 -translate-x-1/2"
            style={{
              background:
                "linear-gradient(to right, transparent, rgba(217,164,65,0.7), transparent)",
            }}
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={dict.menu.close}
            className="absolute inset-x-0 top-0 flex h-8 w-full items-center justify-center touch-manipulation"
          >
            <span className="h-1 w-10 rounded-full bg-sand/30" />
          </button>
          <div className="menu-stagger mt-4 flex flex-col gap-4 px-6">
            {menuContent}
          </div>
        </div>
      </div>
    </>
  );
}
