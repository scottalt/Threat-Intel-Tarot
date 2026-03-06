"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { TimelineEvent } from "@/app/timeline/page";

const catColor: Record<string, string> = {
  "nation-state": "#4aadad",
  criminal: "#9f7aea",
  hacktivist: "#f97316",
  trickster: "#e040a0",
  unknown: "#b8b8c8",
};

export function TimelineClient({ events }: { events: TimelineEvent[] }) {
  const [query, setQuery] = useState("");
  const [yearFrom, setYearFrom] = useState<number | "">("");
  const [yearTo, setYearTo] = useState<number | "">("");
  const [catFilter, setCatFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return events.filter((e) => {
      const matchesQuery = !q || e.op.toLowerCase().includes(q) || e.cardName.toLowerCase().includes(q);
      const matchesFrom = yearFrom === "" || e.year >= yearFrom;
      const matchesTo = yearTo === "" || e.year <= yearTo;
      const matchesCat = catFilter === "all" || e.category === catFilter;
      return matchesQuery && matchesFrom && matchesTo && matchesCat;
    });
  }, [events, query, yearFrom, yearTo, catFilter]);

  const byYear = useMemo(() => {
    const map = new Map<number, TimelineEvent[]>();
    for (const e of filtered) {
      const list = map.get(e.year) ?? [];
      list.push(e);
      map.set(e.year, list);
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [filtered]);

  const catOptions = [
    { value: "all", label: "All", color: "#c9a84c" },
    { value: "nation-state", label: "Nation-State", color: catColor["nation-state"] },
    { value: "criminal", label: "Criminal", color: catColor["criminal"] },
    { value: "hacktivist", label: "Hacktivist", color: catColor["hacktivist"] },
    { value: "trickster", label: "Trickster", color: catColor["trickster"] },
  ];

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 justify-center mb-6">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search operations or groups..."
          className="px-4 py-2 text-sm bg-transparent outline-none"
          style={{
            color: "var(--color-mist)",
            border: "1px solid rgba(201,168,76,0.25)",
            borderRadius: "4px",
            fontFamily: "var(--font-garamond), Georgia, serif",
            width: "240px",
            caretColor: "var(--color-gold)",
          }}
        />
        <input
          type="number"
          value={yearFrom}
          onChange={(e) => setYearFrom(e.target.value ? parseInt(e.target.value) : "")}
          placeholder="From"
          style={{
            width: "80px",
            padding: "8px 12px",
            background: "transparent",
            border: "1px solid rgba(201,168,76,0.2)",
            borderRadius: "4px",
            color: "var(--color-silver)",
            fontFamily: "var(--font-cinzel), serif",
            fontSize: "12px",
            outline: "none",
          }}
        />
        <input
          type="number"
          value={yearTo}
          onChange={(e) => setYearTo(e.target.value ? parseInt(e.target.value) : "")}
          placeholder="To"
          style={{
            width: "80px",
            padding: "8px 12px",
            background: "transparent",
            border: "1px solid rgba(201,168,76,0.2)",
            borderRadius: "4px",
            color: "var(--color-silver)",
            fontFamily: "var(--font-cinzel), serif",
            fontSize: "12px",
            outline: "none",
          }}
        />
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {catOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setCatFilter(opt.value)}
            style={{
              fontFamily: "var(--font-cinzel), serif",
              fontSize: "9px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "4px 12px",
              borderRadius: "4px",
              border: `1px solid ${catFilter === opt.value ? opt.color : "rgba(201,168,76,0.15)"}`,
              background: catFilter === opt.value ? `${opt.color}18` : "transparent",
              color: catFilter === opt.value ? opt.color : "rgba(201,168,76,0.4)",
              cursor: "pointer",
              transition: "all 0.18s ease",
              touchAction: "manipulation",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {byYear.length === 0 ? (
        <div className="text-center py-16" style={{ color: "var(--color-silver)", opacity: 0.4 }}>
          No operations match your filters.
        </div>
      ) : (
        <div style={{ position: "relative" }}>
          {/* Vertical spine */}
          <div
            style={{
              position: "absolute",
              left: "64px",
              top: 0,
              bottom: 0,
              width: "1px",
              background: "linear-gradient(to bottom, transparent, rgba(201,168,76,0.2) 5%, rgba(201,168,76,0.2) 95%, transparent)",
            }}
          />

          {byYear.map(([year, yearEvents]) => (
            <div key={year} className="mb-5" style={{ display: "flex" }}>
              {/* Year label */}
              <div
                style={{
                  width: "64px",
                  flexShrink: 0,
                  paddingRight: "14px",
                  paddingTop: "3px",
                  textAlign: "right",
                  fontFamily: "var(--font-cinzel), serif",
                  fontSize: "10px",
                  color: "var(--color-gold)",
                  opacity: 0.65,
                  letterSpacing: "0.04em",
                }}
              >
                {year}
              </div>

              {/* Events */}
              <div style={{ flex: 1, paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "5px" }}>
                {yearEvents.map((e, i) => {
                  const color = catColor[e.category] ?? "#c9a84c";
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      {/* Dot */}
                      <div
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: color,
                          flexShrink: 0,
                          marginTop: "5px",
                          marginLeft: "-21px",
                          boxShadow: `0 0 5px ${color}88`,
                        }}
                      />
                      <div>
                        <div
                          style={{
                            fontSize: "13px",
                            color: "var(--color-mist)",
                            lineHeight: 1.4,
                            opacity: 0.88,
                          }}
                        >
                          {e.op}
                        </div>
                        <Link
                          href={`/card/${e.slug}`}
                          style={{
                            fontSize: "10px",
                            color: color,
                            opacity: 0.7,
                            textDecoration: "none",
                            fontFamily: "var(--font-cinzel), serif",
                            letterSpacing: "0.04em",
                            transition: "opacity 0.15s",
                          }}
                        >
                          {e.cardName}
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-center mt-8" style={{ color: "var(--color-silver)", fontSize: "11px", opacity: 0.3 }}>
        {filtered.length} of {events.length} operations shown
      </div>
    </>
  );
}
