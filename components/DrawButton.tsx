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
