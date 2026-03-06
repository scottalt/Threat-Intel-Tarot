"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import type { TarotCard } from "@/data/types";
import type { Category } from "@/data/types";

const GEO_URL = "/world-110m.json";

// ── Country node definitions ─────────────────────────────────────

interface CountryNode {
  key: string;
  label: string;
  coordinates: [number, number]; // [longitude, latitude]
  labelAnchor?: "start" | "middle" | "end";
  labelDy?: number;
}

const NODES: CountryNode[] = [
  { key: "russia",        label: "Russia",       coordinates: [95,  62],  labelAnchor: "middle", labelDy: -14 },
  { key: "china",         label: "China",        coordinates: [108, 35],  labelAnchor: "middle", labelDy: -14 },
  { key: "iran",          label: "Iran",         coordinates: [53,  33],  labelAnchor: "middle", labelDy: -14 },
  { key: "north-korea",   label: "N. Korea",     coordinates: [127, 40],  labelAnchor: "start",  labelDy: 4 },
  { key: "usa",           label: "USA",          coordinates: [-100, 40], labelAnchor: "middle", labelDy: -14 },
  { key: "europe",        label: "Europe",       coordinates: [15,  51],  labelAnchor: "middle", labelDy: -14 },
  { key: "middle-east",   label: "Middle East",  coordinates: [44,  29],  labelAnchor: "middle", labelDy: 16 },
  { key: "south-asia",    label: "S. Asia",      coordinates: [76,  24],  labelAnchor: "middle", labelDy: 16 },
  { key: "se-asia",       label: "SE Asia",      coordinates: [108, 12],  labelAnchor: "start",  labelDy: 5 },
  { key: "latin-america", label: "Lat. America", coordinates: [-65, 4],   labelAnchor: "middle", labelDy: 16 },
  { key: "africa",        label: "Africa",       coordinates: [22,  5],   labelAnchor: "middle", labelDy: 16 },
  { key: "global",        label: "Global",       coordinates: [-30, -28], labelAnchor: "middle", labelDy: 16 },
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
  trickster:      "#e040a0",
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
    { value: "trickster",    label: "Trickster",     color: catColor["trickster"] },
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
        {/* World map */}
        <div
          className="flex-1 rounded-xl overflow-hidden relative"
          style={{
            border: "1px solid rgba(201,168,76,0.15)",
            background: "radial-gradient(ellipse 120% 100% at 50% 0%, rgba(26,26,46,0.9) 0%, #0a0a0f 100%)",
          }}
        >
          <ComposableMap
            projection="geoNaturalEarth1"
            projectionConfig={{ scale: 155, center: [15, 10] }}
            style={{ width: "100%", height: "auto" }}
          >
            {/* Ocean fill */}
            <rect
              x="-1000" y="-1000" width="3000" height="3000"
              fill="rgba(10,10,20,0)"
            />

            {/* Country polygons */}
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    style={{
                      default: {
                        fill: "rgba(201,168,76,0.05)",
                        stroke: "rgba(201,168,76,0.18)",
                        strokeWidth: 0.4,
                        outline: "none",
                      },
                      hover: {
                        fill: "rgba(201,168,76,0.05)",
                        stroke: "rgba(201,168,76,0.18)",
                        strokeWidth: 0.4,
                        outline: "none",
                      },
                      pressed: {
                        fill: "rgba(201,168,76,0.05)",
                        stroke: "rgba(201,168,76,0.18)",
                        strokeWidth: 0.4,
                        outline: "none",
                      },
                    }}
                  />
                ))
              }
            </Geographies>

            {/* Threat actor nodes */}
            {NODES.map((node) => {
              const nodeCards = nodeCardMap.get(node.key) ?? [];
              if (nodeCards.length === 0) return null;

              const filteredCards = filter === "all"
                ? nodeCards
                : nodeCards.filter((c) => c.category === filter);
              const isDimmed = filter !== "all" && filteredCards.length === 0;

              const cat = dominantCategory(nodeCards);
              const color = catColor[cat] ?? "#c9a84c";
              const radius = Math.min(7 + nodeCards.length * 1.1, 16);
              const isSelected = selected === node.key;
              const isHovered  = hovered === node.key;
              const active = isSelected || isHovered;

              return (
                <Marker
                  key={node.key}
                  coordinates={node.coordinates}
                  onClick={() => !isDimmed && handleNodeClick(node.key)}
                  onMouseEnter={() => setHovered(node.key)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <g
                    style={{
                      cursor: isDimmed ? "default" : "pointer",
                      opacity: isDimmed ? 0.12 : 1,
                      transition: "opacity 0.3s ease",
                    }}
                    role="button"
                    tabIndex={isDimmed ? -1 : 0}
                    aria-label={`${node.label}: ${nodeCards.length} threat actors`}
                    onKeyDown={(e) => {
                      if (!isDimmed && (e.key === "Enter" || e.key === " ")) {
                        e.preventDefault();
                        handleNodeClick(node.key);
                      }
                    }}
                  >
                    {/* Pulse rings */}
                    {!isDimmed && (
                      <>
                        <circle
                          r={radius}
                          fill="none"
                          stroke={color}
                          strokeWidth="1"
                          opacity="0.5"
                          style={{
                            animation: "map-pulse 2.5s ease-out infinite",
                            transformOrigin: "0px 0px",
                          }}
                        />
                        <circle
                          r={radius}
                          fill="none"
                          stroke={color}
                          strokeWidth="0.7"
                          opacity="0.3"
                          style={{
                            animation: "map-pulse 2.5s ease-out 1.25s infinite",
                            transformOrigin: "0px 0px",
                          }}
                        />
                      </>
                    )}

                    {/* Core dot */}
                    <circle
                      r={radius}
                      fill={active ? color : `${color}44`}
                      stroke={color}
                      strokeWidth={isSelected ? 2 : 1}
                      style={{ transition: "all 0.2s ease" }}
                    />

                    {/* Count label */}
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={radius > 11 ? 7 : 6}
                      fill={active ? "#0a0a0f" : color}
                      fontWeight="700"
                      style={{ pointerEvents: "none", fontFamily: "monospace" }}
                    >
                      {nodeCards.length}
                    </text>

                    {/* Region label */}
                    <text
                      x={node.labelAnchor === "start" ? radius + 4 : node.labelAnchor === "end" ? -(radius + 4) : 0}
                      y={node.labelDy ?? -14}
                      textAnchor={node.labelAnchor ?? "middle"}
                      fontSize="6.5"
                      fill={active ? color : "rgba(201,168,76,0.55)"}
                      letterSpacing="0.07em"
                      style={{
                        pointerEvents: "none",
                        textTransform: "uppercase",
                        transition: "fill 0.2s",
                        fontFamily: "var(--font-cinzel), serif",
                      }}
                    >
                      {node.label}
                    </text>
                  </g>
                </Marker>
              );
            })}
          </ComposableMap>

          {/* Hover tooltip (absolutely positioned over map) */}
          {hovered && (() => {
            const node = NODES.find((n) => n.key === hovered);
            if (!node) return null;
            const nodeCards = nodeCardMap.get(hovered) ?? [];
            const topCard = [...nodeCards].sort((a, b) => b.riskLevel - a.riskLevel)[0];

            // Convert lon/lat to rough percentage position for tooltip placement
            const xPct = Math.min(((node.coordinates[0] + 170) / 350) * 100, 75);
            const yPct = Math.max(((90 - node.coordinates[1]) / 180) * 100 - 12, 5);

            return (
              <div
                style={{
                  position: "absolute",
                  left: `${xPct}%`,
                  top: `${yPct}%`,
                  transform: "translate(-50%, -100%)",
                  background: "rgba(10,10,15,0.97)",
                  border: "1px solid rgba(201,168,76,0.35)",
                  borderRadius: "6px",
                  padding: "8px 12px",
                  pointerEvents: "none",
                  zIndex: 10,
                  whiteSpace: "nowrap",
                  animation: "section-reveal 0.12s ease-out both",
                }}
              >
                <div style={{ color: "var(--color-gold-bright)", fontFamily: "var(--font-cinzel), serif", fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "3px" }}>
                  {node.label}
                </div>
                <div style={{ color: "var(--color-silver)", fontSize: "11px" }}>
                  {nodeCards.length} threat actor{nodeCards.length !== 1 ? "s" : ""}
                </div>
                {topCard && (
                  <div style={{ color: "var(--color-silver)", fontSize: "10px", opacity: 0.6, marginTop: "2px" }}>
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
          { label: "Trickster",    key: "trickster" },
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
