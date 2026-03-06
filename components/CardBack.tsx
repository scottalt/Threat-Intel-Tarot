export function CardBack() {
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
      <div className="absolute inset-2 rounded-xl border border-yellow-600/60 pointer-events-none" />
      <div className="absolute inset-[14px] rounded-xl border border-yellow-600/20 pointer-events-none" />

      <svg
        viewBox="0 0 200 200"
        className="w-48 h-48"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Rotating outer ring */}
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

        {/* Pentagram */}
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
          <ellipse
            cx="100" cy="100" rx="23" ry="14"
            fill="none" stroke="#c9a84c" strokeWidth="0.5" opacity="0.18"
          />
          <ellipse
            cx="100" cy="100" rx="18" ry="11"
            fill="none" stroke="#c9a84c" strokeWidth="1" opacity="0.85"
          />
          <circle cx="100" cy="100" r="5" fill="#c9a84c" opacity="0.65" />
          <circle cx="100" cy="100" r="2" fill="#0a0a0f" opacity="0.9" />
        </g>

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
            style={{ animation: `glyph-fade 2.2s ease-in-out infinite ${g.delay}` }}
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
        }}
      >
        Threat Intelligence Tarot
      </div>
    </div>
  );
}
