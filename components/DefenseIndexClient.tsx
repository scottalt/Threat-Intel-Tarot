"use client";

import { useState, useMemo, useEffect } from "react";
import { getCoverage, toggleCoverage } from "@/lib/coverage";

type DefenseEntry = {
  control: string;
  framework: string | null;
  count: number;
  groups: { name: string; cardTitle: string; slug: string; category: string }[];
};

const categoryAccent: Record<string, string> = {
  "nation-state": "var(--color-teal)",
  criminal: "var(--color-purple)",
  hacktivist: "var(--color-ember)",
  trickster: "var(--color-trickster)",
  unknown: "var(--color-silver)",
};

function frameworkUrl(fw: string): string | null {
  if (fw.startsWith("NIST CSF")) return "https://www.nist.gov/cyberframework";
  if (fw.startsWith("NIST SSDF")) return "https://csrc.nist.gov/Projects/ssdf";
  if (fw.startsWith("NIST SP")) return "https://csrc.nist.gov/publications/sp";
  if (fw.startsWith("CIS Control")) return "https://www.cisecurity.org/controls/cis-controls-list/";
  if (fw.startsWith("ICS-CERT")) return "https://www.cisa.gov/resources-tools/resources/ics-cert";
  return null;
}

type FrameworkFilter = "all" | "CIS" | "NIST CSF" | "NIST SP" | "Other";

const FRAMEWORK_LABELS: Record<FrameworkFilter, string> = {
  all: "All",
  CIS: "CIS Controls",
  "NIST CSF": "NIST CSF",
  "NIST SP": "NIST SP 800-",
  Other: "Other",
};

function matchesFramework(fw: string | null, filter: FrameworkFilter): boolean {
  if (filter === "all") return true;
  if (!fw) return filter === "Other";
  if (filter === "CIS") return fw.startsWith("CIS");
  if (filter === "NIST CSF") return fw.startsWith("NIST CSF");
  if (filter === "NIST SP") return fw.startsWith("NIST SP");
  if (filter === "Other") return !fw.startsWith("CIS") && !fw.startsWith("NIST");
  return true;
}

export function DefenseIndexClient({ defenses }: { defenses: DefenseEntry[] }) {
  const [query, setQuery] = useState("");
  const [fwFilter, setFwFilter] = useState<FrameworkFilter>("all");
  const [covered, setCovered] = useState<Set<string>>(new Set());

  useEffect(() => {
    setCovered(getCoverage());
  }, []);

  const handleToggleCoverage = (control: string) => {
    setCovered(new Set(toggleCoverage(control)));
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return defenses.filter((d) => {
      const matchesSearch =
        !q ||
        d.control.toLowerCase().includes(q) ||
        (d.framework?.toLowerCase().includes(q) ?? false) ||
        d.groups.some((g) => g.name.toLowerCase().includes(q));
      const fwMatch = matchesFramework(d.framework, fwFilter);
      return matchesSearch && fwMatch;
    });
  }, [defenses, query, fwFilter]);

  const maxCount = defenses[0]?.count ?? 1;

  return (
    <>
      {/* Search + framework filter */}
      <div className="mb-6 space-y-3">
        <div className="relative w-full max-w-sm">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by control, framework, or group…"
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
          {(["all", "CIS", "NIST CSF", "NIST SP", "Other"] as FrameworkFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFwFilter(f === fwFilter ? "all" : f)}
              className="px-2.5 py-1 text-xs rounded transition-all"
              style={{
                fontFamily: "var(--font-cinzel), serif",
                fontSize: "9px",
                letterSpacing: "0.08em",
                color: fwFilter === f ? "var(--color-gold-bright)" : "var(--color-silver)",
                border: `1px solid ${fwFilter === f ? "rgba(201,168,76,0.4)" : "rgba(192,192,192,0.15)"}`,
                background: fwFilter === f ? "rgba(201,168,76,0.08)" : "transparent",
                opacity: fwFilter === f ? 1 : 0.6,
                touchAction: "manipulation",
              }}
            >
              {FRAMEWORK_LABELS[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Coverage tracker summary */}
      {covered.size > 0 && (
        <div
          className="mb-4 px-4 py-3 rounded-lg"
          style={{ background: "rgba(74,173,173,0.08)", border: "1px solid rgba(74,173,173,0.2)" }}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span
              style={{
                fontFamily: "var(--font-cinzel), serif",
                fontSize: "10px",
                color: "var(--color-teal)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Coverage Tracker
            </span>
            <span style={{ fontSize: "11px", color: "var(--color-teal)" }}>
              {covered.size} / {defenses.length} implemented
            </span>
          </div>
          <div style={{ height: "4px", background: "rgba(74,173,173,0.15)", borderRadius: "2px", overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${Math.round((covered.size / defenses.length) * 100)}%`,
                background: "var(--color-teal)",
                borderRadius: "2px",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>
      )}

      {/* Results count */}
      {(query.trim() || fwFilter !== "all") && filtered.length > 0 && (
        <div className="text-xs mb-4" style={{ color: "var(--color-silver)", opacity: 0.45 }}>
          {filtered.length} of {defenses.length} controls
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-16 text-sm italic" style={{ color: "var(--color-silver)", opacity: 0.45 }}>
          No controls match &ldquo;{query}&rdquo;.
        </div>
      )}

      {/* Defense list */}
      <div className="space-y-4">
        {filtered.map((defense, i) => {
          const fwUrl = defense.framework ? frameworkUrl(defense.framework) : null;
          return (
            <div
              key={defense.control}
              className="px-4 py-4 rounded-xl"
              style={{
                background: "var(--color-arcane)",
                border: "1px solid rgba(201,168,76,0.1)",
                animation: "section-reveal 0.4s cubic-bezier(0.22, 1, 0.36, 1) both",
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
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="flex-1">
                      <div className="text-sm font-semibold mb-1" style={{ color: "var(--color-mist)" }}>
                        {defense.control}
                      </div>
                      {defense.framework && (
                        fwUrl ? (
                          <a
                            href={fwUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs transition-opacity hover:opacity-100"
                            style={{ color: "var(--color-gold)", opacity: 0.45, textDecoration: "none" }}
                          >
                            {defense.framework} ↗
                          </a>
                        ) : (
                          <span className="text-xs" style={{ color: "var(--color-silver)", opacity: 0.45 }}>
                            {defense.framework}
                          </span>
                        )
                      )}
                    </div>

                    <div className="flex flex-col items-end shrink-0 gap-1.5">
                      <button
                        onClick={() => handleToggleCoverage(defense.control)}
                        title={covered.has(defense.control) ? "Mark as not implemented" : "Mark as implemented"}
                        aria-label={covered.has(defense.control) ? "Remove from coverage" : "Mark as implemented"}
                        style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "4px",
                          border: `1px solid ${covered.has(defense.control) ? "rgba(74,173,173,0.6)" : "rgba(192,192,192,0.2)"}`,
                          background: covered.has(defense.control) ? "rgba(74,173,173,0.2)" : "transparent",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--color-teal)",
                          fontSize: "11px",
                          transition: "all 0.18s ease",
                          flexShrink: 0,
                          touchAction: "manipulation",
                        }}
                      >
                        {covered.has(defense.control) ? "✓" : ""}
                      </button>
                      <span
                        className="text-sm font-semibold"
                        style={{ color: "var(--color-gold-bright)", fontFamily: "var(--font-cinzel), serif" }}
                      >
                        {defense.count}
                      </span>
                      <div className="flex items-center gap-1">
                        <div
                          className="h-1.5 rounded-full"
                          style={{
                            width: `${Math.round((defense.count / maxCount) * 80)}px`,
                            background: "var(--color-gold)",
                            opacity: 0.5,
                            animation: `bar-grow 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${Math.min(i, 20) * 30 + 100}ms both`,
                          }}
                        />
                        <span className="text-xs" style={{ color: "var(--color-silver)", opacity: 0.4 }}>
                          groups
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Category-colored group tags */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {defense.groups.map((g) => (
                      <a
                        key={g.slug}
                        href={`/card/${g.slug}`}
                        className="text-xs px-1.5 py-0.5 rounded transition-opacity hover:opacity-100"
                        style={{
                          background: `${categoryAccent[g.category]}18`,
                          color: "var(--color-silver)",
                          border: `1px solid ${categoryAccent[g.category]}33`,
                          textDecoration: "none",
                          opacity: 0.75,
                          fontSize: "9px",
                        }}
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
