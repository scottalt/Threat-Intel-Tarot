"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const SWIPE_MIN_X = 60;   // minimum horizontal distance
const SWIPE_MAX_RATIO = 1.5; // horizontal must be > vertical * this ratio

export function CardKeyNav({
  prevSlug,
  nextSlug,
}: {
  prevSlug?: string;
  nextSlug?: string;
}) {
  const router = useRouter();
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowLeft" && prevSlug) {
        router.push(`/card/${prevSlug}`);
      } else if (e.key === "ArrowRight" && nextSlug) {
        router.push(`/card/${nextSlug}`);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [prevSlug, nextSlug, router]);

  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (touchStartX.current === null || touchStartY.current === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      const dy = e.changedTouches[0].clientY - touchStartY.current;
      touchStartX.current = null;
      touchStartY.current = null;

      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      // Require clear horizontal intent: min distance + horizontal dominance
      if (absX < SWIPE_MIN_X) return;
      if (absX < absY * SWIPE_MAX_RATIO) return; // looks more like a scroll

      if (dx > 0 && prevSlug) {
        router.push(`/card/${prevSlug}`);
      } else if (dx < 0 && nextSlug) {
        router.push(`/card/${nextSlug}`);
      }
    };
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [prevSlug, nextSlug, router]);

  return null;
}
