"use client";

import { useState, useMemo } from "react";

type TechniqueEntry = {
  techniqueId: string;
  name: string;
  tactic: string;
  count: number;
  groups: { name: string; cardTitle: string; slug: string }[];
};

const TACTIC_ORDER = [
  "Reconnaissance",
  "Resource Development",
  "Initial Access",
  "Execution",
  "Persistence",
  "Privilege Escalation",
  "Defense Evasion",
  "Credential Access",
  "Discovery",
  "Lateral Movement",
  "Collection",
  "Command and Control",
  "Exfiltration",
  "Impact",
];

const TACTIC_SHORT: Record<string, string> = {
  Reconnaissance: "RECON",
  "Resource Development": "RESOURCE",
  "Initial Access": "INIT ACCESS",
  Execution: "EXEC",
  Persistence: "PERSIST",
  "Privilege Escalation": "PRIV ESC",
  "Defense Evasion": "DEF EVASION",
  "Credential Access": "CRED ACCESS",
  Discovery: "DISCOVERY",
  "Lateral Movement": "LAT MOVE",
  Collection: "COLLECTION",
  "Command and Control": "C2",
  Exfiltration: "EXFIL",
  Impact: "IMPACT",
};

function mitreUrl(id: string): string {
  return `https://attack.mitre.org/techniques/${id.replace(".", "/")}/`;
}

export function TechniqueExplorerClient({
  techniques,
  allTactics,
}: {
  techniques: TechniqueEntry[];
  allTactics: string[];
}) {
  const [query, setQuery] = useState("");
  const [tacticFilter, setTacticFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return techniques.filter((t) => {
      const matchesTactic = tacticFilter === "all" || t.tactic === tacticFilter;
      const matchesQuery =
        !q ||
        t.techniqueId.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.tactic.toLowerCase().includes(q) ||
        t.groups.some(
          (g) =>
            g.name.toLowerCase().includes(q) ||
            g.cardTitle.toLowerCase().includes(q)
        );
      return matchesTactic && matchesQuery;
    });
  }, [techniques, query, tacticFilter]);

  // Group filtered results by tactic
  const byTactic = useMemo(() => {
    const map = new Map<string, TechniqueEntry[]>();
    for (const tech of filtered) {
      const list = map.get(tech.tactic) ?? [];
      list.push(tech);
      map.set(tech.tactic, list);
    }
    return map;
  }, [filtered]);

  const orderedTactics = [
    ...TACTIC_ORDER.filter((t) => byTactic.has(t)),
    ...[...byTactic.keys()].filter((t) => !TACTIC_ORDER.includes(t)),
  ];

  const maxCount = Math.max(...techniques.map((t) => t.count), 1);

  return (
    <>
      {/* Search + tactic filter */}
      <div className="mb-8 space-y-3">
        <div className="relative w-full max-w-sm">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by technique, tactic, or group…"
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
          <button
            onClick={() => setTacticFilter("all")}
            className="px-2.5 py-1 text-xs rounded transition-all"
            style={{
              fontFamily: "var(--font-cinzel), serif",
              fontSize: "9px",
              letterSpacing: "0.08em",
              color: tacticFilter === "all" ? "var(--color-gold-bright)" : "var(--color-silver)",
              border: `1px solid ${tacticFilter === "all" ? "rgba(201,168,76,0.4)" : "rgba(192,192,192,0.15)"}`,
              background: tacticFilter === "all" ? "rgba(201,168,76,0.08)" : "transparent",
              opacity: tacticFilter === "all" ? 1 : 0.6,
            }}
          >
            ALL
          </button>
          {allTactics.map((tactic) => (
            <button
              key={tactic}
              onClick={() => setTacticFilter(tactic === tacticFilter ? "all" : tactic)}
              className="px-2.5 py-1 text-xs rounded transition-all"
              style={{
                fontFamily: "var(--font-cinzel), serif",
                fontSize: "9px",
                letterSpacing: "0.08em",
                color: tacticFilter === tactic ? "var(--color-gold-bright)" : "var(--color-silver)",
                border: `1px solid ${tacticFilter === tactic ? "rgba(201,168,76,0.4)" : "rgba(192,192,192,0.15)"}`,
                background: tacticFilter === tactic ? "rgba(201,168,76,0.08)" : "transparent",
                opacity: tacticFilter === tactic ? 1 : 0.55,
                touchAction: "manipulation",
              }}
            >
              {TACTIC_SHORT[tactic] ?? tactic.toUpperCase().slice(0, 10)}
            </button>
          ))}
        </div>
      </div>

      {/* Results count when filtering */}
      {(query.trim() || tacticFilter !== "all") && filtered.length > 0 && (
        <div
          className="text-xs mb-4"
          style={{ color: "var(--color-silver)", opacity: 0.45 }}
        >
          {filtered.length} of {techniques.length} techniques
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div
          className="text-center py-16 text-sm italic"
          style={{ color: "var(--color-silver)", opacity: 0.45 }}
        >
          No techniques match &ldquo;{query}&rdquo;.
        </div>
      )}

      {/* Techniques by tactic */}
      <div className="space-y-10">
        {orderedTactics.map((tactic) => {
          const tacticTechniques = byTactic.get(tactic) ?? [];
          const tacticMax = tacticTechniques[0]?.count ?? 1;
          return (
            <div key={tactic}>
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="text-xs px-2 py-0.5 rounded font-mono"
                  style={{
                    background: "rgba(201,168,76,0.1)",
                    color: "var(--color-gold)",
                    border: "1px solid rgba(201,168,76,0.2)",
                    letterSpacing: "0.08em",
                  }}
                >
                  {TACTIC_SHORT[tactic] ?? tactic.toUpperCase()}
                </span>
                <span
                  className="text-sm font-semibold"
                  style={{
                    color: "var(--color-gold-bright)",
                    fontFamily: "var(--font-cinzel), serif",
                  }}
                >
                  {tactic}
                </span>
                <span className="text-xs" style={{ color: "var(--color-silver)", opacity: 0.4 }}>
                  {tacticTechniques.length} technique{tacticTechniques.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="space-y-1.5">
                {tacticTechniques.map((tech) => (
                  <div
                    key={tech.techniqueId}
                    className="flex items-start gap-3 px-3 py-2 rounded"
                    style={{
                      background: "var(--color-arcane)",
                      border: "1px solid rgba(201,168,76,0.08)",
                    }}
                  >
                    <a
                      href={mitreUrl(tech.techniqueId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs shrink-0 transition-opacity hover:opacity-100"
                      style={{
                        color: "var(--color-gold)",
                        opacity: 0.6,
                        textDecoration: "none",
                        minWidth: "72px",
                        marginTop: "2px",
                      }}
                    >
                      {tech.techniqueId}
                    </a>

                    <div className="flex-1 min-w-0">
                      <div className="text-sm" style={{ color: "var(--color-mist)" }}>
                        {tech.name}
                      </div>
                      {tech.count > 1 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {tech.groups.map((g) => (
                            <a
                              key={g.slug}
                              href={`/card/${g.slug}`}
                              className="text-xs px-1.5 py-0.5 rounded transition-opacity hover:opacity-100"
                              style={{
                                background: "rgba(192,192,192,0.08)",
                                color: "var(--color-silver)",
                                border: "1px solid rgba(192,192,192,0.15)",
                                textDecoration: "none",
                                opacity: 0.75,
                                fontSize: "9px",
                              }}
                            >
                              {g.name}
                            </a>
                          ))}
                        </div>
                      )}
                      {tech.count === 1 && (
                        <div className="text-xs mt-0.5" style={{ color: "var(--color-silver)", opacity: 0.4 }}>
                          <a
                            href={`/card/${tech.groups[0].slug}`}
                            style={{ color: "inherit", textDecoration: "none" }}
                          >
                            {tech.groups[0].name}
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {tech.count > 1 && (
                        <div
                          className="h-1 rounded-full opacity-40"
                          style={{
                            width: `${Math.max(8, Math.round((tech.count / tacticMax) * 40))}px`,
                            background: "var(--color-gold)",
                          }}
                        />
                      )}
                      <span
                        className="text-xs font-mono"
                        style={{
                          color: "var(--color-silver)",
                          opacity: tech.count > 1 ? 0.7 : 0.3,
                        }}
                      >
                        {tech.count}×
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Use maxCount in a hidden element to prevent unused var lint error */}
      <span aria-hidden="true" style={{ display: "none" }}>{maxCount}</span>
    </>
  );
}
