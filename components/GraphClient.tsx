"use client";

import { useEffect, useRef, useState } from "react";
import type { RelationshipType, RelationshipStrength } from "@/data/relationships";

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
  type: RelationshipType;
  strength: RelationshipStrength;
  summary: string;
};

type PositionedNode = GraphNode & { x: number; y: number };

const CAT_COLOR: Record<string, string> = {
  "nation-state": "#4aadad",
  criminal: "#9f7aea",
  hacktivist: "#f97316",
  trickster: "#c026a0",
  unknown: "#b8b8c8",
};

const REL_COLOR: Record<RelationshipType, string> = {
  cluster:        "#f0c040", // gold — same actor
  lineage:        "#fb923c", // orange — evolved from
  personnel:      "#f472b6", // pink — shared people
  tooling:        "#a78bfa", // violet — shared malware
  infrastructure: "#60a5fa", // blue — shared C2/infra
  collaboration:  "#34d399", // green — operational partnership
  sponsor:        "#94a3b8", // slate — same state sponsor
  suspected:      "#6b7280", // gray — unconfirmed
};

const REL_LABEL: Record<RelationshipType, string> = {
  cluster:        "Same actor",
  lineage:        "Lineage",
  personnel:      "Personnel",
  tooling:        "Shared tooling",
  infrastructure: "Infrastructure",
  collaboration:  "Collaboration",
  sponsor:        "Same sponsor",
  suspected:      "Suspected",
};

const STRENGTH_OPACITY: Record<RelationshipStrength, number> = {
  confirmed: 0.9,
  assessed:  0.55,
  suspected: 0.25,
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
  const pos = nodes.map((n, i) => ({
    ...n,
    x: width / 2 + Math.cos((i / nodes.length) * 2 * Math.PI) * (Math.min(width, height) * 0.38),
    y: height / 2 + Math.sin((i / nodes.length) * 2 * Math.PI) * (Math.min(width, height) * 0.38),
    vx: 0,
    vy: 0,
  }));

  const idToIdx = new Map(pos.map((n, i) => [n.id, i]));
  const edgeList = edges
    .map((e) => ({ si: idToIdx.get(e.source)!, ti: idToIdx.get(e.target)! }))
    .filter((e) => e.si !== undefined && e.ti !== undefined);

  const TICKS = 400;
  const REPULSION = 4000;
  const LINK_DIST = 140;
  const LINK_STRENGTH = 0.4;
  const CENTER_STRENGTH = 0.04;
  const cx = width / 2;
  const cy = height / 2;

  for (let tick = 0; tick < TICKS; tick++) {
    const alpha = 1 - tick / TICKS;

    // Repulsion
    for (let i = 0; i < pos.length; i++) {
      for (let j = i + 1; j < pos.length; j++) {
        const dx = pos[j].x - pos[i].x || 0.01;
        const dy = pos[j].y - pos[i].y || 0.01;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (REPULSION / (dist * dist)) * alpha;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        pos[i].vx -= fx; pos[i].vy -= fy;
        pos[j].vx += fx; pos[j].vy += fy;
      }
    }

    // Link attraction
    for (const { si, ti } of edgeList) {
      const dx = pos[ti].x - pos[si].x;
      const dy = pos[ti].y - pos[si].y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const delta = (dist - LINK_DIST) / dist;
      const strength = LINK_STRENGTH * alpha * delta;
      pos[si].vx += dx * strength; pos[si].vy += dy * strength;
      pos[ti].vx -= dx * strength; pos[ti].vy -= dy * strength;
    }

    // Center + damping + clamp
    for (const n of pos) {
      n.vx += (cx - n.x) * CENTER_STRENGTH * alpha;
      n.vy += (cy - n.y) * CENTER_STRENGTH * alpha;
      n.vx *= 0.55; n.vy *= 0.55;
      n.x += n.vx; n.y += n.vy;
      const r = nodeRadius(n.riskLevel) + 8;
      n.x = Math.max(r, Math.min(width - r, n.x));
      n.y = Math.max(r, Math.min(height - r, n.y));
    }
  }

  return pos.map(({ vx: _vx, vy: _vy, ...rest }) => rest);
}

const ALL_TYPES = Object.keys(REL_COLOR) as RelationshipType[];

export function GraphClient({ nodes, edges }: { nodes: GraphNode[]; edges: GraphEdge[] }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 900, h: 600 });
  const [typeFilter, setTypeFilter] = useState<Set<RelationshipType>>(new Set(ALL_TYPES));
  const [strengthFilter, setStrengthFilter] = useState<Set<RelationshipStrength>>(
    new Set(["confirmed", "assessed", "suspected"] as RelationshipStrength[])
  );
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [hoverEdge, setHoverEdge] = useState<GraphEdge | null>(null);
  const [positioned, setPositioned] = useState<PositionedNode[]>([]);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setDims({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    setDims({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  const visibleEdges = edges.filter(
    (e) => typeFilter.has(e.type) && strengthFilter.has(e.strength)
  );

  useEffect(() => {
    setPositioned(runSimulation(nodes, visibleEdges, dims.w, dims.h));
    setPan({ x: 0, y: 0 });
    setZoom(1);
    setHoverId(null);
    setHoverEdge(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges, dims, typeFilter, strengthFilter]);

  const nodeMap = new Map(positioned.map((n) => [n.id, n]));

  // Hovered node connections
  const hoveredEdges = new Set<string>();
  const hoveredNeighbors = new Set<string>();
  if (hoverId) {
    for (const e of visibleEdges) {
      if (e.source === hoverId || e.target === hoverId) {
        hoveredEdges.add(`${e.source}--${e.target}`);
        hoveredNeighbors.add(e.source === hoverId ? e.target : e.source);
      }
    }
  }

  const hasHover = hoverId !== null;

  // Toggle helpers
  function toggleType(t: RelationshipType) {
    setTypeFilter((prev) => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });
  }

  function toggleStrength(s: RelationshipStrength) {
    setStrengthFilter((prev) => {
      const next = new Set(prev);
      next.has(s) ? next.delete(s) : next.add(s);
      return next;
    });
  }

  const hoveredNode = hoverId ? nodeMap.get(hoverId) : null;

  return (
    <div ref={wrapperRef} style={{ position: "relative", width: "100%", height: "100%" }}>
      <svg
        width={dims.w}
        height={dims.h}
        style={{ display: "block", cursor: isPanning.current ? "grabbing" : "grab", userSelect: "none" }}
        onWheel={(e) => {
          e.preventDefault();
          setZoom((z) => Math.max(0.25, Math.min(5, z * (e.deltaY < 0 ? 1.1 : 0.9))));
        }}
        onMouseDown={(e) => {
          if (e.button !== 0) return;
          isPanning.current = true;
          lastPos.current = { x: e.clientX, y: e.clientY };
        }}
        onMouseMove={(e) => {
          if (!isPanning.current) return;
          const dx = e.clientX - lastPos.current.x;
          const dy = e.clientY - lastPos.current.y;
          lastPos.current = { x: e.clientX, y: e.clientY };
          setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
        }}
        onMouseUp={() => { isPanning.current = false; }}
        onMouseLeave={() => { isPanning.current = false; }}
      >
        {/* Dashed stroke pattern for suspected */}
        <defs>
          <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="rgba(201,168,76,0.4)" />
          </marker>
        </defs>

        <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
          {/* Edges */}
          {visibleEdges.map((e) => {
            const a = nodeMap.get(e.source);
            const b = nodeMap.get(e.target);
            if (!a || !b) return null;
            const key = `${e.source}--${e.target}`;
            const isHighlighted = hoveredEdges.has(key);
            const isDimmed = hasHover && !isHighlighted;
            const baseOpacity = STRENGTH_OPACITY[e.strength];
            const opacity = isDimmed ? 0.04 : (isHighlighted ? 1 : baseOpacity);
            const color = REL_COLOR[e.type];
            const strokeW = isHighlighted ? 2.5 : (e.strength === "confirmed" ? 1.5 : 1);

            return (
              <line
                key={key}
                x1={a.x} y1={a.y}
                x2={b.x} y2={b.y}
                stroke={color}
                strokeOpacity={opacity}
                strokeWidth={strokeW}
                strokeDasharray={e.strength === "suspected" ? "4 4" : undefined}
                style={{ transition: "stroke-opacity 0.12s", cursor: "pointer" }}
                onMouseEnter={() => setHoverEdge(e)}
                onMouseLeave={() => setHoverEdge(null)}
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
            const hasEdges = visibleEdges.some((e) => e.source === node.id || e.target === node.id);

            return (
              <g
                key={node.id}
                transform={`translate(${node.x},${node.y})`}
                style={{ cursor: "pointer" }}
                onMouseEnter={() => { setHoverId(node.id); setHoverEdge(null); }}
                onMouseLeave={() => setHoverId(null)}
                onClick={() => window.open(`/card/${node.id}`, "_self")}
              >
                {isHovered && <circle r={r + 7} fill={color} opacity={0.2} />}
                <circle
                  r={r}
                  fill={color}
                  opacity={isDimmed ? 0.12 : (isHovered || isNeighbor ? 1 : hasEdges ? 0.85 : 0.35)}
                  style={{ transition: "opacity 0.12s" }}
                />
                {/* Dim ring on unconnected nodes */}
                {!hasEdges && (
                  <circle r={r} fill="none" stroke={color} strokeOpacity={0.2} strokeWidth={0.5} />
                )}
                {(isHovered || isNeighbor || zoom >= 1.8) && (
                  <text
                    y={r + 11}
                    textAnchor="middle"
                    fontSize={Math.max(10 / zoom, 3)}
                    fill={isDimmed ? "#444" : "#e8e0f0"}
                    style={{ pointerEvents: "none", userSelect: "none" }}
                  >
                    {node.name}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Hover tooltip — node */}
      {hoveredNode && !hoverEdge && (
        <div style={{
          position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)",
          background: "rgba(26,26,46,0.96)",
          border: `1px solid ${CAT_COLOR[hoveredNode.category] ?? "#c9a84c"}55`,
          borderRadius: 8, padding: "8px 16px", pointerEvents: "none", zIndex: 20,
          textAlign: "center", whiteSpace: "nowrap",
        }}>
          <div style={{ color: "#f0c040", fontFamily: "var(--font-cinzel), serif", fontSize: 13, fontWeight: 600 }}>
            {hoveredNode.cardTitle}
          </div>
          <div style={{ color: "#c0c0c0", fontSize: 11, marginTop: 2 }}>
            {hoveredNode.name} · {hoveredNode.origin}
          </div>
          <div style={{ color: CAT_COLOR[hoveredNode.category] ?? "#c9a84c", fontSize: 10, marginTop: 2 }}>
            {Array.from(hoveredEdges).length} documented relationship{Array.from(hoveredEdges).length !== 1 ? "s" : ""}
          </div>
          <div style={{ color: "#666", fontSize: 9, marginTop: 3 }}>Click to open card</div>
        </div>
      )}

      {/* Hover tooltip — edge */}
      {hoverEdge && (
        <div style={{
          position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)",
          background: "rgba(26,26,46,0.97)",
          border: `1px solid ${REL_COLOR[hoverEdge.type]}55`,
          borderRadius: 8, padding: "10px 16px", pointerEvents: "none", zIndex: 20,
          maxWidth: 360, textAlign: "center",
        }}>
          <div style={{ color: REL_COLOR[hoverEdge.type], fontSize: 10, fontFamily: "var(--font-cinzel), serif", letterSpacing: "0.06em", marginBottom: 5 }}>
            {REL_LABEL[hoverEdge.type].toUpperCase()} · {hoverEdge.strength.toUpperCase()}
          </div>
          <div style={{ color: "#e8e0f0", fontSize: 12, lineHeight: 1.5 }}>
            {hoverEdge.summary}
          </div>
        </div>
      )}

      {/* Controls */}
      <div style={{
        position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)",
        background: "rgba(10,10,15,0.9)", border: "1px solid rgba(201,168,76,0.15)",
        borderRadius: 12, padding: "10px 16px", zIndex: 10,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        backdropFilter: "blur(8px)", maxWidth: "90vw",
      }}>
        {/* Relationship type filters */}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "center" }}>
          {ALL_TYPES.map((t) => (
            <button key={t} onClick={() => toggleType(t)} style={{
              padding: "2px 8px", borderRadius: 99, cursor: "pointer",
              border: `1px solid ${REL_COLOR[t]}66`,
              background: typeFilter.has(t) ? `${REL_COLOR[t]}22` : "transparent",
              color: REL_COLOR[t], fontSize: 9,
              fontFamily: "var(--font-cinzel), serif", letterSpacing: "0.05em",
              opacity: typeFilter.has(t) ? 1 : 0.35,
              transition: "opacity 0.15s, background 0.15s",
            }}>
              {REL_LABEL[t]}
            </button>
          ))}
        </div>

        {/* Strength filters */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ color: "#c9a84c", fontSize: 9, opacity: 0.6, fontFamily: "var(--font-cinzel), serif" }}>Show:</span>
          {(["confirmed", "assessed", "suspected"] as RelationshipStrength[]).map((s) => (
            <button key={s} onClick={() => toggleStrength(s)} style={{
              padding: "2px 8px", borderRadius: 99, cursor: "pointer",
              border: "1px solid rgba(201,168,76,0.3)",
              background: strengthFilter.has(s) ? "rgba(201,168,76,0.15)" : "transparent",
              color: "#c9a84c", fontSize: 9,
              fontFamily: "var(--font-cinzel), serif",
              opacity: strengthFilter.has(s) ? 1 : 0.3,
              transition: "opacity 0.15s",
            }}>
              {s}
            </button>
          ))}
          <span style={{ color: "#888", fontSize: 9 }}>· {visibleEdges.length} shown · scroll to zoom · drag to pan</span>
        </div>
      </div>

      {/* Legend */}
      <div style={{
        position: "absolute", top: 80, right: 12,
        background: "rgba(10,10,15,0.85)", border: "1px solid rgba(201,168,76,0.12)",
        borderRadius: 8, padding: "10px 12px", zIndex: 10, backdropFilter: "blur(8px)",
      }}>
        <div style={{ color: "#c9a84c", fontSize: 9, fontFamily: "var(--font-cinzel), serif", opacity: 0.6, marginBottom: 7, letterSpacing: "0.06em" }}>
          RELATIONSHIP
        </div>
        {ALL_TYPES.map((t) => (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <div style={{ width: 16, height: t === "suspected" ? 0 : 2, borderTop: t === "suspected" ? `2px dashed ${REL_COLOR[t]}` : undefined, background: t === "suspected" ? undefined : REL_COLOR[t], flexShrink: 0, opacity: 0.8 }} />
            <span style={{ color: "#c0c0c0", fontSize: 9, opacity: 0.75 }}>{REL_LABEL[t]}</span>
          </div>
        ))}
        <div style={{ marginTop: 8, paddingTop: 7, borderTop: "1px solid rgba(201,168,76,0.1)" }}>
          <div style={{ color: "#c9a84c", fontSize: 9, fontFamily: "var(--font-cinzel), serif", opacity: 0.6, marginBottom: 5, letterSpacing: "0.06em" }}>
            GROUP
          </div>
          {Object.entries(CAT_COLOR).map(([cat, color]) => (
            <div key={cat} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
              <span style={{ color: "#c0c0c0", fontSize: 9, textTransform: "capitalize", opacity: 0.7 }}>{cat}</span>
            </div>
          ))}
          <div style={{ color: "#c0c0c0", fontSize: 9, opacity: 0.4, marginTop: 5 }}>Node size = risk level</div>
        </div>
      </div>
    </div>
  );
}
