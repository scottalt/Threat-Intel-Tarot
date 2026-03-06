"use client";

import { useState, useEffect, useRef } from "react";
import type { TarotCard } from "@/data/types";

const categoryLabel: Record<string, string> = {
  "nation-state": "Nation-State",
  criminal: "Criminal",
  hacktivist: "Hacktivist",
  trickster: "Trickster",
  unknown: "Unknown",
};

const categoryAccent: Record<string, string> = {
  "nation-state": "var(--color-teal)",
  criminal: "var(--color-purple)",
  hacktivist: "var(--color-ember)",
  trickster: "var(--color-trickster)",
  unknown: "var(--color-silver)",
};

const riskLabel = (level: number) =>
  Array.from({ length: 5 }, (_, i) => (
    <span key={i} style={{ color: i < level ? "var(--color-gold-bright)" : "#333" }}>★</span>
  ));

type Category = "all" | "nation-state" | "criminal" | "hacktivist" | "trickster";
type VolumeFilter = "all" | "core" | "expansion";
type ArcanaFilter = "all" | "major" | "swords" | "wands" | "cups" | "pentacles";
type SortOrder = "deck" | "risk-desc" | "risk-asc" | "name" | "ttps-desc";

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
    card.motivation.some((m) => m.toLowerCase().includes(lower)) ||
    card.ttps.some(
      (t) =>
        t.techniqueId.toLowerCase().includes(lower) ||
        t.name.toLowerCase().includes(lower) ||
        t.tactic.toLowerCase().includes(lower)
    ) ||
    (card.mitreGroupId?.toLowerCase().includes(lower) ?? false)
  );
}

const SORT_LABELS: Record<SortOrder, string> = {
  deck: "Deck Order",
  "risk-desc": "Highest Risk",
  "risk-asc": "Lowest Risk",
  name: "A–Z",
  "ttps-desc": "Most TTPs",
};

const SCROLL_KEY = "ti-gallery-scroll";
const STATE_KEY = "ti-gallery-state";

type GalleryState = {
  filter: Category;
  arcana: ArcanaFilter;
  query: string;
  sort: SortOrder;
  originFilter: string;
  volume: VolumeFilter;
  activeOnly: boolean;
};

function loadState(): GalleryState {
  try {
    const raw = sessionStorage.getItem(STATE_KEY);
    if (raw) return JSON.parse(raw) as GalleryState;
  } catch { /* ignore */ }
  return { filter: "all", arcana: "all", query: "", sort: "deck", originFilter: "", volume: "all", activeOnly: false };
}

function saveState(s: GalleryState) {
  try { sessionStorage.setItem(STATE_KEY, JSON.stringify(s)); } catch { /* ignore */ }
}

export function GalleryClient({ cards }: { cards: TarotCard[] }) {
  const [filter, setFilter] = useState<Category>("all");
  const [arcana, setArcana] = useState<ArcanaFilter>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOrder>("deck");
  const [originFilter, setOriginFilter] = useState("");
  const [volume, setVolume] = useState<VolumeFilter>("all");
  const [activeOnly, setActiveOnly] = useState(false);
  const [skipAnimation, setSkipAnimation] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollRestoredRef = useRef(false);

  // Restore filter state + scroll position when returning from a card page
  useEffect(() => {
    if (scrollRestoredRef.current) return;
    scrollRestoredRef.current = true;
    const s = loadState();
    const hadSavedScroll = !!sessionStorage.getItem(SCROLL_KEY);
    setFilter(s.filter);
    setArcana(s.arcana);
    setQuery(s.query);
    setSort(s.sort);
    setOriginFilter(s.originFilter);
    setVolume(s.volume ?? "all");
    setActiveOnly(s.activeOnly ?? false);
    // Suppress card entrance animations when restoring position
    if (hadSavedScroll) setSkipAnimation(true);
    try {
      const y = sessionStorage.getItem(SCROLL_KEY);
      if (y) {
        requestAnimationFrame(() => {
          window.scrollTo({ top: parseInt(y, 10), behavior: "instant" });
        });
      }
    } catch {
      // sessionStorage not available
    }
  }, []);

  // Save filter state when it changes
  useEffect(() => {
    saveState({ filter, arcana, query, sort, originFilter, volume, activeOnly });
  }, [filter, arcana, query, sort, originFilter, volume, activeOnly]);

  // Save scroll position + update progress bar
  useEffect(() => {
    const handleScroll = () => {
      try {
        sessionStorage.setItem(SCROLL_KEY, String(Math.round(window.scrollY)));
      } catch {
        // sessionStorage not available
      }
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docH > 0 ? Math.min(window.scrollY / docH, 1) : 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const filtered = cards
    .filter((c) => {
      const categoryMatch = filter === "all" || c.category === filter;
      const arcanaMatch =
        arcana === "all" ||
        (arcana === "major" && c.arcanum === "major") ||
        (arcana !== "major" && c.suit === arcana);
      const searchMatch = query.trim() === "" || matchesSearch(c, query.trim());
      const originMatch = originFilter === "" || c.origin.toLowerCase().includes(originFilter.toLowerCase());
      const volumeMatch =
        volume === "all" ||
        (volume === "core" && !c.expansion) ||
        (volume === "expansion" && c.expansion === true);
      const activeMatch = !activeOnly || c.active === true;
      return categoryMatch && arcanaMatch && searchMatch && originMatch && volumeMatch && activeMatch;
    })
    .sort((a, b) => {
      if (sort === "risk-desc") return b.riskLevel - a.riskLevel;
      if (sort === "risk-asc") return a.riskLevel - b.riskLevel;
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "ttps-desc") return b.ttps.length - a.ttps.length;
      return 0; // deck order: preserve original array order
    });
  const filters: { label: string; value: Category }[] = [
    { label: "All", value: "all" },
    { label: "Nation-State", value: "nation-state" },
    { label: "Criminal", value: "criminal" },
    { label: "Hacktivist", value: "hacktivist" },
    { label: "Trickster", value: "trickster" },
  ];

  return (
    <>
      {/* Scroll progress bar */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: 2,
          width: `${scrollProgress * 100}%`,
          background: "linear-gradient(90deg, var(--color-gold), var(--color-gold-bright))",
          zIndex: 100,
          transition: "width 0.1s linear",
          pointerEvents: "none",
        }}
      />

      {/* Search + sort row */}
      <div className="flex flex-wrap gap-2 items-center justify-center mb-5">
        <div className="relative w-full max-w-sm">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, alias, origin, TTP, technique ID…"
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

        {/* Sort select */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOrder)}
          className="text-xs px-3 py-2 bg-transparent outline-none cursor-pointer"
          style={{
            color: "var(--color-silver)",
            border: "1px solid rgba(201,168,76,0.2)",
            borderRadius: "4px",
            fontFamily: "var(--font-cinzel), serif",
            background: "var(--color-arcane)",
            touchAction: "manipulation",
          }}
          aria-label="Sort order"
        >
          {(["deck", "risk-desc", "risk-asc", "name", "ttps-desc"] as SortOrder[]).map((s) => (
            <option key={s} value={s} style={{ background: "var(--color-arcane)" }}>
              {SORT_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {/* Country quick-filter (origin-only match) */}
      <div className="flex flex-wrap justify-center gap-1.5 mb-2">
        <span className="text-xs self-center" style={{ color: "var(--color-silver)", opacity: 0.35 }}>Origin:</span>
        {["Russia", "China", "North Korea", "Iran", "USA"].map((country) => (
          <button
            key={country}
            onClick={() => setOriginFilter(originFilter === country ? "" : country)}
            className="px-2.5 py-0.5 text-xs rounded transition-all"
            style={{
              fontFamily: "var(--font-cinzel), serif",
              fontSize: "9px",
              letterSpacing: "0.06em",
              color: originFilter === country ? "var(--color-gold-bright)" : "var(--color-silver)",
              border: `1px solid ${originFilter === country ? "rgba(201,168,76,0.4)" : "rgba(192,192,192,0.15)"}`,
              background: originFilter === country ? "rgba(201,168,76,0.08)" : "transparent",
              opacity: originFilter === country ? 1 : 0.65,
              touchAction: "manipulation",
            }}
          >
            {country}
          </button>
        ))}
      </div>

      {/* Sector quick-search */}
      <div className="flex flex-wrap justify-center gap-1.5 mb-4">
        <span className="text-xs self-center" style={{ color: "var(--color-silver)", opacity: 0.35 }}>Sector:</span>
        {["Government", "Healthcare", "Financial", "Defense", "Energy", "Telecom", "Technology"].map((sector) => (
          <button
            key={sector}
            onClick={() => setQuery(query === sector ? "" : sector)}
            className="px-2.5 py-0.5 text-xs rounded transition-all"
            style={{
              fontFamily: "var(--font-cinzel), serif",
              fontSize: "9px",
              letterSpacing: "0.06em",
              color: query === sector ? "var(--color-gold-bright)" : "var(--color-silver)",
              border: `1px solid ${query === sector ? "rgba(201,168,76,0.4)" : "rgba(192,192,192,0.15)"}`,
              background: query === sector ? "rgba(201,168,76,0.08)" : "transparent",
              opacity: query === sector ? 1 : 0.65,
              touchAction: "manipulation",
            }}
          >
            {sector}
          </button>
        ))}
      </div>

      {/* Volume filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-3">
        <span className="text-xs self-center" style={{ color: "var(--color-silver)", opacity: 0.35 }}>Volume:</span>
        {([
          { label: "All", value: "all" as VolumeFilter },
          { label: "Core Deck (I)", value: "core" as VolumeFilter },
          { label: "Unbound Arcana (II)", value: "expansion" as VolumeFilter },
        ]).map((v) => (
          <button
            key={v.value}
            onClick={() => setVolume(v.value)}
            className="px-3 py-1 text-xs uppercase tracking-widest transition-all duration-200"
            style={{
              fontFamily: "var(--font-cinzel), serif",
              fontSize: "9px",
              letterSpacing: "0.06em",
              color: volume === v.value ? "var(--color-gold-bright)" : "var(--color-silver)",
              border: `1px solid ${volume === v.value ? "rgba(201,168,76,0.4)" : "rgba(192,192,192,0.12)"}`,
              background: volume === v.value ? "rgba(201,168,76,0.08)" : "transparent",
              opacity: volume === v.value ? 1 : 0.55,
              touchAction: "manipulation",
            }}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Active groups toggle */}
      <div className="flex justify-center mb-3">
        <button
          onClick={() => setActiveOnly((v) => !v)}
          style={{
            fontFamily: "var(--font-cinzel), serif",
            fontSize: "9px",
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            padding: "4px 14px",
            borderRadius: "4px",
            border: `1px solid ${activeOnly ? "rgba(74,173,173,0.5)" : "rgba(192,192,192,0.15)"}`,
            background: activeOnly ? "rgba(74,173,173,0.1)" : "transparent",
            color: activeOnly ? "var(--color-teal)" : "rgba(192,192,192,0.45)",
            cursor: "pointer",
            transition: "all 0.18s ease",
            touchAction: "manipulation",
          }}
        >
          {activeOnly ? "Active Groups Only" : "All Groups (incl. disbanded)"}
        </button>
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

      {/* Results count + clear filters */}
      {(query.trim() || filter !== "all" || arcana !== "all" || originFilter || volume !== "all" || activeOnly) && (
        <div className="flex items-center justify-center gap-4 mb-4">
          {filtered.length > 0 && (
            <div className="text-xs" style={{ color: "var(--color-silver)", opacity: 0.45 }}>
              {filtered.length} of {cards.length} adversaries
            </div>
          )}
          <button
            onClick={() => { setFilter("all"); setArcana("all"); setQuery(""); setOriginFilter(""); setSort("deck"); setVolume("all"); setActiveOnly(false); }}
            className="text-xs uppercase tracking-widest transition-opacity hover:opacity-100"
            style={{ color: "var(--color-gold)", opacity: 0.5, fontFamily: "var(--font-cinzel), serif", background: "none", border: "none", cursor: "pointer" }}
          >
            ✕ Clear
          </button>
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
              className="block rounded-xl overflow-hidden active:scale-95"
              style={{
                background: "var(--color-arcane)",
                border: `1px solid ${accent}44`,
                boxShadow: `0 0 12px ${accent}22`,
                animation: skipAnimation ? "none" : "section-reveal 0.4s cubic-bezier(0.22, 1, 0.36, 1) both",
                animationDelay: skipAnimation ? "0ms" : `${Math.min(i * 30, 400)}ms`,
                textDecoration: "none",
                touchAction: "manipulation",
                transition: "transform 0.2s cubic-bezier(0.34, 1.3, 0.64, 1), box-shadow 0.2s ease, border-color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.transform = "translateY(-4px) scale(1.03)";
                el.style.boxShadow = `0 8px 24px ${accent}44, 0 0 20px ${accent}22`;
                el.style.borderColor = `${accent}88`;
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.transform = "";
                el.style.boxShadow = `0 0 12px ${accent}22`;
                el.style.borderColor = `${accent}44`;
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
                    {card.expansion ? "II·" : (card.arcanum === "major" ? "★" : card.suit?.charAt(0).toUpperCase())}
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
                <div className="text-xs" style={{ color: "var(--color-silver)", opacity: 0.7 }}>
                  {card.name}
                </div>

                {/* Origin */}
                <div className="text-xs mb-2" style={{ color: "var(--color-silver)", opacity: 0.4, fontSize: "9px" }}>
                  {card.origin}
                </div>

                {/* Risk + TTP count row */}
                <div className="flex items-center justify-between">
                  <div className="text-xs">{riskLabel(card.riskLevel)}</div>
                  <span
                    className="text-xs font-mono"
                    style={{ color: "var(--color-silver)", opacity: 0.35, fontSize: "9px" }}
                  >
                    {card.ttps.length} TTPs
                  </span>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </>
  );
}
