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
