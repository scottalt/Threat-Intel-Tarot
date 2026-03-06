"use client";

import { useState } from "react";
import type { TarotCard } from "@/data/types";

const categoryLabel: Record<string, string> = {
  "nation-state": "Nation-State",
  criminal: "Criminal",
  hacktivist: "Hacktivist",
  unknown: "Unknown",
};

const categoryAccent: Record<string, string> = {
  "nation-state": "var(--color-teal)",
  criminal: "var(--color-purple)",
  hacktivist: "var(--color-ember)",
  unknown: "var(--color-silver)",
};

const riskLabel = (level: number) =>
  Array.from({ length: 5 }, (_, i) => (
    <span key={i} style={{ color: i < level ? "var(--color-gold-bright)" : "#333" }}>★</span>
  ));

type Category = "all" | "nation-state" | "criminal" | "hacktivist";
type ArcanaFilter = "all" | "major" | "swords" | "wands" | "cups" | "pentacles";

const arcanaLabel: Record<ArcanaFilter, string> = {
  all: "All",
  major: "Major Arcana",
  swords: "Swords",
  wands: "Wands",
  cups: "Cups",
  pentacles: "Pentacles",
};

function matchesSearch(card: TarotCard, q: string): boolean {
  const lower = q.toLowerCase();
  return (
    card.name.toLowerCase().includes(lower) ||
    card.cardTitle.toLowerCase().includes(lower) ||
    card.origin.toLowerCase().includes(lower) ||
    card.aka.some((a) => a.toLowerCase().includes(lower)) ||
    card.targets.some((t) => t.toLowerCase().includes(lower)) ||
    card.motivation.some((m) => m.toLowerCase().includes(lower))
  );
}

export function GalleryClient({ cards }: { cards: TarotCard[] }) {
  const [filter, setFilter] = useState<Category>("all");
  const [arcana, setArcana] = useState<ArcanaFilter>("all");
  const [query, setQuery] = useState("");

  const filtered = cards.filter((c) => {
    const categoryMatch = filter === "all" || c.category === filter;
    const arcanaMatch =
      arcana === "all" ||
      (arcana === "major" && c.arcanum === "major") ||
      (arcana !== "major" && c.suit === arcana);
    const searchMatch = query.trim() === "" || matchesSearch(c, query.trim());
    return categoryMatch && arcanaMatch && searchMatch;
  });
  const filters: { label: string; value: Category }[] = [
    { label: "All", value: "all" },
    { label: "Nation-State", value: "nation-state" },
    { label: "Criminal", value: "criminal" },
    { label: "Hacktivist", value: "hacktivist" },
  ];

  return (
    <>
      {/* Search box */}
      <div className="relative w-full max-w-sm mx-auto mb-5">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, alias, origin…"
          className="w-full px-4 py-2 text-sm bg-transparent outline-none"
          style={{
            color: "var(--color-mist)",
            border: "1px solid rgba(201,168,76,0.25)",
            borderRadius: "4px",
            fontFamily: "var(--font-garamond), Georgia, serif",
            caretColor: "var(--color-gold)",
          }}
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
            style={{ color: "var(--color-silver)", opacity: 0.5 }}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-3">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className="px-4 py-1.5 text-xs uppercase tracking-widest transition-all duration-200"
            style={{
              fontFamily: "var(--font-cinzel), serif",
              color: filter === f.value ? "var(--color-gold-bright)" : "var(--color-silver)",
              border: `1px solid ${filter === f.value ? "var(--color-gold)" : "rgba(192,192,192,0.2)"}`,
              background: filter === f.value ? "rgba(201,168,76,0.08)" : "transparent",
              touchAction: "manipulation",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Arcana / suit filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {(["all", "major", "swords", "wands", "cups", "pentacles"] as ArcanaFilter[]).map((a) => (
          <button
            key={a}
            onClick={() => setArcana(a)}
            className="px-3 py-1 text-xs uppercase tracking-widest transition-all duration-200"
            style={{
              fontFamily: "var(--font-cinzel), serif",
              color: arcana === a ? "var(--color-gold)" : "var(--color-silver)",
              border: `1px solid ${arcana === a ? "rgba(201,168,76,0.4)" : "rgba(192,192,192,0.12)"}`,
              background: arcana === a ? "rgba(201,168,76,0.05)" : "transparent",
              opacity: arcana === a ? 1 : 0.55,
              touchAction: "manipulation",
              fontSize: "9px",
            }}
          >
            {arcanaLabel[a]}
          </button>
        ))}
      </div>

      {/* Results count */}
      {(query.trim() || filter !== "all" || arcana !== "all") && filtered.length > 0 && (
        <div
          className="text-center mb-4 text-xs"
          style={{ color: "var(--color-silver)", opacity: 0.45 }}
        >
          {filtered.length} of {cards.length} adversaries
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div
          className="text-center py-16 text-sm italic"
          style={{ color: "var(--color-silver)", opacity: 0.45 }}
        >
          No adversaries match &ldquo;{query}&rdquo;.
        </div>
      )}

      {/* Card grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map((card, i) => {
          const accent = categoryAccent[card.category];
          return (
            <a
              key={card.slug}
              href={`/card/${card.slug}`}
              className="block rounded-xl overflow-hidden transition-transform duration-200 hover:scale-105 active:scale-95"
              style={{
                background: "var(--color-arcane)",
                border: `1px solid ${accent}44`,
                boxShadow: `0 0 12px ${accent}22`,
                animation: "section-reveal 0.35s ease-out both",
                animationDelay: `${i * 30}ms`,
                textDecoration: "none",
                touchAction: "manipulation",
              }}
            >
              {/* Category accent bar */}
              <div style={{ height: 3, background: accent }} />

              <div className="p-3">
                {/* Number + arcana/category */}
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className="text-xs opacity-50"
                    style={{ color: "var(--color-gold)", fontFamily: "var(--font-cinzel), serif" }}
                  >
                    {card.arcanum === "major" ? "★" : card.suit?.charAt(0).toUpperCase()}
                    {card.number}
                  </span>
                  <span
                    className="text-xs px-1.5 py-0.5 rounded"
                    style={{
                      background: `${accent}22`,
                      color: "var(--color-silver)",
                      border: `1px solid ${accent}33`,
                      fontSize: "9px",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {categoryLabel[card.category]}
                  </span>
                </div>

                {/* Card title */}
                <div
                  className="text-sm font-semibold leading-tight mb-0.5"
                  style={{ color: "var(--color-gold-bright)", fontFamily: "var(--font-cinzel), serif" }}
                >
                  {card.cardTitle}
                </div>

                {/* Group name */}
                <div className="text-xs mb-2" style={{ color: "var(--color-silver)", opacity: 0.7 }}>
                  {card.name}
                </div>

                {/* Risk stars */}
                <div className="text-xs">{riskLabel(card.riskLevel)}</div>
              </div>
            </a>
          );
        })}
      </div>
    </>
  );
}
