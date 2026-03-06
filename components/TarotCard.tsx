"use client";

import { useState, useRef, useCallback } from "react";
import type { TarotCard as TarotCardType } from "@/data/types";
import { CardBack } from "./CardBack";
import { CardFront } from "./CardFront";
import { playFlip } from "@/lib/sounds";

const categoryParticleColor: Record<string, string> = {
  "nation-state": "#4aadad",
  criminal: "#a855f7",
  hacktivist: "#f97316",
  unknown: "#c9a84c",
};

interface Particle {
  id: number;
  tx: number;
  ty: number;
  rot: number;
  size: number;
  opacity: number;
  delay: number;
}

// Swipe: commit flip at this horizontal distance
const SWIPE_COMMIT_PX = 80;
// Max rotation shown during drag (degrees) at SWIPE_COMMIT_PX
const MAX_DRAG_DEG = 50;
// Desktop tilt: max degrees per axis
const TILT_MAX = 12;

export function TarotCard({
  card,
  startFlipped = false,
}: {
  card: TarotCardType;
  startFlipped?: boolean;
}) {
  const [flipped, setFlipped] = useState(startFlipped);
  const [particles, setParticles] = useState<Particle[]>([]);
  // Unified tilt: { x, y } — used for both touch tilt and mouse-move tilt
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  // Drag rotation while swiping (null = not dragging)
  const [dragDeg, setDragDeg] = useState<number | null>(null);

  const particleIdRef = useRef(0);
  const tiltResetRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const touchStartXRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);
  const isDraggingRef = useRef(false);
  // Track whether pointer device supports hover (desktop)
  const isPointerDeviceRef = useRef(false);

  // ── Particle burst ───────────────────────────────────────────────

  const spawnParticles = useCallback(() => {
    const burst: Particle[] = Array.from({ length: 16 }, (_, i) => {
      const angle = (i * (360 / 16) * Math.PI) / 180;
      const dist = 50 + Math.random() * 50;
      return {
        id: particleIdRef.current++,
        tx: Math.cos(angle) * dist,
        ty: Math.sin(angle) * dist,
        rot: (Math.random() - 0.5) * 360,
        size: 5 + Math.random() * 4,
        opacity: 1,
        delay: Math.random() * 80,
      };
    });
    const outer: Particle[] = Array.from({ length: 10 }, (_, i) => {
      const angle = ((i * (360 / 10) + 18) * Math.PI) / 180;
      const dist = 85 + Math.random() * 55;
      return {
        id: particleIdRef.current++,
        tx: Math.cos(angle) * dist,
        ty: Math.sin(angle) * dist,
        rot: (Math.random() - 0.5) * 480,
        size: 3 + Math.random() * 2,
        opacity: 0.65,
        delay: 40 + Math.random() * 60,
      };
    });
    setParticles([...burst, ...outer]);
    setTimeout(() => setParticles([]), 950);
  }, []);

  const handleFlip = useCallback(() => {
    playFlip();
    setFlipped((prev) => {
      if (!prev) setTimeout(spawnParticles, 380);
      return !prev;
    });
  }, [spawnParticles]);

  // ── Mouse-move tilt (desktop only) ─────────────────────────────

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (flipped) return;
      isPointerDeviceRef.current = true;
      clearTimeout(tiltResetRef.current);
      const rect = e.currentTarget.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      setTilt({ x: -ny * TILT_MAX, y: nx * TILT_MAX });
    },
    [flipped]
  );

  const handleMouseLeave = useCallback(() => {
    if (flipped) return;
    tiltResetRef.current = setTimeout(() => setTilt({ x: 0, y: 0 }), 180);
  }, [flipped]);

  // ── Touch handlers ──────────────────────────────────────────────

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      const touch = e.touches[0];
      touchStartXRef.current = touch.clientX;
      touchStartYRef.current = touch.clientY;
      isDraggingRef.current = false;

      if (flipped) return;
      clearTimeout(tiltResetRef.current);
      const rect = e.currentTarget.getBoundingClientRect();
      const nx = (touch.clientX - rect.left) / rect.width - 0.5;
      const ny = (touch.clientY - rect.top) / rect.height - 0.5;
      setTilt({ x: -ny * 10, y: nx * 10 });
    },
    [flipped]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      const touch = e.touches[0];
      const dx = touch.clientX - touchStartXRef.current;
      const dy = touch.clientY - touchStartYRef.current;

      if (Math.abs(dx) < Math.abs(dy) * 1.2) return;

      isDraggingRef.current = true;
      const progress = Math.min(Math.abs(dx) / SWIPE_COMMIT_PX, 1);
      const rawDeg = progress * MAX_DRAG_DEG * (dx > 0 ? 1 : -1);
      // When flipped, invert so the drag works against the 180deg wrapper rotation
      setDragDeg(flipped ? -rawDeg : rawDeg);
    },
    [flipped]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStartXRef.current;
      const dy = touch.clientY - touchStartYRef.current;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      setDragDeg(null);

      if (absX >= SWIPE_COMMIT_PX && absX > absY) {
        handleFlip();
      }

      isDraggingRef.current = false;
      tiltResetRef.current = setTimeout(() => setTilt({ x: 0, y: 0 }), 120);
    },
    [flipped, handleFlip]
  );

  // ── Scene transform ─────────────────────────────────────────────

  const sceneTransform = (() => {
    if (dragDeg !== null) {
      return `perspective(1200px) rotateY(${dragDeg}deg)`;
    }
    if (!flipped && (tilt.x !== 0 || tilt.y !== 0)) {
      return `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`;
    }
    return undefined;
  })();

  const sceneTransition =
    dragDeg !== null
      ? "none"
      : !flipped && tilt.x === 0 && tilt.y === 0
        ? "transform 0.3s ease-out"
        : undefined;

  const glowColor = categoryParticleColor[card.category] ?? "#c9a84c";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        {/* Particle layer */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 20,
            overflow: "visible",
          }}
        >
          {particles.map((p) => (
            <div
              key={p.id}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: p.size,
                height: p.size,
                borderRadius: "50%",
                background: categoryParticleColor[card.category] ?? "var(--color-gold-bright)",
                opacity: p.opacity,
                transform: "translate(-50%, -50%)",
                animation: `particle-out 0.78s cubic-bezier(0.22, 1, 0.36, 1) ${p.delay}ms forwards`,
                ["--tx" as string]: `${p.tx}px`,
                ["--ty" as string]: `${p.ty}px`,
                ["--rot" as string]: `${p.rot}deg`,
                boxShadow: `0 0 ${p.size * 1.5}px ${categoryParticleColor[card.category] ?? "var(--color-gold-bright)"}`,
                willChange: "transform, opacity",
              }}
            />
          ))}
        </div>

        <div
          className="card-scene arcane-border"
          onClick={handleFlip}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleFlip();
            }
          }}
          role="button"
          tabIndex={0}
          aria-label={
            flipped ? `${card.name}, tap to flip back` : "Tap to reveal card"
          }
          style={{
            borderRadius: "16px",
            transform: sceneTransform,
            transition: sceneTransition,
            willChange: "transform",
            position: "relative",
          }}
        >
          {/* GPU-composited glow overlay — opacity-only animation, iOS safe */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: -1,
              borderRadius: 17,
              pointerEvents: "none",
              zIndex: 30,
              boxShadow: `0 0 22px ${glowColor}66, 0 0 55px ${glowColor}22, inset 0 0 14px ${glowColor}18`,
              border: `1px solid ${glowColor}44`,
              animation: "arcane-glow-overlay 3.5s ease-in-out infinite",
              animationPlayState: flipped ? "paused" : "running",
              willChange: "opacity",
            }}
          />

          <div
            className={`card-wrapper ${flipped ? "is-flipped" : ""}`}
            style={{ willChange: "transform" }}
          >
            <div className="card-face card-face--back">
              <CardBack />
            </div>
            <div className="card-face card-face--front">
              <CardFront card={card} />
            </div>
          </div>
        </div>
      </div>

      {!flipped && (
        <p
          className="text-xs uppercase tracking-widest select-none"
          style={{
            color: "var(--color-gold)",
            opacity: 0.65,
            fontFamily: "var(--font-cinzel), serif",
            animation: "glyph-fade 2.5s ease-in-out infinite",
          }}
        >
          Tap or swipe to reveal
        </p>
      )}
    </div>
  );
}
