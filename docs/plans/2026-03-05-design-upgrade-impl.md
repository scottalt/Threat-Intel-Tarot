# Design Upgrade & iOS Compatibility — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Cinematic animations, category-reactive atmosphere, iOS-safe layout, and staggered content reveals that make the card feel alive on every device.

**Architecture:** All animation via CSS keyframes + React state. One canvas element for starfield. No new npm dependencies. Every new animated class respects `prefers-reduced-motion`.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS v4, CSS keyframes, HTML Canvas API.

---

## Verification Command (run after every task)

```bash
cd "C:\Users\scott\Github Projects\Threat-Intel-Tarot\Threat-Intel-Tarot" && npx tsc --noEmit
```

---

## Task 1: CSS Foundation — Keyframes, iOS Fixes, Card Sizing

**Files:**
- Modify: `app/globals.css`

**Step 1: Read the current globals.css first**

Note the current content, then replace it entirely with the following.

**Step 2: Write the new globals.css**

```css
@import "tailwindcss";

:root {
  --color-void: #0a0a0f;
  --color-arcane: #1a1a2e;
  --color-arcane-light: #16213e;
  --color-gold: #c9a84c;
  --color-gold-bright: #f0c040;
  --color-crimson: #8b0000;
  --color-silver: #c0c0c0;
  --color-mist: #e8e0f0;
  --color-teal: #2d6a6a;
  --color-purple: #4a1a6a;
  --color-ember: #8b3a0f;
}

@theme inline {
  --color-void: var(--color-void);
  --color-arcane: var(--color-arcane);
  --color-gold: var(--color-gold);
  --color-gold-bright: var(--color-gold-bright);
  --color-crimson: var(--color-crimson);
  --color-silver: var(--color-silver);
  --color-mist: var(--color-mist);
  --color-teal: var(--color-teal);
  --color-purple: var(--color-purple);
  --color-ember: var(--color-ember);
  --color-arcane-light: var(--color-arcane-light);
}

body {
  background: var(--color-void);
  color: var(--color-mist);
  font-family: var(--font-garamond), Georgia, serif;
}

/* ─────────────────────────────────────────
   Card Flip — 3D Scene
───────────────────────────────────────── */

.card-scene {
  perspective: 1200px;
  cursor: pointer;
  /* iOS: fluid width, proportional height */
  width: min(340px, 92vw);
  aspect-ratio: 17 / 30; /* 340:600 */
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.card-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.75s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-wrapper.is-flipped {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  border-radius: 16px;
  overflow: hidden;
}

.card-face--front {
  transform: rotateY(180deg);
  /* iOS momentum scrolling for card content */
  -webkit-overflow-scrolling: touch;
}

/* Hover tilt — desktop only (not iOS) */
@media (hover: hover) {
  .card-scene:hover .card-wrapper:not(.is-flipped) {
    transform: rotateY(8deg) rotateX(-2deg);
  }
}

/* Arcane border glow */
.arcane-border {
  border: 1px solid var(--color-gold);
  box-shadow:
    0 0 12px rgba(201, 168, 76, 0.25),
    0 0 40px rgba(201, 168, 76, 0.05),
    inset 0 0 8px rgba(201, 168, 76, 0.05);
}

/* Risk star styling */
.risk-star-filled {
  color: var(--color-gold-bright);
}

.risk-star-empty {
  color: #333;
}

/* Card title shimmer (one-shot on reveal) */
.card-title-shimmer {
  background: linear-gradient(
    105deg,
    var(--color-gold-bright) 35%,
    #fff8e1 50%,
    var(--color-gold-bright) 65%
  );
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: title-shimmer 0.9s ease-out 0.35s both;
}

/* ─────────────────────────────────────────
   Keyframe Animations
───────────────────────────────────────── */

/* Sigil outer ring — slow continuous rotation */
@keyframes sigil-rotate {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

/* Center eye — breathe */
@keyframes eye-pulse {
  0%, 100% { transform: scale(1);    opacity: 0.8; }
  50%       { transform: scale(1.1); opacity: 1;   }
}

/* Corner glyphs — staggered fade */
@keyframes glyph-fade {
  0%, 100% { opacity: 0.5;  }
  50%       { opacity: 0.12; }
}

/* Draw button shimmer sweep */
@keyframes shimmer {
  0%   { transform: translateX(-150%); }
  100% { transform: translateX(400%);  }
}

/* Hint text float */
@keyframes float {
  0%, 100% { transform: translateY(0);   }
  50%       { transform: translateY(-7px); }
}

/* Particle burst (uses CSS custom props --tx --ty set inline) */
@keyframes particle-out {
  0%   { transform: translate(0, 0) scale(1);   opacity: 1; }
  100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
}

/* Section stagger reveal */
@keyframes section-reveal {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0);    }
}

/* TTP badge slide in from left */
@keyframes badge-slide {
  from { opacity: 0; transform: translateX(-10px); }
  to   { opacity: 1; transform: translateX(0);     }
}

/* Title shimmer sweep (one-shot) */
@keyframes title-shimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center;  }
}

/* Risk star sequential fill */
@keyframes star-fill {
  from { color: #333; transform: scale(0.7); }
  to   { color: var(--color-gold-bright); transform: scale(1); }
}

/* Nebula fade in */
@keyframes nebula-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* ─────────────────────────────────────────
   Accessibility — Reduced Motion
───────────────────────────────────────── */

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Step 3: Verify**

```bash
npx tsc --noEmit
```

Expected: No errors.

**Step 4: Commit**

```bash
cd "C:\Users\scott\Github Projects\Threat-Intel-Tarot\Threat-Intel-Tarot" && git add app/globals.css && git commit -m "feat: add animation keyframes, iOS card sizing, and reduced-motion support"
```

---

## Task 2: Starfield Canvas Component

**Files:**
- Create: `components/Starfield.tsx`

**Step 1: Create the file**

```tsx
"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  dx: number;
  dy: number;
}

export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let stars: Star[] = [];

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      stars = Array.from({ length: 90 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.4 + 0.3,
        opacity: Math.random() * 0.45 + 0.08,
        dx: (Math.random() - 0.5) * 0.25,
        dy: (Math.random() - 0.5) * 0.25,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201, 168, 76, ${s.opacity})`;
        ctx.fill();
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
    draw();

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
        opacity: 0.65,
      }}
    />
  );
}
```

**Step 2: Verify**

```bash
npx tsc --noEmit
```

**Step 3: Commit**

```bash
cd "C:\Users\scott\Github Projects\Threat-Intel-Tarot\Threat-Intel-Tarot" && git add components/Starfield.tsx && git commit -m "feat: add animated starfield canvas background"
```

---

## Task 3: DrawButton — Shimmer + Press Effect

**Files:**
- Modify: `components/DrawButton.tsx`

**Step 1: Read the current DrawButton.tsx**

**Step 2: Replace with the upgraded version**

```tsx
"use client";

export function DrawButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="relative overflow-hidden px-8 py-3 text-sm uppercase tracking-widest transition-transform duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        fontFamily: "var(--font-cinzel), serif",
        color: "var(--color-gold)",
        border: "1px solid var(--color-gold)",
        background: "transparent",
        touchAction: "manipulation",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {/* Shimmer sweep — loops every 3s */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(105deg, transparent 35%, rgba(201,168,76,0.45) 50%, transparent 65%)",
          animation: "shimmer 3s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />
      <span className="relative">✦ Draw a Card ✦</span>
    </button>
  );
}
```

**Step 3: Verify**

```bash
npx tsc --noEmit
```

**Step 4: Commit**

```bash
cd "C:\Users\scott\Github Projects\Threat-Intel-Tarot\Threat-Intel-Tarot" && git add components/DrawButton.tsx && git commit -m "feat: add shimmer sweep and press animation to DrawButton"
```

---

## Task 4: Home Page — Starfield + Nebula + Float Hint

**Files:**
- Modify: `app/page.tsx`

**Step 1: Read the current app/page.tsx**

**Step 2: Replace entirely**

```tsx
"use client";

import { useState } from "react";
import { drawRandom } from "@/lib/draw";
import { TarotCard } from "@/components/TarotCard";
import { DrawButton } from "@/components/DrawButton";
import { Starfield } from "@/components/Starfield";
import type { TarotCard as TarotCardType } from "@/data/types";

const categoryNebula: Record<string, string> = {
  "nation-state":
    "radial-gradient(ellipse 700px 500px at 50% 65%, rgba(45,106,106,0.22) 0%, transparent 70%)",
  criminal:
    "radial-gradient(ellipse 700px 500px at 50% 65%, rgba(74,26,106,0.28) 0%, transparent 70%)",
  hacktivist:
    "radial-gradient(ellipse 700px 500px at 50% 65%, rgba(139,58,15,0.22) 0%, transparent 70%)",
};

export default function Home() {
  const [card, setCard] = useState<TarotCardType | null>(null);
  const [key, setKey] = useState(0);
  const [nebula, setNebula] = useState<string | null>(null);

  const handleDraw = () => {
    const drawn = drawRandom();
    setCard(drawn);
    setKey((k) => k + 1);
    setNebula(categoryNebula[drawn.category] ?? null);
  };

  return (
    <main
      className="relative min-h-screen flex flex-col items-center justify-start py-16 px-4"
      style={{
        background: "var(--color-void)",
        paddingBottom: "max(4rem, env(safe-area-inset-bottom))",
      }}
    >
      {/* Starfield — fixed, behind everything */}
      <Starfield />

      {/* Category-reactive nebula */}
      {nebula && (
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            background: nebula,
            zIndex: 1,
            pointerEvents: "none",
            animation: "nebula-in 0.8s ease-out both",
          }}
        />
      )}

      {/* All content sits above starfield + nebula */}
      <div
        className="relative flex flex-col items-center w-full"
        style={{ zIndex: 2 }}
      >
        {/* Header */}
        <div className="text-center mb-12">
          <h1
            className="text-3xl sm:text-4xl font-semibold mb-3"
            style={{
              color: "var(--color-gold-bright)",
              fontFamily: "var(--font-cinzel), serif",
            }}
          >
            Threat Intelligence Tarot
          </h1>
          <p
            className="text-sm sm:text-base"
            style={{ color: "var(--color-silver)" }}
          >
            Real threat intelligence. Impossible to scroll past.
          </p>
          <div
            className="mt-3 w-24 h-px mx-auto"
            style={{
              background:
                "linear-gradient(90deg, transparent, var(--color-gold), transparent)",
            }}
          />
        </div>

        {/* Draw button */}
        <DrawButton onClick={handleDraw} />

        {/* Card (remounts on redraw via key) */}
        {card && (
          <div className="mt-10">
            <TarotCard key={key} card={card} />
          </div>
        )}

        {/* Pre-draw floating hint */}
        {!card && (
          <div
            className="mt-16 text-center text-sm italic select-none"
            style={{
              color: "var(--color-silver)",
              opacity: 0.45,
              animation: "float 3.2s ease-in-out infinite",
            }}
          >
            The cards await. Draw to reveal your adversary.
          </div>
        )}

        {/* Footer */}
        <div
          className="mt-auto pt-16 text-xs text-center"
          style={{ color: "var(--color-silver)", opacity: 0.3 }}
        >
          Data sourced from MITRE ATT&CK. For educational purposes.
        </div>
      </div>
    </main>
  );
}
```

**Step 3: Verify**

```bash
npx tsc --noEmit
```

**Step 4: Commit**

```bash
cd "C:\Users\scott\Github Projects\Threat-Intel-Tarot\Threat-Intel-Tarot" && git add app/page.tsx && git commit -m "feat: add starfield, category nebula, and floating hint to home page"
```

---

## Task 5: CardBack — Animated Sigil

**Files:**
- Modify: `components/CardBack.tsx`

**Step 1: Read current CardBack.tsx**

**Step 2: Replace entirely**

The outer ring rotates. The center eye breathes. The four corner glyphs fade in and out at staggered offsets.

```tsx
export function CardBack() {
  // 12 tick marks evenly spaced around the outer ring (rotates with it)
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * 30 * Math.PI) / 180;
    return {
      x1: 100 + 84 * Math.cos(angle),
      y1: 100 + 84 * Math.sin(angle),
      x2: 100 + 90 * Math.cos(angle),
      y2: 100 + 90 * Math.sin(angle),
    };
  });

  return (
    <div
      className="w-full h-full flex items-center justify-center relative"
      style={{ background: "var(--color-arcane)" }}
    >
      {/* Double gold border inset */}
      <div className="absolute inset-2 rounded-xl border border-yellow-600/60 pointer-events-none" />
      <div className="absolute inset-[14px] rounded-xl border border-yellow-600/20 pointer-events-none" />

      <svg
        viewBox="0 0 200 200"
        className="w-48 h-48"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Rotating outer ring group */}
        <g
          style={{
            transformOrigin: "100px 100px",
            animation: "sigil-rotate 22s linear infinite",
          }}
        >
          <circle
            cx="100" cy="100" r="90"
            fill="none" stroke="#c9a84c" strokeWidth="1" opacity="0.55"
          />
          {ticks.map((t, i) => (
            <line
              key={i}
              x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
              stroke="#c9a84c" strokeWidth="1.2" opacity="0.4"
            />
          ))}
        </g>

        {/* Static inner circle */}
        <circle
          cx="100" cy="100" r="64"
          fill="none" stroke="#c9a84c" strokeWidth="0.5" opacity="0.35"
        />

        {/* Pentagram — static */}
        <polygon
          points="100,18 121,76 185,76 132,113 153,171 100,134 47,171 68,113 15,76 79,76"
          fill="none"
          stroke="#c9a84c"
          strokeWidth="0.8"
          opacity="0.45"
        />

        {/* Breathing center eye */}
        <g
          style={{
            transformOrigin: "100px 100px",
            animation: "eye-pulse 2.2s ease-in-out infinite",
          }}
        >
          {/* Outer glow ring */}
          <ellipse
            cx="100" cy="100" rx="23" ry="14"
            fill="none" stroke="#c9a84c" strokeWidth="0.5" opacity="0.18"
          />
          {/* Eye outline */}
          <ellipse
            cx="100" cy="100" rx="18" ry="11"
            fill="none" stroke="#c9a84c" strokeWidth="1" opacity="0.85"
          />
          {/* Iris */}
          <circle cx="100" cy="100" r="5" fill="#c9a84c" opacity="0.65" />
          {/* Pupil */}
          <circle cx="100" cy="100" r="2" fill="#0a0a0f" opacity="0.9" />
        </g>

        {/* Staggered corner glyphs */}
        {([
          { x: 14, y: 30,  delay: "0s"    },
          { x: 168, y: 30, delay: "0.55s" },
          { x: 14, y: 188, delay: "1.1s"  },
          { x: 168, y: 188, delay: "1.65s"},
        ] as const).map((g, i) => (
          <text
            key={i}
            x={g.x} y={g.y}
            fill="#c9a84c"
            fontSize="13"
            fontFamily="serif"
            style={{ animation: `glyph-fade 2.2s ease-in-out infinite ${g.delay}` }}
          >
            ✦
          </text>
        ))}
      </svg>

      {/* Footer label */}
      <div
        className="absolute bottom-5 text-center tracking-widest text-xs uppercase select-none"
        style={{
          color: "var(--color-gold)",
          fontFamily: "var(--font-cinzel), serif",
          opacity: 0.6,
        }}
      >
        Threat Intelligence Tarot
      </div>
    </div>
  );
}
```

**Step 3: Verify**

```bash
npx tsc --noEmit
```

**Step 4: Commit**

```bash
cd "C:\Users\scott\Github Projects\Threat-Intel-Tarot\Threat-Intel-Tarot" && git add components/CardBack.tsx && git commit -m "feat: animate CardBack sigil with rotating ring, breathing eye, and glyph fades"
```

---

## Task 6: TarotCard — Particle Burst + Touch Tilt

**Files:**
- Modify: `components/TarotCard.tsx`

**Step 1: Read the current TarotCard.tsx**

**Step 2: Replace entirely**

Key behaviours:
- Touch tilt: applied as a transform on the `.card-scene` when not flipped, via inline style. Uses touchstart position relative to card bounds.
- Particle burst: 14 gold sparks rendered as absolute divs, each using CSS custom props `--tx`/`--ty` to set their travel direction. They appear at flip ~400ms and are removed after 700ms.
- The `.is-flipped` class still drives the flip via CSS.

```tsx
"use client";

import { useState, useRef, useCallback } from "react";
import type { TarotCard as TarotCardType } from "@/data/types";
import { CardBack } from "./CardBack";
import { CardFront } from "./CardFront";

interface Particle {
  id: number;
  tx: number; // target x offset in px
  ty: number; // target y offset in px
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
  const tiltResetRef = useRef<ReturnType<typeof setTimeout>>();

  const spawnParticles = useCallback(() => {
    const burst: Particle[] = Array.from({ length: 14 }, (_, i) => {
      const angle = (i * (360 / 14) * Math.PI) / 180;
      const dist = 55 + Math.random() * 45;
      return {
        id: particleIdRef.current++,
        tx: Math.cos(angle) * dist,
        ty: Math.sin(angle) * dist,
      };
    });
    setParticles(burst);
    setTimeout(() => setParticles([]), 750);
  }, []);

  const handleFlip = useCallback(() => {
    setFlipped((prev) => {
      if (!prev) {
        // Flipping face-up — burst particles as the front face appears
        setTimeout(spawnParticles, 380);
      }
      return !prev;
    });
  }, [spawnParticles]);

  // Touch tilt (only when face-down)
  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (flipped) return;
      clearTimeout(tiltResetRef.current);
      const touch = e.touches[0];
      const rect = e.currentTarget.getBoundingClientRect();
      const nx = (touch.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
      const ny = (touch.clientY - rect.top) / rect.height - 0.5;
      setTilt({ x: -ny * 14, y: nx * 14 });
    },
    [flipped]
  );

  const handleTouchEnd = useCallback(() => {
    tiltResetRef.current = setTimeout(() => setTilt({ x: 0, y: 0 }), 120);
  }, []);

  // Tilt applied to the scene container (only when face-down)
  const sceneTransform =
    !flipped && (tilt.x !== 0 || tilt.y !== 0)
      ? `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`
      : undefined;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Particle layer — sits outside the card-scene to avoid clipping */}
      <div className="relative">
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
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "var(--color-gold-bright)",
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
            flipped ? `${card.name} — tap to flip back` : "Tap to reveal card"
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
          Tap to reveal
        </p>
      )}
    </div>
  );
}
```

**Step 3: Verify**

```bash
npx tsc --noEmit
```

**Step 4: Commit**

```bash
cd "C:\Users\scott\Github Projects\Threat-Intel-Tarot\Threat-Intel-Tarot" && git add components/TarotCard.tsx && git commit -m "feat: add particle burst on flip and touch tilt to TarotCard"
```

---

## Task 7: TTPBadge — Slide-In Animation

**Files:**
- Modify: `components/TTPBadge.tsx`

**Step 1: Read current TTPBadge.tsx**

**Step 2: Add optional `index` prop and slide-in animation**

```tsx
import type { TTP } from "@/data/types";

export function TTPBadge({ ttp, index = 0 }: { ttp: TTP; index?: number }) {
  return (
    <div
      className="flex items-start gap-2 py-1"
      style={{
        animation: "badge-slide 0.35s ease-out both",
        animationDelay: `${index * 45}ms`,
      }}
    >
      <span
        className="shrink-0 text-xs font-mono px-1.5 py-0.5 rounded mt-0.5"
        style={{
          background: "rgba(201,168,76,0.15)",
          color: "var(--color-gold-bright)",
          border: "1px solid rgba(201,168,76,0.3)",
        }}
      >
        {ttp.techniqueId}
      </span>
      <div className="min-w-0">
        <div className="text-sm" style={{ color: "var(--color-mist)" }}>
          {ttp.name}
        </div>
        <div
          className="text-xs"
          style={{ color: "var(--color-silver)", opacity: 0.7 }}
        >
          {ttp.tactic}
        </div>
      </div>
    </div>
  );
}
```

**Step 3: Verify**

```bash
npx tsc --noEmit
```

**Step 4: Commit**

```bash
cd "C:\Users\scott\Github Projects\Threat-Intel-Tarot\Threat-Intel-Tarot" && git add components/TTPBadge.tsx && git commit -m "feat: add slide-in entrance animation to TTPBadge"
```

---

## Task 8: CardFront — Category Glow + Staggered Reveals + Star Animation + Title Shimmer

**Files:**
- Modify: `components/CardFront.tsx`

**Step 1: Read the current CardFront.tsx**

**Step 2: Replace entirely**

Changes:
- Category glow: radial gradient div at the top of the card, 70px tall, matches category color
- Each content section gets `animation: section-reveal` with a stagger delay
- TTPs pass `index` to TTPBadge
- Risk stars animate from gray to gold sequentially (300ms start + 100ms per star)
- Card title uses `.card-title-shimmer` class for the one-shot shimmer on reveal
- CardFront inner scroll gets `overscroll-behavior: contain`

```tsx
import type { TarotCard } from "@/data/types";
import { TTPBadge } from "./TTPBadge";
import { DefenseList } from "./DefenseList";

const categoryAccent: Record<string, string> = {
  "nation-state": "var(--color-teal)",
  criminal: "var(--color-purple)",
  hacktivist: "var(--color-ember)",
  unknown: "var(--color-silver)",
};

const categoryGlowRgba: Record<string, string> = {
  "nation-state": "rgba(45,106,106,0.28)",
  criminal: "rgba(74,26,106,0.32)",
  hacktivist: "rgba(139,58,15,0.28)",
  unknown: "rgba(192,192,192,0.08)",
};

// Each section fades + slides up with a stagger
const section = (i: number): React.CSSProperties => ({
  animation: "section-reveal 0.4s ease-out both",
  animationDelay: `${i * 65}ms`,
});

// Risk stars animate sequentially: gray → gold
const RiskStars = ({ level }: { level: number }) => (
  <span>
    {Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        style={
          i < level
            ? {
                display: "inline-block",
                animation: "star-fill 0.3s ease-out both",
                animationDelay: `${300 + i * 100}ms`,
                color: "var(--color-gold-bright)",
              }
            : { color: "#333" }
        }
      >
        ★
      </span>
    ))}
  </span>
);

export function CardFront({ card }: { card: TarotCard }) {
  const accent = categoryAccent[card.category];
  const glowRgba = categoryGlowRgba[card.category];

  return (
    <div
      className="w-full h-full text-left relative"
      style={{
        background: "var(--color-arcane)",
        fontFamily: "var(--font-garamond), Georgia, serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Category top glow — decorative radial gradient */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "80px",
          background: `radial-gradient(ellipse 100% 100% at 50% 0%, ${glowRgba} 0%, transparent 100%)`,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Solid category accent line */}
      <div style={{ height: 4, background: accent, flexShrink: 0, position: "relative", zIndex: 1 }} />

      {/* Scrollable content */}
      <div
        className="overflow-y-auto flex-1"
        style={{
          overscrollBehavior: "contain",
          WebkitOverflowScrolling: "touch",
          position: "relative",
          zIndex: 1,
        } as React.CSSProperties}
      >
        {/* ── Header ── */}
        <div
          className="px-4 pt-4 pb-3 flex items-center justify-between border-b"
          style={{ borderColor: "rgba(201,168,76,0.2)", ...section(0) }}
        >
          <div>
            <div
              className="text-xs uppercase tracking-widest mb-0.5"
              style={{
                color: "var(--color-gold)",
                fontFamily: "var(--font-cinzel), serif",
                opacity: 0.85,
              }}
            >
              {card.arcanum === "major"
                ? `Major Arcana · ${card.number}`
                : `${card.suit ?? "Minor Arcana"} · ${card.number}`}
            </div>
            <div className="text-xs" style={{ color: "var(--color-silver)" }}>
              {card.origin}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm">
              <RiskStars level={card.riskLevel} />
            </div>
            <div
              className="text-xs mt-0.5"
              style={{ color: "var(--color-silver)", opacity: 0.55 }}
            >
              risk {card.riskLevel}/5
            </div>
          </div>
        </div>

        {/* ── Card Title ── */}
        <div
          className="px-4 py-3 border-b"
          style={{ borderColor: "rgba(201,168,76,0.2)", ...section(1) }}
        >
          {/* Title shimmer is a one-shot CSS animation via class */}
          <div
            className="card-title-shimmer text-lg font-semibold leading-tight"
            style={{ fontFamily: "var(--font-cinzel), serif" }}
          >
            ✦ {card.cardTitle} ✦
          </div>
          <div
            className="mt-1 text-sm font-semibold"
            style={{ color: "var(--color-mist)" }}
          >
            {card.name}
          </div>
          {card.aka.length > 0 && (
            <div
              className="text-xs mt-0.5"
              style={{ color: "var(--color-silver)", opacity: 0.65 }}
            >
              {card.aka.join(" · ")}
            </div>
          )}
        </div>

        {/* ── Targets + Motivation ── */}
        <div
          className="px-4 py-2 border-b"
          style={{ borderColor: "rgba(201,168,76,0.2)", ...section(2) }}
        >
          <div className="flex flex-wrap gap-1 mb-1">
            {card.targets.map((t) => (
              <span
                key={t}
                className="text-xs px-1.5 py-0.5 rounded"
                style={{
                  background: `${accent}20`,
                  color: "var(--color-silver)",
                  border: `1px solid ${accent}40`,
                }}
              >
                {t}
              </span>
            ))}
          </div>
          <div
            className="text-xs mt-1"
            style={{ color: "var(--color-silver)", opacity: 0.55 }}
          >
            {card.since} · {card.motivation.join(", ")}
          </div>
        </div>

        {/* ── Flavor text ── */}
        <div
          className="px-4 py-3 border-b italic text-sm leading-relaxed"
          style={{
            color: "var(--color-mist)",
            borderColor: "rgba(201,168,76,0.2)",
            ...section(3),
          }}
        >
          {card.flavor}
        </div>

        {/* ── TTPs ── */}
        <div
          className="px-4 py-3 border-b"
          style={{ borderColor: "rgba(201,168,76,0.2)", ...section(4) }}
        >
          <div
            className="text-xs uppercase tracking-widest mb-2"
            style={{
              color: "var(--color-gold)",
              fontFamily: "var(--font-cinzel), serif",
            }}
          >
            Tactics & Techniques
          </div>
          <div className="space-y-0.5">
            {card.ttps.map((ttp, i) => (
              <TTPBadge key={ttp.techniqueId} ttp={ttp} index={i} />
            ))}
          </div>
        </div>

        {/* ── Notable Ops ── */}
        <div
          className="px-4 py-3 border-b"
          style={{ borderColor: "rgba(201,168,76,0.2)", ...section(5) }}
        >
          <div
            className="text-xs uppercase tracking-widest mb-2"
            style={{
              color: "var(--color-gold)",
              fontFamily: "var(--font-cinzel), serif",
            }}
          >
            Notable Operations
          </div>
          <ul className="space-y-1">
            {card.notableOps.map((op) => (
              <li
                key={op}
                className="text-sm flex gap-2"
                style={{ color: "var(--color-mist)" }}
              >
                <span style={{ color: "var(--color-crimson)", flexShrink: 0 }}>◆</span>
                {op}
              </li>
            ))}
          </ul>
        </div>

        {/* ── Defenses ── */}
        <div
          className="px-4 py-3 border-b"
          style={{ borderColor: "rgba(201,168,76,0.2)", ...section(6) }}
        >
          <div
            className="text-xs uppercase tracking-widest mb-2"
            style={{
              color: "var(--color-gold)",
              fontFamily: "var(--font-cinzel), serif",
            }}
          >
            Defenses
          </div>
          <DefenseList defenses={card.defenses} />
        </div>

        {/* ── Reversed Meaning ── */}
        <div className="px-4 py-3" style={section(7)}>
          <div
            className="text-xs uppercase tracking-widest mb-2"
            style={{
              color: "var(--color-silver)",
              fontFamily: "var(--font-cinzel), serif",
              opacity: 0.55,
            }}
          >
            Reversed — Their Weakness
          </div>
          <div
            className="text-sm italic leading-relaxed"
            style={{ color: "var(--color-silver)", opacity: 0.8 }}
          >
            {card.reversedMeaning}
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Note: If TypeScript complains about `WebkitOverflowScrolling` not being in `React.CSSProperties`, cast the style object `as React.CSSProperties`. The property is vendor-prefixed and may not be in older @types/react versions.

**Step 4: Commit**

```bash
cd "C:\Users\scott\Github Projects\Threat-Intel-Tarot\Threat-Intel-Tarot" && git add components/CardFront.tsx && git commit -m "feat: add category glow, staggered reveals, star animation, and title shimmer to CardFront"
```

---

## Task 9: Production Build Verification

**Step 1: Run a full build**

```bash
cd "C:\Users\scott\Github Projects\Threat-Intel-Tarot\Threat-Intel-Tarot" && npm run build
```

Expected: Build succeeds. 26 routes generated (/ + /_not-found + 22 /card/[slug] + 2 others).

**Step 2: Common issues to fix**

- If `WebkitOverflowScrolling` errors: cast the style prop `as React.CSSProperties` in CardFront
- If SVG animation inline styles error: ensure `style` props on SVG elements use camelCase (`transformOrigin`, not `transform-origin`)
- If canvas causes SSR errors: Starfield already uses `useEffect` (client-only), so it's safe. If Next.js still complains, add `"use client"` — wait, it already has it.

**Step 3: Commit any fixes**

```bash
cd "C:\Users\scott\Github Projects\Threat-Intel-Tarot\Threat-Intel-Tarot" && git add -A && git commit -m "fix: resolve build errors from design upgrade"
```

---

## Notes

- The `section()` helper returns inline `animation` + `animationDelay` CSS. Each call uses a different index so sections cascade 65ms apart. Total cascade for 8 sections = ~520ms.
- The `card-title-shimmer` class uses `-webkit-text-fill-color: transparent` to make the gradient show through the text. This is standard and works on all modern browsers including iOS Safari.
- The `particle-out` keyframe uses CSS custom properties `--tx` and `--ty` set inline on each particle div. This is the cleanest way to parameterize keyframes without JavaScript animation.
- `env(safe-area-inset-bottom)` on the home page main padding ensures content isn't hidden behind the iPhone home indicator bar.
- `touch-action: manipulation` on `.card-scene` and the draw button eliminates the 300ms tap delay on iOS without needing FastClick or any library.
