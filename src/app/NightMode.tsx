"use client";

import { useEffect, useRef, useCallback } from "react";

// 5 zodiac constellations with real RA (hours) / Dec (degrees)
const ZODIAC_CONSTELLATIONS: { name: string; stars: [number, number][]; connections: [number, number][] }[] = [
  {
    name: "Sagittarius",
    stars: [[18.35, -29.83], [18.10, -30.42], [18.47, -25.42], [19.04, -29.88], [18.92, -26.30], [18.76, -27.03], [19.16, -21.02], [18.02, -34.38]],
    connections: [[7,1],[1,0],[0,5],[5,2],[2,4],[4,3],[5,4],[4,6]],
  },
  {
    name: "Libra",
    stars: [[14.85, -16.04], [15.28, -9.38], [15.59, -14.79], [15.07, -25.28], [14.69, -15.99]],
    connections: [[4,0],[0,1],[1,2],[2,0],[0,3]],
  },
  {
    name: "Capricornus",
    stars: [[20.29, -12.51], [20.35, -14.78], [21.10, -17.23], [21.37, -16.83], [21.62, -16.66], [21.78, -16.13], [20.77, -25.27], [21.44, -22.41]],
    connections: [[0,1],[1,6],[6,7],[7,5],[5,4],[4,3],[3,2],[2,1]],
  },
  {
    name: "Leo",
    stars: [[10.14, 11.97], [11.24, 20.52], [11.82, 14.57], [10.33, 19.84], [10.12, 16.76], [9.76, 23.77], [9.88, 26.01]],
    connections: [[5,6],[6,3],[3,4],[4,0],[3,1],[1,2]],
  },
  {
    name: "Virgo",
    stars: [[13.42, -11.16], [12.69, -1.45], [13.04, 10.96], [12.33, -0.67], [11.84, 1.76], [12.93, 3.40], [13.58, -0.60]],
    connections: [[4,3],[3,1],[1,5],[5,2],[1,6],[6,0]],
  },
];

const BAYER4 = [[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]];

function ditherPixel(x: number, y: number, brightness: number): boolean {
  const bx = ((x % 4) + 4) % 4;
  const by = ((y % 4) + 4) % 4;
  return brightness > BAYER4[by][bx] / 16;
}

// Shuffle and pick pairs
function pickConstellationPairs(): { name: string; stars: [number, number][]; connections: [number, number][] }[] {
  const shuffled = [...ZODIAC_CONSTELLATIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 2 + Math.floor(Math.random() * 2)); // 2-3 constellations
}

interface ShootingStar {
  x: number; y: number; angle: number; speed: number;
  length: number; life: number; maxLife: number;
}

interface Firework {
  x: number; y: number; particles: { angle: number; speed: number; decay: number }[];
  life: number; maxLife: number;
}

interface BGStar {
  x: number; y: number; brightness: number;
  twinkle: boolean; shimmer: boolean;
  twinkleSpeed: number; twinkleOffset: number;
}

export default function NightMode({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const bgStarsRef = useRef<BGStar[]>([]);
  const constellationsRef = useRef<ReturnType<typeof pickConstellationPairs>>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const fireworksRef = useRef<Firework[]>([]);
  const timeRef = useRef(0);
  const nextEventRef = useRef(180);
  const moonCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const initBGStars = useCallback((w: number, h: number) => {
    const stars: BGStar[] = [];
    const count = Math.floor((w * h) / 7000);
    for (let i = 0; i < count; i++) {
      const isTwinkle = Math.random() < 0.15;
      const isShimmer = !isTwinkle && Math.random() < 0.05; // 5% get a slow shimmer (grow/shrink glow)
      stars.push({
        x: Math.floor(Math.random() * w),
        y: Math.floor(Math.random() * h * 0.85),
        brightness: 0.12 + Math.random() * 0.4,
        twinkle: isTwinkle,
        shimmer: isShimmer,
        twinkleSpeed: 0.15 + Math.random() * 0.4,
        twinkleOffset: Math.random() * Math.PI * 2,
      });
    }
    bgStarsRef.current = stars;
  }, []);

  const spawnShootingStar = useCallback((w: number, h: number) => {
    shootingStarsRef.current.push({
      x: Math.random() * w * 0.6, y: Math.random() * h * 0.3,
      angle: Math.PI / 7 + Math.random() * Math.PI / 6,
      speed: 5 + Math.random() * 4, length: 50 + Math.random() * 70,
      life: 0, maxLife: 30 + Math.random() * 20,
    });
  }, []);

  const spawnFirework = useCallback((w: number, h: number) => {
    const particles: { angle: number; speed: number; decay: number }[] = [];
    const count = 20 + Math.floor(Math.random() * 20);
    for (let i = 0; i < count; i++) {
      particles.push({
        angle: (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4,
        speed: 1.5 + Math.random() * 2.5, decay: 0.95 + Math.random() * 0.03,
      });
    }
    fireworksRef.current.push({
      x: w * 0.15 + Math.random() * w * 0.7,
      y: h * 0.1 + Math.random() * h * 0.35,
      particles, life: 0, maxLife: 50 + Math.random() * 25,
    });
  }, []);

  // Dither moon
  useEffect(() => {
    if (!active) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const c = document.createElement("canvas");
      const size = 200;
      c.width = size; c.height = size;
      const cx = c.getContext("2d");
      if (!cx) return;
      cx.drawImage(img, 0, 0, size, size);
      const imageData = cx.getImageData(0, 0, size, size);
      const data = imageData.data;
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const i = (y * size + x) * 4;
          const a = data[i + 3];
          if (a < 10) { data[i]=0; data[i+1]=0; data[i+2]=0; data[i+3]=0; continue; }
          const gray = data[i]*0.299 + data[i+1]*0.587 + data[i+2]*0.114;
          const bx = ((x % 4) + 4) % 4;
          const by = ((y % 4) + 4) % 4;
          const threshold = (BAYER4[by][bx] / 16) * 255 + 10;
          data[i]=247; data[i+1]=245; data[i+2]=242;
          data[i+3] = gray > threshold ? 0 : a;
        }
      }
      cx.putImageData(imageData, 0, 0);
      moonCanvasRef.current = c;
    };
    img.src = "/moon.png";
  }, [active]);

  useEffect(() => {
    if (!active) { if (animRef.current) cancelAnimationFrame(animRef.current); return; }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    timeRef.current = 0;
    nextEventRef.current = 180;
    shootingStarsRef.current = [];
    fireworksRef.current = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initBGStars(canvas.width, canvas.height);
      constellationsRef.current = pickConstellationPairs();
    };
    resize();
    window.addEventListener("resize", resize);

    const drawDitheredDot = (dotX: number, dotY: number, radius: number, bright: number) => {
      const lx = Math.max(0, Math.floor(dotX - radius));
      const ly = Math.max(0, Math.floor(dotY - radius));
      const rx = Math.min(canvas.width, Math.ceil(dotX + radius));
      const ry = Math.min(canvas.height, Math.ceil(dotY + radius));
      for (let py = ly; py < ry; py++) {
        for (let px = lx; px < rx; px++) {
          const ddx = px - dotX; const ddy = py - dotY;
          if (ddx * ddx + ddy * ddy > radius * radius) continue;
          if (ditherPixel(px, py, bright)) ctx.fillRect(px, py, 1, 1);
        }
      }
    };

    const drawDitheredLine = (x0: number, y0: number, x1: number, y1: number, bright: number) => {
      const dx = x1 - x0; const dy = y1 - y0;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const steps = Math.max(1, Math.floor(dist / 2));
      for (let i = 0; i <= steps; i++) {
        const frac = i / steps;
        const px = Math.floor(x0 + dx * frac);
        const py = Math.floor(y0 + dy * frac);
        if (px >= 0 && px < canvas.width && py >= 0 && py < canvas.height) {
          if (ditherPixel(px, py, bright)) ctx.fillRect(px, py, 1, 1);
        }
      }
    };

    // Place constellations in spread-out zones across upper sky
    const zones = [
      { xMin: 0.05, xMax: 0.35, yMin: 0.08, yMax: 0.45 },
      { xMin: 0.35, xMax: 0.65, yMin: 0.05, yMax: 0.40 },
      { xMin: 0.65, xMax: 0.90, yMin: 0.08, yMax: 0.45 },
    ];

    const placedConstellations = constellationsRef.current.map((c, idx) => {
      const zone = zones[idx % zones.length];
      // Find bounding box of constellation stars
      const ras = c.stars.map(s => s[0]);
      const decs = c.stars.map(s => s[1]);
      const minRA = Math.min(...ras); const maxRA = Math.max(...ras);
      const minDec = Math.min(...decs); const maxDec = Math.max(...decs);
      const raRange = maxRA - minRA || 1;
      const decRange = maxDec - minDec || 1;

      const zoneW = (zone.xMax - zone.xMin) * canvas.width;
      const zoneH = (zone.yMax - zone.yMin) * canvas.height;
      const scale = Math.min(zoneW / raRange, zoneH / decRange) * 0.6;

      const offsetX = zone.xMin * canvas.width + zoneW * 0.5;
      const offsetY = zone.yMin * canvas.height + zoneH * 0.5;

      const screenStars = c.stars.map(([ra, dec]) => ({
        x: offsetX + (ra - (minRA + raRange / 2)) * scale,
        y: offsetY - (dec - (minDec + decRange / 2)) * scale * 0.5,
      }));

      return { ...c, screenStars };
    });

    const animate = () => {
      timeRef.current++;
      const t = timeRef.current;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#f7f5f2";

      // Background stars
      bgStarsRef.current.forEach((star) => {
        let b = star.brightness;

        if (star.twinkle) {
          // Gentle on/off twinkle
          const wave = Math.sin(t * 0.025 * star.twinkleSpeed + star.twinkleOffset);
          b *= (0.3 + 0.7 * (0.5 + 0.5 * wave));
        }

        if (star.shimmer) {
          // Slow shimmer — star pulses bigger/brighter then back
          const wave = Math.sin(t * 0.015 * star.twinkleSpeed + star.twinkleOffset);
          const shimmerB = b * (0.6 + 0.4 * (0.5 + 0.5 * wave));
          if (shimmerB > 0.08) {
            const radius = 1 + (0.5 + 0.5 * wave) * 1.5;
            drawDitheredDot(star.x, star.y, radius, shimmerB);
          }
          return;
        }

        if (b > 0.05 && ditherPixel(star.x, star.y, b)) {
          ctx.fillRect(star.x, star.y, 1, 1);
        }
      });

      // Constellations
      placedConstellations.forEach((c) => {
        // Faint lines
        c.connections.forEach(([a, bIdx]) => {
          const sa = c.screenStars[a]; const sb = c.screenStars[bIdx];
          drawDitheredLine(sa.x, sa.y, sb.x, sb.y, 0.1);
        });
        // Bright stars
        c.screenStars.forEach((s) => {
          drawDitheredDot(s.x, s.y, 2.5, 0.8);
        });
      });

      // Moon — top right, big
      if (moonCanvasRef.current) {
        ctx.drawImage(moonCanvasRef.current, w - 240, 15);
      }

      // Rare events
      if (t > nextEventRef.current) {
        if (Math.random() < 0.65) {
          spawnShootingStar(w, h);
          nextEventRef.current = t + 200 + Math.random() * 300;
        } else {
          spawnFirework(w, h);
          nextEventRef.current = t + 250 + Math.random() * 350;
        }
      }

      // Shooting stars
      shootingStarsRef.current = shootingStarsRef.current.filter((ss) => {
        ss.life++;
        if (ss.life > ss.maxLife) return false;
        const progress = ss.life / ss.maxLife;
        const headX = ss.x + Math.cos(ss.angle) * ss.speed * ss.life;
        const headY = ss.y + Math.sin(ss.angle) * ss.speed * ss.life;
        const tailLen = ss.length * (1 - progress * 0.5);
        const steps = Math.floor(tailLen / 2);
        for (let i = 0; i < steps; i++) {
          const frac = i / steps;
          const px = Math.floor(headX - Math.cos(ss.angle) * tailLen * frac);
          const py = Math.floor(headY - Math.sin(ss.angle) * tailLen * frac);
          const b = (1 - frac) * (1 - progress * 0.7);
          if (px >= 0 && px < w && py >= 0 && py < h && ditherPixel(px, py, b)) {
            ctx.fillRect(px, py, 2, 2);
          }
        }
        return true;
      });

      // Fireworks
      fireworksRef.current = fireworksRef.current.filter((fw) => {
        fw.life++;
        if (fw.life > fw.maxLife) return false;
        const progress = fw.life / fw.maxLife;
        fw.particles.forEach((p) => {
          const dist = p.speed * fw.life * Math.pow(p.decay, fw.life);
          const px = Math.floor(fw.x + Math.cos(p.angle) * dist);
          const py = Math.floor(fw.y + Math.sin(p.angle) * dist + fw.life * 0.4);
          const b = (1 - progress) * 0.8;
          if (px >= 0 && px < w && py >= 0 && py < h && ditherPixel(px, py, b)) {
            ctx.fillRect(px, py, 2, 2);
          }
        });
        return true;
      });

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener("resize", resize); };
  }, [active, initBGStars, spawnShootingStar, spawnFirework]);

  if (!active) return null;
  return <canvas ref={canvasRef} className="night-mode-canvas" />;
}