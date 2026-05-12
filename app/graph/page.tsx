import type { Metadata } from "next";
import { cards } from "@/data/cards";
import { relationships } from "@/data/relationships";
import { SiteNav } from "@/components/SiteNav";
import { Starfield } from "@/components/Starfield";
import { GraphClient } from "@/components/GraphClient";
import type { GraphNode, GraphEdge, EdgeSets } from "@/components/GraphClient";

export const metadata: Metadata = {
  title: "Adversary Relationship Graph | Threat Intelligence Tarot",
  description:
    "Interactive force-directed graph showing connections between adversary groups by shared TTPs, shared targets, shared origin, or curated attribution relationships.",
};

function normalizeOrigin(origin: string): string {
  const o = origin.toLowerCase();
  if (o.includes("russia") || o.includes("gru") || o.includes("fsb") || o.includes("svr")) return "russia";
  if (o.includes("china") || o.includes("mss") || o.includes("pla")) return "china";
  if (o.includes("iran") || o.includes("irgc") || o.includes("mois")) return "iran";
  if (o.includes("north korea") || o.includes("dprk") || o.includes("rgb")) return "dprk";
  if (o.includes("usa") || o.includes("nsa")) return "usa";
  if (o.includes("uae") || o.includes("emirat")) return "uae";
  if (o.includes("israel")) return "israel";
  if (o.includes("turkey")) return "turkey";
  if (o.includes("belarus")) return "belarus";
  if (o.includes("vietnam")) return "vietnam";
  if (o.includes("ukraine")) return "ukraine";
  if (o.includes("hamas") || o.includes("gaza") || o.includes("palestin")) return "palestine";
  if (o.includes("syria")) return "syria";
  if (o.includes("pakistan")) return "pakistan";
  if (o.includes("india")) return "india";
  if (o.includes("brazil")) return "brazil";
  if (o.includes("colombia")) return "colombia";
  if (o.includes("criminal")) return "criminal";
  if (o.includes("hacktivist")) return "hacktivist";
  return "other";
}

function buildEdgeSets(): { nodes: GraphNode[]; edges: EdgeSets } {
  const nodes: GraphNode[] = cards.map((c) => ({
    id: c.slug,
    name: c.name,
    cardTitle: c.cardTitle,
    category: c.category,
    riskLevel: c.riskLevel,
    origin: c.origin,
  }));

  const ttp: GraphEdge[] = [];
  const targets: GraphEdge[] = [];
  const origin: GraphEdge[] = [];

  const cardOrigins = cards.map((c) => normalizeOrigin(c.origin));
  const cardTargetSets = cards.map(
    (c) => new Set(c.targets.map((t) => t.toLowerCase().trim()))
  );
  const cardTtpSets = cards.map(
    (c) => new Set(c.ttps.map((t) => t.techniqueId))
  );

  for (let i = 0; i < cards.length; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      // TTP overlap
      let ttpShared = 0;
      for (const id of cardTtpSets[i]) if (cardTtpSets[j].has(id)) ttpShared++;
      if (ttpShared >= 1) {
        ttp.push({ source: cards[i].slug, target: cards[j].slug, shared: ttpShared });
      }

      // Target overlap
      let tShared = 0;
      for (const t of cardTargetSets[i]) if (cardTargetSets[j].has(t)) tShared++;
      if (tShared >= 1) {
        targets.push({ source: cards[i].slug, target: cards[j].slug, shared: tShared });
      }

      // Same origin
      if (cardOrigins[i] === cardOrigins[j] && cardOrigins[i] !== "other") {
        origin.push({ source: cards[i].slug, target: cards[j].slug, shared: 1 });
      }
    }
  }

  // Curated relationships — convert to GraphEdge with strength-weighted "shared"
  const strengthWeight = { confirmed: 5, assessed: 3, suspected: 1 } as const;
  const curated: GraphEdge[] = relationships.map((r) => ({
    source: r.a,
    target: r.b,
    shared: strengthWeight[r.strength],
    type: r.type,
    strength: r.strength,
    summary: r.summary,
  }));

  return { nodes, edges: { ttp, targets, origin, curated } };
}

export default function GraphPage() {
  const { nodes, edges } = buildEdgeSets();

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
            {nodes.length} adversaries · switch relationship modes · search · hover to highlight neighbors
          </p>
        </div>
      </div>

      <div style={{ flex: 1, position: "relative", zIndex: 5 }}>
        <GraphClient nodes={nodes} edges={edges} />
      </div>
    </main>
  );
}
