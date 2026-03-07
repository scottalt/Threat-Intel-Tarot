"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export type GraphNode = {
  id: string;
  name: string;
  cardTitle: string;
  category: string;
  riskLevel: number;
  origin: string;
  ttpCount: number;
};

export type GraphEdge = {
  source: string;
  target: string;
  shared: number;
};

type PositionedNode = GraphNode & { x: number; y: number };

const CAT_COLOR: Record<string, string> = {
  "nation-state": "#4aadad",
  criminal: "#9f7aea",
  hacktivist: "#f97316",
  trickster: "#c026a0",
  unknown: "#b8b8c8",
};

function nodeRadius(riskLevel: number) {
  return 4 + riskLevel * 2;
}

function runSimulation(
  nodes: GraphNode[],
  edges: GraphEdge[],
  width: number,
  height: number
): PositionedNode[] {
  // Inline simulation — avoids importing d3-force in a way that breaks SSR
  // We use a simplified force-directed layout: repulsion + attraction + centering
  const pos = nodes.map((n, i) => ({
    ...n,
    x: width / 2 + Math.cos((i / nodes.length) * 2 * Math.PI) * (Math.min(width, height) * 0.35),
    y: height / 2 + Math.sin((i / nodes.length) * 2 * Math.PI) * (Math.min(width, height) * 0.35),
    vx: 0,
    vy: 0,
  }));

  const idToIdx = new Map(pos.map((n, i) => [n.id, i]));
  const edgeList = edges
    .map((e) => ({ si: idToIdx.get(e.source)!, ti: idToIdx.get(e.target)!, shared: e.shared }))
    .filter((e) => e.si !== undefined && e.ti !== undefined);

  const TICKS = 300;
  const REPULSION = 3500;
  const LINK_DIST = 120;
  const LINK_STRENGTH = 0.3;
  const CENTER_STRENGTH = 0.05;
  const cx = width / 2;
  const cy = height / 2;

  for (let tick = 0; tick < TICKS; tick++) {
    const alpha = 1 - tick / TICKS;

    // Repulsion between all pairs
    for (let i = 0; i < pos.length; i++) {
      for (let j = i + 1; j < pos.length; j++) {
        const dx = pos[j].x - pos[i].x || 0.01;
        const dy = pos[j].y - pos[i].y || 0.01;
        const dist2 = dx * dx + dy * dy || 1;
        const force = (REPULSION / dist2) * alpha;
        pos[i].vx -= (dx / Math.sqrt(dist2)) * force;
        pos[i].vy -= (dy / Math.sqrt(dist2)) * force;
        pos[j].vx += (dx / Math.sqrt(dist2)) * force;
        pos[j].vy += (dy / Math.sqrt(dist2)) * force;
      }
    }

    // Link attraction
    for (const { si, ti, shared } of edgeList) {
      const dx = pos[ti].x - pos[si].x;
      const dy = pos[ti].y - pos[si].y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const targetDist = LINK_DIST / Math.sqrt(shared);
      const delta = (dist - targetDist) / dist;
      const strength = LINK_STRENGTH * alpha * delta;
      pos[si].vx += dx * strength;
      pos[si].vy += dy * strength;
      pos[ti].vx -= dx * strength;
      pos[ti].vy -= dy * strength;
    }

    // Centering
    for (const n of pos) {
      n.vx += (cx - n.x) * CENTER_STRENGTH * alpha;
      n.vy += (cy - n.y) * CENTER_STRENGTH * alpha;
      // Damping
      n.vx *= 0.6;
      n.vy *= 0.6;
      n.x += n.vx;
      n.y += n.vy;
      // Clamp to bounds with padding
      const r = nodeRadius(n.riskLevel);
      n.x = Math.max(r + 10, Math.min(width - r - 10, n.x));
      n.y = Math.max(r + 10, Math.min(height - r - 10, n.y));
    }
  }

  return pos.map(({ vx, vy, ...rest }) => rest);
}

export function GraphClient({ nodes, edges }: { nodes: GraphNode[]; edges: GraphEdge[] }) {
  const containerRef = useRef<SVGSVGElement>(null);
  const [dims, setDims] = useState({ w: 900, h: 600 });
  const [threshold, setThreshold] = useState(5);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [positioned, setPositioned] = useState<PositionedNode[]>([]);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const lastPan = useRef({ x: 0, y: 0 });

  // Measure container
  useEffect(() => {
    const el = containerRef.current?.parentElement;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setDims({ w: el.clientWidth, h: el.clientHeight });
    });
    ro.observe(el);
    setDims({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  // Re-run simulation when filter/threshold/dims change
  useEffect(() => {
    const filteredNodes = categoryFilter === "all" ? nodes : nodes.filter((n) => n.category === categoryFilter);
    const filteredIds = new Set(filteredNodes.map((n) => n.id));
    const filteredEdges = edges.filter(
      (e) => e.shared >= threshold && filteredIds.has(e.source) && filteredIds.has(e.target)
    );
    const result = runSimulation(filteredNodes, filteredEdges, dims.w, dims.h);
    setPositioned(result);
    setPan({ x: 0, y: 0 });
    setZoom(1);
    setHoverId(null);
  }, [nodes, edges, threshold, categoryFilter, dims]);

  const filteredIds = new Set(
    (categoryFilter === "all" ? nodes : nodes.filter((n) => n.category === categoryFilter)).map((n) => n.id)
  );
  const visibleEdges = edges.filter(
    (e) => e.shared >= threshold && filteredIds.has(e.source) && filteredIds.has(e.target)
  );

  const nodeMap = new Map(positioned.map((n) => [n.id, n]));

  // Edges connected to hovered node
  const hoveredEdgeSet = new Set<string>();
  const hoveredNeighbors = new Set<string>();
  if (hoverId) {
    for (const e of visibleEdges) {
      if (e.source === hoverId || e.target === hoverId) {
        hoveredEdgeSet.add(`${e.source}--${e.target}`);
        hoveredNeighbors.add(e.source === hoverId ? e.target : e.source);
      }
    }
  }

  const connectionCount = new Map<string, number>();
  for (const e of visibleEdges) {
    connectionCount.set(e.source, (connectionCount.get(e.source) ?? 0) + 1);
    connectionCount.set(e.target, (connectionCount.get(e.target) ?? 0) + 1);
  }

  // Zoom / pan handlers
  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.max(0.3, Math.min(4, z * (e.deltaY < 0 ? 1.1 : 0.9))));
  }, []);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    isPanning.current = true;
    lastPan.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning.current) return;
    const dx = e.clientX - lastPan.current.x;
    const dy = e.clientY - lastPan.current.y;
    lastPan.current = { x: e.clientX, y: e.clientY };
    setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
  }, []);

  const onMouseUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  const categories = ["all", ...Array.from(new Set(nodes.map((n) => n.category))).sort()];
  const hoveredNode = hoverId ? nodeMap.get(hoverId) : null;

  const hasHover = hoverId !== null;

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <svg
        ref={containerRef}
        width={dims.w}
        height={dims.h}
        style={{ display: "block", cursor: isPanning.current ? "grabbing" : "grab" }}
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
          {/* Edges */}
          {visibleEdges.map((e) => {
            const a = nodeMap.get(e.source);
            const b = nodeMap.get(e.target);
            if (!a || !b) return null;
            const key = `${e.source}--${e.target}`;
            const isHighlighted = hoveredEdgeSet.has(key);
            const isDimmed = hasHover && !isHighlighted;
            const opacity = isDimmed ? 0.04 : (Math.min(e.shared / 8, 0.7) + 0.1);
            const strokeW = isDimmed ? 0.5 : (0.5 + e.shared * 0.35);
            return (
              <line
                key={key}
                x1={a.x} y1={a.y}
                x2={b.x} y2={b.y}
                stroke={isHighlighted ? "#f0c040" : "rgba(201,168,76,1)"}
                strokeOpacity={opacity}
                strokeWidth={strokeW}
                style={{ transition: "stroke-opacity 0.15s, stroke-width 0.15s" }}
              />
            );
          })}

          {/* Nodes */}
          {positioned.map((node) => {
            const color = CAT_COLOR[node.category] ?? "#b8b8c8";
            const r = nodeRadius(node.riskLevel);
            const isHovered = hoverId === node.id;
            const isNeighbor = hoveredNeighbors.has(node.id);
            const isDimmed = hasHover && !isHovered && !isNeighbor;
            return (
              <g
                key={node.id}
                transform={`translate(${node.x},${node.y})`}
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHoverId(node.id)}
                onMouseLeave={() => setHoverId(null)}
                onClick={() => window.open(`/card/${node.id}`, "_self")}
              >
                {isHovered && (
                  <circle r={r + 6} fill={color} opacity={0.2} />
                )}
                <circle
                  r={r}
                  fill={color}
                  opacity={isDimmed ? 0.15 : (isHovered || isNeighbor ? 1 : 0.75)}
                  style={{ transition: "opacity 0.15s" }}
                />
                {/* Label — always show on hover, show at zoom >= 1.8 otherwise */}
                {(isHovered || isNeighbor || zoom >= 1.8) && (
                  <text
                    y={r + 10}
                    textAnchor="middle"
                    fontSize={isHovered ? 11 / zoom : 9 / zoom}
                    fill={isDimmed ? "#555" : "#e8e0f0"}
                    style={{ pointerEvents: "none", userSelect: "none", transition: "fill 0.15s" }}
                  >
                    {node.name}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Hover tooltip */}
      {hoveredNode && (
        <div
          style={{
            position: "absolute",
            top: 12,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(26,26,46,0.96)",
            border: `1px solid ${CAT_COLOR[hoveredNode.category] ?? "#c9a84c"}55`,
            borderRadius: 8,
            padding: "8px 16px",
            pointerEvents: "none",
            zIndex: 20,
            textAlign: "center",
            whiteSpace: "nowrap",
          }}
        >
          <div style={{ color: "#f0c040", fontFamily: "var(--font-cinzel), serif", fontSize: 13, fontWeight: 600 }}>
            {hoveredNode.cardTitle}
          </div>
          <div style={{ color: "#c0c0c0", fontSize: 11, marginTop: 2 }}>
            {hoveredNode.name} · {hoveredNode.origin}
          </div>
          <div style={{ color: CAT_COLOR[hoveredNode.category] ?? "#c9a84c", fontSize: 10, marginTop: 2 }}>
            {connectionCount.get(hoveredNode.id) ?? 0} connections at this threshold · {hoveredNode.ttpCount} TTPs
          </div>
          <div style={{ color: "#888", fontSize: 9, marginTop: 3 }}>Click to open card</div>
        </div>
      )}

      {/* Controls */}
      <div
        style={{
          position: "absolute",
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(10,10,15,0.88)",
          border: "1px solid rgba(201,168,76,0.15)",
          borderRadius: 12,
          padding: "12px 20px",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
          backdropFilter: "blur(8px)",
          minWidth: 320,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%" }}>
          <span style={{ color: "#c9a84c", fontSize: 10, fontFamily: "var(--font-cinzel), serif", opacity: 0.7, whiteSpace: "nowrap" }}>
            Min shared TTPs
          </span>
          <input
            type="range" min={2} max={12} value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            style={{ flex: 1, accentColor: "#c9a84c" }}
          />
          <span style={{ color: "#f0c040", fontSize: 13, fontFamily: "var(--font-cinzel), serif", minWidth: 16, textAlign: "center" }}>
            {threshold}
          </span>
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              style={{
                padding: "3px 10px",
                borderRadius: 99,
                border: `1px solid ${cat === "all" ? "rgba(201,168,76,0.4)" : `${CAT_COLOR[cat] ?? "#c9a84c"}66`}`,
                background: categoryFilter === cat
                  ? cat === "all" ? "rgba(201,168,76,0.15)" : `${CAT_COLOR[cat] ?? "#c9a84c"}22`
                  : "transparent",
                color: cat === "all" ? "#c9a84c" : (CAT_COLOR[cat] ?? "#c9a84c"),
                fontSize: 9,
                fontFamily: "var(--font-cinzel), serif",
                letterSpacing: "0.06em",
                textTransform: "capitalize",
                cursor: "pointer",
                opacity: categoryFilter === cat ? 1 : 0.55,
                transition: "opacity 0.15s, background 0.15s",
              }}
            >
              {cat === "all" ? "All Groups" : cat}
            </button>
          ))}
        </div>

        <div style={{ color: "#c0c0c0", fontSize: 9, opacity: 0.4 }}>
          {positioned.length} groups · {visibleEdges.length} connections · scroll to zoom · drag to pan
        </div>
      </div>

      {/* Legend */}
      <div
        style={{
          position: "absolute",
          top: 80,
          right: 16,
          background: "rgba(10,10,15,0.82)",
          border: "1px solid rgba(201,168,76,0.12)",
          borderRadius: 8,
          padding: "10px 14px",
          zIndex: 10,
          backdropFilter: "blur(8px)",
        }}
      >
        <div style={{ color: "#c9a84c", fontSize: 9, fontFamily: "var(--font-cinzel), serif", opacity: 0.6, marginBottom: 8, letterSpacing: "0.06em" }}>
          CATEGORY
        </div>
        {Object.entries(CAT_COLOR).map(([cat, color]) => (
          <div key={cat} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
            <span style={{ color: "#c0c0c0", fontSize: 10, textTransform: "capitalize", opacity: 0.75 }}>{cat}</span>
          </div>
        ))}
        <div style={{ marginTop: 10, paddingTop: 8, borderTop: "1px solid rgba(201,168,76,0.1)" }}>
          <div style={{ color: "#c0c0c0", fontSize: 9, opacity: 0.5 }}>Node size = risk level</div>
          <div style={{ color: "#c9a84c", fontSize: 9, opacity: 0.5, marginTop: 3 }}>Edge brightness = shared TTPs</div>
        </div>
      </div>
    </div>
  );
}
