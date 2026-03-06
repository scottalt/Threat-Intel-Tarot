"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function CardKeyNav({
  prevSlug,
  nextSlug,
}: {
  prevSlug?: string;
  nextSlug?: string;
}) {
  const router = useRouter();

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

  return null;
}
