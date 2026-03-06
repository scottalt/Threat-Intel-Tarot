"use client";

import { useEffect, useRef } from "react";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only activate on real pointer devices
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const dot = dotRef.current;
    const trail = trailRef.current;
    if (!dot || !trail) return;

    dot.style.display = "block";
    trail.style.display = "block";

    let cx = -100, cy = -100;
    let tx = -100, ty = -100;
    let rafId: number;

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      // Dot snaps immediately
      dot.style.transform = `translate(${tx}px, ${ty}px)`;
    };

    const animateTrail = () => {
      cx += (tx - cx) * 0.14;
      cy += (ty - cy) * 0.14;
      trail.style.transform = `translate(${cx}px, ${cy}px)`;
      rafId = requestAnimationFrame(animateTrail);
    };

    document.addEventListener("mousemove", onMove, { passive: true });
    rafId = requestAnimationFrame(animateTrail);

    return () => {
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      {/* Trailing ring — lags behind */}
      <div
        ref={trailRef}
        aria-hidden="true"
        style={{
          display: "none",
          position: "fixed",
          top: 0,
          left: 0,
          width: 28,
          height: 28,
          marginLeft: -14,
          marginTop: -14,
          border: "1px solid rgba(201,168,76,0.45)",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 9998,
          willChange: "transform",
        }}
      />
      {/* Dot — snaps to cursor */}
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
    </>
  );
}
