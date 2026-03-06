"use client";

import { useState, useEffect } from "react";

const shortcuts = [
  { key: "Space / D", desc: "Draw a new card (home page)" },
  { key: "← →", desc: "Browse prev / next card" },
  { key: "Swipe", desc: "Flip card or browse (mobile)" },
  { key: "Enter / Space", desc: "Flip focused card" },
  { key: "?", desc: "Show this overlay" },
  { key: "Esc", desc: "Close overlays" },
];

export function KeyboardShortcuts() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "?") {
        e.preventDefault();
        setVisible((v) => !v);
      }
      if (e.key === "Escape") setVisible(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(10,10,15,0.85)",
        backdropFilter: "blur(4px)",
        animation: "nebula-in 0.18s ease-out both",
      }}
      onClick={() => setVisible(false)}
    >
      <div
        style={{
          background: "var(--color-arcane)",
          border: "1px solid rgba(201,168,76,0.3)",
          boxShadow: "0 0 60px rgba(201,168,76,0.12), 0 24px 48px rgba(0,0,0,0.6)",
          padding: "32px 36px",
          minWidth: 300,
          maxWidth: "90vw",
          animation: "section-reveal 0.22s cubic-bezier(0.22,1,0.36,1) both",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            fontFamily: "var(--font-cinzel), serif",
            color: "var(--color-gold-bright)",
            fontSize: "13px",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          Keyboard Shortcuts
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {shortcuts.map(({ key, desc }) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <kbd
                style={{
                  fontFamily: "var(--font-cinzel), serif",
                  fontSize: "10px",
                  color: "var(--color-gold)",
                  background: "rgba(201,168,76,0.1)",
                  border: "1px solid rgba(201,168,76,0.3)",
                  borderRadius: 3,
                  padding: "2px 8px",
                  whiteSpace: "nowrap",
                  minWidth: 90,
                  textAlign: "center",
                  letterSpacing: "0.08em",
                }}
              >
                {key}
              </kbd>
              <span
                style={{
                  color: "var(--color-silver)",
                  fontSize: "12px",
                  opacity: 0.75,
                }}
              >
                {desc}
              </span>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 24,
            textAlign: "center",
            fontSize: "10px",
            color: "var(--color-silver)",
            opacity: 0.3,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            fontFamily: "var(--font-cinzel), serif",
          }}
        >
          Press Esc or click to close
        </div>
      </div>
    </div>
  );
}
