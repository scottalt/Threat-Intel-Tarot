import type { Metadata } from "next";
import { cards } from "@/data/cards";
import { SiteNav } from "@/components/SiteNav";
import { Starfield } from "@/components/Starfield";
import { GraphClient } from "@/components/GraphClient";
import type { GraphNode, GraphEdge } from "@/components/GraphClient";

export const metadata: Metadata = {
  title: "Adversary Relationship Graph | Threat Intelligence Tarot",
  description:
    "Interactive force-directed graph showing connections between 78 adversary groups based on shared MITRE ATT&CK techniques.",
};

function buildGraphData(): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = cards.map((card) => ({
    id: card.slug,
    name: card.name,
    cardTitle: card.cardTitle,
    category: card.category,
    riskLevel: card.riskLevel,
    origin: card.origin,
    ttpCount: card.ttps.length,
  }));

  const edges: GraphEdge[] = [];
  for (let i = 0; i < cards.length; i++) {
    const a = cards[i];
    const aIds = new Set(a.ttps.map((t) => t.techniqueId));
    for (let j = i + 1; j < cards.length; j++) {
      const b = cards[j];
      let shared = 0;
      for (const ttp of b.ttps) {
        if (aIds.has(ttp.techniqueId)) shared++;
      }
      if (shared >= 2) {
        edges.push({ source: a.slug, target: b.slug, shared });
      }
    }
  }

  return { nodes, edges };
}

export default function GraphPage() {
  const { nodes, edges } = buildGraphData();
  const totalEdges = edges.filter((e) => e.shared >= 5).length;

  return (
    <main
      id="main-content"
      style={{
        position: "relative",
        width: "100vw",
        height: "100dvh",
        overflow: "hidden",
        background: "var(--color-void)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Starfield />

      {/* Header */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          padding: "16px 20px 0",
          flexShrink: 0,
        }}
      >
        <SiteNav current="/graph" />
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <h1
            style={{
              fontFamily: "var(--font-cinzel), serif",
              color: "var(--color-gold-bright)",
              fontSize: "clamp(16px, 3vw, 24px)",
              fontWeight: 600,
              margin: 0,
            }}
          >
            Adversary Relationship Graph
          </h1>
          <p style={{ color: "var(--color-silver)", opacity: 0.45, fontSize: 11, marginTop: 4 }}>
            {nodes.length} groups · {totalEdges} connections at default threshold · click a node to open its card
          </p>
        </div>
      </div>

      {/* Graph — fills remaining height */}
      <div style={{ flex: 1, position: "relative", zIndex: 5 }}>
        <GraphClient nodes={nodes} edges={edges} />
      </div>
    </main>
  );
}
