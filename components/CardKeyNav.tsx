"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export function CardKeyNav({
  prevSlug,
  nextSlug,
}: {
  prevSlug?: string;
  nextSlug?: string;
}) {
  const router = useRouter();
  const touchStartX = useRef<number | null>(null);

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
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (touchStartX.current === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      const absDx = Math.abs(dx);
      touchStartX.current = null;
      if (absDx < 60) return; // below threshold
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
