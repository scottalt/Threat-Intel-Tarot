"use client";

import { useState } from "react";
import type { TTP } from "@/data/types";

export function TTPBadge({ ttp, index = 0 }: { ttp: TTP; index?: number }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(ttp.techniqueId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    });
  };

  return (
    <div
      className="flex items-start gap-2 py-1"
      style={{
        animation: "badge-slide 0.35s cubic-bezier(0.22, 1, 0.36, 1) both",
        animationDelay: `${Math.min(index * 45, 350)}ms`,
      }}
    >
      <a
        href={`https://attack.mitre.org/techniques/${ttp.techniqueId.replace(".", "/")}/`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleCopy}
        className="shrink-0 text-xs font-mono px-1.5 py-0.5 rounded mt-0.5 transition-all hover:opacity-80"
        style={{
          background: copied ? "rgba(74,173,173,0.25)" : "rgba(201,168,76,0.15)",
          color: copied ? "var(--color-teal)" : "var(--color-gold-bright)",
          border: `1px solid ${copied ? "rgba(74,173,173,0.5)" : "rgba(201,168,76,0.3)"}`,
          textDecoration: "none",
          touchAction: "manipulation",
          transition: "background 0.2s, color 0.2s, border-color 0.2s",
          cursor: "copy",
          userSelect: "none",
        }}
        title="Click to copy · Opens MITRE ATT&CK in new tab"
      >
        {copied ? "Copied!" : ttp.techniqueId}
      </a>
      <div className="min-w-0">
        <div className="text-sm" style={{ color: "var(--color-mist)" }}>
          {ttp.name}
        </div>
        <div
          className="text-xs"
          style={{ color: "var(--color-silver)", opacity: 0.7 }}
        >
          {ttp.tactic}
        </div>
      </div>
    </div>
  );
}
