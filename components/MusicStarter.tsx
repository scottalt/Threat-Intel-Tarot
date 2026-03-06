"use client";

import { useEffect } from "react";
import { musicPlayer } from "@/lib/music";

// Starts ambient music on first user interaction (required by browser autoplay policy).
// Placed in layout so it works across all pages.
export function MusicStarter() {
  useEffect(() => {
    const start = () => {
      musicPlayer.start();
      // Only need to fire once
      window.removeEventListener("mousedown", start);
      window.removeEventListener("touchstart", start);
      window.removeEventListener("keydown", start);
    };
    window.addEventListener("mousedown", start, { passive: true });
    window.addEventListener("touchstart", start, { passive: true });
    window.addEventListener("keydown", start, { passive: true });
    return () => {
      window.removeEventListener("mousedown", start);
      window.removeEventListener("touchstart", start);
      window.removeEventListener("keydown", start);
    };
  }, []);

  return null;
}
