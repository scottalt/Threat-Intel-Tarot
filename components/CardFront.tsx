import type { TarotCard } from "@/data/types";
import { TTPBadge } from "./TTPBadge";
import { DefenseList } from "./DefenseList";

const categoryColor: Record<string, string> = {
  "nation-state": "var(--color-teal)",
  criminal: "var(--color-purple)",
  hacktivist: "var(--color-ember)",
  unknown: "var(--color-silver)",
};

const riskStars = (level: number) =>
  Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={i < level ? "risk-star-filled" : "risk-star-empty"}>
      ★
    </span>
  ));

export function CardFront({ card }: { card: TarotCard }) {
  const accent = categoryColor[card.category];

  return (
    <div
      className="w-full h-full overflow-y-auto text-left"
      style={{
        background: "var(--color-arcane)",
        borderTop: `4px solid ${accent}`,
        fontFamily: "var(--font-garamond), Georgia, serif",
      }}
    >
      {/* Header bar */}
      <div
        className="px-4 pt-4 pb-3 flex items-center justify-between border-b"
        style={{ borderColor: "rgba(201,168,76,0.2)" }}
      >
        <div>
          <div
            className="text-xs uppercase tracking-widest mb-0.5"
            style={{ color: "var(--color-gold)", fontFamily: "var(--font-cinzel), serif", opacity: 0.8 }}
          >
            {card.arcanum === "major" ? `Major Arcana · ${card.number}` : `${card.suit ?? "Minor Arcana"} · ${card.number}`}
          </div>
          <div className="text-xs" style={{ color: "var(--color-silver)" }}>
            {card.origin}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm" style={{ color: "var(--color-gold)" }}>
            {riskStars(card.riskLevel)}
          </div>
          <div className="text-xs mt-0.5" style={{ color: "var(--color-silver)", opacity: 0.6 }}>
            risk level {card.riskLevel}/5
          </div>
        </div>
      </div>

      {/* Card title + name */}
      <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(201,168,76,0.2)" }}>
        <div
          className="text-lg font-semibold leading-tight"
          style={{ color: "var(--color-gold-bright)", fontFamily: "var(--font-cinzel), serif" }}
        >
          ✦ {card.cardTitle} ✦
        </div>
        <div className="mt-1 text-sm font-semibold" style={{ color: "var(--color-mist)" }}>
          {card.name}
        </div>
        {card.aka.length > 0 && (
          <div className="text-xs mt-0.5" style={{ color: "var(--color-silver)", opacity: 0.7 }}>
            {card.aka.join(" · ")}
          </div>
        )}
      </div>

      {/* Targets + Since */}
      <div className="px-4 py-2 border-b" style={{ borderColor: "rgba(201,168,76,0.2)" }}>
        <div className="flex flex-wrap gap-1 mb-1">
          {card.targets.map((t) => (
            <span
              key={t}
              className="text-xs px-1.5 py-0.5 rounded"
              style={{ background: `${accent}22`, color: "var(--color-silver)", border: `1px solid ${accent}44` }}
            >
              {t}
            </span>
          ))}
        </div>
        <div className="text-xs mt-1" style={{ color: "var(--color-silver)", opacity: 0.6 }}>
          {card.since} · {card.motivation.join(", ")}
        </div>
      </div>

      {/* Flavor text */}
      <div className="px-4 py-3 border-b italic text-sm leading-relaxed" style={{ color: "var(--color-mist)", borderColor: "rgba(201,168,76,0.2)" }}>
        {card.flavor}
      </div>

      {/* TTPs */}
      <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(201,168,76,0.2)" }}>
        <div
          className="text-xs uppercase tracking-widest mb-2"
          style={{ color: "var(--color-gold)", fontFamily: "var(--font-cinzel), serif" }}
        >
          Tactics & Techniques
        </div>
        <div className="space-y-0.5">
          {card.ttps.map((ttp) => (
            <TTPBadge key={ttp.techniqueId} ttp={ttp} />
          ))}
        </div>
      </div>

      {/* Notable Ops */}
      <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(201,168,76,0.2)" }}>
        <div
          className="text-xs uppercase tracking-widest mb-2"
          style={{ color: "var(--color-gold)", fontFamily: "var(--font-cinzel), serif" }}
        >
          Notable Operations
        </div>
        <ul className="space-y-1">
          {card.notableOps.map((op) => (
            <li key={op} className="text-sm flex gap-2" style={{ color: "var(--color-mist)" }}>
              <span style={{ color: "var(--color-crimson)" }}>◆</span> {op}
            </li>
          ))}
        </ul>
      </div>

      {/* Defenses */}
      <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(201,168,76,0.2)" }}>
        <div
          className="text-xs uppercase tracking-widest mb-2"
          style={{ color: "var(--color-gold)", fontFamily: "var(--font-cinzel), serif" }}
        >
          Defenses
        </div>
        <DefenseList defenses={card.defenses} />
      </div>

      {/* Reversed meaning */}
      <div className="px-4 py-3">
        <div
          className="text-xs uppercase tracking-widest mb-2"
          style={{ color: "var(--color-silver)", fontFamily: "var(--font-cinzel), serif", opacity: 0.6 }}
        >
          Reversed — Their Weakness
        </div>
        <div className="text-sm italic leading-relaxed" style={{ color: "var(--color-silver)", opacity: 0.8 }}>
          {card.reversedMeaning}
        </div>
      </div>
    </div>
  );
}
