"use client";

import { useState } from "react";
import { drawSpread } from "@/lib/draw";
import { TarotCard } from "@/components/TarotCard";
import { Starfield } from "@/components/Starfield";
import type { TarotCard as TarotCardType } from "@/data/types";

function buildReading(spread: TarotCardType[]): {
  origins: string[];
  tactics: string[];
  avgRisk: number;
  narrative: string;
} {
  const origins = [...new Set(spread.map((c) => c.origin))];
  const tactics = [
    ...new Set(spread.flatMap((c) => c.ttps.map((t) => t.tactic))),
  ].slice(0, 4);
  const avgRisk = Math.round(
    spread.reduce((sum, c) => sum + c.riskLevel, 0) / spread.length
  );

  const categoryCount: Record<string, number> = {};
  spread.forEach((c) => {
    categoryCount[c.category] = (categoryCount[c.category] ?? 0) + 1;
  });
  const dominantCategory = Object.entries(categoryCount).sort(
    (a, b) => b[1] - a[1]
  )[0][0];

  const narratives: Record<string, string> = {
    "nation-state":
      "Your threat landscape is dominated by nation-state actors — sophisticated, patient, and politically motivated. Prioritize detection over prevention, and assume persistent access. These adversaries play the long game.",
    criminal:
      "Financially motivated threat actors define this spread. Expect opportunistic entry, rapid monetization, and ransomware or data extortion. Backups, segmentation, and endpoint visibility are your best defenses.",
    hacktivist:
      "Ideologically driven actors appear across this spread. Attacks are often loud, public-facing, and timed to political events. DDoS resilience and public disclosure preparedness are essential.",
  };

  const narrative =
    narratives[dominantCategory] ??
    "This spread reveals a complex, multi-vector threat environment. No single defensive posture is sufficient — depth, detection, and response speed are critical.";

  return { origins, tactics, avgRisk, narrative };
}

const positions = [
  {
    label: "I",
    title: "The Shadow",
    subtitle: "A threat from the past",
  },
  {
    label: "II",
    title: "The Adversary",
    subtitle: "Your present danger",
  },
  {
    label: "III",
    title: "The Harbinger",
    subtitle: "What approaches",
  },
];

const categoryNebula: Record<string, string> = {
  "nation-state":
    "radial-gradient(ellipse 900px 500px at 50% 60%, rgba(45,106,106,0.18) 0%, transparent 70%)",
  criminal:
    "radial-gradient(ellipse 900px 500px at 50% 60%, rgba(74,26,106,0.22) 0%, transparent 70%)",
  hacktivist:
    "radial-gradient(ellipse 900px 500px at 50% 60%, rgba(139,58,15,0.18) 0%, transparent 70%)",
};

export default function SpreadPage() {
  const [spread, setSpread] = useState<TarotCardType[] | null>(null);
  const [drawKey, setDrawKey] = useState(0);

  const handleDraw = () => {
    setSpread(drawSpread(3));
    setDrawKey((k) => k + 1);
  };

  // Nebula color based on center card category
  const nebulaGradient = spread
    ? (categoryNebula[spread[1].category] ?? null)
    : null;

  return (
    <main
      className="relative min-h-screen flex flex-col items-center py-12 px-4"
      style={{
        background: "var(--color-void)",
        paddingBottom: "max(3rem, env(safe-area-inset-bottom))",
      }}
    >
      <Starfield />

      {nebulaGradient && (
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            background: nebulaGradient,
            zIndex: 1,
            pointerEvents: "none",
            animation: "nebula-in 0.8s ease-out both",
          }}
        />
      )}

      <div
        className="relative flex flex-col items-center w-full max-w-5xl"
        style={{ zIndex: 2 }}
      >
        {/* Header */}
        <div className="text-center mb-2">
          <a
            href="/"
            className="text-xs uppercase tracking-widest mb-6 inline-block transition-opacity hover:opacity-100"
            style={{
              color: "var(--color-gold)",
              opacity: 0.45,
              fontFamily: "var(--font-cinzel), serif",
            }}
          >
            ← Back
          </a>
          <h1
            className="text-2xl sm:text-3xl font-semibold mb-2"
            style={{
              color: "var(--color-gold-bright)",
              fontFamily: "var(--font-cinzel), serif",
            }}
          >
            Three-Card Spread
          </h1>
          <p
            className="text-sm"
            style={{ color: "var(--color-silver)", opacity: 0.7 }}
          >
            Past threat · Present danger · Emerging risk
          </p>
          <div
            className="mt-3 w-24 h-px mx-auto"
            style={{
              background:
                "linear-gradient(90deg, transparent, var(--color-gold), transparent)",
            }}
          />
        </div>

        {/* Draw Button */}
        <button
          onClick={handleDraw}
          className="mt-8 mb-10 relative overflow-hidden px-8 py-3 text-sm uppercase tracking-widest font-semibold"
          style={{
            fontFamily: "var(--font-cinzel), serif",
            color: "var(--color-gold-bright)",
            background:
              "linear-gradient(135deg, rgba(201,168,76,0.12) 0%, rgba(201,168,76,0.06) 100%)",
            border: "1px solid rgba(201,168,76,0.5)",
            borderRadius: "4px",
            cursor: "pointer",
            touchAction: "manipulation",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "40%",
              height: "100%",
              background:
                "linear-gradient(90deg, transparent, rgba(240,192,64,0.25), transparent)",
              animation: "shimmer 3s ease-in-out infinite",
              pointerEvents: "none",
            }}
          />
          {spread ? "Draw Again" : "Draw the Spread"}
        </button>

        {/* Spread layout */}
        {spread && (
          <div
            key={drawKey}
            className="flex flex-col sm:flex-row gap-4 sm:gap-3 items-center sm:items-start justify-center w-full"
          >
            {spread.map((card, i) => (
              <div
                key={`${drawKey}-${i}`}
                className="spread-card-slot flex flex-col items-center gap-3"
                style={{
                  animation: "section-reveal 0.5s ease-out both",
                  animationDelay: `${i * 180}ms`,
                }}
              >
                {/* Position label */}
                <div className="text-center mb-1">
                  <div
                    className="text-xs uppercase tracking-widest"
                    style={{
                      color: "var(--color-gold)",
                      fontFamily: "var(--font-cinzel), serif",
                      opacity: 0.6,
                    }}
                  >
                    {positions[i].label}
                  </div>
                  <div
                    className="text-sm font-semibold mt-0.5"
                    style={{
                      color: "var(--color-gold-bright)",
                      fontFamily: "var(--font-cinzel), serif",
                    }}
                  >
                    {positions[i].title}
                  </div>
                  <div
                    className="text-xs italic mt-0.5"
                    style={{ color: "var(--color-silver)", opacity: 0.55 }}
                  >
                    {positions[i].subtitle}
                  </div>
                </div>

                {/* Card */}
                <div
                  className="card-deal"
                  style={{ animationDelay: `${i * 180}ms` }}
                >
                  <TarotCard card={card} />
                </div>
              </div>
            ))}
          </div>
        )}

        {!spread && (
          <div
            className="mt-4 text-center text-sm italic select-none"
            style={{
              color: "var(--color-silver)",
              opacity: 0.4,
              animation: "float 3.2s ease-in-out infinite",
            }}
          >
            Three adversaries await. Draw to reveal your spread.
          </div>
        )}

        {/* Spread Analysis */}
        {spread && (() => {
          const reading = buildReading(spread);
          return (
            <div
              className="mt-12 w-full max-w-2xl mx-auto"
              style={{
                animation: "section-reveal 0.5s ease-out both",
                animationDelay: "700ms",
              }}
            >
              <div
                className="w-full h-px mb-8"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, var(--color-gold), transparent)",
                }}
              />

              <div
                className="text-center mb-6"
                style={{
                  color: "var(--color-gold)",
                  fontFamily: "var(--font-cinzel), serif",
                  fontSize: "11px",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  opacity: 0.8,
                }}
              >
                Your Threat Reading
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                {/* Origins */}
                <div>
                  <div
                    className="text-xs uppercase tracking-widest mb-2"
                    style={{
                      color: "var(--color-gold)",
                      fontFamily: "var(--font-cinzel), serif",
                      opacity: 0.55,
                    }}
                  >
                    Origins
                  </div>
                  <div className="space-y-1">
                    {reading.origins.map((o) => (
                      <div
                        key={o}
                        className="text-xs"
                        style={{ color: "var(--color-mist)" }}
                      >
                        {o}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Combined Risk */}
                <div>
                  <div
                    className="text-xs uppercase tracking-widest mb-2"
                    style={{
                      color: "var(--color-gold)",
                      fontFamily: "var(--font-cinzel), serif",
                      opacity: 0.55,
                    }}
                  >
                    Avg. Risk
                  </div>
                  <div className="text-sm">
                    {Array.from({ length: 5 }, (_, i) => (
                      <span
                        key={i}
                        style={{
                          color:
                            i < reading.avgRisk
                              ? "var(--color-gold-bright)"
                              : "#333",
                        }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <div
                    className="text-xs mt-0.5"
                    style={{ color: "var(--color-silver)", opacity: 0.45 }}
                  >
                    {reading.avgRisk}/5
                  </div>
                </div>

                {/* Top Tactics */}
                <div>
                  <div
                    className="text-xs uppercase tracking-widest mb-2"
                    style={{
                      color: "var(--color-gold)",
                      fontFamily: "var(--font-cinzel), serif",
                      opacity: 0.55,
                    }}
                  >
                    Top Tactics
                  </div>
                  <div className="space-y-1">
                    {reading.tactics.map((t) => (
                      <div
                        key={t}
                        className="text-xs"
                        style={{ color: "var(--color-mist)", opacity: 0.85 }}
                      >
                        {t}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Narrative */}
              <div
                className="text-sm italic leading-relaxed text-center px-4 pb-2"
                style={{ color: "var(--color-silver)", opacity: 0.75 }}
              >
                {reading.narrative}
              </div>

              <div
                className="mt-8 text-xs text-center"
                style={{ color: "var(--color-silver)", opacity: 0.25 }}
              >
                Data sourced from MITRE ATT&CK. For educational purposes.
              </div>
            </div>
          );
        })()}
      </div>
    </main>
  );
}
