"use client";

import { useState, useEffect } from "react";
import { isMuted, setMuted } from "@/lib/sounds";
import { musicPlayer } from "@/lib/music";

export function SoundToggle() {
  const [muted, setMutedState] = useState(false); // on by default

  useEffect(() => {
    setMutedState(isMuted());
  }, []);

  const toggle = () => {
    const next = !muted;
    setMutedState(next);
    setMuted(next);
    if (next) {
      musicPlayer.pause();
    } else {
      musicPlayer.resume();
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label={muted ? "Unmute sound effects" : "Mute sound effects"}
      title={muted ? "Sound off — click to enable" : "Sound on — click to mute"}
      style={{
        position: "fixed",
        bottom: "max(1.5rem, env(safe-area-inset-bottom, 1.5rem))",
        left: "1.25rem",
        zIndex: 50,
        width: 36,
        height: 36,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(26,26,46,0.85)",
        border: "1px solid rgba(201,168,76,0.2)",
        borderRadius: "50%",
        cursor: "pointer",
        color: muted ? "rgba(192,192,192,0.3)" : "rgba(201,168,76,0.6)",
        transition: "color 0.2s, border-color 0.2s, opacity 0.2s",
        opacity: 0.65,
        backdropFilter: "blur(4px)",
        WebkitTapHighlightColor: "transparent",
        touchAction: "manipulation",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.opacity = "1";
        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(201,168,76,0.45)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.opacity = "0.65";
        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(201,168,76,0.2)";
      }}
    >
      {muted ? (
        // Speaker muted SVG
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      ) : (
        // Speaker with waves SVG
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      )}
    </button>
  );
}
