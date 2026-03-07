import type { Metadata } from "next";
import { cards } from "@/data/cards";
import { relationships } from "@/data/relationships";
import { SiteNav } from "@/components/SiteNav";
import { Starfield } from "@/components/Starfield";
import { GraphClient } from "@/components/GraphClient";
import type { GraphNode, GraphEdge } from "@/components/GraphClient";

export const metadata: Metadata = {
  title: "Adversary Relationship Graph | Threat Intelligence Tarot",
  description:
    "Interactive graph of documented relationships between adversary groups — shared members, tooling, lineage, infrastructure, and state sponsorship.",
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

  const edges: GraphEdge[] = relationships.map((r) => ({
    source: r.a,
    target: r.b,
    type: r.type,
    strength: r.strength,
    summary: r.summary,
    detail: r.detail,
    sources: r.sources,
  }));

  return { nodes, edges };
}

export default function GraphPage() {
  const { nodes, edges } = buildGraphData();
  const confirmed = edges.filter((e) => e.strength === "confirmed").length;

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
          <p style={{ color: "var(--color-silver)", opacity: 0.45, fontSize: 11, marginTop: 4 }}>
            {edges.length} documented relationships · {confirmed} confirmed · hover to inspect · click to open card
          </p>
        </div>
      </div>

      <div style={{ flex: 1, position: "relative", zIndex: 5 }}>
        <GraphClient nodes={nodes} edges={edges} />
      </div>
    </main>
  );
}
