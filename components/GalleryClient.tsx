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

export function GalleryClient({ cards }: { cards: TarotCard[] }) {
  const [filter, setFilter] = useState<Category>("all");

  const filtered = filter === "all" ? cards : cards.filter((c) => c.category === filter);
  const filters: { label: string; value: Category }[] = [
    { label: "All", value: "all" },
    { label: "Nation-State", value: "nation-state" },
    { label: "Criminal", value: "criminal" },
    { label: "Hacktivist", value: "hacktivist" },
  ];

  return (
    <>
      {/* Filter bar */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
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
                {/* Number + category */}
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className="text-xs opacity-50"
                    style={{ color: "var(--color-gold)", fontFamily: "var(--font-cinzel), serif" }}
                  >
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
