"use client";

import { useState, useRef, useCallback } from "react";
import type { TarotCard as TarotCardType } from "@/data/types";
import { CardBack } from "./CardBack";
import { CardFront } from "./CardFront";

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
  size: number;
  opacity: number;
}

export function TarotCard({
  card,
  startFlipped = false,
}: {
  card: TarotCardType;
  startFlipped?: boolean;
}) {
  const [flipped, setFlipped] = useState(startFlipped);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const particleIdRef = useRef(0);
  const tiltResetRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const touchStartXRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);

  const spawnParticles = useCallback(() => {
    const burst: Particle[] = Array.from({ length: 14 }, (_, i) => {
      const angle = (i * (360 / 14) * Math.PI) / 180;
      const dist = 55 + Math.random() * 45;
      return {
        id: particleIdRef.current++,
        tx: Math.cos(angle) * dist,
        ty: Math.sin(angle) * dist,
        size: 7,
        opacity: 1,
      };
    });
    // Outer ring — smaller, travel further
    const outer: Particle[] = Array.from({ length: 8 }, (_, i) => {
      const angle = ((i * (360 / 8) + 22.5) * Math.PI) / 180;
      const dist = 90 + Math.random() * 40;
      return {
        id: particleIdRef.current++,
        tx: Math.cos(angle) * dist,
        ty: Math.sin(angle) * dist,
        size: 4,
        opacity: 0.6,
      };
    });
    setParticles([...burst, ...outer]);
    setTimeout(() => setParticles([]), 900);
  }, []);

  const handleFlip = useCallback(() => {
    setFlipped((prev) => {
      if (!prev) {
        setTimeout(spawnParticles, 380);
      }
      return !prev;
    });
  }, [spawnParticles]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      const touch = e.touches[0];
      touchStartXRef.current = touch.clientX;
      touchStartYRef.current = touch.clientY;
      if (flipped) return;
      clearTimeout(tiltResetRef.current);
      const rect = e.currentTarget.getBoundingClientRect();
      const nx = (touch.clientX - rect.left) / rect.width - 0.5;
      const ny = (touch.clientY - rect.top) / rect.height - 0.5;
      setTilt({ x: -ny * 14, y: nx * 14 });
    },
    [flipped]
  );

  const handleTouchEndWithSwipe = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStartXRef.current;
      const dy = touch.clientY - touchStartYRef.current;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      // Swipe-to-flip: only when face-down (not yet revealed), horizontal > 40px
      if (!flipped && absX > 40 && absX > absY) {
        handleFlip();
      }

      // Reset tilt
      tiltResetRef.current = setTimeout(() => setTilt({ x: 0, y: 0 }), 120);
    },
    [flipped, handleFlip]
  );

  const sceneTransform =
    !flipped && (tilt.x !== 0 || tilt.y !== 0)
      ? `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`
      : undefined;

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
                animation: "particle-out 0.72s ease-out forwards",
                ["--tx" as string]: `${p.tx}px`,
                ["--ty" as string]: `${p.ty}px`,
              }}
            />
          ))}
        </div>

        <div
          className="card-scene arcane-border"
          onClick={handleFlip}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEndWithSwipe}
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
            transition:
              !flipped && tilt.x === 0 && tilt.y === 0
                ? "transform 0.2s ease-out"
                : undefined,
          }}
        >
          <div className={`card-wrapper ${flipped ? "is-flipped" : ""}`}>
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
          className="text-xs uppercase tracking-widest animate-pulse select-none"
          style={{
            color: "var(--color-gold)",
            opacity: 0.65,
            fontFamily: "var(--font-cinzel), serif",
          }}
        >
          Tap or swipe to reveal
        </p>
      )}
    </div>
  );
}
