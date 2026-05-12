"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

export type GraphNode = {
  id: string;
  name: string;
  cardTitle: string;
  category: string;
  riskLevel: number;
  origin: string;
};

export type GraphEdge = {
  source: string;
  target: string;
  shared: number;
  type?: string;
  strength?: string;
  summary?: string;
};

export type EdgeMode = "ttp" | "targets" | "origin" | "curated";

export type EdgeSets = Record<EdgeMode, GraphEdge[]>;

const CAT_COLOR: Record<string, string> = {
  "nation-state": "#4aadad",
  criminal:       "#9f7aea",
  hacktivist:     "#f97316",
  trickster:      "#c026a0",
  unknown:        "#b8b8c8",
};

const CATEGORIES = ["nation-state", "criminal", "hacktivist", "trickster", "unknown"];

const MODE_META: Record<EdgeMode, { label: string; defaultThreshold: number; min: number; max: number; thresholdLabel: string }> = {
  ttp:      { label: "TTPs",        defaultThreshold: 3, min: 1, max: 8, thresholdLabel: "MIN SHARED TTPS" },
  targets:  { label: "Targets",     defaultThreshold: 2, min: 1, max: 6, thresholdLabel: "MIN SHARED TARGETS" },
  origin:   { label: "Origin",      defaultThreshold: 1, min: 1, max: 1, thresholdLabel: "SAME ORIGIN" },
  curated:  { label: "Curated",     defaultThreshold: 1, min: 1, max: 5, thresholdLabel: "MIN STRENGTH" },
};

// Curated relationship type → edge color
const CURATED_TYPE_COLOR: Record<string, string> = {
  cluster:        "#f0c040",
  lineage:        "#e040a0",
  personnel:      "#4aadad",
  tooling:        "#9f7aea",
  infrastructure: "#f97316",
  collaboration:  "#4ade80",
  sponsor:        "#c9a84c",
  suspected:      "#888",
};

export function GraphClient({ nodes, edges }: { nodes: GraphNode[]; edges: EdgeSets }) {
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 900, h: 600 });
  const [mode, setMode] = useState<EdgeMode>("ttp");
  const [threshold, setThreshold] = useState(MODE_META.ttp.defaultThreshold);
  const [catFilter, setCatFilter] = useState<Set<string>>(new Set(CATEGORIES));
  const [search, setSearch] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setDims({ w: el.clientWidth, h: el.clientHeight });
    });
    ro.observe(el);
    setDims({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  // When mode changes, reset threshold to that mode's default
  useEffect(() => {
    setThreshold(MODE_META[mode].defaultThreshold);
  }, [mode]);

  const searchLower = search.trim().toLowerCase();
  const matchesSearch = useCallback(
    (n: GraphNode) =>
      !searchLower ||
      n.name.toLowerCase().includes(searchLower) ||
      n.cardTitle.toLowerCase().includes(searchLower) ||
      n.id.toLowerCase().includes(searchLower) ||
      n.origin.toLowerCase().includes(searchLower),
    [searchLower]
  );

  const activeNodes = nodes.filter((n) => catFilter.has(n.category));
  const activeNodeIds = new Set(activeNodes.map((n) => n.id));
  const activeEdges = (edges[mode] ?? []).filter(
    (e) => e.shared >= threshold && activeNodeIds.has(e.source) && activeNodeIds.has(e.target)
  );

  // Adjacency (used for hover-highlight)
  const adjacency = useMemo(() => {
    const adj = new Map<string, Set<string>>();
    for (const e of activeEdges) {
      if (!adj.has(e.source)) adj.set(e.source, new Set());
      if (!adj.has(e.target)) adj.set(e.target, new Set());
      adj.get(e.source)!.add(e.target);
      adj.get(e.target)!.add(e.source);
    }
    return adj;
  }, [activeEdges]);

  // Only include nodes that have at least one edge at current threshold
  const connectedIds = new Set(activeEdges.flatMap((e) => [e.source, e.target]));

  const graphNodes = activeNodes.map((n) => ({ ...n }));
  const graphLinks = activeEdges.map((e) => ({
    source: e.source,
    target: e.target,
    shared: e.shared,
    type: e.type,
    strength: e.strength,
    summary: e.summary,
  }));

  const graphData = { nodes: graphNodes, links: graphLinks };

  // Hover/search highlighting decisions
  const highlightedNodeIds = useMemo(() => {
    const s = new Set<string>();
    if (hoveredId) {
      s.add(hoveredId);
      (adjacency.get(hoveredId) ?? new Set()).forEach((n) => s.add(n));
    }
    if (searchLower) {
      for (const n of activeNodes) if (matchesSearch(n)) s.add(n.id);
    }
    return s;
  }, [hoveredId, adjacency, searchLower, activeNodes, matchesSearch]);

  const hasActiveFocus = hoveredId !== null || searchLower !== "";

  const nodeCanvasObject = useCallback(
    (node: Record<string, unknown>, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const r = 4 + (node.riskLevel as number) * 2;
      const baseColor = CAT_COLOR[node.category as string] ?? "#b8b8c8";
      const x = node.x as number;
      const y = node.y as number;
      const id = node.id as string;
      const isConnected = connectedIds.has(id);
      const isHighlighted = highlightedNodeIds.has(id);

      // Opacity logic:
      //  - When focus is active (hover or search), highlighted nodes full, others dim
      //  - When no focus, connected nodes full, isolated dim
      let opacity: number;
      if (hasActiveFocus) {
        opacity = isHighlighted ? 1 : 0.08;
      } else {
        opacity = isConnected ? 1 : 0.27;
      }

      ctx.globalAlpha = opacity;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = baseColor;
      ctx.fill();

      if (isHighlighted && hasActiveFocus) {
        ctx.lineWidth = 2 / globalScale;
        ctx.strokeStyle = "#f0c040";
        ctx.stroke();
      }

      // Label for connected nodes; always for highlighted
      if (isConnected || isHighlighted) {
        const fontSize = Math.max(8, 11 / globalScale);
        ctx.font = `${fontSize}px sans-serif`;
        ctx.fillStyle = isHighlighted ? "#f0c040" : "rgba(232,224,240,0.8)";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(node.name as string, x, y + r + 2);
      }

      ctx.globalAlpha = 1;
    },
    [connectedIds, highlightedNodeIds, hasActiveFocus]
  );

  const linkColor = useCallback(
    (link: Record<string, unknown>) => {
      const sourceId =
        typeof link.source === "object" && link.source !== null
          ? (link.source as { id: string }).id
          : (link.source as string);
      const targetId =
        typeof link.target === "object" && link.target !== null
          ? (link.target as { id: string }).id
          : (link.target as string);

      const linkInFocus =
        hasActiveFocus &&
        highlightedNodeIds.has(sourceId) &&
        highlightedNodeIds.has(targetId);

      if (mode === "curated") {
        const t = link.type as string;
        const baseColor = CURATED_TYPE_COLOR[t] ?? "#c9a84c";
        const strength = link.strength as string;
        const baseOpacity = strength === "confirmed" ? 0.8 : strength === "assessed" ? 0.55 : 0.32;
        if (hasActiveFocus && !linkInFocus) {
          return `${baseColor}10`;
        }
        // Convert hex + alpha
        return hexAlpha(baseColor, baseOpacity);
      }

      const shared = link.shared as number;
      const baseOpacity = Math.min(shared / 8, 0.8) + 0.1;
      if (hasActiveFocus && !linkInFocus) {
        return `rgba(201,168,76,0.05)`;
      }
      return `rgba(201,168,76,${baseOpacity.toFixed(2)})`;
    },
    [mode, hasActiveFocus, highlightedNodeIds]
  );

  const linkWidth = useCallback(
    (link: Record<string, unknown>) => {
      if (mode === "curated") {
        const strength = link.strength as string;
        return strength === "confirmed" ? 2.6 : strength === "assessed" ? 1.6 : 0.9;
      }
      return 1 + (link.shared as number) * 0.5;
    },
    [mode]
  );

  const onNodeClick = useCallback(
    (node: Record<string, unknown>) => {
      router.push(`/card/${node.id as string}`);
    },
    [router]
  );

  const onNodeHover = useCallback((node: Record<string, unknown> | null) => {
    setHoveredId(node ? (node.id as string) : null);
  }, []);

  function toggleCat(cat: string) {
    setCatFilter((prev) => {
      const s = new Set(prev);
      if (s.has(cat)) s.delete(cat);
      else s.add(cat);
      return s;
    });
  }

  return (
    <div ref={wrapperRef} style={{ position: "relative", width: "100%", height: "100%" }}>
      <ForceGraph2D
        key={`${mode}-${threshold}-${Array.from(catFilter).sort().join(",")}`}
        width={dims.w}
        height={dims.h}
        graphData={graphData}
        backgroundColor="transparent"
        nodeCanvasObject={nodeCanvasObject}
        nodeCanvasObjectMode={() => "replace"}
        linkColor={linkColor}
        linkWidth={linkWidth}
        onNodeClick={onNodeClick}
        onNodeHover={onNodeHover}
        nodeLabel={(node: Record<string, unknown>) =>
          `${node.cardTitle as string} (${node.name as string}) · ${node.origin as string}`
        }
        linkLabel={(link: Record<string, unknown>) => {
          if (mode === "curated") {
            return `${link.type as string} · ${link.strength as string}\n${link.summary as string}`;
          }
          return `${link.shared as number} shared ${mode}`;
        }}
        cooldownTicks={150}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
      />

      {/* Search box — top-left */}
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "rgba(10,10,15,0.9)",
          border: "1px solid rgba(201,168,76,0.18)",
          borderRadius: 8,
          padding: "6px 10px",
          backdropFilter: "blur(8px)",
        }}
      >
        <span style={{ fontSize: 11, color: "rgba(201,168,76,0.55)" }}>⌕</span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search adversary..."
          aria-label="Search adversaries"
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            color: "#e8e0f0",
            fontSize: 11,
            fontFamily: "var(--font-cinzel), serif",
            letterSpacing: "0.04em",
            width: 160,
          }}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            aria-label="Clear search"
            style={{
              background: "none",
              border: "none",
              color: "rgba(201,168,76,0.55)",
              cursor: "pointer",
              fontSize: 12,
              padding: 0,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* Controls — bottom center */}
      <div
        style={{
          position: "absolute",
          bottom: 16,
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(10,10,15,0.9)",
          border: "1px solid rgba(201,168,76,0.15)",
          borderRadius: 12,
          padding: "10px 16px",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          backdropFilter: "blur(8px)",
          maxWidth: "calc(100vw - 32px)",
        }}
      >
        {/* Mode toggle */}
        <div style={{ display: "flex", gap: 4 }}>
          {(Object.keys(MODE_META) as EdgeMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              title={modeTooltip(m)}
              style={{
                padding: "3px 10px",
                borderRadius: 4,
                cursor: "pointer",
                border: `1px solid ${mode === m ? "#f0c040" : "rgba(201,168,76,0.25)"}`,
                background: mode === m ? "rgba(240,192,64,0.16)" : "transparent",
                color: mode === m ? "#f0c040" : "rgba(201,168,76,0.55)",
                fontSize: 10,
                fontFamily: "var(--font-cinzel), serif",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                transition: "all 0.15s",
              }}
            >
              {MODE_META[m].label}
            </button>
          ))}
        </div>

        {/* Threshold slider */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              color: "#c9a84c",
              fontSize: 9,
              fontFamily: "var(--font-cinzel), serif",
              opacity: 0.7,
              whiteSpace: "nowrap",
            }}
          >
            {MODE_META[mode].thresholdLabel}
          </span>
          <input
            type="range"
            min={MODE_META[mode].min}
            max={MODE_META[mode].max}
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            disabled={MODE_META[mode].min === MODE_META[mode].max}
            style={{ width: 100, accentColor: "#c9a84c", opacity: MODE_META[mode].min === MODE_META[mode].max ? 0.3 : 1 }}
          />
          <span
            style={{
              color: "#f0c040",
              fontSize: 13,
              fontFamily: "var(--font-cinzel), serif",
              minWidth: 14,
              textAlign: "center",
            }}
          >
            {threshold}
          </span>
          <span style={{ color: "#555", fontSize: 9 }}>· {activeEdges.length} edges</span>
        </div>

        {/* Category filter */}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "center" }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => toggleCat(cat)}
              style={{
                padding: "2px 8px",
                borderRadius: 99,
                cursor: "pointer",
                border: `1px solid ${CAT_COLOR[cat]}55`,
                background: catFilter.has(cat) ? `${CAT_COLOR[cat]}25` : "transparent",
                color: CAT_COLOR[cat],
                fontSize: 9,
                fontFamily: "var(--font-cinzel), serif",
                textTransform: "capitalize",
                opacity: catFilter.has(cat) ? 1 : 0.3,
                transition: "opacity 0.12s, background 0.12s",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Legend — top right */}
      <div
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          background: "rgba(10,10,15,0.85)",
          border: "1px solid rgba(201,168,76,0.12)",
          borderRadius: 8,
          padding: "10px 12px",
          zIndex: 10,
          backdropFilter: "blur(8px)",
          maxWidth: 200,
        }}
      >
        <div
          style={{
            color: "#c9a84c",
            fontSize: 9,
            fontFamily: "var(--font-cinzel), serif",
            opacity: 0.6,
            marginBottom: 7,
            letterSpacing: "0.06em",
          }}
        >
          {mode === "curated" ? "RELATIONSHIP TYPE" : "CATEGORY"}
        </div>
        {mode === "curated"
          ? Object.entries(CURATED_TYPE_COLOR).map(([type, color]) => (
              <div key={type} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                <div style={{ width: 14, height: 2, background: color, flexShrink: 0 }} />
                <span style={{ color: "#c0c0c0", fontSize: 9, textTransform: "capitalize" }}>{type}</span>
              </div>
            ))
          : CATEGORIES.map((cat) => (
              <div key={cat} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: CAT_COLOR[cat],
                    flexShrink: 0,
                  }}
                />
                <span style={{ color: "#c0c0c0", fontSize: 9, textTransform: "capitalize" }}>{cat}</span>
              </div>
            ))}
        <div
          style={{
            marginTop: 8,
            paddingTop: 7,
            borderTop: "1px solid rgba(201,168,76,0.1)",
            color: "#666",
            fontSize: 9,
            lineHeight: 1.4,
          }}
        >
          Drag · scroll to zoom · hover to highlight · click to open
        </div>
      </div>
    </div>
  );
}

function modeTooltip(m: EdgeMode): string {
  switch (m) {
    case "ttp": return "Edges between groups that share MITRE ATT&CK techniques.";
    case "targets": return "Edges between groups that target the same sectors or regions.";
    case "origin": return "Edges between groups that operate from the same country or sponsor.";
    case "curated": return "Hand-curated attribution-grade relationships (indictments, vendor reports).";
  }
}

// Apply alpha 0-1 to a hex color like "#f0c040"
function hexAlpha(hex: string, alpha: number): string {
  const a = Math.max(0, Math.min(1, alpha));
  const aHex = Math.round(a * 255).toString(16).padStart(2, "0");
  return `${hex}${aHex}`;
}
