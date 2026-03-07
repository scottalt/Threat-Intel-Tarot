"use client";

import { useEffect, useRef, useState, useCallback } from "react";
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
  detail: string;
  sources: string[];
};

type SimNode = GraphNode & { x: number; y: number; vx: number; vy: number };
type SimEdge = { si: number; ti: number; edge: GraphEdge };

// ─── Visual constants ────────────────────────────────────────────────────────

const CAT_COLOR: Record<string, string> = {
  "nation-state": "#4aadad",
  criminal:       "#9f7aea",
  hacktivist:     "#f97316",
  trickster:      "#c026a0",
  unknown:        "#b8b8c8",
};

const REL_COLOR: Record<RelationshipType, string> = {
  cluster:        "#f0c040",
  lineage:        "#fb923c",
  personnel:      "#f472b6",
  tooling:        "#a78bfa",
  infrastructure: "#60a5fa",
  collaboration:  "#34d399",
  sponsor:        "#94a3b8",
  suspected:      "#6b7280",
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
  confirmed: 0.85,
  assessed:  0.5,
  suspected: 0.22,
};

const ALL_TYPES = Object.keys(REL_COLOR) as RelationshipType[];

function nodeRadius(riskLevel: number) { return 5 + riskLevel * 2; }

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

// ─── Simulation ──────────────────────────────────────────────────────────────

function initPositions(nodes: GraphNode[], w: number, h: number): SimNode[] {
  return nodes.map((n, i) => ({
    ...n,
    x: w / 2 + Math.cos((i / nodes.length) * 2 * Math.PI) * Math.min(w, h) * 0.38,
    y: h / 2 + Math.sin((i / nodes.length) * 2 * Math.PI) * Math.min(w, h) * 0.38,
    vx: 0, vy: 0,
  }));
}

function simStep(nodes: SimNode[], edges: SimEdge[], alpha: number, w: number, h: number) {
  const REPULSION = 3500;
  const LINK_DIST  = 150;
  const LINK_STR   = 0.35;
  const cx = w / 2, cy = h / 2;

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[j].x - nodes[i].x || 0.01;
      const dy = nodes[j].y - nodes[i].y || 0.01;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const f = (REPULSION / (dist * dist)) * alpha;
      const fx = (dx / dist) * f, fy = (dy / dist) * f;
      nodes[i].vx -= fx; nodes[i].vy -= fy;
      nodes[j].vx += fx; nodes[j].vy += fy;
    }
  }

  for (const { si, ti } of edges) {
    const a = nodes[si], b = nodes[ti];
    const dx = b.x - a.x, dy = b.y - a.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const delta = ((dist - LINK_DIST) / dist) * LINK_STR * alpha;
    a.vx += dx * delta; a.vy += dy * delta;
    b.vx -= dx * delta; b.vy -= dy * delta;
  }

  for (const n of nodes) {
    n.vx += (cx - n.x) * 0.025 * alpha;
    n.vy += (cy - n.y) * 0.025 * alpha;
    n.vx *= 0.65; n.vy *= 0.65;
    n.x += n.vx; n.y += n.vy;
    const r = nodeRadius(n.riskLevel) + 6;
    n.x = Math.max(r, Math.min(w - r, n.x));
    n.y = Math.max(r, Math.min(h - r, n.y));
  }
}

// ─── Canvas draw ─────────────────────────────────────────────────────────────

function drawGraph(
  ctx: CanvasRenderingContext2D,
  nodes: SimNode[],
  edges: SimEdge[],
  nodeSet: Set<string>,      // nodes that have edges
  hoverId: string | null,
  selectedId: string | null,
  zoom: number,
  pan: { x: number; y: number },
  w: number,
  h: number,
) {
  ctx.clearRect(0, 0, w, h);
  ctx.save();
  ctx.translate(pan.x, pan.y);
  ctx.scale(zoom, zoom);

  const idToNode = new Map(nodes.map((n) => [n.id, n]));
  const hovNeighbors = new Set<string>();
  if (hoverId) {
    for (const { si, ti } of edges) {
      if (nodes[si].id === hoverId) hovNeighbors.add(nodes[ti].id);
      if (nodes[ti].id === hoverId) hovNeighbors.add(nodes[si].id);
    }
  }
  const selNeighbors = new Set<string>();
  if (selectedId) {
    for (const { si, ti } of edges) {
      if (nodes[si].id === selectedId) selNeighbors.add(nodes[ti].id);
      if (nodes[ti].id === selectedId) selNeighbors.add(nodes[si].id);
    }
  }

  const hasActive = hoverId !== null || selectedId !== null;

  // Edges
  for (const { si, ti, edge } of edges) {
    const a = nodes[si], b = nodes[ti];
    const isHovConn = hoverId && (a.id === hoverId || b.id === hoverId);
    const isSelConn = selectedId && (a.id === selectedId || b.id === selectedId);
    const dimmed = hasActive && !isHovConn && !isSelConn;
    const highlighted = isHovConn || isSelConn;

    const baseOp = STRENGTH_OPACITY[edge.strength];
    const opacity = dimmed ? 0.04 : highlighted ? 1 : baseOp;
    const color = REL_COLOR[edge.type];
    const rgb = hexToRgb(color);

    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.strokeStyle = `rgba(${rgb},${opacity})`;
    ctx.lineWidth = highlighted ? 2.5 : edge.strength === "confirmed" ? 1.5 : 1;

    if (edge.strength === "suspected") {
      ctx.setLineDash([5, 5]);
    } else {
      ctx.setLineDash([]);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Nodes
  for (const node of nodes) {
    const color = CAT_COLOR[node.category] ?? "#b8b8c8";
    const r = nodeRadius(node.riskLevel);
    const isHov = node.id === hoverId;
    const isSel = node.id === selectedId;
    const isHovNeigh = hovNeighbors.has(node.id);
    const isSelNeigh = selNeighbors.has(node.id);
    const hasEdge = nodeSet.has(node.id);
    const dimmed = hasActive && !isHov && !isSel && !isHovNeigh && !isSelNeigh;

    const baseOpacity = hasEdge ? 0.85 : 0.25;
    const opacity = dimmed ? 0.1 : (isHov || isSel ? 1 : baseOpacity);

    const rgb = hexToRgb(color);

    // Glow ring for hovered/selected
    if (isHov || isSel) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, r + 8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rgb},0.18)`;
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${rgb},${opacity})`;
    ctx.fill();

    // Labels: always on for connected nodes, others only when zoomed
    const showLabel = hasEdge || isHov || isSelNeigh || isHovNeigh || zoom >= 2;
    if (showLabel) {
      const labelOpacity = dimmed ? 0.15 : opacity;
      ctx.font = `${Math.max(11, 11 / zoom)}px sans-serif`;
      ctx.fillStyle = `rgba(232,224,240,${labelOpacity})`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(node.name, node.x, node.y + r + 4);
    }
  }

  ctx.restore();
}

// ─── Hit testing ─────────────────────────────────────────────────────────────

function hitNode(
  nodes: SimNode[],
  cx: number, cy: number,   // canvas coords
  zoom: number, pan: { x: number; y: number }
): SimNode | null {
  const wx = (cx - pan.x) / zoom;
  const wy = (cy - pan.y) / zoom;
  for (const n of nodes) {
    const r = nodeRadius(n.riskLevel) + 4;
    if ((wx - n.x) ** 2 + (wy - n.y) ** 2 <= r * r) return n;
  }
  return null;
}

function hitEdge(
  edges: SimEdge[],
  nodes: SimNode[],
  cx: number, cy: number,
  zoom: number, pan: { x: number; y: number }
): SimEdge | null {
  const wx = (cx - pan.x) / zoom;
  const wy = (cy - pan.y) / zoom;
  for (const e of edges) {
    const a = nodes[e.si], b = nodes[e.ti];
    const dx = b.x - a.x, dy = b.y - a.y;
    const len2 = dx * dx + dy * dy;
    if (len2 === 0) continue;
    const t = Math.max(0, Math.min(1, ((wx - a.x) * dx + (wy - a.y) * dy) / len2));
    const px = a.x + t * dx - wx;
    const py = a.y + t * dy - wy;
    if (px * px + py * py < (6 / zoom) ** 2) return e;
  }
  return null;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function GraphClient({ nodes, edges }: { nodes: GraphNode[]; edges: GraphEdge[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 900, h: 600 });

  // Filters
  const [typeFilter, setTypeFilter] = useState<Set<RelationshipType>>(new Set(ALL_TYPES));
  const [strengthFilter, setStrengthFilter] = useState<Set<RelationshipStrength>>(
    new Set(["confirmed", "assessed", "suspected"] as RelationshipStrength[])
  );

  // Interaction state (refs for canvas loop, state for React panels)
  const simNodes = useRef<SimNode[]>([]);
  const [hoverId, setHoverId]         = useState<string | null>(null);
  const [hoverEdge, setHoverEdge]     = useState<SimEdge | null>(null);
  const [selectedId, setSelectedId]   = useState<string | null>(null);
  const hoverIdRef    = useRef<string | null>(null);
  const hoverEdgeRef  = useRef<SimEdge | null>(null);
  const selectedIdRef = useRef<string | null>(null);

  // Pan / zoom
  const zoom = useRef(1);
  const pan  = useRef({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  // Drag
  const dragging = useRef<SimNode | null>(null);

  // Animation
  const rafRef   = useRef<number>(0);
  const alphaRef = useRef(1);
  const dirtyRef = useRef(true);

  // Measure container
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

  // Active edges from filters
  const activeEdges: GraphEdge[] = edges.filter(
    (e) => typeFilter.has(e.type) && strengthFilter.has(e.strength)
  );

  const nodeHasEdge = new Set(activeEdges.flatMap((e) => [e.source, e.target]));

  // Build SimEdge index whenever active edges change
  const simEdges = useRef<SimEdge[]>([]);
  useEffect(() => {
    const idToIdx = new Map(simNodes.current.map((n, i) => [n.id, i]));
    simEdges.current = activeEdges
      .map((edge) => ({ si: idToIdx.get(edge.source)!, ti: idToIdx.get(edge.target)!, edge }))
      .filter((e) => e.si !== undefined && e.ti !== undefined);
    alphaRef.current = 1; // reheat when filters change
    dirtyRef.current = true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(activeEdges.map((e) => e.source + e.target + e.type))]);

  // Init simulation when dims change
  useEffect(() => {
    if (dims.w === 0 || dims.h === 0) return;
    simNodes.current = initPositions(nodes, dims.w, dims.h);
    const idToIdx = new Map(simNodes.current.map((n, i) => [n.id, i]));
    simEdges.current = activeEdges
      .map((edge) => ({ si: idToIdx.get(edge.source)!, ti: idToIdx.get(edge.target)!, edge }))
      .filter((e) => e.si !== undefined && e.ti !== undefined);
    alphaRef.current = 1;
    zoom.current = 1;
    pan.current = { x: 0, y: 0 };
    dirtyRef.current = true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dims, nodes]);

  // RAF loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let alive = true;

    function loop() {
      if (!alive) return;
      rafRef.current = requestAnimationFrame(loop);

      // Advance simulation while alpha > 0
      if (alphaRef.current > 0.005) {
        simStep(simNodes.current, simEdges.current, alphaRef.current, dims.w, dims.h);
        alphaRef.current *= 0.97;
        dirtyRef.current = true;
      }

      if (dirtyRef.current) {
        const ctx = (canvas as HTMLCanvasElement).getContext("2d");
        if (ctx) {
          drawGraph(
            ctx, simNodes.current, simEdges.current, nodeHasEdge,
            hoverIdRef.current, selectedIdRef.current,
            zoom.current, pan.current, dims.w, dims.h
          );
        }
        dirtyRef.current = false;
      }
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => { alive = false; cancelAnimationFrame(rafRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dims, nodeHasEdge]);

  // Mouse handlers
  const onMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    if (isPanning.current) {
      pan.current = {
        x: pan.current.x + (cx - lastMouse.current.x),
        y: pan.current.y + (cy - lastMouse.current.y),
      };
      lastMouse.current = { x: cx, y: cy };
      dirtyRef.current = true;
      return;
    }

    if (dragging.current) {
      const wx = (cx - pan.current.x) / zoom.current;
      const wy = (cy - pan.current.y) / zoom.current;
      dragging.current.x = wx;
      dragging.current.y = wy;
      dragging.current.vx = 0;
      dragging.current.vy = 0;
      alphaRef.current = 0.3; // gentle reheat for neighbouring nodes
      dirtyRef.current = true;
      return;
    }

    const node = hitNode(simNodes.current, cx, cy, zoom.current, pan.current);
    const newHov = node?.id ?? null;
    if (newHov !== hoverIdRef.current) {
      hoverIdRef.current = newHov;
      setHoverId(newHov);
      dirtyRef.current = true;
    }

    if (!node) {
      const edge = hitEdge(simEdges.current, simNodes.current, cx, cy, zoom.current, pan.current);
      if (edge !== hoverEdgeRef.current) {
        hoverEdgeRef.current = edge;
        setHoverEdge(edge);
        dirtyRef.current = true;
      }
    } else {
      hoverEdgeRef.current = null;
      setHoverEdge(null);
    }
  }, []);

  const onMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const node = hitNode(simNodes.current, cx, cy, zoom.current, pan.current);
    if (node) {
      dragging.current = node;
    } else {
      isPanning.current = true;
      lastMouse.current = { x: cx, y: cy };
    }
  }, []);

  const onMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    if (dragging.current) {
      dragging.current = null;
    } else if (!isPanning.current) {
      // click — select node or deselect
    }

    if (isPanning.current) {
      isPanning.current = false;
      // If mouse barely moved, treat as click
      const moved = Math.abs(e.clientX - rect.left - lastMouse.current.x) +
                    Math.abs(e.clientY - rect.top - lastMouse.current.y);
      if (moved < 4) {
        const node = hitNode(simNodes.current, cx, cy, zoom.current, pan.current);
        const newSel = node ? (node.id === selectedIdRef.current ? null : node.id) : null;
        selectedIdRef.current = newSel;
        setSelectedId(newSel);
        dirtyRef.current = true;
      }
    } else {
      const node = hitNode(simNodes.current, cx, cy, zoom.current, pan.current);
      if (node) {
        const newSel = node.id === selectedIdRef.current ? null : node.id;
        selectedIdRef.current = newSel;
        setSelectedId(newSel);
        dirtyRef.current = true;
      }
    }

    isPanning.current = false;
  }, []);

  const onWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const rect = canvasRef.current!.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const factor = e.deltaY < 0 ? 1.12 : 0.88;
    const newZoom = Math.max(0.2, Math.min(6, zoom.current * factor));
    // Zoom toward cursor
    pan.current = {
      x: cx - (cx - pan.current.x) * (newZoom / zoom.current),
      y: cy - (cy - pan.current.y) * (newZoom / zoom.current),
    };
    zoom.current = newZoom;
    dirtyRef.current = true;
  }, []);

  // Selected node's edges
  const selectedEdges = selectedId
    ? activeEdges.filter((e) => e.source === selectedId || e.target === selectedId)
    : [];
  const selectedNode = selectedId ? nodes.find((n) => n.id === selectedId) : null;

  function toggleType(t: RelationshipType) {
    setTypeFilter((prev) => { const s = new Set(prev); s.has(t) ? s.delete(t) : s.add(t); return s; });
  }
  function toggleStrength(s: RelationshipStrength) {
    setStrengthFilter((prev) => { const set = new Set(prev); set.has(s) ? set.delete(s) : set.add(s); return set; });
  }

  return (
    <div ref={wrapperRef} style={{ position: "relative", width: "100%", height: "100%" }}>
      <canvas
        ref={canvasRef}
        width={dims.w}
        height={dims.h}
        style={{ display: "block", background: "transparent", cursor: dragging.current ? "grabbing" : hoverId ? "pointer" : "grab" }}
        onMouseMove={onMouseMove}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseLeave={() => {
          isPanning.current = false;
          dragging.current = null;
          hoverIdRef.current = null;
          hoverEdgeRef.current = null;
          setHoverId(null);
          setHoverEdge(null);
          dirtyRef.current = true;
        }}
        onWheel={onWheel}
      />

      {/* Edge hover tooltip */}
      {hoverEdge && !hoverId && (
        <div style={{
          position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)",
          background: "rgba(26,26,46,0.97)",
          border: `1px solid ${REL_COLOR[hoverEdge.edge.type]}55`,
          borderRadius: 8, padding: "10px 16px", pointerEvents: "none", zIndex: 20,
          maxWidth: 380, textAlign: "center",
        }}>
          <div style={{ color: REL_COLOR[hoverEdge.edge.type], fontSize: 10, fontFamily: "var(--font-cinzel), serif", letterSpacing: "0.06em", marginBottom: 5 }}>
            {REL_LABEL[hoverEdge.edge.type].toUpperCase()} · {hoverEdge.edge.strength.toUpperCase()}
          </div>
          <div style={{ color: "#e8e0f0", fontSize: 12, lineHeight: 1.5 }}>
            {hoverEdge.edge.summary}
          </div>
          <div style={{ color: "#888", fontSize: 10, marginTop: 5 }}>Click to see full detail</div>
        </div>
      )}

      {/* Node hover tooltip (when nothing selected) */}
      {hoverId && !selectedId && (() => {
        const n = nodes.find((x) => x.id === hoverId);
        if (!n) return null;
        const connCount = activeEdges.filter((e) => e.source === hoverId || e.target === hoverId).length;
        return (
          <div style={{
            position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)",
            background: "rgba(26,26,46,0.95)",
            border: `1px solid ${CAT_COLOR[n.category] ?? "#c9a84c"}55`,
            borderRadius: 8, padding: "8px 16px", pointerEvents: "none", zIndex: 20,
            textAlign: "center", whiteSpace: "nowrap",
          }}>
            <div style={{ color: "#f0c040", fontFamily: "var(--font-cinzel), serif", fontSize: 13, fontWeight: 600 }}>{n.cardTitle}</div>
            <div style={{ color: "#c0c0c0", fontSize: 11, marginTop: 2 }}>{n.name} · {n.origin}</div>
            {connCount > 0
              ? <div style={{ color: CAT_COLOR[n.category], fontSize: 10, marginTop: 2 }}>{connCount} documented relationship{connCount !== 1 ? "s" : ""} · click for detail</div>
              : <div style={{ color: "#555", fontSize: 10, marginTop: 2 }}>No relationships documented yet · click to open card</div>
            }
          </div>
        );
      })()}

      {/* Detail panel */}
      {selectedNode && (
        <div style={{
          position: "absolute", top: 0, right: 0, bottom: 0, width: "min(380px, 90vw)",
          background: "rgba(10,10,15,0.96)",
          borderLeft: `1px solid ${CAT_COLOR[selectedNode.category] ?? "#c9a84c"}33`,
          overflowY: "auto", zIndex: 30, padding: "16px",
          backdropFilter: "blur(12px)",
        }}>
          {/* Close */}
          <button
            onClick={() => { setSelectedId(null); selectedIdRef.current = null; dirtyRef.current = true; }}
            style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", color: "#888", fontSize: 18, cursor: "pointer", lineHeight: 1 }}
          >
            ×
          </button>

          {/* Card info */}
          <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid rgba(201,168,76,0.12)" }}>
            <div style={{ color: "#f0c040", fontFamily: "var(--font-cinzel), serif", fontSize: 15, fontWeight: 600, marginBottom: 4, paddingRight: 24 }}>
              {selectedNode.cardTitle}
            </div>
            <div style={{ color: "#e8e0f0", fontSize: 13, marginBottom: 4 }}>{selectedNode.name}</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 10, color: CAT_COLOR[selectedNode.category] ?? "#c9a84c", background: `${CAT_COLOR[selectedNode.category] ?? "#c9a84c"}18`, border: `1px solid ${CAT_COLOR[selectedNode.category] ?? "#c9a84c"}33`, borderRadius: 4, padding: "1px 6px", textTransform: "capitalize" }}>
                {selectedNode.category}
              </span>
              <span style={{ fontSize: 10, color: "#c0c0c0", opacity: 0.6 }}>{selectedNode.origin}</span>
            </div>
            <a href={`/card/${selectedNode.id}`} style={{ display: "inline-block", marginTop: 10, fontSize: 10, color: "#c9a84c", opacity: 0.7, fontFamily: "var(--font-cinzel), serif", letterSpacing: "0.06em", textDecoration: "none" }}>
              Open full card →
            </a>
          </div>

          {/* Relationships */}
          {selectedEdges.length === 0 ? (
            <div style={{ color: "#555", fontSize: 12, textAlign: "center", marginTop: 24 }}>
              No documented relationships yet.<br />
              <span style={{ fontSize: 10, opacity: 0.6 }}>This group will be researched in a future update.</span>
            </div>
          ) : (
            <div>
              <div style={{ color: "#c9a84c", fontSize: 10, fontFamily: "var(--font-cinzel), serif", opacity: 0.6, letterSpacing: "0.06em", marginBottom: 12 }}>
                {selectedEdges.length} DOCUMENTED RELATIONSHIP{selectedEdges.length !== 1 ? "S" : ""}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {selectedEdges.map((edge, i) => {
                  const otherId = edge.source === selectedId ? edge.target : edge.source;
                  const other = nodes.find((n) => n.id === otherId);
                  const relColor = REL_COLOR[edge.type];
                  return (
                    <div key={i} style={{
                      borderLeft: `3px solid ${relColor}`,
                      paddingLeft: 12,
                      paddingBottom: 12,
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                    }}>
                      {/* Type + strength */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                        <span style={{ fontSize: 9, color: relColor, fontFamily: "var(--font-cinzel), serif", letterSpacing: "0.05em", background: `${relColor}18`, border: `1px solid ${relColor}33`, borderRadius: 4, padding: "1px 6px" }}>
                          {REL_LABEL[edge.type]}
                        </span>
                        <span style={{ fontSize: 9, color: "#888", letterSpacing: "0.04em" }}>
                          {edge.strength}
                        </span>
                      </div>

                      {/* Other group */}
                      {other && (
                        <a href={`/card/${other.id}`} style={{ display: "block", color: "#f0c040", fontSize: 12, fontWeight: 600, marginBottom: 6, textDecoration: "none", opacity: 0.9 }}>
                          {other.cardTitle}
                          <span style={{ color: "#c0c0c0", fontWeight: 400, fontSize: 11, marginLeft: 6 }}>{other.name}</span>
                        </a>
                      )}

                      {/* Summary */}
                      <p style={{ color: "#e8e0f0", fontSize: 12, lineHeight: 1.6, margin: "0 0 8px" }}>
                        {edge.summary}
                      </p>

                      {/* Detail */}
                      <p style={{ color: "#a0a0b0", fontSize: 11, lineHeight: 1.6, margin: "0 0 8px" }}>
                        {edge.detail}
                      </p>

                      {/* Sources */}
                      <div>
                        <div style={{ color: "#666", fontSize: 9, fontFamily: "var(--font-cinzel), serif", letterSpacing: "0.05em", marginBottom: 4 }}>SOURCES</div>
                        {edge.sources.map((src, j) => (
                          <div key={j} style={{ color: "#555", fontSize: 10, lineHeight: 1.5, paddingLeft: 8, borderLeft: "1px solid #333", marginBottom: 2 }}>
                            {src}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <div style={{
        position: "absolute", bottom: 16,
        left: selectedId ? `calc(50% - min(190px, 45vw))` : "50%",
        transform: "translateX(-50%)",
        background: "rgba(10,10,15,0.9)", border: "1px solid rgba(201,168,76,0.15)",
        borderRadius: 12, padding: "10px 14px", zIndex: 10,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 7,
        backdropFilter: "blur(8px)", maxWidth: "calc(100vw - 40px)",
        transition: "left 0.2s",
      }}>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "center" }}>
          {ALL_TYPES.map((t) => (
            <button key={t} onClick={() => toggleType(t)} style={{
              padding: "2px 7px", borderRadius: 99, cursor: "pointer",
              border: `1px solid ${REL_COLOR[t]}55`,
              background: typeFilter.has(t) ? `${REL_COLOR[t]}20` : "transparent",
              color: REL_COLOR[t], fontSize: 9,
              fontFamily: "var(--font-cinzel), serif",
              opacity: typeFilter.has(t) ? 1 : 0.3,
              transition: "opacity 0.12s, background 0.12s",
            }}>{REL_LABEL[t]}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          <span style={{ color: "#c9a84c", fontSize: 9, opacity: 0.6, fontFamily: "var(--font-cinzel), serif" }}>Strength:</span>
          {(["confirmed", "assessed", "suspected"] as RelationshipStrength[]).map((s) => (
            <button key={s} onClick={() => toggleStrength(s)} style={{
              padding: "2px 7px", borderRadius: 99, cursor: "pointer",
              border: "1px solid rgba(201,168,76,0.25)",
              background: strengthFilter.has(s) ? "rgba(201,168,76,0.12)" : "transparent",
              color: "#c9a84c", fontSize: 9, fontFamily: "var(--font-cinzel), serif",
              opacity: strengthFilter.has(s) ? 1 : 0.3,
              transition: "opacity 0.12s",
            }}>{s}</button>
          ))}
          <span style={{ color: "#666", fontSize: 9 }}>· {activeEdges.length} shown</span>
        </div>
      </div>

      {/* Legend */}
      <div style={{
        position: "absolute", top: selectedId ? "auto" : 80, bottom: selectedId ? 80 : "auto",
        right: selectedId ? `calc(min(380px, 90vw) + 12px)` : 12,
        background: "rgba(10,10,15,0.85)", border: "1px solid rgba(201,168,76,0.12)",
        borderRadius: 8, padding: "10px 12px", zIndex: 10, backdropFilter: "blur(8px)",
        transition: "right 0.2s, top 0.2s, bottom 0.2s",
      }}>
        <div style={{ color: "#c9a84c", fontSize: 9, fontFamily: "var(--font-cinzel), serif", opacity: 0.6, marginBottom: 7, letterSpacing: "0.06em" }}>RELATIONSHIP</div>
        {ALL_TYPES.map((t) => (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <div style={{
              width: 16, height: 2,
              borderTop: t === "suspected" ? `2px dashed ${REL_COLOR[t]}` : undefined,
              background: t === "suspected" ? "transparent" : REL_COLOR[t],
              flexShrink: 0, opacity: 0.85,
            }} />
            <span style={{ color: "#c0c0c0", fontSize: 9, opacity: 0.75 }}>{REL_LABEL[t]}</span>
          </div>
        ))}
        <div style={{ marginTop: 8, paddingTop: 7, borderTop: "1px solid rgba(201,168,76,0.1)", color: "#666", fontSize: 9 }}>
          Drag nodes · scroll to zoom
        </div>
      </div>
    </div>
  );
}
