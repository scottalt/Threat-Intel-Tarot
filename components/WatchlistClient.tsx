"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { TarotCard } from "@/data/types";
import { getBookmarks, toggleBookmark } from "@/lib/bookmarks";

const categoryAccent: Record<string, string> = {
  "nation-state": "var(--color-teal)",
  criminal: "var(--color-purple)",
  hacktivist: "var(--color-ember)",
  trickster: "var(--color-trickster)",
  unknown: "var(--color-silver)",
};

const categoryLabel: Record<string, string> = {
  "nation-state": "Nation-State",
  criminal: "Criminal",
  hacktivist: "Hacktivist",
  trickster: "Trickster",
  unknown: "Unknown",
};

export function WatchlistClient({ cards }: { cards: TarotCard[] }) {
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    setSlugs(getBookmarks());
  }, []);

  const saved = cards.filter((c) => slugs.includes(c.slug));

  const handleRemove = (slug: string) => {
    toggleBookmark(slug);
    setSlugs(getBookmarks());
  };

  if (saved.length === 0) {
    return (
      <div className="text-center py-20" style={{ color: "var(--color-silver)", opacity: 0.45 }}>
        <div
          style={{
            fontFamily: "var(--font-cinzel), serif",
            fontSize: "13px",
            letterSpacing: "0.08em",
            marginBottom: "8px",
          }}
        >
          No cards saved yet.
        </div>
        <p className="text-xs">Use the Save button on any card to add it here.</p>
        <Link
          href="/gallery"
          style={{
            display: "inline-block",
            marginTop: "20px",
            fontFamily: "var(--font-cinzel), serif",
            fontSize: "10px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--color-gold)",
            border: "1px solid rgba(201,168,76,0.3)",
            padding: "6px 16px",
            borderRadius: "4px",
            textDecoration: "none",
            opacity: 0.7,
          }}
        >
          Browse Gallery
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {saved.map((card, i) => {
        const accent = categoryAccent[card.category] ?? "var(--color-gold)";
        return (
          <div
            key={card.slug}
            style={{
              background: "var(--color-arcane)",
              border: `1px solid ${accent}44`,
              borderRadius: "12px",
              overflow: "hidden",
              animation: "section-reveal 0.4s cubic-bezier(0.22, 1, 0.36, 1) both",
              animationDelay: `${Math.min(i * 40, 400)}ms`,
            }}
          >
            <div style={{ height: 3, background: accent }} />
            <div className="p-3">
              <Link
                href={`/card/${card.slug}`}
                style={{ textDecoration: "none", display: "block", marginBottom: "8px" }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    style={{
                      fontSize: "9px",
                      fontFamily: "var(--font-cinzel), serif",
                      color: "var(--color-gold)",
                      opacity: 0.5,
                    }}
                  >
                    {card.expansion ? `II·${card.number}` : (card.arcanum === "major" ? `★${card.number}` : `${card.suit?.charAt(0).toUpperCase()}${card.number}`)}
                  </span>
                  <span
                    style={{
                      fontSize: "9px",
                      padding: "1px 5px",
                      borderRadius: "3px",
                      background: `${accent}22`,
                      color: "var(--color-silver)",
                      border: `1px solid ${accent}33`,
                    }}
                  >
                    {categoryLabel[card.category]}
                  </span>
                </div>
                <div
                  className="text-sm font-semibold leading-tight mb-0.5"
                  style={{ color: "var(--color-gold-bright)", fontFamily: "var(--font-cinzel), serif" }}
                >
                  {card.cardTitle}
                </div>
                <div className="text-xs mb-1" style={{ color: "var(--color-silver)", opacity: 0.7 }}>
                  {card.name}
                </div>
                <div style={{ color: "var(--color-silver)", opacity: 0.4, fontSize: "9px" }}>
                  {card.origin}
                </div>
              </Link>
              <button
                onClick={() => handleRemove(card.slug)}
                style={{
                  background: "none",
                  border: "1px solid rgba(192,192,192,0.15)",
                  borderRadius: "3px",
                  padding: "2px 8px",
                  fontSize: "9px",
                  color: "rgba(192,192,192,0.4)",
                  cursor: "pointer",
                  fontFamily: "var(--font-cinzel), serif",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  touchAction: "manipulation",
                }}
              >
                Remove
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
