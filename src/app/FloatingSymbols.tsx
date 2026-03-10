"use client";

import { useEffect, useRef } from "react";

const SYMBOLS = ["✦", "✧", "·", "•", "◦", "✩", "∗", "⊹", "✶", "˚", "⁺", "❄", "❅", "❆", "✳", "※", "✷", "⋆", "°"];

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  symbol: string;
  size: number;
  alpha: number;
  rotation: number;
  rotSpeed: number;
}

export default function FloatingSymbols() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);
  const initedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, rect.width);
      const h = Math.max(1, rect.height);
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (!initedRef.current) {
        const count = Math.max(25, Math.floor(w / 28));
        const initial: Particle[] = [];
        for (let i = 0; i < count; i++) {
          const isSnowflake = Math.random() < 0.3;
          const isLarge = Math.random() < 0.08;
          const isTiny = Math.random() < 0.4;
          const symbol = isSnowflake
            ? ["❄", "❅", "❆"][Math.floor(Math.random() * 3)]
            : SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
          const size = isTiny ? 6 + Math.random() * 3 : isLarge ? 14 + Math.random() * 4 : 8 + Math.random() * 4;
          let alpha = isTiny ? 0.22 + Math.random() * 0.12 : isLarge ? 0.14 + Math.random() * 0.08 : 0.18 + Math.random() * 0.14;
          if (isSnowflake) alpha += 0.06;
          initial.push({
            id: i,
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.25,
            vy: 0.05 + Math.random() * 0.15,
            symbol,
            size,
            alpha,
            rotation: Math.random() * 360,
            rotSpeed: (Math.random() - 0.5) * 0.3,
          });
        }
        particlesRef.current = initial;
        initedRef.current = true;
      }
    };

    resize();
    let lastTime = performance.now();

    const animate = (now: number) => {
      const dt = Math.min(32, now - lastTime) / 16;
      lastTime = now;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);

      for (const p of particlesRef.current) {
        p.vx += (Math.random() - 0.5) * 0.008 * dt;
        p.vx += Math.sin(now * 0.0003 + p.id) * 0.003 * dt;
        p.vy += (Math.random() - 0.5) * 0.003 * dt;
        if (p.vy < 0.02) p.vy = 0.02;
        if (p.vy > 0.3) p.vy = 0.3;
        p.vx *= 0.998;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rotation += p.rotSpeed * dt;

        if (p.x < -15) p.x = w + 15;
        if (p.x > w + 15) p.x = -15;
        if (p.y > h + 10) {
          p.y = -10;
          p.x = Math.random() * w;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = "rgba(46, 39, 30, 1)";
        ctx.font = `${p.size}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.symbol, 0, 0);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        overflow: "hidden",
      }}
      aria-hidden="true"
    />
  );
}
