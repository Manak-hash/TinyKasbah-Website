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

export default function MusicPlayer({ dict }: { dict: MusicDict }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [expanded, setExpanded] = useState(false);

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
      window.setTimeout(() => setExpanded(false), 6000);
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
    <div className="fixed bottom-5 right-5 z-50 print:hidden">
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
        className={`overflow-hidden rounded-full border transition-all duration-500 ${
          expanded
            ? "border-sand/25 bg-black/70 backdrop-blur shadow-xl"
            : "border-sand/25 bg-black/40 backdrop-blur"
        }`}
      >
        <div className="flex items-center gap-2 px-2 py-2">
          {/* Expand/collapse toggle — spinning disc when playing */}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            aria-label={expanded ? dict.collapse : dict.expand}
            className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-gold"
          >
            <Music
              className={`h-4 w-4 ${playing ? "animate-[spin_4s_linear_infinite]" : ""}`}
            />
            {playing && (
              <span className="absolute inset-0 rounded-full border border-gold/30 animate-ping [animation-duration:3s]" />
            )}
          </button>

          {/* Collapsible panel: title + controls */}
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
              <div className="min-w-0">
                <div className="flex items-baseline gap-2 pr-1">
                  <p className="truncate text-xs font-medium text-sand">
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
                  className="mt-1.5 h-1 w-40 cursor-pointer appearance-none rounded-full bg-sand/20 accent-gold sm:w-52"
                />

                <div className="mt-1.5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={togglePlay}
                    aria-label={playing ? dict.pause : dict.play}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-gold text-black transition-transform hover:scale-105"
                  >
                    {playing ? (
                      <Pause className="h-3.5 w-3.5" />
                    ) : (
                      <Play className="h-3.5 w-3.5 translate-x-[1px]" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={toggleMute}
                    aria-label={muted ? dict.unmute : dict.mute}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-sand/70 transition-colors hover:text-sand"
                  >
                    {muted ? (
                      <VolumeX className="h-3.5 w-3.5" />
                    ) : (
                      <Volume2 className="h-3.5 w-3.5" />
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
                    className="h-1 w-16 cursor-pointer appearance-none rounded-full bg-sand/20 accent-gold"
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
