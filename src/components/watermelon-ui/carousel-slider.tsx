"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  type PanInfo,
  type Variants,
} from "motion/react";

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
  /** ms between automatic advances; drag/click resets the timer */
  autoAdvanceMs?: number;
}

/* ---------------- Animation Variants ---------------- */

const variants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 260 : -260,
    scale: 0.9,
    opacity: 0,
    rotate: direction > 0 ? 8 : -8,
    zIndex: 2,
  }),
  center: {
    x: 0,
    scale: 1,
    opacity: 1,
    rotate: -3,
    zIndex: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -260 : 260,
    scale: 0.85,
    opacity: 0,
    rotate: direction > 0 ? -18 : 18,
    zIndex: 0,
  }),
};

/* ---------------- Component ---------------- */

export const CarouselSlider: React.FC<CarouselSliderProps> = ({ slides, hint, autoAdvanceMs = 6700 }) => {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const autoTimer = useRef<number | null>(null);

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setIndex((prev) => (prev + newDirection + slides.length) % slides.length);
  };

  // Preload every slide image on mount so switching never shows a loading
  // gap — the files are small and there are only four.
  useEffect(() => {
    slides.forEach((s) => {
      const img = new window.Image();
      img.src = s.img;
    });
  }, [slides]);

  // Auto-advance every autoAdvanceMs. Any manual interaction (drag or dot
  // click) resets the timer so the carousel never fights the visitor.
  const resetAuto = () => {
    if (autoTimer.current !== null) window.clearInterval(autoTimer.current);
    autoTimer.current = window.setInterval(() => paginate(1), autoAdvanceMs);
  };
  useEffect(() => {
    resetAuto();
    return () => {
      if (autoTimer.current !== null) window.clearInterval(autoTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides, autoAdvanceMs]);

  const dragX = useMotionValue(0);
  const rotate = useTransform(dragX, [-200, 200], [-12, 12]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < -120) paginate(1);
    else if (info.offset.x > 120) paginate(-1);
    resetAuto();
  };

  const slide = slides[index];

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-full">
      {/* Slider */}
      <div className="relative w-64 sm:w-72 max-w-[82vw] aspect-[4/5] flex items-center justify-center -rotate-[6deg]">
        {/* enter/exit overlap (no mode="wait"): switching feels instant */}
        <AnimatePresence custom={direction} initial={false}>
          <motion.div
            key={index}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 320, damping: 30 },
              scale: { duration: 0.3 },
              opacity: { duration: 0.22 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            style={{ rotate, x: dragX }}
            onDragEnd={handleDragEnd}
            className="absolute w-full h-full bg-[#FDFDFD] rounded-[40px] p-2 shadow-md border-[1.2px] border-[#E6E6EA] overflow-hidden cursor-grab active:cursor-grabbing"
          >
            <div className="w-full h-full rounded-[32px] overflow-hidden bg-zinc-100 relative">
              <Image
                src={slide.img}
                alt={slide.title}
                fill
                sizes="(max-width: 640px) 82vw, 288px"
                priority={index === 0}
                draggable={false}
                className="object-cover w-full h-full pointer-events-none select-none"
              />

              {/* Label plate */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent pt-14 pb-5 px-5">
                <p className={`text-sm font-semibold tracking-wide uppercase ${slide.accent}`}>
                  {slide.title}
                </p>
                <p className="text-sm text-white/85 mt-0.5">{slide.subtitle}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Background Card */}
        <div className="absolute -z-10 w-[95%] h-[95%] bg-white rounded-[40px] border-[6px] border-white scale-95 opacity-50" />
      </div>

      {/* Pagination */}
      <div className="flex gap-2.5 mt-8 pl-8 -rotate-[6deg]">
        {slides.map((s, i) => (
          <motion.div
            key={s.id}
            animate={{
              scale: i === index ? 1.2 : 1,
              opacity: i === index ? 1 : 0.4,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
            }}
            className="w-2.5 h-2.5 rounded-full bg-[#D9A441] cursor-pointer"
            onClick={() => {
              setDirection(i > index ? 1 : -1);
              setIndex(i);
              resetAuto();
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
