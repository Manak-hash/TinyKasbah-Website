"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

/* ---------------- Types ---------------- */

export interface UniverseSlide {
  id: number;
  img: string;
  title: string;
  subtitle: string;
  accent: string; // tailwind text color class
}

interface CarouselSliderProps {
  slides: UniverseSlide[];
  hint?: string;
  /** ms between automatic advances; any interaction resets the timer */
  autoAdvanceMs?: number;
}

/* ---------------- Component ---------------- */

/**
 * Custom carousel — no animation library. Plain CSS transform transitions on
 * a 3-slide track (previous / current / next): a real sliding carousel where
 * cards physically move left or right, with touch drag, dot pagination and
 * auto-advance. Every slide is always mounted (translateX offscreen when
 * hidden), so switching never loads or decodes anything.
 */
export const CarouselSlider: React.FC<CarouselSliderProps> = ({
  slides,
  hint,
  autoAdvanceMs = 6700,
}) => {
  const [index, setIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0); // px, live during drag
  const dragStart = useRef<number | null>(null);
  const autoTimer = useRef<number | null>(null);
  const padRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback(
    (i: number) => {
      setIndex(((i % slides.length) + slides.length) % slides.length);
      setDragOffset(0);
    },
    [slides.length],
  );

  const paginate = useCallback(
    (dir: number) => goTo(index + dir),
    [goTo, index],
  );

  // Preload every slide image on mount so switching never shows a loading gap.
  useEffect(() => {
    slides.forEach((s) => {
      const img = new window.Image();
      img.src = s.img;
    });
  }, [slides]);

  // Auto-advance; any interaction resets the timer.
  const resetAuto = useCallback(() => {
    if (autoTimer.current !== null) window.clearInterval(autoTimer.current);
    autoTimer.current = window.setInterval(
      () => setIndex((prev) => (prev + 1) % slides.length),
      autoAdvanceMs,
    );
  }, [autoAdvanceMs, slides.length]);
  useEffect(() => {
    resetAuto();
    return () => {
      if (autoTimer.current !== null) window.clearInterval(autoTimer.current);
    };
  }, [resetAuto]);

  // --- touch/pointer drag ---
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStart.current = e.clientX;
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStart.current === null) return;
    setDragOffset(e.clientX - dragStart.current);
  };
  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStart.current === null) return;
    const delta = e.clientX - dragStart.current;
    dragStart.current = null;
    if (Math.abs(delta) > Math.max(60, 0.12 * 288)) {
      paginate(delta < 0 ? 1 : -1);
      resetAuto();
    } else {
      setDragOffset(0); // snap back
    }
    void e;
  };

  // Each slide's track position relative to the current one, taking the
  // shortest path around the 4-slide loop: -1, 0, 1 (2 wraps to -2).
  const slideRel = (i: number) => {
    let rel = i - index;
    if (rel > slides.length / 2) rel -= slides.length;
    if (rel < -slides.length / 2) rel += slides.length;
    return rel;
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-full">
      {/* Slider */}
      <div
        ref={padRef}
        className="relative w-64 sm:w-72 max-w-[82vw] aspect-[4/5] -rotate-[6deg] touch-pan-y select-none"
        style={{ perspective: "1200px" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {slides.map((s, i) => {
          const rel = slideRel(i);
          const isCenter = rel === 0;
          const x = isCenter ? dragOffset * 0.35 : 0;
          // Only the active slide is rendered; neighbors stay mounted but
          // invisible (preload + instant crossfade target).
          const onScreen = isCenter || (Math.abs(rel) === 1 && Math.abs(dragOffset) > 8);
          return (
            <div
              key={s.id}
              className="absolute inset-0 transition-[transform,opacity] duration-500 ease-out"
              style={{
                transform: `translateX(${x}px) scale(${isCenter ? 1 : 1.06})`,
                opacity: isCenter ? 1 : onScreen ? 0 : 0,
                zIndex: isCenter ? 2 : 1,
                pointerEvents: isCenter ? "auto" : "none",
              }}
            >
              <div className="w-full h-full bg-[#FDFDFD] rounded-[40px] p-2 shadow-md border-[1.2px] border-[#E6E6EA] overflow-hidden">
                <div className="w-full h-full rounded-[32px] overflow-hidden bg-zinc-100 relative">
                  <Image
                    src={s.img}
                    alt={s.title}
                    fill
                    sizes="(max-width: 640px) 82vw, 288px"
                    priority={i === 0}
                    draggable={false}
                    className="object-cover w-full h-full pointer-events-none select-none"
                  />
                  {/* Label plate */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent pt-14 pb-5 px-5">
                    <p className={`text-sm font-semibold tracking-wide uppercase ${s.accent}`}>
                      {s.title}
                    </p>
                    <p className="text-sm text-white/85 mt-0.5">{s.subtitle}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {/* Background Card */}
        <div className="absolute -z-10 w-[95%] h-[95%] bg-white rounded-[40px] border-[6px] border-white scale-95 opacity-50" />
      </div>

      {/* Pagination */}
      <div className="flex gap-2.5 mt-8 pl-8 -rotate-[6deg]">
        {slides.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              goTo(i);
              resetAuto();
            }}
            aria-label={s.title}
            className="w-2.5 h-2.5 rounded-full bg-[#D9A441] cursor-pointer transition-all duration-200"
            style={{
              transform: i === index ? "scale(1.2)" : "scale(1)",
              opacity: i === index ? 1 : 0.4,
            }}
            title={s.title}
          />
        ))}
      </div>

      <p className="mt-6 text-xs text-sand/50 tracking-widest uppercase text-center px-4">
        {hint}
      </p>
    </div>
  );
};
