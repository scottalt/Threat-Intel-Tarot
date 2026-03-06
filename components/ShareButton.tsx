"use client";

import { useState, useRef, useEffect } from "react";

interface ShareButtonProps {
  cardTitle: string;
  groupName: string;
  topTtp?: { name: string; techniqueId: string };
  slug: string;
}

export function ShareButton({ cardTitle, groupName, topTtp, slug }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const cardUrl = `https://tarot.scottaltiparmak.com/card/${slug}`;
  const imageUrl = `/card/${slug}/share-image`;

  const tweetText = topTtp
    ? `I drew ${cardTitle} (${groupName}). ${topTtp.name} (${topTtp.techniqueId}).`
    : `I drew ${cardTitle} (${groupName}).`;

  const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(cardUrl)}`;
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(cardUrl)}`;

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cardUrl);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setOpen(false);
      }, 2000);
    } catch {
      // Clipboard not available
    }
  };

  const itemStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    width: "100%",
    padding: "9px 14px",
    background: "transparent",
    border: "none",
    color: "var(--color-silver)",
    fontSize: "11px",
    fontFamily: "var(--font-cinzel), serif",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    cursor: "pointer",
    textAlign: "left",
    textDecoration: "none",
    transition: "color 0.15s, background 0.15s",
    WebkitTapHighlightColor: "transparent",
  };

  const hoverOn = (e: React.MouseEvent<HTMLElement>) => {
    (e.currentTarget as HTMLElement).style.color = "var(--color-gold-bright)";
    (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.06)";
  };
  const hoverOff = (e: React.MouseEvent<HTMLElement>) => {
    (e.currentTarget as HTMLElement).style.color = "var(--color-silver)";
    (e.currentTarget as HTMLElement).style.background = "transparent";
  };

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative overflow-hidden px-5 py-2 text-xs uppercase tracking-widest transition-transform duration-150 active:scale-95"
        style={{
          fontFamily: "var(--font-cinzel), serif",
          color: open ? "var(--color-gold-bright)" : "var(--color-silver)",
          border: `1px solid ${open ? "var(--color-gold)" : "rgba(192,192,192,0.3)"}`,
          background: "transparent",
          cursor: "pointer",
          touchAction: "manipulation",
          WebkitTapHighlightColor: "transparent",
          transition: "color 0.2s, border-color 0.2s",
        }}
      >
        ✦ Share Card
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--color-arcane)",
            border: "1px solid rgba(201,168,76,0.25)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
            minWidth: 220,
            zIndex: 50,
            animation: "section-reveal 0.18s cubic-bezier(0.22,1,0.36,1) both",
          }}
        >
          <a
            href={imageUrl}
            download={`${slug}.png`}
            style={itemStyle}
            onMouseEnter={hoverOn}
            onMouseLeave={hoverOff}
            onClick={() => setOpen(false)}
          >
            <span style={{ opacity: 0.5, fontSize: 13 }}>↓</span>
            Download Image
          </a>

          <div style={{ height: 1, background: "rgba(201,168,76,0.1)", margin: "0 14px" }} />

          <a
            href={xUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={itemStyle}
            onMouseEnter={hoverOn}
            onMouseLeave={hoverOff}
            onClick={() => setOpen(false)}
          >
            <span style={{ opacity: 0.5, fontSize: 13 }}>𝕏</span>
            Share to X
          </a>

          <div style={{ height: 1, background: "rgba(201,168,76,0.1)", margin: "0 14px" }} />

          <a
            href={linkedInUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={itemStyle}
            onMouseEnter={hoverOn}
            onMouseLeave={hoverOff}
            onClick={() => setOpen(false)}
          >
            <span style={{ opacity: 0.5, fontSize: 11 }}>in</span>
            Share to LinkedIn
          </a>

          <div style={{ height: 1, background: "rgba(201,168,76,0.1)", margin: "0 14px" }} />

          <button
            onClick={handleCopy}
            style={{
              ...itemStyle,
              color: copied ? "var(--color-gold-bright)" : "var(--color-silver)",
            }}
            onMouseEnter={copied ? undefined : hoverOn}
            onMouseLeave={copied ? undefined : hoverOff}
          >
            <span style={{ opacity: 0.5, fontSize: 13 }}>{copied ? "✓" : "⎘"}</span>
            {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>
      )}
    </div>
  );
}
