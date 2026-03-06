"use client";

import { useState, useMemo } from "react";

type SectorEntry = {
  sector: string;
  count: number;
  avgRisk: number;
  groups: { name: string; cardTitle: string; slug: string; category: string; riskLevel: number }[];
};

const categoryAccent: Record<string, string> = {
  "nation-state": "var(--color-teal)",
  criminal: "var(--color-purple)",
  hacktivist: "var(--color-ember)",
  unknown: "var(--color-silver)",
};

const categoryLabel: Record<string, string> = {
  "nation-state": "Nation-State",
  criminal: "Criminal",
  hacktivist: "Hacktivist",
  unknown: "Unknown",
};

type CategoryFilter = "all" | "nation-state" | "criminal" | "hacktivist";

export function SectorIndexClient({ sectors }: { sectors: SectorEntry[] }) {
  const [query, setQuery] = useState("");
  const [catFilter, setCatFilter] = useState<CategoryFilter>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sectors
      .map((s) => {
        const filteredGroups = s.groups.filter((g) => {
          const catMatch = catFilter === "all" || g.category === catFilter;
          return catMatch;
        });
        return { ...s, groups: filteredGroups, count: filteredGroups.length };
      })
      .filter((s) => {
        if (s.count === 0) return false;
        if (!q) return true;
        return (
          s.sector.toLowerCase().includes(q) ||
          s.groups.some(
            (g) =>
              g.name.toLowerCase().includes(q) ||
              g.cardTitle.toLowerCase().includes(q)
          )
        );
      })
      .sort((a, b) => b.count - a.count);
  }, [sectors, query, catFilter]);

  const maxCount = filtered[0]?.count ?? 1;

  return (
    <>
      {/* Search + category filter */}
      <div className="mb-8 space-y-3">
        <div className="relative w-full max-w-sm">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sector or adversary…"
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

        <div className="flex flex-wrap gap-1.5">
          {(["all", "nation-state", "criminal", "hacktivist"] as CategoryFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setCatFilter(f === catFilter ? "all" : f)}
              className="px-2.5 py-1 text-xs rounded transition-all"
              style={{
                fontFamily: "var(--font-cinzel), serif",
                fontSize: "9px",
                letterSpacing: "0.08em",
                color: catFilter === f ? "var(--color-gold-bright)" : "var(--color-silver)",
                border: `1px solid ${catFilter === f ? "rgba(201,168,76,0.4)" : "rgba(192,192,192,0.15)"}`,
                background: catFilter === f ? "rgba(201,168,76,0.08)" : "transparent",
                opacity: catFilter === f ? 1 : 0.6,
                touchAction: "manipulation",
              }}
            >
              {f === "all" ? "ALL" : categoryLabel[f].toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {(query.trim() || catFilter !== "all") && filtered.length > 0 && (
        <div className="text-xs mb-4" style={{ color: "var(--color-silver)", opacity: 0.45 }}>
          {filtered.length} of {sectors.length} sectors
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-16 text-sm italic" style={{ color: "var(--color-silver)", opacity: 0.45 }}>
          No sectors match &ldquo;{query}&rdquo;.
        </div>
      )}

      {/* Sector list */}
      <div className="space-y-4">
        {filtered.map((sector, i) => {
          const riskBar = Math.round(sector.avgRisk);
          return (
            <div
              key={sector.sector}
              className="px-4 py-4 rounded-xl"
              style={{
                background: "var(--color-arcane)",
                border: "1px solid rgba(201,168,76,0.1)",
                animation: "section-reveal 0.35s ease-out both",
                animationDelay: `${Math.min(i, 20) * 30}ms`,
              }}
            >
              <div className="flex items-start gap-3">
                {/* Rank */}
                <div
                  className="text-lg font-semibold shrink-0 w-7 text-right"
                  style={{
                    color: "var(--color-gold)",
                    opacity: i < 3 ? 0.9 : 0.4,
                    fontFamily: "var(--font-cinzel), serif",
                  }}
                >
                  {i + 1}
                </div>

                {/* Main content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
                    <div className="text-sm font-semibold" style={{ color: "var(--color-mist)" }}>
                      {sector.sector}
                    </div>

                    <div className="flex flex-col items-end shrink-0 gap-1">
                      <span
                        className="text-sm font-semibold"
                        style={{ color: "var(--color-gold-bright)", fontFamily: "var(--font-cinzel), serif" }}
                      >
                        {sector.count}
                      </span>
                      <div className="flex items-center gap-1">
                        <div
                          className="h-1.5 rounded-full"
                          style={{
                            width: `${Math.round((sector.count / maxCount) * 80)}px`,
                            background: "var(--color-gold)",
                            opacity: 0.4,
                          }}
                        />
                        <span className="text-xs" style={{ color: "var(--color-silver)", opacity: 0.4 }}>
                          adversaries
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Avg risk stars */}
                  <div className="flex items-center gap-1.5 mb-3">
                    <div className="text-xs">
                      {Array.from({ length: 5 }, (_, j) => (
                        <span key={j} style={{ color: j < riskBar ? "var(--color-gold-bright)" : "#333" }}>★</span>
                      ))}
                    </div>
                    <span className="text-xs" style={{ color: "var(--color-silver)", opacity: 0.4 }}>
                      avg risk {sector.avgRisk.toFixed(1)}/5
                    </span>
                  </div>

                  {/* Group tags, category-colored */}
                  <div className="flex flex-wrap gap-1">
                    {sector.groups.map((g) => (
                      <a
                        key={g.slug}
                        href={`/card/${g.slug}`}
                        className="text-xs px-1.5 py-0.5 rounded transition-opacity hover:opacity-100"
                        style={{
                          background: `${categoryAccent[g.category] ?? "rgba(192,192,192,0.08)"}18`,
                          color: "var(--color-silver)",
                          border: `1px solid ${categoryAccent[g.category] ?? "rgba(192,192,192,0.2)"}33`,
                          textDecoration: "none",
                          opacity: 0.75,
                          fontSize: "9px",
                        }}
                        title={`${g.cardTitle} (Risk: ${g.riskLevel}/5)`}
                      >
                        {g.name}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
