"use client";

import { useState, useEffect } from "react";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className="fixed bottom-6 right-6 transition-all"
      style={{
        zIndex: 50,
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: "var(--color-arcane)",
        border: "1px solid rgba(201,168,76,0.35)",
        color: "var(--color-gold)",
        fontSize: "14px",
        cursor: "pointer",
        boxShadow: "0 0 16px rgba(201,168,76,0.12)",
        animation: "section-reveal 0.3s cubic-bezier(0.22, 1, 0.36, 1) both",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        touchAction: "manipulation",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      ↑
    </button>
  );
}
