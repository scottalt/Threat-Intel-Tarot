import type { Metadata } from "next";
import { cards } from "@/data/cards";
import { SiteNav } from "@/components/SiteNav";
import { Starfield } from "@/components/Starfield";
import { GraphClient } from "@/components/GraphClient";
import type { GraphNode, GraphEdge } from "@/components/GraphClient";

export const metadata: Metadata = {
  title: "Adversary Relationship Graph | Threat Intelligence Tarot",
  description:
    "Interactive force-directed graph showing connections between adversary groups based on shared MITRE ATT&CK techniques.",
};

function buildGraphData(): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = cards.map((c) => ({
    id: c.slug,
    name: c.name,
    cardTitle: c.cardTitle,
    category: c.category,
    riskLevel: c.riskLevel,
    origin: c.origin,
  }));

  const edges: GraphEdge[] = [];
  for (let i = 0; i < cards.length; i++) {
    const idsA = new Set(cards[i].ttps.map((t) => t.techniqueId));
    for (let j = i + 1; j < cards.length; j++) {
      const shared = cards[j].ttps.filter((t) => idsA.has(t.techniqueId)).length;
      if (shared >= 1) {
        edges.push({ source: cards[i].slug, target: cards[j].slug, shared });
      }
    }
  }

  return { nodes, edges };
}

export default function GraphPage() {
  const { nodes, edges } = buildGraphData();
  const defaultThreshold = 3;
  const defaultEdges = edges.filter((e) => e.shared >= defaultThreshold).length;

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
          <p
            style={{
              color: "var(--color-silver)",
              opacity: 0.45,
              fontSize: 11,
              marginTop: 4,
            }}
          >
            {nodes.length} adversaries · {defaultEdges} connections at default threshold · drag nodes · click to open card
          </p>
        </div>
      </div>

      <div style={{ flex: 1, position: "relative", zIndex: 5 }}>
        <GraphClient nodes={nodes} edges={edges} />
      </div>
    </main>
  );
}
