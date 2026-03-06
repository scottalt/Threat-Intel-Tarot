"use client";

import type { CSSProperties } from "react";
import type { TarotCard } from "@/data/types";
import { TTPBadge } from "./TTPBadge";
import { DefenseList } from "./DefenseList";

const categoryAccent: Record<string, string> = {
  "nation-state": "var(--color-teal)",
  criminal: "var(--color-purple)",
  hacktivist: "var(--color-ember)",
  unknown: "var(--color-silver)",
};

// Brighter colors for sigil SVGs (small artwork, needs to pop on dark bg)
const sigilColor: Record<string, string> = {
  "nation-state": "#4aadad",
  criminal: "#9f7aea",
  hacktivist: "#f97316",
  unknown: "#b8b8c8",
};

function CardSigil({ category }: { category: string }) {
  const color = sigilColor[category] ?? "#c9a84c";

  if (category === "nation-state") {
    const hex = Array.from({ length: 6 }, (_, i) => {
      const a = (i * 60 - 30) * (Math.PI / 180);
      return { x: 38 + 22 * Math.cos(a), y: 38 + 22 * Math.sin(a) };
    });
    const outerRing = Array.from({ length: 6 }, (_, i) => {
      const a = (i * 60 - 30) * (Math.PI / 180);
      return { x: 38 + 32 * Math.cos(a), y: 38 + 32 * Math.sin(a) };
    });
    return (
      <svg viewBox="0 0 76 76" width="72" height="72" aria-hidden="true">
        <g style={{ transformOrigin: "38px 38px", animation: "sigil-rotate 30s linear infinite" }}>
          <circle cx="38" cy="38" r="35" fill="none" stroke={color} strokeWidth="0.5" opacity="0.22" />
          {outerRing.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="2" fill={color} opacity="0.45" />
          ))}
        </g>
        <polygon
          points={hex.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none" stroke={color} strokeWidth="0.8" opacity="0.55"
        />
        {outerRing.map((p, i) => (
          <line key={i} x1="38" y1="38" x2={p.x} y2={p.y} stroke={color} strokeWidth="0.4" opacity="0.2" />
        ))}
        <circle cx="38" cy="38" r="7" fill="none" stroke={color} strokeWidth="1" opacity="0.75"
          style={{ animation: "eye-pulse 3s ease-in-out infinite" }}
        />
        <circle cx="38" cy="38" r="2.5" fill={color} opacity="0.9" />
      </svg>
    );
  }

  if (category === "criminal") {
    const spokes = Array.from({ length: 8 }, (_, i) => {
      const a = (i * 45) * (Math.PI / 180);
      return { x: 38 + 28 * Math.cos(a), y: 38 + 28 * Math.sin(a) };
    });
    return (
      <svg viewBox="0 0 76 76" width="72" height="72" aria-hidden="true">
        <g style={{ transformOrigin: "38px 38px", animation: "sigil-rotate 22s linear infinite reverse" }}>
          <circle cx="38" cy="38" r="34" fill="none" stroke={color} strokeWidth="0.5" opacity="0.25" />
        </g>
        {spokes.map((s, i) => (
          <line key={i} x1="38" y1="38" x2={s.x} y2={s.y} stroke={color} strokeWidth="0.6" opacity="0.35" />
        ))}
        <circle cx="38" cy="38" r="14" fill="none" stroke={color} strokeWidth="0.5" opacity="0.25" />
        <circle cx="38" cy="38" r="22" fill="none" stroke={color} strokeWidth="0.5" opacity="0.18" />
        {spokes.map((s, i) => {
          const next = spokes[(i + 1) % spokes.length];
          return (
            <line key={i} x1={s.x} y1={s.y} x2={next.x} y2={next.y}
              stroke={color} strokeWidth="0.4" opacity="0.22" />
          );
        })}
        <circle cx="38" cy="38" r="4.5" fill={color} opacity="0.8"
          style={{ animation: "eye-pulse 2.2s ease-in-out infinite" }}
        />
        <circle cx="38" cy="38" r="1.5" fill="#0a0a0f" opacity="0.9" />
      </svg>
    );
  }

  if (category === "hacktivist") {
    return (
      <svg viewBox="0 0 76 76" width="72" height="72" aria-hidden="true">
        <circle cx="38" cy="38" r="34" fill="none" stroke={color} strokeWidth="0.5" opacity="0.22" />
        {/* Glow behind bolt */}
        <polyline
          points="47,9 29,38 43,38 25,67"
          fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"
          opacity="0.1"
        />
        {/* Lightning bolt */}
        <polyline
          points="47,9 29,38 43,38 25,67"
          fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          opacity="0.85"
          style={{ animation: "glyph-fade 1.8s ease-in-out infinite" }}
        />
      </svg>
    );
  }

  // unknown — watching eye
  return (
    <svg viewBox="0 0 76 76" width="72" height="72" aria-hidden="true">
      <circle cx="38" cy="38" r="34" fill="none" stroke={color} strokeWidth="0.5" opacity="0.22" />
      <ellipse cx="38" cy="38" rx="21" ry="13" fill="none" stroke={color} strokeWidth="0.8" opacity="0.45" />
      <ellipse cx="38" cy="38" rx="16" ry="9" fill="none" stroke={color} strokeWidth="1" opacity="0.75"
        style={{ animation: "eye-pulse 2.5s ease-in-out infinite" }}
      />
      <circle cx="38" cy="38" r="3.5" fill={color} opacity="0.85" />
      <circle cx="38" cy="38" r="1.5" fill="#0a0a0f" opacity="0.9" />
    </svg>
  );
}

const categoryGlowRgba: Record<string, string> = {
  "nation-state": "rgba(45,106,106,0.28)",
  criminal: "rgba(74,26,106,0.32)",
  hacktivist: "rgba(139,58,15,0.28)",
  unknown: "rgba(192,192,192,0.08)",
};

const section = (i: number): CSSProperties => ({
  animation: "section-reveal 0.4s ease-out both",
  animationDelay: `${i * 65}ms`,
});

const ATT_CK_TACTICS = [
  { id: "Reconnaissance", abbr: "RCN" },
  { id: "Resource Development", abbr: "RDV" },
  { id: "Initial Access", abbr: "INI" },
  { id: "Execution", abbr: "EXC" },
  { id: "Persistence", abbr: "PRS" },
  { id: "Privilege Escalation", abbr: "PRV" },
  { id: "Defense Evasion", abbr: "EVA" },
  { id: "Credential Access", abbr: "CRD" },
  { id: "Discovery", abbr: "DSC" },
  { id: "Lateral Movement", abbr: "LAT" },
  { id: "Collection", abbr: "COL" },
  { id: "Command and Control", abbr: "C2" },
  { id: "Exfiltration", abbr: "EXF" },
  { id: "Impact", abbr: "IMP" },
] as const;

const RiskStars = ({ level }: { level: number }) => (
  <span>
    {Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        style={
          i < level
            ? {
                display: "inline-block",
                animation: "star-fill 0.3s ease-out both",
                animationDelay: `${300 + i * 100}ms`,
                color: "var(--color-gold-bright)",
              }
            : { color: "#333" }
        }
      >
        ★
      </span>
    ))}
  </span>
);

export function CardFront({ card }: { card: TarotCard }) {
  const accent = categoryAccent[card.category];
  const glowRgba = categoryGlowRgba[card.category];

  return (
    <div
      className="w-full h-full text-left relative"
      style={{
        background: "var(--color-arcane)",
        fontFamily: "var(--font-garamond), Georgia, serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Category top glow */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "80px",
          background: `radial-gradient(ellipse 100% 100% at 50% 0%, ${glowRgba} 0%, transparent 100%)`,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Category accent line */}
      <div style={{ height: 4, background: accent, flexShrink: 0, position: "relative", zIndex: 1 }} />

      {/* Scrollable content */}
      <div
        className="overflow-y-auto flex-1"
        style={
          {
            overscrollBehavior: "contain",
            position: "relative",
            zIndex: 1,
          } as CSSProperties
        }
      >
        {/* Header */}
        <div
          className="px-4 pt-4 pb-3 flex items-center justify-between border-b"
          style={{ borderColor: "rgba(201,168,76,0.2)", ...section(0) }}
        >
          <div>
            <div
              className="text-xs uppercase tracking-widest mb-0.5"
              style={{
                color: "var(--color-gold)",
                fontFamily: "var(--font-cinzel), serif",
                opacity: 0.85,
              }}
            >
              {card.arcanum === "major"
                ? `Major Arcana · ${card.number}`
                : `${card.suit ?? "Minor Arcana"} · ${card.number}`}
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs" style={{ color: "var(--color-silver)" }}>
                {card.origin}
              </div>
              {card.mitreGroupId && (
                <a
                  href={`https://attack.mitre.org/groups/${card.mitreGroupId}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono transition-opacity hover:opacity-80"
                  style={{
                    color: "var(--color-gold)",
                    opacity: 0.55,
                    textDecoration: "none",
                    fontSize: "9px",
                    border: "1px solid rgba(201,168,76,0.2)",
                    padding: "1px 4px",
                    borderRadius: "2px",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {card.mitreGroupId}
                </a>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm">
              <RiskStars level={card.riskLevel} />
            </div>
            <div
              className="text-xs mt-0.5"
              style={{ color: "var(--color-silver)", opacity: 0.55 }}
            >
              risk {card.riskLevel}/5
            </div>
          </div>
        </div>

        {/* Category Sigil */}
        <div
          className="flex justify-center py-3 border-b"
          style={{
            borderColor: "rgba(201,168,76,0.2)",
            animation: "section-reveal 0.4s ease-out 110ms both",
          }}
        >
          <div
            style={{
              border: "1px solid rgba(201,168,76,0.18)",
              borderRadius: "10px",
              padding: "8px 12px",
              background: "rgba(0,0,0,0.18)",
            }}
          >
            <CardSigil category={card.category} />
          </div>
        </div>

        {/* Card Title */}
        <div
          className="px-4 py-3 border-b"
          style={{ borderColor: "rgba(201,168,76,0.2)", ...section(1) }}
        >
          <div
            className="card-title-shimmer text-lg font-semibold leading-tight"
            style={{ fontFamily: "var(--font-cinzel), serif" }}
          >
            ✦ {card.cardTitle} ✦
          </div>
          <div
            className="mt-1 text-sm font-semibold"
            style={{ color: "var(--color-mist)" }}
          >
            {card.name}
          </div>
          {card.aka.length > 0 && (
            <div
              className="text-xs mt-0.5"
              style={{ color: "var(--color-silver)", opacity: 0.65 }}
            >
              {card.aka.join(" · ")}
            </div>
          )}
        </div>

        {/* Targets + Motivation */}
        <div
          className="px-4 py-2 border-b"
          style={{ borderColor: "rgba(201,168,76,0.2)", ...section(2) }}
        >
          <div className="flex flex-wrap gap-1 mb-1">
            {card.targets.map((t) => (
              <span
                key={t}
                className="text-xs px-1.5 py-0.5 rounded"
                style={{
                  background: `${accent}20`,
                  color: "var(--color-silver)",
                  border: `1px solid ${accent}40`,
                }}
              >
                {t}
              </span>
            ))}
          </div>
          <div
            className="text-xs mt-1"
            style={{ color: "var(--color-silver)", opacity: 0.55 }}
          >
            {card.since} · {card.motivation.join(", ")}
          </div>
        </div>

        {/* Flavor text */}
        <div
          className="px-4 py-3 border-b italic text-sm leading-relaxed"
          style={{
            color: "var(--color-mist)",
            borderColor: "rgba(201,168,76,0.2)",
            ...section(3),
          }}
        >
          {card.flavor}
        </div>

        {/* TTPs */}
        <div
          className="px-4 py-3 border-b"
          style={{ borderColor: "rgba(201,168,76,0.2)", ...section(4) }}
        >
          <div
            className="text-xs uppercase tracking-widest mb-2"
            style={{
              color: "var(--color-gold)",
              fontFamily: "var(--font-cinzel), serif",
            }}
          >
            Tactics & Techniques
          </div>
          {/* ATT&CK kill-chain heatmap */}
          {(() => {
            const activeTactics = new Set(card.ttps.map((t) => t.tactic));
            return (
              <div className="flex flex-wrap gap-0.5 mb-3" title="ATT&CK tactic coverage">
                {ATT_CK_TACTICS.map((tactic) => {
                  const active = activeTactics.has(tactic.id);
                  return (
                    <div
                      key={tactic.id}
                      title={tactic.id}
                      style={{
                        fontSize: "7px",
                        letterSpacing: "0.04em",
                        padding: "2px 3px",
                        borderRadius: "2px",
                        fontFamily: "var(--font-cinzel), serif",
                        background: active ? "rgba(201,168,76,0.18)" : "rgba(255,255,255,0.04)",
                        border: `1px solid ${active ? "rgba(201,168,76,0.45)" : "rgba(255,255,255,0.08)"}`,
                        color: active ? "var(--color-gold-bright)" : "rgba(192,192,192,0.25)",
                        transition: "all 0.2s",
                      }}
                    >
                      {tactic.abbr}
                    </div>
                  );
                })}
              </div>
            );
          })()}
          <div className="space-y-0.5">
            {card.ttps.map((ttp, i) => (
              <TTPBadge key={ttp.techniqueId} ttp={ttp} index={i} />
            ))}
          </div>
        </div>

        {/* Notable Ops */}
        <div
          className="px-4 py-3 border-b"
          style={{ borderColor: "rgba(201,168,76,0.2)", ...section(5) }}
        >
          <div
            className="text-xs uppercase tracking-widest mb-2"
            style={{
              color: "var(--color-gold)",
              fontFamily: "var(--font-cinzel), serif",
            }}
          >
            Notable Operations
          </div>
          <ul className="space-y-1">
            {card.notableOps.map((op) => (
              <li
                key={op}
                className="text-sm flex gap-2"
                style={{ color: "var(--color-mist)" }}
              >
                <span style={{ color: "var(--color-crimson)", flexShrink: 0 }}>◆</span>
                {op}
              </li>
            ))}
          </ul>
        </div>

        {/* Defenses */}
        <div
          className="px-4 py-3 border-b"
          style={{ borderColor: "rgba(201,168,76,0.2)", ...section(6) }}
        >
          <div
            className="text-xs uppercase tracking-widest mb-2"
            style={{
              color: "var(--color-gold)",
              fontFamily: "var(--font-cinzel), serif",
            }}
          >
            Defenses
          </div>
          <DefenseList defenses={card.defenses} />
        </div>

        {/* Reversed Meaning */}
        <div className="px-4 py-3" style={section(7)}>
          <div
            className="text-xs uppercase tracking-widest mb-2"
            style={{
              color: "var(--color-silver)",
              fontFamily: "var(--font-cinzel), serif",
              opacity: 0.55,
            }}
          >
            Reversed: Their Weakness
          </div>
          <div
            className="text-sm italic leading-relaxed"
            style={{ color: "var(--color-silver)", opacity: 0.8 }}
          >
            {card.reversedMeaning}
          </div>
        </div>
      </div>
    </div>
  );
}
