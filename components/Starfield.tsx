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

const STAR_COLORS = [
  // gold
  (op: number) => `rgba(201, 168, 76, ${op})`,
  // silver-white
  (op: number) => `rgba(220, 215, 230, ${op})`,
  // dim blue-white
  (op: number) => `rgba(170, 190, 220, ${op})`,
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

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Layered star counts: 50 background, 30 mid, 15 foreground
      stars = [
        // Background layer — tiny, slow, mostly silver/blue
        ...Array.from({ length: 50 }, () => ({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 0.7 + 0.2,
          baseOpacity: Math.random() * 0.25 + 0.05,
          opacity: 0,
          dx: (Math.random() - 0.5) * 0.08,
          dy: (Math.random() - 0.5) * 0.08,
          twinkleSpeed: Math.random() * 0.6 + 0.3,
          twinklePhase: Math.random() * Math.PI * 2,
          colorType: (Math.random() < 0.3 ? 0 : Math.random() < 0.5 ? 1 : 2) as 0 | 1 | 2,
        })),
        // Mid layer — medium, moderate speed, mixed colors
        ...Array.from({ length: 30 }, () => ({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.0 + 0.5,
          baseOpacity: Math.random() * 0.35 + 0.1,
          opacity: 0,
          dx: (Math.random() - 0.5) * 0.18,
          dy: (Math.random() - 0.5) * 0.18,
          twinkleSpeed: Math.random() * 0.8 + 0.4,
          twinklePhase: Math.random() * Math.PI * 2,
          colorType: (Math.random() < 0.5 ? 0 : 1) as 0 | 1 | 2,
        })),
        // Foreground layer — larger, faster, gold-dominant
        ...Array.from({ length: 15 }, () => ({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.4 + 0.9,
          baseOpacity: Math.random() * 0.45 + 0.15,
          opacity: 0,
          dx: (Math.random() - 0.5) * 0.3,
          dy: (Math.random() - 0.5) * 0.3,
          twinkleSpeed: Math.random() * 1.2 + 0.6,
          twinklePhase: Math.random() * Math.PI * 2,
          colorType: 0 as 0 | 1 | 2,
        })),
      ];
    };

    const draw = (timestamp: number) => {
      const dt = Math.min((timestamp - lastTime) / 1000, 0.1); // seconds, capped
      lastTime = timestamp;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const s of stars) {
        // Twinkle — sinusoidal opacity oscillation
        s.twinklePhase += s.twinkleSpeed * dt;
        const twinkle = 0.5 + 0.5 * Math.sin(s.twinklePhase);
        s.opacity = s.baseOpacity * (0.4 + 0.6 * twinkle);

        // Draw with soft glow for larger stars
        if (s.size > 1.1) {
          const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 2.5);
          grd.addColorStop(0, STAR_COLORS[s.colorType](s.opacity));
          grd.addColorStop(1, STAR_COLORS[s.colorType](0));
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = grd;
          ctx.fill();
        }

        // Core dot
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = STAR_COLORS[s.colorType](s.opacity);
        ctx.fill();

        // Move
        s.x += s.dx;
        s.y += s.dy;
        if (s.x < 0) s.x = canvas.width;
        if (s.x > canvas.width) s.x = 0;
        if (s.y < 0) s.y = canvas.height;
        if (s.y > canvas.height) s.y = 0;
      }

      animId = requestAnimationFrame(draw);
    };

    init();
    window.addEventListener("resize", init);
    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", init);
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
