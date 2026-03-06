"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import type { TarotCard } from "@/data/types";
import type { Category } from "@/data/types";

// ── SVG map dimensions ───────────────────────────────────────────

const W = 800;
const H = 380;

function merc(lat: number, lon: number): { x: number; y: number } {
  return {
    x: Math.round((lon + 180) * (W / 360)),
    y: Math.round((90 - lat) * (H / 180)),
  };
}

// ── Country node definitions ─────────────────────────────────────

interface CountryNode {
  key: string;
  label: string;
  lat: number;
  lon: number;
  labelAnchor?: "start" | "middle" | "end";
  labelDy?: number;
}

const NODES: CountryNode[] = [
  { key: "russia",        label: "Russia",       lat: 62,  lon: 95,   labelAnchor: "middle", labelDy: -13 },
  { key: "china",         label: "China",        lat: 32,  lon: 108,  labelAnchor: "middle", labelDy: -13 },
  { key: "iran",          label: "Iran",         lat: 33,  lon: 53,   labelAnchor: "middle", labelDy: -13 },
  { key: "north-korea",   label: "N. Korea",     lat: 40,  lon: 127,  labelAnchor: "start",  labelDy: 4 },
  { key: "usa",           label: "USA",          lat: 38,  lon: -97,  labelAnchor: "middle", labelDy: -13 },
  { key: "europe",        label: "Europe",       lat: 51,  lon: 10,   labelAnchor: "middle", labelDy: -13 },
  { key: "middle-east",   label: "Middle East",  lat: 31,  lon: 40,   labelAnchor: "middle", labelDy: 16 },
  { key: "south-asia",    label: "S. Asia",      lat: 24,  lon: 76,   labelAnchor: "middle", labelDy: 16 },
  { key: "se-asia",       label: "SE Asia",      lat: 10,  lon: 108,  labelAnchor: "start",  labelDy: 4 },
  { key: "latin-america", label: "Lat. America", lat: 6,   lon: -65,  labelAnchor: "middle", labelDy: 16 },
  { key: "africa",        label: "Africa",       lat: 8,   lon: 22,   labelAnchor: "middle", labelDy: 16 },
  { key: "global",        label: "Global",       lat: -25, lon: -30,  labelAnchor: "middle", labelDy: 16 },
];

// ── Origin → node key ────────────────────────────────────────────

function getNodeKey(origin: string): string {
  const o = origin.toLowerCase();
  if (o.includes("russia") || o.includes("russian") || o.includes("kremlin") ||
      o.includes("gru") || o.includes("fsb") || o.includes("svr")) return "russia";
  if (o.includes("china") || o.includes("pla") || o.includes("mss") || o.includes("chinese")) return "china";
  if (o.includes("iran") || o.includes("irgc")) return "iran";
  if (o.includes("north korea") || o.includes("dprk")) return "north-korea";
  if (o.includes("usa") || o.includes("nsa") || o.includes("unit 8200")) return "usa";
  if (o.includes("india") || o.includes("pakistan") || o.includes("south asia") ||
      o.includes("bangladesh") || o.includes("sidewinder") || o.includes("bitter") ||
      o.includes("patchwork") || o.includes("transparent")) return "south-asia";
  if (o.includes("southeast asia") || o.includes("vietnam") || o.includes("indonesia")) return "se-asia";
  if (o.includes("israel") || o.includes("palestine") || o.includes("gulf") ||
      o.includes("saudi") || o.includes("turkey") || o.includes("lebanon") ||
      o.includes("private sector") || o.includes("mercenary")) return "middle-east";
  if (o.includes("latin") || o.includes("venezuela") || o.includes("colombia") ||
      o.includes("south america")) return "latin-america";
  if (o.includes("africa") || o.includes("sudan") || o.includes("nigeria") ||
      o.includes("guacamaya")) return "africa";
  if (o.includes("ukraine") || o.includes("belarus") || o.includes("european") ||
      o.includes("eastern europe") || o.includes("uk") || o.includes("western") ||
      o.includes("british") || o.includes("anglophone")) return "europe";
  return "global";
}

// ── Category colors ──────────────────────────────────────────────

const catColor: Record<string, string> = {
  "nation-state": "#4aadad",
  criminal:       "#9f7aea",
  hacktivist:     "#f97316",
  unknown:        "#b8b8c8",
  mixed:          "#c9a84c",
};

function dominantCategory(nodeCards: TarotCard[]): string {
  const counts: Record<string, number> = {};
  for (const c of nodeCards) counts[c.category] = (counts[c.category] ?? 0) + 1;
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (!sorted.length) return "unknown";
  if (sorted.length === 1 || sorted[0][1] > (sorted[1]?.[1] ?? 0)) return sorted[0][0];
  return "mixed";
}

// ── Simplified continent SVG paths (decorative background) ───────
// Mercator-projected simplified polygons for major landmasses

const CONTINENT_PATHS = [
  // North America
  "M 26,25 L 90,14 L 255,10 L 352,48 L 315,63 L 228,76 L 205,90 L 218,100 L 150,70 L 120,50 L 65,28 Z",
  // South America
  "M 220,92 L 260,88 L 325,106 L 338,130 L 288,160 L 244,165 L 222,145 Z",
  // Europe (western)
  "M 377,22 L 462,22 L 489,60 L 462,75 L 440,82 L 410,75 L 395,65 L 376,62 Z",
  // Africa
  "M 363,60 L 510,88 L 510,100 L 494,142 L 432,157 L 365,142 L 358,100 Z",
  // Asia (main mass including Russia, Middle East, Indian sub, SE Asia)
  "M 456,22 L 714,22 L 742,75 L 714,100 L 685,115 L 648,152 L 645,110 L 682,107 L 680,76 L 644,73 L 644,96 L 614,92 L 614,73 L 580,73 L 578,93 L 555,93 L 534,70 L 533,89 L 510,88 L 489,60 L 456,22 Z",
  // Australia
  "M 651,112 L 741,112 L 741,152 L 651,152 Z",
  // Greenland
  "M 300,8 L 363,8 L 363,35 L 300,35 Z",
];

// ── Lat/lon grid lines ───────────────────────────────────────────

function GridLines() {
  const latLines = [-60, -30, 0, 30, 60];
  const lonLines = [-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150];
  return (
    <g opacity="0.08" stroke="#c9a84c" strokeWidth="0.4">
      {latLines.map((lat) => {
        const y = merc(lat, 0).y;
        return <line key={lat} x1={0} y1={y} x2={W} y2={y} />;
      })}
      {lonLines.map((lon) => {
        const x = merc(0, lon).x;
        return <line key={lon} x1={x} y1={0} x2={x} y2={H} />;
      })}
    </g>
  );
}

// ── Filter type ──────────────────────────────────────────────────

type FilterMode = "all" | Category;

// ── Props ────────────────────────────────────────────────────────

interface MapClientProps {
  cards: TarotCard[];
}

// ── Main component ───────────────────────────────────────────────

export function MapClient({ cards }: MapClientProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered,  setHovered]  = useState<string | null>(null);
  const [filter,   setFilter]   = useState<FilterMode>("all");
  const panelRef = useRef<HTMLDivElement>(null);

  // Group cards by node key
  const nodeCardMap = useMemo(() => {
    const map = new Map<string, TarotCard[]>();
    for (const card of cards) {
      const key = getNodeKey(card.origin);
      const existing = map.get(key) ?? [];
      existing.push(card);
      map.set(key, existing);
    }
    return map;
  }, [cards]);

  // Filter cards for selected node
  const selectedCards = useMemo(() => {
    if (!selected) return [];
    const nodeCards = nodeCardMap.get(selected) ?? [];
    if (filter === "all") return nodeCards;
    return nodeCards.filter((c) => c.category === filter);
  }, [selected, nodeCardMap, filter]);

  const selectedNode = NODES.find((n) => n.key === selected);

  const handleNodeClick = useCallback((key: string) => {
    setSelected((prev) => (prev === key ? null : key));
    // Scroll panel into view on mobile
    setTimeout(() => {
      panelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 50);
  }, []);

  // Filter buttons
  const filterOptions: { value: FilterMode; label: string; color: string }[] = [
    { value: "all",          label: "All",          color: "#c9a84c" },
    { value: "nation-state", label: "Nation-State",  color: catColor["nation-state"] },
    { value: "criminal",     label: "Criminal",      color: catColor["criminal"] },
    { value: "hacktivist",   label: "Hacktivist",    color: catColor["hacktivist"] },
  ];

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            style={{
              fontFamily: "var(--font-cinzel), serif",
              fontSize: "10px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "5px 14px",
              borderRadius: "4px",
              border: `1px solid ${filter === opt.value ? opt.color : "rgba(201,168,76,0.2)"}`,
              background: filter === opt.value ? `${opt.color}18` : "transparent",
              color: filter === opt.value ? opt.color : "rgba(201,168,76,0.45)",
              cursor: "pointer",
              transition: "all 0.18s ease",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Map + panel layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* SVG world map */}
        <div
          className="flex-1 rounded-xl overflow-hidden relative"
          style={{
            border: "1px solid rgba(201,168,76,0.15)",
            background: "radial-gradient(ellipse 120% 100% at 50% 0%, rgba(26,26,46,0.9) 0%, #0a0a0f 100%)",
            minHeight: "280px",
          }}
        >
          <svg
            viewBox={`0 0 ${W} ${H}`}
            width="100%"
            style={{ display: "block" }}
            aria-label="Global threat actor origin map"
          >
            {/* Latitude/longitude grid */}
            <GridLines />

            {/* Continent outlines */}
            <g fill="rgba(201,168,76,0.04)" stroke="rgba(201,168,76,0.12)" strokeWidth="0.6">
              {CONTINENT_PATHS.map((d, i) => (
                <path key={i} d={d} />
              ))}
            </g>

            {/* Country nodes */}
            {NODES.map((node) => {
              const nodeCards = nodeCardMap.get(node.key) ?? [];
              if (nodeCards.length === 0) return null;

              // Filter dimming
              const filteredCards = filter === "all"
                ? nodeCards
                : nodeCards.filter((c) => c.category === filter);
              const isDimmed = filter !== "all" && filteredCards.length === 0;

              const pos = merc(node.lat, node.lon);
              const cat = dominantCategory(nodeCards);
              const color = catColor[cat] ?? "#c9a84c";
              const radius = Math.min(6 + nodeCards.length * 1.2, 14);
              const isSelected = selected === node.key;
              const isHovered  = hovered === node.key;

              return (
                <g
                  key={node.key}
                  style={{
                    cursor: "pointer",
                    opacity: isDimmed ? 0.18 : 1,
                    transition: "opacity 0.3s ease",
                  }}
                  onClick={() => handleNodeClick(node.key)}
                  onMouseEnter={() => setHovered(node.key)}
                  onMouseLeave={() => setHovered(null)}
                  role="button"
                  aria-label={`${node.label}: ${nodeCards.length} threat actor${nodeCards.length !== 1 ? "s" : ""}`}
                  tabIndex={isDimmed ? -1 : 0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleNodeClick(node.key);
                    }
                  }}
                >
                  {/* Pulse rings (2 staggered) */}
                  {!isDimmed && (
                    <>
                      <circle
                        cx={pos.x} cy={pos.y} r={radius}
                        fill="none" stroke={color} strokeWidth="1"
                        style={{ animation: "map-pulse 2.5s ease-out infinite", transformOrigin: `${pos.x}px ${pos.y}px` }}
                        opacity="0.5"
                      />
                      <circle
                        cx={pos.x} cy={pos.y} r={radius}
                        fill="none" stroke={color} strokeWidth="0.7"
                        style={{ animation: "map-pulse 2.5s ease-out 1.25s infinite", transformOrigin: `${pos.x}px ${pos.y}px` }}
                        opacity="0.35"
                      />
                    </>
                  )}

                  {/* Core node */}
                  <circle
                    cx={pos.x} cy={pos.y} r={radius}
                    fill={isSelected || isHovered ? color : `${color}44`}
                    stroke={color}
                    strokeWidth={isSelected ? 2 : 1}
                    style={{ transition: "all 0.2s ease" }}
                  />

                  {/* Count label inside node */}
                  <text
                    x={pos.x} y={pos.y}
                    textAnchor="middle" dominantBaseline="central"
                    fontSize={radius > 10 ? "7" : "6"}
                    fill={isSelected || isHovered ? "#0a0a0f" : color}
                    fontWeight="700"
                    style={{ pointerEvents: "none", fontFamily: "monospace" }}
                  >
                    {nodeCards.length}
                  </text>

                  {/* Node label */}
                  <text
                    x={pos.x + (node.labelAnchor === "start" ? radius + 3 : node.labelAnchor === "end" ? -(radius + 3) : 0)}
                    y={pos.y + (node.labelDy ?? -13)}
                    textAnchor={node.labelAnchor ?? "middle"}
                    fontSize="7"
                    fill={isSelected || isHovered ? color : "rgba(201,168,76,0.55)"}
                    letterSpacing="0.06em"
                    style={{ pointerEvents: "none", textTransform: "uppercase", transition: "fill 0.2s" }}
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Hover tooltip */}
          {hovered && (() => {
            const node = NODES.find((n) => n.key === hovered);
            if (!node) return null;
            const nodeCards = nodeCardMap.get(hovered) ?? [];
            const topCard = nodeCards.sort((a, b) => b.riskLevel - a.riskLevel)[0];
            const pos = merc(node.lat, node.lon);
            const xPct = (pos.x / W) * 100;
            const yPct = (pos.y / H) * 100;
            return (
              <div
                style={{
                  position: "absolute",
                  left: `${Math.min(xPct, 70)}%`,
                  top: `${Math.max(yPct - 18, 5)}%`,
                  transform: "translate(-50%, -100%)",
                  background: "rgba(10,10,15,0.95)",
                  border: "1px solid rgba(201,168,76,0.3)",
                  borderRadius: "6px",
                  padding: "8px 12px",
                  pointerEvents: "none",
                  zIndex: 10,
                  whiteSpace: "nowrap",
                  animation: "section-reveal 0.15s ease-out both",
                }}
              >
                <div style={{ color: "var(--color-gold-bright)", fontFamily: "var(--font-cinzel), serif", fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "3px" }}>
                  {node.label}
                </div>
                <div style={{ color: "var(--color-silver)", fontSize: "11px" }}>
                  {nodeCards.length} threat actor{nodeCards.length !== 1 ? "s" : ""}
                </div>
                {topCard && (
                  <div style={{ color: "var(--color-silver)", fontSize: "10px", opacity: 0.65, marginTop: "2px" }}>
                    Incl. {topCard.name}
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Side panel */}
        {selected && (
          <div
            ref={panelRef}
            style={{
              width: "100%",
              maxWidth: "100%",
              animation: "map-panel-in 0.28s cubic-bezier(0.22, 1, 0.36, 1) both",
            }}
            className="lg:w-72 lg:flex-shrink-0"
          >
            <div
              style={{
                background: "rgba(26,26,46,0.95)",
                border: "1px solid rgba(201,168,76,0.2)",
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              {/* Panel header */}
              <div
                style={{
                  padding: "14px 16px",
                  borderBottom: "1px solid rgba(201,168,76,0.15)",
                  background: "rgba(201,168,76,0.04)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div
                    style={{
                      fontFamily: "var(--font-cinzel), serif",
                      color: "var(--color-gold-bright)",
                      fontSize: "13px",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    {selectedNode?.label}
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    style={{
                      color: "rgba(201,168,76,0.45)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "16px",
                      lineHeight: 1,
                      padding: "0 4px",
                    }}
                    aria-label="Close panel"
                  >
                    x
                  </button>
                </div>
                <div style={{ color: "var(--color-silver)", fontSize: "11px", opacity: 0.65, marginTop: "3px" }}>
                  {selectedCards.length} adversary{selectedCards.length !== 1 ? "s" : ""}
                  {filter !== "all" ? ` (${filter} filter)` : " in this region"}
                </div>
              </div>

              {/* Card list */}
              <div style={{ maxHeight: "420px", overflowY: "auto", padding: "8px" }}>
                {selectedCards.length === 0 ? (
                  <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--color-silver)", fontSize: "12px", opacity: 0.5 }}>
                    No {filter} actors in this region
                  </div>
                ) : (
                  selectedCards
                    .sort((a, b) => b.riskLevel - a.riskLevel)
                    .map((card, i) => {
                      const color = catColor[card.category] ?? "#c9a84c";
                      return (
                        <Link
                          key={card.slug}
                          href={`/card/${card.slug}`}
                          style={{
                            display: "block",
                            padding: "10px 12px",
                            borderRadius: "8px",
                            marginBottom: "4px",
                            textDecoration: "none",
                            border: `1px solid ${color}22`,
                            background: `${color}08`,
                            animation: `section-reveal 0.3s cubic-bezier(0.22, 1, 0.36, 1) ${i * 40}ms both`,
                            transition: "background 0.15s, border-color 0.15s",
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.background = `${color}18`;
                            (e.currentTarget as HTMLElement).style.borderColor = `${color}44`;
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.background = `${color}08`;
                            (e.currentTarget as HTMLElement).style.borderColor = `${color}22`;
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div
                              style={{
                                width: "6px",
                                height: "6px",
                                borderRadius: "50%",
                                background: color,
                                flexShrink: 0,
                              }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div
                                style={{
                                  fontFamily: "var(--font-cinzel), serif",
                                  fontSize: "10px",
                                  color: "var(--color-gold)",
                                  letterSpacing: "0.05em",
                                  textTransform: "uppercase",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {card.cardTitle}
                              </div>
                              <div style={{ fontSize: "11px", color: "var(--color-silver)", opacity: 0.7, marginTop: "1px" }}>
                                {card.name}
                              </div>
                            </div>
                            <div style={{ flexShrink: 0, fontSize: "10px", color: "var(--color-gold-bright)", opacity: 0.7 }}>
                              {"★".repeat(card.riskLevel)}
                            </div>
                          </div>
                        </Link>
                      );
                    })
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 mt-6 justify-center">
        {[
          { label: "Nation-State", key: "nation-state" },
          { label: "Criminal",     key: "criminal" },
          { label: "Hacktivist",   key: "hacktivist" },
          { label: "Mixed",        key: "mixed" },
        ].map(({ label, key }) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: catColor[key],
                boxShadow: `0 0 6px ${catColor[key]}88`,
              }}
            />
            <span style={{ fontSize: "10px", color: "var(--color-silver)", opacity: 0.55, fontFamily: "var(--font-cinzel), serif", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              {label}
            </span>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ fontSize: "9px", color: "rgba(201,168,76,0.4)", fontFamily: "monospace", fontWeight: 700 }}>12</div>
          <span style={{ fontSize: "10px", color: "var(--color-silver)", opacity: 0.45, fontFamily: "var(--font-cinzel), serif", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            = group count
          </span>
        </div>
      </div>
    </div>
  );
}
