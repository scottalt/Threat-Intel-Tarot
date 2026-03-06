"use client";

import { useState, useEffect } from "react";
import { toggleBookmark, isBookmarked } from "@/lib/bookmarks";

export function BookmarkButton({ slug }: { slug: string }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isBookmarked(slug));
  }, [slug]);

  const handleToggle = () => {
    const nowSaved = toggleBookmark(slug);
    setSaved(nowSaved);
  };

  return (
    <button
      onClick={handleToggle}
      aria-label={saved ? "Remove from watchlist" : "Add to watchlist"}
      title={saved ? "Remove from watchlist" : "Save to watchlist"}
      style={{
        background: saved ? "rgba(201,168,76,0.08)" : "transparent",
        border: `1px solid ${saved ? "rgba(201,168,76,0.5)" : "rgba(201,168,76,0.2)"}`,
        borderRadius: "4px",
        padding: "4px 10px",
        cursor: "pointer",
        fontFamily: "var(--font-cinzel), serif",
        fontSize: "9px",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: saved ? "var(--color-gold-bright)" : "rgba(201,168,76,0.45)",
        transition: "all 0.2s ease",
        touchAction: "manipulation",
      }}
    >
      {saved ? "Saved" : "Save"}
    </button>
  );
}
