"use client";

import { useState } from "react";

export function ShareButton({ title, text, url }: { title: string; text: string; url: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    // Use native share sheet on mobile if available
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        // User cancelled or share failed — fall through to copy
      }
    }
    // Fallback: copy URL to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available — silently fail
    }
  };

  return (
    <button
      onClick={handleShare}
      className="relative overflow-hidden px-5 py-2 text-xs uppercase tracking-widest transition-transform duration-150 active:scale-95"
      style={{
        fontFamily: "var(--font-cinzel), serif",
        color: copied ? "var(--color-gold-bright)" : "var(--color-silver)",
        border: `1px solid ${copied ? "var(--color-gold)" : "rgba(192,192,192,0.3)"}`,
        background: "transparent",
        touchAction: "manipulation",
        WebkitTapHighlightColor: "transparent",
        transition: "color 0.3s, border-color 0.3s",
      }}
    >
      {copied ? "✓ Link Copied" : "✦ Share Card"}
    </button>
  );
}
