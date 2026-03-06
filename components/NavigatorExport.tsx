"use client";

import type { TarotCard } from "@/data/types";

export function NavigatorExport({ card }: { card: TarotCard }) {
  const handleExport = () => {
    const techniques = card.ttps.map((ttp) => ({
      techniqueID: ttp.techniqueId,
      score: card.riskLevel,
      color: "#c9a84c",
      comment: `${ttp.tactic}: ${ttp.name}`,
      enabled: true,
      metadata: [],
      links: [],
      showSubtechniques: false,
    }));

    const layer = {
      name: `${card.name} (${card.cardTitle})`,
      versions: { attack: "16", navigator: "5.0.0", layer: "4.5" },
      domain: "enterprise-attack",
      description: `ATT&CK techniques for ${card.name} — exported from Threat Intelligence Tarot (tarot.scottaltiparmak.com)`,
      filters: { platforms: ["Windows", "Linux", "macOS", "Network", "Cloud"] },
      sorting: 0,
      layout: {
        layout: "side",
        aggregateFunction: "max",
        showID: true,
        showName: true,
        showAggregateScores: false,
        countUnscored: false,
      },
      hideDisabled: false,
      techniques,
      gradient: { colors: ["#1a1a2e", "#c9a84c"], minValue: 0, maxValue: 5 },
      legendItems: [{ label: `${card.name} TTPs`, color: "#c9a84c" }],
      metadata: [
        { name: "source", value: "Threat Intelligence Tarot" },
        { name: "category", value: card.category },
        { name: "origin", value: card.origin },
        { name: "risk_level", value: String(card.riskLevel) },
      ],
      links: [{ label: "Threat Intelligence Tarot", url: `https://tarot.scottaltiparmak.com/card/${card.slug}` }],
      showTacticRowBackground: false,
      tacticRowBackground: "#dddddd",
      selectTechniquesAcrossSubtechniques: true,
    };

    const blob = new Blob([JSON.stringify(layer, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attck-${card.slug}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="text-xs uppercase tracking-widest transition-opacity hover:opacity-100"
      style={{
        color: "var(--color-gold)",
        opacity: 0.45,
        fontFamily: "var(--font-cinzel), serif",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        padding: 0,
      }}
      title="Export ATT&CK Navigator layer for this adversary"
    >
      ↓ ATT&CK Navigator
    </button>
  );
}
