"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

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

const CAT_COLOR: Record<string, string> = {
  "nation-state": "#4aadad",
  criminal: "#9f7aea",
  hacktivist: "#f97316",
  trickster: "#c026a0",
  unknown: "#b8b8c8",
};

export function GraphClient({ nodes, edges }: { nodes: GraphNode[]; edges: GraphEdge[] }) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [threshold, setThreshold] = useState(3);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [tooltip, setTooltip] = useState<{ x: number; y: number; node: GraphNode; connections: number } | null>(null);
  const [hoverNode, setHoverNode] = useState<GraphNode | null>(null);

  useEffect(() => {
    function update() {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const categories = ["all", ...Array.from(new Set(nodes.map((n) => n.category))).sort()];

  const filteredNodes = categoryFilter === "all" ? nodes : nodes.filter((n) => n.category === categoryFilter);
  const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));

  const filteredEdges = edges.filter(
    (e) =>
      e.shared >= threshold &&
      filteredNodeIds.has(e.source) &&
      filteredNodeIds.has(e.target)
  );

  // Count connections per node for tooltip
  const connectionCount = new Map<string, number>();
  for (const edge of filteredEdges) {
    connectionCount.set(edge.source, (connectionCount.get(edge.source) ?? 0) + 1);
    connectionCount.set(edge.target, (connectionCount.get(edge.target) ?? 0) + 1);
  }

  const graphData = {
    nodes: filteredNodes.map((n) => ({ ...n })),
    links: filteredEdges.map((e) => ({ ...e })),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodeColor = useCallback((node: any) => CAT_COLOR[(node as GraphNode).category] ?? "#b8b8c8", []);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodeVal = useCallback((node: any) => Math.pow(2 + (node as GraphNode).riskLevel * 1.5, 2), []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const linkColor = useCallback((link: any) => {
    const opacity = Math.min((link as GraphEdge).shared / 8, 0.8) + 0.1;
    return `rgba(201,168,76,${opacity.toFixed(2)})`;
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const linkWidth = useCallback((link: any) => 0.5 + (link as GraphEdge).shared * 0.4, []);

  const onNodeClick = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (node: any) => {
      router.push(`/card/${(node as GraphNode).id}`);
    },
    [router]
  );

  const onNodeHover = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (node: any) => {
      setHoverNode(node as GraphNode | null);
      if (!node) {
        setTooltip(null);
      }
    },
    []
  );

  const onNodeRightClick = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (node: any, event: MouseEvent) => {
      const n = node as GraphNode;
      event.preventDefault();
      setTooltip({
        x: event.clientX,
        y: event.clientY,
        node: n,
        connections: connectionCount.get(n.id) ?? 0,
      });
    },
    [connectionCount]
  );

  const paintNode = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (rawNode: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const node = rawNode as GraphNode & { x?: number; y?: number };
      const x = node.x ?? 0;
      const y = node.y ?? 0;
      const r = Math.sqrt(nodeVal(node)) * 0.8;
      const color = nodeColor(node);
      const isHovered = hoverNode?.id === node.id;

      // Glow for hovered
      if (isHovered) {
        ctx.beginPath();
        ctx.arc(x, y, r + 4, 0, 2 * Math.PI);
        ctx.fillStyle = `${color}33`;
        ctx.fill();
      }

      // Node circle
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      ctx.fillStyle = isHovered ? color : `${color}bb`;
      ctx.fill();

      // Label at higher zoom
      if (globalScale >= 1.8 || isHovered) {
        const label = node.name;
        const fontSize = Math.max(10 / globalScale, 3);
        ctx.font = `${fontSize}px sans-serif`;
        ctx.fillStyle = "#e8e0f0";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(label, x, y + r + fontSize + 1);
      }
    },
    [nodeColor, nodeVal, hoverNode]
  );

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
        <ForceGraph2D
          graphData={graphData}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="#0a0a0f"
          nodeId="id"
          nodeLabel=""
          nodeColor={nodeColor}
          nodeVal={nodeVal}
          linkColor={linkColor}
          linkWidth={linkWidth}
          onNodeClick={onNodeClick}
          onNodeHover={onNodeHover}
          onNodeRightClick={onNodeRightClick}
          nodeCanvasObject={paintNode}
          nodeCanvasObjectMode={() => "replace"}
          cooldownTicks={120}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
          linkDirectionalParticles={0}
        />
      </div>

      {/* Hover tooltip */}
      {hoverNode && (
        <div
          style={{
            position: "absolute",
            top: 16,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(26,26,46,0.95)",
            border: `1px solid ${CAT_COLOR[hoverNode.category] ?? "#c9a84c"}44`,
            borderRadius: 8,
            padding: "8px 14px",
            pointerEvents: "none",
            zIndex: 20,
            textAlign: "center",
          }}
        >
          <div style={{ color: "#f0c040", fontFamily: "var(--font-cinzel), serif", fontSize: 13, fontWeight: 600 }}>
            {hoverNode.cardTitle}
          </div>
          <div style={{ color: "#c0c0c0", fontSize: 11, marginTop: 2 }}>
            {hoverNode.name} · {hoverNode.origin}
          </div>
          <div style={{ color: CAT_COLOR[hoverNode.category] ?? "#c9a84c", fontSize: 10, marginTop: 2, opacity: 0.8 }}>
            {connectionCount.get(hoverNode.id) ?? 0} connections at threshold {threshold} · {hoverNode.ttpCount} TTPs
          </div>
          <div style={{ color: "#c0c0c0", fontSize: 9, marginTop: 3, opacity: 0.4 }}>
            Click to open card · Right-click to pin
          </div>
        </div>
      )}

      {/* Pinned tooltip */}
      {tooltip && (
        <div
          style={{
            position: "fixed",
            top: tooltip.y + 12,
            left: tooltip.x + 12,
            background: "rgba(26,26,46,0.97)",
            border: `1px solid ${CAT_COLOR[tooltip.node.category] ?? "#c9a84c"}66`,
            borderRadius: 8,
            padding: "10px 14px",
            zIndex: 30,
            fontSize: 12,
            maxWidth: 220,
            cursor: "pointer",
          }}
          onClick={() => setTooltip(null)}
        >
          <div style={{ color: "#f0c040", fontFamily: "var(--font-cinzel), serif", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
            {tooltip.node.cardTitle}
          </div>
          <div style={{ color: "#e8e0f0", marginBottom: 2 }}>{tooltip.node.name}</div>
          <div style={{ color: "#c0c0c0", fontSize: 10, opacity: 0.7 }}>
            {tooltip.node.origin} · {tooltip.node.category}
          </div>
          <div style={{ color: "#c9a84c", fontSize: 10, marginTop: 4 }}>
            {tooltip.connections} connections · {tooltip.node.ttpCount} TTPs
          </div>
          <div style={{ color: "#c0c0c0", fontSize: 9, marginTop: 6, opacity: 0.4 }}>Click to dismiss</div>
        </div>
      )}

      {/* Controls overlay */}
      <div
        style={{
          position: "absolute",
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(10,10,15,0.85)",
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
        {/* Threshold slider */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%" }}>
          <span style={{ color: "#c9a84c", fontSize: 10, fontFamily: "var(--font-cinzel), serif", opacity: 0.7, whiteSpace: "nowrap" }}>
            Min shared TTPs
          </span>
          <input
            type="range"
            min={1}
            max={8}
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            style={{ flex: 1, accentColor: "#c9a84c" }}
          />
          <span style={{ color: "#f0c040", fontSize: 13, fontFamily: "var(--font-cinzel), serif", minWidth: 16, textAlign: "center" }}>
            {threshold}
          </span>
        </div>

        {/* Category filter */}
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

        {/* Stats */}
        <div style={{ color: "#c0c0c0", fontSize: 9, opacity: 0.4 }}>
          {filteredNodes.length} groups · {filteredEdges.length} connections
        </div>
      </div>

      {/* Legend */}
      <div
        style={{
          position: "absolute",
          top: 80,
          right: 16,
          background: "rgba(10,10,15,0.8)",
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
          <div style={{ color: "#c9a84c", fontSize: 9, fontFamily: "var(--font-cinzel), serif", opacity: 0.6, marginBottom: 6, letterSpacing: "0.06em" }}>
            NODE SIZE
          </div>
          <div style={{ color: "#c0c0c0", fontSize: 9, opacity: 0.55 }}>= Risk level</div>
          <div style={{ color: "#c9a84c", fontSize: 9, opacity: 0.55, marginTop: 4 }}>Edge brightness</div>
          <div style={{ color: "#c0c0c0", fontSize: 9, opacity: 0.55 }}>= Shared TTPs</div>
        </div>
      </div>
    </div>
  );
}
