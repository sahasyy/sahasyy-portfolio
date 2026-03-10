"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  text: string;
  className?: string;
  startSize?: number;
  endSize?: number;
  onProgress?: (progress: number) => void;
}

export default function ScrollRevealText({
  text,
  className = "",
  startSize = 140,
  endSize = 52,
  onProgress,
}: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const smoothRef = useRef(0);
  const rafRef = useRef<number>(0);
  const [progress, setProgress] = useState(0);
  const onProgressRef = useRef(onProgress);
  useEffect(() => {
    onProgressRef.current = onProgress;
  }, [onProgress]);

  // Responsive scale
  const [s, setS] = useState(1);
  useEffect(() => {
    const c = () => setS(window.innerWidth <= 700 ? 0.42 : window.innerWidth <= 940 ? 0.6 : 1);
    c();
    window.addEventListener("resize", c);
    return () => window.removeEventListener("resize", c);
  }, []);

  const sStart = startSize * s;
  const sEnd = endSize * s;

  // rAF loop
  useEffect(() => {
    const loop = () => {
      const el = wrapperRef.current;
      if (!el) { rafRef.current = requestAnimationFrame(loop); return; }

      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;

      // Faster section timing so each heading resolves before the next section begins
      const raw = (vh * 0.88 - rect.top) / (vh * 0.82);
      const p = Math.max(0, Math.min(1, raw));

      // Smooth lerp
      smoothRef.current += (p - smoothRef.current) * 0.085;
      if (Math.abs(smoothRef.current - p) < 0.0015) smoothRef.current = p;

      onProgressRef.current?.(smoothRef.current);
      setProgress(smoothRef.current);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const chars = text.split("");
  const len = chars.length;

  // Letters reveal: 0% → 45% of scroll progress
  // Size shrinks:  35% → 65%
  const letterProg = Math.min(1, progress / 0.45);
  const sizeProg = Math.max(0, Math.min(1, (progress - 0.35) / 0.3));
  const easedSize = sizeProg * sizeProg * (3 - 2 * sizeProg);
  const currentSize = sStart - (sStart - sEnd) * easedSize;

  return (
    <div
      ref={wrapperRef}
      className={className}
      style={{
        fontSize: `${currentSize}px`,
        lineHeight: 1.15,
        letterSpacing: "-0.03em",
        fontWeight: 600,
      }}
    >
      {chars.map((char, i) => {
        // Each letter takes 25% of letterProg to fully reveal.
        // Letters are staggered so the LAST letter finishes at letterProg = 1.
        // startAt for letter i:  (i / len) * (1 - duration)
        // This guarantees last letter: startAt + duration = 1.0
        const duration = 0.25;
        const startAt = (i / Math.max(len - 1, 1)) * (1 - duration);
        const charP = Math.max(0, Math.min(1, (letterProg - startAt) / duration));
        const eased = 1 - Math.pow(1 - charP, 3);

        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              overflow: "hidden",
              verticalAlign: "top",
              height: "1.2em",
              lineHeight: "1.2em",
            }}
          >
            <span
              style={{
                display: "inline-block",
                transform: `translateY(${(1 - eased) * 105}%)`,
                opacity: charP > 0.01 ? 1 : 0,
                whiteSpace: char === " " ? "pre" : undefined,
                willChange: "transform",
              }}
            >
              {char === " " ? "\u00A0" : char}
            </span>
          </span>
        );
      })}
    </div>
  );
}
