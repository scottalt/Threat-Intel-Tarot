"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { cards } from "@/data/cards";

type Result = {
  type: "card" | "technique";
  label: string;
  sublabel: string;
  href: string;
  category?: string;
};

const catColor: Record<string, string> = {
  "nation-state": "#4aadad",
  criminal: "#9f7aea",
  hacktivist: "#f97316",
  trickster: "#c026a0",
  unknown: "#b8b8c8",
};

function buildResults(query: string): Result[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: Result[] = [];

  for (const card of cards) {
    const nameMatch = card.name.toLowerCase().includes(q);
    const titleMatch = card.cardTitle.toLowerCase().includes(q);
    const akaMatch = card.aka.some((a) => a.toLowerCase().includes(q));
    const originMatch = card.origin.toLowerCase().includes(q);

    if (nameMatch || titleMatch || akaMatch || originMatch) {
      results.push({
        type: "card",
        label: card.name,
        sublabel: card.cardTitle,
        href: `/card/${card.slug}`,
        category: card.category,
      });
    }

    // Search TTPs on this card
    for (const ttp of card.ttps) {
      if (
        ttp.techniqueId.toLowerCase().includes(q) ||
        ttp.name.toLowerCase().includes(q) ||
        ttp.tactic.toLowerCase().includes(q)
      ) {
        // Deduplicate technique hits
        const existing = results.find(
          (r) => r.type === "technique" && r.label === ttp.techniqueId
        );
        if (!existing) {
          results.push({
            type: "technique",
            label: ttp.techniqueId,
            sublabel: ttp.name,
            href: `https://attack.mitre.org/techniques/${ttp.techniqueId.replace(".", "/")}/`,
          });
        }
      }
    }
  }

  // Cards first, techniques second; cap at 12
  results.sort((a, b) => {
    if (a.type !== b.type) return a.type === "card" ? -1 : 1;
    return a.label.localeCompare(b.label);
  });

  return results.slice(0, 12);
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => buildResults(query), [query]);

  // Reset active index when results change
  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  // Keyboard shortcut: / to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "/" && !open) {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
        setQuery("");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 30);
    } else {
      setQuery("");
    }
  }, [open]);

  // Arrow key + Enter navigation inside overlay
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[activeIdx]) {
      const r = results[activeIdx];
      if (r.type === "technique") {
        window.open(r.href, "_blank", "noopener,noreferrer");
      } else {
        window.location.href = r.href;
      }
      setOpen(false);
    } else if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Global search"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "15vh",
        background: "rgba(10,10,15,0.88)",
        backdropFilter: "blur(6px)",
        animation: "nebula-in 0.15s ease-out both",
      }}
      onClick={() => { setOpen(false); setQuery(""); }}
    >
      <div
        style={{
          width: "min(560px, 92vw)",
          background: "var(--color-arcane)",
          border: "1px solid rgba(201,168,76,0.35)",
          boxShadow: "0 0 80px rgba(201,168,76,0.1), 0 32px 64px rgba(0,0,0,0.7)",
          borderRadius: "8px",
          overflow: "hidden",
          animation: "section-reveal 0.2s cubic-bezier(0.22,1,0.36,1) both",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "14px 18px",
            borderBottom: "1px solid rgba(201,168,76,0.1)",
          }}
        >
          <span style={{ color: "var(--color-gold)", opacity: 0.5, fontSize: 14 }}>⌕</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search groups, techniques, tactics…"
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--color-mist)",
              fontSize: "15px",
              fontFamily: "var(--font-garamond), Georgia, serif",
              caretColor: "var(--color-gold)",
            }}
          />
          <kbd
            style={{
              fontFamily: "var(--font-cinzel), serif",
              fontSize: "9px",
              color: "var(--color-silver)",
              background: "rgba(192,192,192,0.08)",
              border: "1px solid rgba(192,192,192,0.2)",
              borderRadius: 3,
              padding: "2px 6px",
              opacity: 0.5,
              whiteSpace: "nowrap",
            }}
          >
            Esc
          </kbd>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div style={{ maxHeight: "50vh", overflowY: "auto" }}>
            {results.map((r, i) => {
              const isActive = i === activeIdx;
              const accent = r.type === "card" ? (catColor[r.category ?? "unknown"] ?? "#c9a84c") : "rgba(201,168,76,0.7)";
              return (
                <a
                  key={`${r.type}-${r.label}`}
                  href={r.href}
                  target={r.type === "technique" ? "_blank" : undefined}
                  rel={r.type === "technique" ? "noopener noreferrer" : undefined}
                  onClick={() => { setOpen(false); setQuery(""); }}
                  onMouseEnter={() => setActiveIdx(i)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 18px",
                    textDecoration: "none",
                    background: isActive ? "rgba(201,168,76,0.06)" : "transparent",
                    borderLeft: `2px solid ${isActive ? accent : "transparent"}`,
                    transition: "background 0.1s, border-color 0.1s",
                  }}
                >
                  {/* Type indicator */}
                  <span
                    style={{
                      fontSize: "9px",
                      fontFamily: "var(--font-cinzel), serif",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: accent,
                      opacity: 0.8,
                      minWidth: 58,
                      textAlign: "right",
                    }}
                  >
                    {r.type === "card" ? r.category?.replace("-", "\u2011") : "technique"}
                  </span>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "13px",
                        color: "var(--color-mist)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {r.label}
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: "var(--color-silver)",
                        opacity: 0.5,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {r.sublabel}
                    </div>
                  </div>

                  {r.type === "technique" && (
                    <span style={{ fontSize: 10, color: "var(--color-silver)", opacity: 0.35 }}>↗</span>
                  )}
                </a>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {query.trim() && results.length === 0 && (
          <div
            style={{
              padding: "24px 18px",
              textAlign: "center",
              fontSize: "13px",
              color: "var(--color-silver)",
              opacity: 0.4,
              fontStyle: "italic",
              fontFamily: "var(--font-garamond), Georgia, serif",
            }}
          >
            No results for &ldquo;{query}&rdquo;
          </div>
        )}

        {/* Hint */}
        {!query.trim() && (
          <div
            style={{
              padding: "20px 18px",
              textAlign: "center",
              fontSize: "11px",
              color: "var(--color-silver)",
              opacity: 0.3,
              fontFamily: "var(--font-cinzel), serif",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Search across 106 adversaries and techniques
          </div>
        )}
      </div>
    </div>
  );
}
