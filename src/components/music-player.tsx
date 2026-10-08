"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Music, Pause, Play, Volume2, VolumeX } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries";

type MusicDict = Dictionary["music"];

// Broader than pointerdown/keydown alone: touch devices, scrolling, and
// clicks on other controls all count as "the visitor is here".
const INTERACTION_EVENTS = [
  "pointerdown",
  "keydown",
  "touchstart",
  "wheel",
] as const;

// On mobile the expanded panel briefly covers the hero badge text (top-right
// position), so it gets out of the way faster there than on desktop.
const autoCollapseMs = () =>
  typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches
    ? 6000
    : 3500;

// Cross-panel exclusivity: opening the music panel must close the language
// dropdown (and vice versa). Components announce via a window CustomEvent;
// each listener closes itself when the id is not its own.
export const UI_PANEL_EVENT = "tinykasbah:panel-open";
export const UI_PANEL_MUSIC = "music";

export default function MusicPlayer({ dict }: { dict: MusicDict }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [expanded, setExpanded] = useState(false);

  // Close this panel when another panel (language switcher) opens.
  useEffect(() => {
    const onPanelOpen = (e: Event) => {
      const detail = (e as CustomEvent<{ id: string }>).detail;
      if (detail?.id !== UI_PANEL_MUSIC) setExpanded(false);
    };
    window.addEventListener(UI_PANEL_EVENT, onPanelOpen);
    return () => window.removeEventListener(UI_PANEL_EVENT, onPanelOpen);
  }, []);

  // Announce this panel opening so others close themselves.
  useEffect(() => {
    if (!expanded) return;
    window.dispatchEvent(
      new CustomEvent(UI_PANEL_EVENT, { detail: { id: UI_PANEL_MUSIC } }),
    );
  }, [expanded]);

  // Attempt autoplay on mount. If the browser blocks unmuted autoplay
  // (no prior user interaction with the domain), fall back to starting
  // on the first user interaction anywhere on the page.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.4;

    // preload="auto" can load metadata BEFORE React hydration attaches the
    // onLoadedMetadata/onDurationChange handlers — read it directly too.
    if (Number.isFinite(audio.duration)) setDuration(audio.duration);

    const startAndAnnounce = () => {
      setPlaying(true);
      setExpanded(true);
      window.setTimeout(() => setExpanded(false), autoCollapseMs());
    };

    const onFirstInteraction = () => {
      INTERACTION_EVENTS.forEach((ev) =>
        window.removeEventListener(ev, onFirstInteraction),
      );
      audio
        .play()
        .then(startAndAnnounce)
        .catch(() => undefined);
    };

    audio
      .play()
      .then(startAndAnnounce)
      .catch(() => {
        INTERACTION_EVENTS.forEach((ev) =>
          window.addEventListener(ev, onFirstInteraction, { passive: true }),
        );
      });
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
  const onLoadedMetadata = useCallback((e: React.SyntheticEvent<HTMLAudioElement>) => {
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
  }, []);

  const onDurationChange = useCallback(
    (e: React.SyntheticEvent<HTMLAudioElement>) => {
      const d = e.currentTarget.duration;
      if (Number.isFinite(d)) setDuration(d);
    },
    [],
  );

  const formatTime = (s: number) => {
    if (!Number.isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    // Mobile: top-right, tucked UNDER the language switcher (top-16) — the
    // bottom edge is crowded on both pages (viewpoint pills, sliders, chapter
    // cards) and an overlay there hurts text visibility. Desktop (md+):
    // unchanged bottom-right. The expanded panel drops DOWN below the disc
    // on mobile so it never stretches the top edge or overlaps the switcher.
    <div className="fixed top-[4.5rem] right-5 z-50 md:top-auto md:bottom-5 print:hidden">
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

      <div
        className={`overflow-hidden transition-all duration-500 ${
          expanded
            ? "rounded-3xl border border-sand/25 bg-black/70 backdrop-blur shadow-xl md:rounded-full"
            : "rounded-full border border-gold/25 bg-black/40 backdrop-blur shadow-[0_0_16px_rgba(217,164,65,0.12)]"
        }`}
      >
        <div className="flex flex-col items-end gap-2 p-2 md:flex-row md:items-center md:gap-2 md:px-2 md:py-2">
          {/* Expand/collapse toggle — spinning disc when playing */}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            aria-label={expanded ? dict.collapse : dict.expand}
            className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-gradient-to-br from-gold/15 to-gold/5 text-gold shadow-[0_0_12px_rgba(217,164,65,0.15)] transition-all duration-300 hover:scale-105 hover:border-gold/70 hover:shadow-[0_0_18px_rgba(217,164,65,0.4)] active:scale-95 md:h-9 md:w-9"
          >
            <Music
              className={`h-5 w-5 md:h-4 md:w-4 ${
                playing
                  ? "animate-[spin_4s_linear_infinite]"
                  : "animate-pulse [animation-duration:3s]"
              }`}
            />
            {playing && (
              <span className="absolute inset-0 rounded-full border border-gold/30 animate-ping [animation-duration:3s]" />
            )}
          </button>

          {/* Collapsible panel: title + controls. Mobile = column below the
              disc; desktop = row to the right of it. */}
          <div
            className={`grid transition-all duration-500 ease-in-out ${
              expanded
                ? "grid-cols-[1fr] opacity-100"
                : "grid-cols-[0fr] opacity-0"
            }`}
            style={{ gridTemplateRows: "1fr" }}
            aria-hidden={!expanded}
          >
            {expanded && (
              <div className="min-w-0 md:min-w-[16rem]">
                <div className="flex items-baseline gap-2 md:pr-1">
                  <p className="max-w-44 truncate text-xs font-medium text-sand md:max-w-none">
                    {dict.title}
                  </p>
                  <p className="shrink-0 text-[10px] tabular-nums text-sand/50">
                    {formatTime(current)} / {formatTime(duration)}
                  </p>
                </div>

                {/* Seek bar */}
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  step={0.1}
                  value={current}
                  onChange={(e) => onSeek(Number(e.target.value))}
                  aria-label={dict.seek}
                  className="mt-1.5 h-1 w-44 cursor-pointer appearance-none rounded-full bg-sand/20 accent-gold md:w-52"
                />

                <div className="mt-1.5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={togglePlay}
                    aria-label={playing ? dict.pause : dict.play}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-gold text-black transition-transform hover:scale-105 md:h-7 md:w-7"
                  >
                    {playing ? (
                      <Pause className="h-4 w-4 md:h-3.5 md:w-3.5" />
                    ) : (
                      <Play className="h-4 w-4 translate-x-[1px] md:h-3.5 md:w-3.5" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={toggleMute}
                    aria-label={muted ? dict.unmute : dict.mute}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-sand/70 transition-colors hover:text-sand md:h-7 md:w-7"
                  >
                    {muted ? (
                      <VolumeX className="h-4 w-4 md:h-3.5 md:w-3.5" />
                    ) : (
                      <Volume2 className="h-4 w-4 md:h-3.5 md:w-3.5" />
                    )}
                  </button>

                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={muted ? 0 : volume}
                    onChange={(e) => onVolume(Number(e.target.value))}
                    aria-label={dict.volume}
                    className="h-1 w-20 cursor-pointer appearance-none rounded-full bg-sand/20 accent-gold md:w-16"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
