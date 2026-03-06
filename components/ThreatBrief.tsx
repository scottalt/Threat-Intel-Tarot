"use client";

import { useState } from "react";
import type { TarotCard } from "@/data/types";

function buildBrief(card: TarotCard): string {
  const stars = "★".repeat(card.riskLevel) + "☆".repeat(5 - card.riskLevel);
  const tactics = [...new Set(card.ttps.map((t) => t.tactic))].join(", ");

  const ttpTable =
    "| Technique ID | Name | Tactic |\n|---|---|---|\n" +
    card.ttps
      .map((t) => `| ${t.techniqueId} | ${t.name} | ${t.tactic} |`)
      .join("\n");

  const defenseList = card.defenses
    .map((d) => `- ${d.control}${d.framework ? ` *(${d.framework})*` : ""}`)
    .join("\n");

  const opsList = card.notableOps.map((op) => `- ${op}`).join("\n");

  return [
    `# ${card.name} — ${card.cardTitle}`,
    "",
    `**Category:** ${card.category.replace("-", " ")} | **Origin:** ${card.origin} | **Risk:** ${stars} (${card.riskLevel}/5)`,
    `**Active Since:** ${card.since} | **Motivation:** ${card.motivation.join(", ")}`,
    `**Targets:** ${card.targets.join(", ")}`,
    card.aka.length > 0 ? `**Also Known As:** ${card.aka.join(", ")}` : "",
    card.mitreGroupId ? `**MITRE Group ID:** ${card.mitreGroupId}` : "",
    "",
    "## Overview",
    "",
    card.flavor,
    "",
    `**Kill-chain coverage:** ${tactics}`,
    "",
    "## MITRE ATT&CK Techniques",
    "",
    ttpTable,
    "",
    "## Notable Operations",
    "",
    opsList,
    "",
    "## Recommended Defenses",
    "",
    defenseList,
    "",
    "## Known Weakness",
    "",
    card.reversedMeaning,
    "",
    "---",
    `*Source: Threat Intelligence Tarot — https://tarot.scottaltiparmak.com/card/${card.slug}*`,
    `*Data sourced from MITRE ATT&CK. For educational purposes.*`,
  ]
    .filter((line) => line !== undefined)
    .join("\n");
}

export function ThreatBrief({ card }: { card: TarotCard }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildBrief(card));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: download as .md file
      const blob = new Blob([buildBrief(card)], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `threat-brief-${card.slug}.md`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="text-xs uppercase tracking-widest transition-opacity hover:opacity-100"
      style={{
        color: copied ? "var(--color-gold-bright)" : "var(--color-gold)",
        opacity: copied ? 1 : 0.45,
        fontFamily: "var(--font-cinzel), serif",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        padding: 0,
        transition: "color 0.2s, opacity 0.2s",
      }}
      title="Copy markdown threat brief to clipboard"
    >
      {copied ? "✓ Copied" : "↓ Threat Brief"}
    </button>
  );
}
