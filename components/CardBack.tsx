export function CardBack() {
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * 30 * Math.PI) / 180;
    return {
      x1: 100 + 84 * Math.cos(angle),
      y1: 100 + 84 * Math.sin(angle),
      x2: 100 + 91 * Math.cos(angle),
      y2: 100 + 91 * Math.sin(angle),
    };
  });

  // Inner ring dots — 8 evenly spaced
  const innerDots = Array.from({ length: 8 }, (_, i) => {
    const angle = (i * 45 * Math.PI) / 180;
    return { x: 100 + 52 * Math.cos(angle), y: 100 + 52 * Math.sin(angle) };
  });

  return (
    <div
      className="w-full h-full flex items-center justify-center relative"
      style={{ background: "var(--color-arcane)" }}
    >
      {/* Inner double border */}
      <div className="absolute inset-2 rounded-xl border border-yellow-600/60 pointer-events-none" />
      <div className="absolute inset-[14px] rounded-xl border border-yellow-600/20 pointer-events-none" />

      {/* Subtle radial ambient glow */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          background: "radial-gradient(ellipse 65% 55% at 50% 50%, rgba(201,168,76,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
          animation: "arcane-glow-overlay 4s ease-in-out infinite",
        }}
      />

      {/* Periodic light shimmer sweep across card back */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "35%",
            height: "100%",
            background: "linear-gradient(105deg, transparent 20%, rgba(201,168,76,0.18) 50%, transparent 80%)",
            animation: "card-back-shimmer 5.5s ease-in-out infinite 1.2s",
          }}
        />
      </div>

      <svg
        viewBox="0 0 200 200"
        className="w-52 h-52"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Outer rotating ring with ticks */}
        <g
          style={{
            transformOrigin: "100px 100px",
            animation: "sigil-rotate 24s linear infinite",
          }}
        >
          <circle
            cx="100" cy="100" r="91"
            fill="none" stroke="#c9a84c" strokeWidth="0.8" opacity="0.45"
            strokeDasharray="4 6"
          />
          {ticks.map((t, i) => (
            <line
              key={i}
              x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
              stroke="#c9a84c" strokeWidth={i % 3 === 0 ? "1.8" : "1"} opacity={i % 3 === 0 ? "0.6" : "0.3"}
            />
          ))}
        </g>

        {/* Counter-rotating mid ring */}
        <g
          style={{
            transformOrigin: "100px 100px",
            animation: "sigil-counter-rotate 36s linear infinite",
          }}
        >
          <circle
            cx="100" cy="100" r="74"
            fill="none" stroke="#c9a84c" strokeWidth="0.5" opacity="0.22"
            strokeDasharray="2 10"
          />
          {innerDots.map((d, i) => (
            <circle
              key={i}
              cx={d.x} cy={d.y} r="1.6"
              fill="#c9a84c" opacity="0.35"
            />
          ))}
        </g>

        {/* Static inner circle */}
        <circle
          cx="100" cy="100" r="60"
          fill="none" stroke="#c9a84c" strokeWidth="0.5" opacity="0.28"
        />

        {/* Pentagram — slow pulse */}
        <polygon
          points="100,18 121,76 185,76 132,113 153,171 100,134 47,171 68,113 15,76 79,76"
          fill="none"
          stroke="#c9a84c"
          strokeWidth="0.8"
          opacity="0.4"
          style={{ animation: "eye-pulse 6s ease-in-out infinite" }}
        />

        {/* Breathing center eye — outer halo */}
        <g
          style={{
            transformOrigin: "100px 100px",
            animation: "eye-pulse 2.8s ease-in-out infinite",
          }}
        >
          <ellipse
            cx="100" cy="100" rx="26" ry="15"
            fill="none" stroke="#c9a84c" strokeWidth="0.4" opacity="0.12"
          />
        </g>

        {/* Eye lid outlines */}
        <ellipse
          cx="100" cy="100" rx="20" ry="12"
          fill="none" stroke="#c9a84c" strokeWidth="0.6" opacity="0.3"
        />
        <ellipse
          cx="100" cy="100" rx="18" ry="11"
          fill="none" stroke="#c9a84c" strokeWidth="1.2" opacity="0.9"
          style={{ animation: "eye-pulse 2.8s ease-in-out infinite" }}
        />

        {/* Iris glow */}
        <circle
          cx="100" cy="100" r="7"
          fill="none" stroke="#c9a84c" strokeWidth="0.8" opacity="0.35"
          style={{ animation: "iris-breathe 2.8s ease-in-out infinite" }}
        />

        {/* Pupil */}
        <circle cx="100" cy="100" r="4.5" fill="#c9a84c" opacity="0.75"
          style={{ animation: "iris-breathe 2.8s ease-in-out infinite" }}
        />
        <circle cx="100" cy="100" r="2" fill="#0a0a0f" opacity="0.95" />

        {/* Staggered corner glyphs */}
        {[
          { x: 14,  y: 30,  delay: "0s"     },
          { x: 168, y: 30,  delay: "0.55s"  },
          { x: 14,  y: 188, delay: "1.1s"   },
          { x: 168, y: 188, delay: "1.65s"  },
        ].map((g, i) => (
          <text
            key={i}
            x={g.x} y={g.y}
            fill="#c9a84c"
            fontSize="13"
            fontFamily="serif"
            style={{ animation: `glyph-fade 2.8s ease-in-out infinite ${g.delay}` }}
          >
            ✦
          </text>
        ))}
      </svg>

      <div
        className="absolute bottom-5 text-center tracking-widest text-xs uppercase select-none"
        style={{
          color: "var(--color-gold)",
          fontFamily: "var(--font-cinzel), serif",
          opacity: 0.6,
          animation: "glyph-fade 4s ease-in-out infinite 2s",
        }}
      >
        Threat Intelligence Tarot
      </div>
    </div>
  );
}
