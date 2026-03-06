"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  baseOpacity: number;
  opacity: number;
  dx: number;
  dy: number;
  twinkleSpeed: number;
  twinklePhase: number;
  // 0=gold, 1=silver, 2=dim-blue
  colorType: 0 | 1 | 2;
}

// Build star with a specific layer profile
function makeStar(
  canvasW: number,
  canvasH: number,
  sizeRange: [number, number],
  opacityRange: [number, number],
  speed: number,
  colorWeights: [number, number, number],
  twinkleRange: [number, number]
): Star {
  const r = Math.random();
  const colorType = (
    r < colorWeights[0] ? 0 : r < colorWeights[0] + colorWeights[1] ? 1 : 2
  ) as 0 | 1 | 2;
  return {
    x: Math.random() * canvasW,
    y: Math.random() * canvasH,
    size: sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]),
    baseOpacity: opacityRange[0] + Math.random() * (opacityRange[1] - opacityRange[0]),
    opacity: 0,
    dx: (Math.random() - 0.5) * speed,
    dy: (Math.random() - 0.5) * speed,
    twinkleSpeed: twinkleRange[0] + Math.random() * (twinkleRange[1] - twinkleRange[0]),
    twinklePhase: Math.random() * Math.PI * 2,
    colorType,
  };
}

const STAR_RGBA = [
  // gold
  (op: number) => `rgba(201, 168, 76, ${op})`,
  // silver-white
  (op: number) => `rgba(220, 215, 230, ${op})`,
  // dim blue-white
  (op: number) => `rgba(170, 190, 215, ${op})`,
];

export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let stars: Star[] = [];
    let lastTime = 0;
    let paused = false;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // cap at 2x for perf

    const init = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.scale(dpr, dpr);

      stars = [
        // Background layer — tiny, slow, silver/blue
        ...Array.from({ length: 50 }, () =>
          makeStar(w, h, [0.2, 0.8], [0.05, 0.28], 0.08, [0.25, 0.4, 0.35], [0.3, 0.9])
        ),
        // Mid layer
        ...Array.from({ length: 30 }, () =>
          makeStar(w, h, [0.5, 1.3], [0.1, 0.38], 0.18, [0.45, 0.4, 0.15], [0.4, 1.2])
        ),
        // Foreground — larger, gold-dominant, with glow
        ...Array.from({ length: 15 }, () =>
          makeStar(w, h, [0.9, 2.0], [0.15, 0.5], 0.28, [0.7, 0.25, 0.05], [0.6, 1.8])
        ),
      ];
    };

    const draw = (timestamp: number) => {
      if (paused) {
        animId = requestAnimationFrame(draw);
        return;
      }
      // With reduced motion: draw once then stop
      const dt = reducedMotion ? 0 : Math.min((timestamp - lastTime) / 1000, 0.1);
      lastTime = timestamp;

      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);

      for (const s of stars) {
        s.twinklePhase += s.twinkleSpeed * dt;
        const twinkle = 0.5 + 0.5 * Math.sin(s.twinklePhase);
        s.opacity = s.baseOpacity * (0.35 + 0.65 * twinkle);

        // Radial glow for foreground (large) stars only
        if (s.size > 1.2) {
          const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 2.8);
          grd.addColorStop(0, STAR_RGBA[s.colorType](s.opacity * 0.7));
          grd.addColorStop(1, STAR_RGBA[s.colorType](0));
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size * 2.8, 0, Math.PI * 2);
          ctx.fillStyle = grd;
          ctx.fill();
        }

        // Core dot
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = STAR_RGBA[s.colorType](s.opacity);
        ctx.fill();

        s.x += s.dx;
        s.y += s.dy;
        if (s.x < 0) s.x = w;
        if (s.x > w) s.x = 0;
        if (s.y < 0) s.y = h;
        if (s.y > h) s.y = 0;
      }

      if (!reducedMotion) {
        animId = requestAnimationFrame(draw);
      }
    };

    const onVisibilityChange = () => {
      paused = document.hidden;
      if (!paused) lastTime = 0; // reset dt so we don't jump after resume
    };

    init();
    window.addEventListener("resize", init, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", init);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0.75,
      }}
    />
  );
}
