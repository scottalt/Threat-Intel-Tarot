export function DrawButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="relative px-8 py-3 text-sm uppercase tracking-widest transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        fontFamily: "var(--font-cinzel), serif",
        color: "var(--color-gold)",
        border: "1px solid var(--color-gold)",
        background: "transparent",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "rgba(201,168,76,0.1)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
      }}
    >
      ✦ Draw a Card ✦
    </button>
  );
}
