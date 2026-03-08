"use client";

import { useEffect, useRef, useState, useCallback } from "react";
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
};

const CAT_COLOR: Record<string, string> = {
  "nation-state": "#4aadad",
  criminal:       "#9f7aea",
  hacktivist:     "#f97316",
  trickster:      "#c026a0",
  unknown:        "#b8b8c8",
};

const CATEGORIES = ["nation-state", "criminal", "hacktivist", "trickster", "unknown"];

export function GraphClient({ nodes, edges }: { nodes: GraphNode[]; edges: GraphEdge[] }) {
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 900, h: 600 });
  const [threshold, setThreshold] = useState(3);
  const [catFilter, setCatFilter] = useState<Set<string>>(new Set(CATEGORIES));

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

  const activeNodes = nodes.filter((n) => catFilter.has(n.category));
  const activeNodeIds = new Set(activeNodes.map((n) => n.id));
  const activeEdges = edges.filter(
    (e) => e.shared >= threshold && activeNodeIds.has(e.source) && activeNodeIds.has(e.target)
  );

  // Only include nodes that have at least one edge at current threshold
  const connectedIds = new Set(activeEdges.flatMap((e) => [e.source, e.target]));
  const graphNodes = activeNodes.map((n) => ({ ...n }));
  const graphLinks = activeEdges.map((e) => ({
    source: e.source,
    target: e.target,
    shared: e.shared,
  }));

  const graphData = { nodes: graphNodes, links: graphLinks };

  const nodeCanvasObject = useCallback(
    (node: Record<string, unknown>, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const r = 4 + (node.riskLevel as number) * 2;
      const color = CAT_COLOR[node.category as string] ?? "#b8b8c8";
      const x = node.x as number;
      const y = node.y as number;
      const isConnected = connectedIds.has(node.id as string);

      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = isConnected ? color : `${color}44`;
      ctx.fill();

      if (isConnected) {
        const fontSize = Math.max(8, 11 / globalScale);
        ctx.font = `${fontSize}px sans-serif`;
        ctx.fillStyle = "rgba(232,224,240,0.8)";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(node.name as string, x, y + r + 2);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [threshold, catFilter]
  );

  const linkColor = useCallback((link: Record<string, unknown>) => {
    const shared = link.shared as number;
    const opacity = Math.min(shared / 8, 0.8) + 0.1;
    return `rgba(201,168,76,${opacity.toFixed(2)})`;
  }, []);

  const linkWidth = useCallback((link: Record<string, unknown>) => {
    return 1 + (link.shared as number) * 0.5;
  }, []);

  const onNodeClick = useCallback(
    (node: Record<string, unknown>) => {
      router.push(`/card/${node.id as string}`);
    },
    [router]
  );

  function toggleCat(cat: string) {
    setCatFilter((prev) => {
      const s = new Set(prev);
      s.has(cat) ? s.delete(cat) : s.add(cat);
      return s;
    });
  }

  return (
    <div ref={wrapperRef} style={{ position: "relative", width: "100%", height: "100%" }}>
      <ForceGraph2D
        key={`${threshold}-${Array.from(catFilter).sort().join(",")}`}
        width={dims.w}
        height={dims.h}
        graphData={graphData}
        backgroundColor="transparent"
        nodeCanvasObject={nodeCanvasObject}
        nodeCanvasObjectMode={() => "replace"}
        linkColor={linkColor}
        linkWidth={linkWidth}
        onNodeClick={onNodeClick}
        nodeLabel={(node: Record<string, unknown>) =>
          `${node.cardTitle as string} (${node.name as string}) · ${node.origin as string}`
        }
        cooldownTicks={150}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
      />

      {/* Controls */}
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
            MIN SHARED TTPS
          </span>
          <input
            type="range"
            min={1}
            max={8}
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            style={{ width: 100, accentColor: "#c9a84c" }}
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

      {/* Legend */}
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
          CATEGORY
        </div>
        {CATEGORIES.map((cat) => (
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
          }}
        >
          Drag nodes · scroll to zoom · click to open
        </div>
      </div>
    </div>
  );
}
