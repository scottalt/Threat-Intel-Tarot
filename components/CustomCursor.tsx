"use client";

import { useEffect, useRef } from "react";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const dot = dotRef.current;
    if (!dot) return;

    dot.style.display = "block";

    const onMove = (e: MouseEvent) => {
      dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    };

    document.addEventListener("mousemove", onMove, { passive: true });

    return () => {
      document.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      style={{
        display: "none",
        position: "fixed",
        top: 0,
        left: 0,
        width: 6,
        height: 6,
        marginLeft: -3,
        marginTop: -3,
        background: "var(--color-gold)",
        borderRadius: "50%",
        pointerEvents: "none",
        zIndex: 9999,
        willChange: "transform",
        opacity: 0.85,
      }}
    />
  );
}
