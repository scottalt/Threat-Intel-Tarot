"use client";

export function DrawButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="relative overflow-hidden px-8 py-3 text-sm uppercase tracking-widest active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        fontFamily: "var(--font-cinzel), serif",
        color: "var(--color-gold)",
        border: "1px solid var(--color-gold)",
        background: "transparent",
        touchAction: "manipulation",
        WebkitTapHighlightColor: "transparent",
        animation: "draw-button-glow 2.8s ease-in-out infinite",
        transition: "transform 0.15s ease-out, background 0.2s ease-out",
        willChange: "transform",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "rgba(201,168,76,0.08)";
        (e.currentTarget as HTMLButtonElement).style.animationPlayState = "paused";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
        (e.currentTarget as HTMLButtonElement).style.animationPlayState = "running";
      }}
    >
      {/* Shimmer sweep */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(105deg, transparent 30%, rgba(201,168,76,0.55) 50%, transparent 70%)",
          animation: "shimmer 2.4s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />
      <span className="relative">✦ Draw a Card ✦</span>
    </button>
  );
}
