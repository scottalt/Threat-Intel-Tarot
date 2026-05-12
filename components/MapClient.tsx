"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Line,
} from "react-simple-maps";
import type { TarotCard } from "@/data/types";
import type { Category } from "@/data/types";

const GEO_URL = "/world-110m.json";

interface CountryNode {
  key: string;
  label: string;
  coordinates: [number, number]; // [longitude, latitude]
  labelAnchor?: "start" | "middle" | "end";
  labelDy?: number;
}

// Finer-grained country/sub-region nodes. Ordered by getNodeKey priority:
// specific countries match before broader region fallbacks.
const NODES: CountryNode[] = [
  // Major attribution origins
  { key: "russia",        label: "Russia",       coordinates: [95,  62],  labelAnchor: "middle", labelDy: -14 },
  { key: "china",         label: "China",        coordinates: [108, 35],  labelAnchor: "middle", labelDy: -14 },
  { key: "iran",          label: "Iran",         coordinates: [53,  33],  labelAnchor: "end",    labelDy: 4 },
  { key: "north-korea",   label: "N. Korea",     coordinates: [127, 40],  labelAnchor: "start",  labelDy: 4 },
  { key: "usa",           label: "USA",          coordinates: [-100, 40], labelAnchor: "middle", labelDy: -14 },

  // Distinct state-aligned actors
  { key: "uae",           label: "UAE",          coordinates: [54,  24],  labelAnchor: "start",  labelDy: 12 },
  { key: "israel",        label: "Israel",       coordinates: [35,  31],  labelAnchor: "end",    labelDy: -10 },
  { key: "turkey",        label: "Turkey",       coordinates: [35,  39],  labelAnchor: "middle", labelDy: -12 },
  { key: "belarus",       label: "Belarus",      coordinates: [28,  53],  labelAnchor: "middle", labelDy: -12 },
  { key: "pakistan",      label: "Pakistan",     coordinates: [69,  30],  labelAnchor: "middle", labelDy: -12 },
  { key: "india",         label: "India",        coordinates: [78,  22],  labelAnchor: "middle", labelDy: 14 },
  { key: "vietnam",       label: "Vietnam",      coordinates: [108, 16],  labelAnchor: "start",  labelDy: 4 },
  { key: "ukraine",       label: "Ukraine",      coordinates: [31,  49],  labelAnchor: "middle", labelDy: -10 },
  { key: "palestine",     label: "Palestine",    coordinates: [34.5, 32], labelAnchor: "end",    labelDy: 12 },
  { key: "syria",         label: "Syria",        coordinates: [38,  35],  labelAnchor: "start",  labelDy: -10 },
  { key: "colombia",      label: "Colombia",     coordinates: [-74, 4],   labelAnchor: "end",    labelDy: -10 },
  { key: "brazil",        label: "Brazil",       coordinates: [-55, -10], labelAnchor: "middle", labelDy: 14 },

  // Broader / fallback regions
  { key: "europe",        label: "Europe",       coordinates: [10,  48],  labelAnchor: "middle", labelDy: -14 },
  { key: "se-asia",       label: "SE Asia",      coordinates: [114, 6],   labelAnchor: "start",  labelDy: 5 },
  { key: "middle-east",   label: "Middle East",  coordinates: [44,  29],  labelAnchor: "middle", labelDy: 16 },
  { key: "africa",        label: "Africa",       coordinates: [22,  5],   labelAnchor: "middle", labelDy: 16 },
  { key: "global",        label: "Global",       coordinates: [-30, -28], labelAnchor: "middle", labelDy: 16 },
];

const NODE_BY_KEY: Record<string, CountryNode> = Object.fromEntries(
  NODES.map((n) => [n.key, n])
);

// Map a card's origin string to the most specific node key.
function getNodeKey(origin: string): string {
  const o = origin.toLowerCase();

  // Specific countries (checked first)
  if (o.includes("russia") || o.includes("russian") || o.includes("kremlin") ||
      o.includes("gru") || o.includes("fsb") || o.includes("svr")) return "russia";
  if (o.includes("china") || o.includes("pla") || o.includes("mss") || o.includes("chinese") || o.includes("hong kong")) return "china";
  if (o.includes("iran") || o.includes("irgc") || o.includes("mois")) return "iran";
  if (o.includes("north korea") || o.includes("dprk") || o.includes("rgb -")) return "north-korea";
  if (o.includes("usa") || o.includes("nsa") || o.includes("unit 8200")) return "usa";
  if (o.includes("uae") || o.includes("emirat")) return "uae";
  if (o.includes("israel")) return "israel";
  if (o.includes("turkey")) return "turkey";
  if (o.includes("belarus")) return "belarus";
  if (o.includes("pakistan")) return "pakistan";
  if (o.includes("india")) return "india";
  if (o.includes("vietnam")) return "vietnam";
  if (o.includes("ukraine")) return "ukraine";
  if (o.includes("hamas") || o.includes("gaza") || o.includes("palestin")) return "palestine";
  if (o.includes("syria")) return "syria";
  if (o.includes("colombia")) return "colombia";
  if (o.includes("brazil")) return "brazil";

  // South Asia umbrella
  if (o.includes("south asia") || o.includes("bangladesh") ||
      o.includes("sidewinder") || o.includes("bitter") ||
      o.includes("patchwork") || o.includes("transparent")) return "india";

  // SE Asia umbrella
  if (o.includes("southeast asia") || o.includes("indonesia") ||
      o.includes("philippines") || o.includes("malaysia") || o.includes("thailand")) return "se-asia";

  // Middle East fallback
  if (o.includes("gulf") || o.includes("saudi") || o.includes("lebanon") ||
      o.includes("middle east") || o.includes("yemen") || o.includes("private sector") ||
      o.includes("mercenary")) return "middle-east";

  // Latin America fallback (no specific country)
  if (o.includes("latin") || o.includes("venezuela") || o.includes("south america")) return "brazil";

  // Africa
  if (o.includes("africa") || o.includes("sudan") || o.includes("nigeria") ||
      o.includes("guacamaya")) return "africa";

  // Europe fallback
  if (o.includes("european") || o.includes("eastern europe") || o.includes("uk") ||
      o.includes("western") || o.includes("british") || o.includes("anglophone") ||
      o.includes("germany") || o.includes("france")) return "europe";

  return "global";
}

// Geographic terms in `targets[]` → node key. Used for drawing target-flow arcs.
const TARGET_TERMS: Array<[RegExp, string]> = [
  [/\bukrain/i, "ukraine"],
  [/\bisrael/i, "israel"],
  [/\bpalestin/i, "palestine"],
  [/\bsyria/i, "syria"],
  [/\bturkey|turkish/i, "turkey"],
  [/\bbelarus/i, "belarus"],
  [/\bpakistan/i, "pakistan"],
  [/\bindia/i, "india"],
  [/\bvietnam/i, "vietnam"],
  [/\bcolombia/i, "colombia"],
  [/\bbrazil/i, "brazil"],
  [/\busa\b|united states|american|u\.s\.|u\.k\.|us federal|us govern|us critical/i, "usa"],
  [/\bchin(a|ese)|hong kong|taiwan/i, "china"],
  [/\brussi/i, "russia"],
  [/\biran/i, "iran"],
  [/\bnorth korea|dprk|south korea\b/i, "north-korea"],
  [/\buae|emirat|gulf state|saudi/i, "middle-east"],
  [/\bnato|european|eastern europe|west(ern)?|euro/i, "europe"],
  [/\basean|southeast asia|philippines|indonesia|malaysia|thailand|cambodia|singapore/i, "se-asia"],
  [/\bafrica|sudan|nigeria/i, "africa"],
];

function targetsToNodes(targets: string[]): Map<string, number> {
  const out = new Map<string, number>();
  for (const t of targets) {
    for (const [re, key] of TARGET_TERMS) {
      if (re.test(t)) {
        out.set(key, (out.get(key) ?? 0) + 1);
        break;
      }
    }
  }
  return out;
}

// Aggregate top target-region nodes for a list of cards from a single origin.
function aggregateTargetNodes(
  cards: TarotCard[],
  sourceKey: string
): Array<{ key: string; weight: number }> {
  const totals = new Map<string, number>();
  for (const c of cards) {
    const m = targetsToNodes(c.targets);
    for (const [k, n] of m) {
      if (k === sourceKey) continue; // skip self-targeting
      totals.set(k, (totals.get(k) ?? 0) + n);
    }
  }
  return Array.from(totals.entries())
    .map(([key, weight]) => ({ key, weight }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 6);
}

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

type FilterMode = "all" | Category;

interface MapClientProps {
  cards: TarotCard[];
}

export function MapClient({ cards }: MapClientProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered,  setHovered]  = useState<string | null>(null);
  const [filter,   setFilter]   = useState<FilterMode>("all");
  const panelRef = useRef<HTMLDivElement>(null);

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

  const selectedCards = useMemo(() => {
    if (!selected) return [];
    const nodeCards = nodeCardMap.get(selected) ?? [];
    if (filter === "all") return nodeCards;
    return nodeCards.filter((c) => c.category === filter);
  }, [selected, nodeCardMap, filter]);

  const selectedNode = selected ? NODE_BY_KEY[selected] : undefined;

  // Compute target-flow arcs for the selected node
  const targetArcs = useMemo(() => {
    if (!selected || !selectedNode) return [];
    const cardsForArcs = filter === "all"
      ? (nodeCardMap.get(selected) ?? [])
      : (nodeCardMap.get(selected) ?? []).filter((c) => c.category === filter);
    const top = aggregateTargetNodes(cardsForArcs, selected);
    return top
      .map(({ key, weight }) => {
        const targetNode = NODE_BY_KEY[key];
        if (!targetNode) return null;
        return {
          from: selectedNode.coordinates,
          to: targetNode.coordinates,
          weight,
          targetKey: key,
          targetLabel: targetNode.label,
        };
      })
      .filter(Boolean) as Array<{
        from: [number, number];
        to: [number, number];
        weight: number;
        targetKey: string;
        targetLabel: string;
      }>;
  }, [selected, selectedNode, nodeCardMap, filter]);

  // Top target sectors (non-geographic) shown in the panel
  const topTargetSectors = useMemo(() => {
    if (!selected) return [] as Array<{ label: string; count: number }>;
    const counts = new Map<string, number>();
    const cardsForSectors = filter === "all"
      ? (nodeCardMap.get(selected) ?? [])
      : (nodeCardMap.get(selected) ?? []).filter((c) => c.category === filter);
    for (const c of cardsForSectors) {
      const geoMatched = targetsToNodes(c.targets);
      for (const t of c.targets) {
        // Skip targets that look geographic (already shown as arcs)
        let isGeo = false;
        for (const [re] of TARGET_TERMS) {
          if (re.test(t)) { isGeo = true; break; }
        }
        if (isGeo) continue;
        if (geoMatched.size > 0 && t.length < 4) continue;
        const norm = t.trim();
        counts.set(norm, (counts.get(norm) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [selected, nodeCardMap, filter]);

  const handleNodeClick = useCallback((key: string) => {
    setSelected((prev) => (prev === key ? null : key));
    setTimeout(() => {
      panelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 50);
  }, []);

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
            <rect
              x="-1000" y="-1000" width="3000" height="3000"
              fill="rgba(10,10,20,0)"
            />

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

            {/* Target-flow arcs (drawn below markers) */}
            {targetArcs.map((arc, i) => {
              const maxWeight = targetArcs[0]?.weight ?? 1;
              const intensity = arc.weight / maxWeight;
              const sourceCat = dominantCategory(nodeCardMap.get(selected!) ?? []);
              const arcColor = catColor[sourceCat] ?? "#c9a84c";
              return (
                <Line
                  key={`${arc.targetKey}-${i}`}
                  from={arc.from}
                  to={arc.to}
                  stroke={arcColor}
                  strokeWidth={1 + intensity * 1.4}
                  strokeOpacity={0.35 + intensity * 0.45}
                  strokeLinecap="round"
                  strokeDasharray={i === 0 ? undefined : "3 3"}
                  style={{
                    filter: `drop-shadow(0 0 4px ${arcColor}55)`,
                  }}
                />
              );
            })}

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
              const radius = Math.min(5 + nodeCards.length * 0.9, 14);
              const isSelected = selected === node.key;
              const isHovered  = hovered === node.key;
              const isTargetOfArc = targetArcs.some((a) => a.targetKey === node.key);
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

                    {/* Target-of-arc highlight ring */}
                    {isTargetOfArc && (
                      <circle
                        r={radius + 3}
                        fill="none"
                        stroke="#f0c040"
                        strokeWidth="0.8"
                        strokeDasharray="2 2"
                        opacity="0.7"
                      />
                    )}

                    <circle
                      r={radius}
                      fill={active ? color : `${color}44`}
                      stroke={color}
                      strokeWidth={isSelected ? 2 : 1}
                      style={{ transition: "all 0.2s ease" }}
                    />

                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={radius > 10 ? 6.5 : 5.5}
                      fill={active ? "#0a0a0f" : color}
                      fontWeight="700"
                      style={{ pointerEvents: "none", fontFamily: "monospace" }}
                    >
                      {nodeCards.length}
                    </text>

                    <text
                      x={node.labelAnchor === "start" ? radius + 4 : node.labelAnchor === "end" ? -(radius + 4) : 0}
                      y={node.labelDy ?? -14}
                      textAnchor={node.labelAnchor ?? "middle"}
                      fontSize="5.5"
                      fill={active ? color : "rgba(201,168,76,0.55)"}
                      letterSpacing="0.06em"
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

          {hovered && (() => {
            const node = NODE_BY_KEY[hovered];
            if (!node) return null;
            const nodeCards = nodeCardMap.get(hovered) ?? [];
            const topCard = [...nodeCards].sort((a, b) => b.riskLevel - a.riskLevel)[0];

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
            className="lg:w-80 lg:flex-shrink-0"
          >
            <div
              style={{
                background: "rgba(26,26,46,0.95)",
                border: "1px solid rgba(201,168,76,0.2)",
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
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

              {/* Target geography arcs */}
              {targetArcs.length > 0 && (
                <div
                  style={{
                    padding: "10px 14px 6px",
                    borderBottom: "1px solid rgba(201,168,76,0.1)",
                  }}
                >
                  <div
                    style={{
                      color: "rgba(201,168,76,0.6)",
                      fontSize: "9px",
                      fontFamily: "var(--font-cinzel), serif",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      marginBottom: "6px",
                    }}
                  >
                    Top target regions
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {targetArcs.map((arc) => (
                      <span
                        key={arc.targetKey}
                        style={{
                          fontSize: "10px",
                          color: "#f0c040",
                          padding: "2px 6px",
                          borderRadius: 3,
                          background: "rgba(240,192,64,0.08)",
                          border: "1px solid rgba(240,192,64,0.2)",
                        }}
                      >
                        {arc.targetLabel} · {arc.weight}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Top target sectors */}
              {topTargetSectors.length > 0 && (
                <div
                  style={{
                    padding: "10px 14px 6px",
                    borderBottom: "1px solid rgba(201,168,76,0.1)",
                  }}
                >
                  <div
                    style={{
                      color: "rgba(201,168,76,0.6)",
                      fontSize: "9px",
                      fontFamily: "var(--font-cinzel), serif",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      marginBottom: "6px",
                    }}
                  >
                    Top target sectors
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {topTargetSectors.map((s) => (
                      <span
                        key={s.label}
                        style={{
                          fontSize: "10px",
                          color: "var(--color-silver)",
                          padding: "2px 6px",
                          borderRadius: 3,
                          background: "rgba(192,192,192,0.06)",
                          border: "1px solid rgba(192,192,192,0.16)",
                          opacity: 0.85,
                        }}
                      >
                        {s.label} · {s.count}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Card list */}
              <div style={{ maxHeight: "360px", overflowY: "auto", padding: "8px" }}>
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
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div
            style={{
              width: "16px",
              height: "2px",
              background: "#f0c040",
              borderRadius: 1,
            }}
          />
          <span style={{ fontSize: "10px", color: "var(--color-silver)", opacity: 0.45, fontFamily: "var(--font-cinzel), serif", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            = target-flow arc
          </span>
        </div>
      </div>
    </div>
  );
}
