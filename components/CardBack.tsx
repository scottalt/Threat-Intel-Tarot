export function CardBack() {
  return (
    <div
      className="w-full h-full flex items-center justify-center relative"
      style={{ background: "var(--color-arcane)" }}
    >
      {/* Outer gold border */}
      <div className="absolute inset-2 rounded-xl border border-yellow-600/60" />
      <div className="absolute inset-3 rounded-xl border border-yellow-600/30" />

      {/* Central sigil */}
      <svg
        viewBox="0 0 200 200"
        className="w-48 h-48 opacity-70"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer circle */}
        <circle cx="100" cy="100" r="90" fill="none" stroke="#c9a84c" strokeWidth="1" opacity="0.6" />
        {/* Inner circle */}
        <circle cx="100" cy="100" r="65" fill="none" stroke="#c9a84c" strokeWidth="0.5" opacity="0.4" />
        {/* Pentagram */}
        <polygon
          points="100,15 120,75 185,75 132,112 152,172 100,135 48,172 68,112 15,75 80,75"
          fill="none"
          stroke="#c9a84c"
          strokeWidth="0.8"
          opacity="0.5"
        />
        {/* Center eye */}
        <ellipse cx="100" cy="100" rx="18" ry="11" fill="none" stroke="#c9a84c" strokeWidth="1" opacity="0.8" />
        <circle cx="100" cy="100" r="5" fill="#c9a84c" opacity="0.6" />
        {/* Corner glyphs */}
        <text x="20" y="30" fill="#c9a84c" fontSize="10" opacity="0.5" fontFamily="serif">✦</text>
        <text x="168" y="30" fill="#c9a84c" fontSize="10" opacity="0.5" fontFamily="serif">✦</text>
        <text x="20" y="182" fill="#c9a84c" fontSize="10" opacity="0.5" fontFamily="serif">✦</text>
        <text x="168" y="182" fill="#c9a84c" fontSize="10" opacity="0.5" fontFamily="serif">✦</text>
      </svg>

      {/* Bottom text */}
      <div
        className="absolute bottom-6 text-center tracking-widest text-xs uppercase"
        style={{ color: "var(--color-gold)", fontFamily: "var(--font-cinzel), serif", opacity: 0.7 }}
      >
        Threat Intelligence Tarot
      </div>
    </div>
  );
}
