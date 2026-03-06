"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { drawSpread } from "@/lib/draw";
import { getCardBySlug } from "@/lib/slug";
import { TarotCard } from "@/components/TarotCard";
import { Starfield } from "@/components/Starfield";
import type { TarotCard as TarotCardType } from "@/data/types";

type SharedTTP = { techniqueId: string; name: string; tactic: string };
type PriorityDefense = { control: string; count: number };

function buildReading(spread: TarotCardType[]): {
  origins: string[];
  tactics: string[];
  avgRisk: number;
  narrative: string;
  sharedTTPs: SharedTTP[];
  priorityDefenses: PriorityDefense[];
} {
  const origins = [...new Set(spread.map((c) => c.origin))];
  const tactics = [
    ...new Set(spread.flatMap((c) => c.ttps.map((t) => t.tactic))),
  ].slice(0, 4);
  const avgRisk = Math.round(
    spread.reduce((sum, c) => sum + c.riskLevel, 0) / spread.length
  );

  // Find technique IDs that appear in 2+ of the 3 cards
  const ttpCount = new Map<string, { ttp: SharedTTP; count: number }>();
  for (const card of spread) {
    const seen = new Set<string>();
    for (const ttp of card.ttps) {
      if (!seen.has(ttp.techniqueId)) {
        seen.add(ttp.techniqueId);
        const existing = ttpCount.get(ttp.techniqueId);
        if (existing) {
          existing.count += 1;
        } else {
          ttpCount.set(ttp.techniqueId, {
            ttp: { techniqueId: ttp.techniqueId, name: ttp.name, tactic: ttp.tactic },
            count: 1,
          });
        }
      }
    }
  }
  const sharedTTPs = [...ttpCount.values()]
    .filter((e) => e.count >= 2)
    .map((e) => e.ttp)
    .slice(0, 4);

  const categoryCount: Record<string, number> = {};
  spread.forEach((c) => {
    categoryCount[c.category] = (categoryCount[c.category] ?? 0) + 1;
  });
  const dominantCategory = Object.entries(categoryCount).sort(
    (a, b) => b[1] - a[1]
  )[0][0];

  const narratives: Record<string, string> = {
    "nation-state":
      "Your threat landscape is dominated by nation-state actors: sophisticated, patient, and politically motivated. Prioritize detection over prevention and assume persistent access. These adversaries play the long game.",
    criminal:
      "Financially motivated threat actors define this spread. Expect opportunistic entry, rapid monetization, and ransomware or data extortion. Backups, segmentation, and endpoint visibility are your best defenses.",
    hacktivist:
      "Ideologically driven actors appear across this spread. Attacks are often loud, public-facing, and timed to political events. DDoS resilience and public disclosure preparedness are essential.",
  };

  const narrative =
    narratives[dominantCategory] ??
    "This spread reveals a complex, multi-vector threat environment. No single defensive posture is sufficient. Depth, detection, and response speed are critical.";

  // Compute defenses recommended by 2+ cards in this spread
  const defenseCount = new Map<string, number>();
  for (const card of spread) {
    const seen = new Set<string>();
    for (const defense of card.defenses) {
      const key = defense.control.trim().toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        defenseCount.set(defense.control.trim(), (defenseCount.get(defense.control.trim()) ?? 0) + 1);
      }
    }
  }
  const priorityDefenses = [...defenseCount.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([control, count]) => ({ control, count }));

  return { origins, tactics, avgRisk, narrative, sharedTTPs, priorityDefenses };
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

function buildReadingText(spread: TarotCardType[]): string {
  const reading = buildReading(spread);
  const lines = [
    "THREAT INTELLIGENCE TAROT: THREE-CARD SPREAD",
    "threat-intel-tarot.vercel.app/spread",
    "",
    ...positions.map((pos, i) => {
      const card = spread[i];
      return [
        `${pos.label}. ${pos.title.toUpperCase()} (${pos.subtitle})`,
        `  ${card.cardTitle}: ${card.name}`,
        `  Origin: ${card.origin} · Risk: ${"★".repeat(card.riskLevel)}${"☆".repeat(5 - card.riskLevel)}`,
        `  TTPs: ${card.ttps.slice(0, 3).map((t) => t.techniqueId).join(", ")}`,
      ].join("\n");
    }),
    "",
    "READING",
    `Origins: ${reading.origins.join(", ")}`,
    `Avg Risk: ${reading.avgRisk}/5`,
    `Top Tactics: ${reading.tactics.join(", ")}`,
    reading.sharedTTPs.length > 0
      ? `Shared Techniques: ${reading.sharedTTPs.map((t) => `${t.techniqueId} (${t.name})`).join(", ")}`
      : "",
    reading.priorityDefenses.length > 0
      ? `Priority Defenses: ${reading.priorityDefenses.map((d) => d.control).join("; ")}`
      : "",
    "",
    reading.narrative,
  ].filter((line) => line !== undefined);
  return lines.join("\n");
}

function SpreadContent() {
  const [spread, setSpread] = useState<TarotCardType[] | null>(null);
  const [drawKey, setDrawKey] = useState(0);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Load spread from URL params on mount
  useEffect(() => {
    const cardParam = searchParams.get("cards");
    if (cardParam) {
      const slugs = cardParam.split(",").slice(0, 3);
      const loaded = slugs.map((s) => getCardBySlug(s)).filter(Boolean) as TarotCardType[];
      if (loaded.length === 3) {
        setSpread(loaded);
        setDrawKey(1);
      }
    }
  }, [searchParams]);

  const handleDraw = () => {
    const drawn = drawSpread(3);
    setSpread(drawn);
    setDrawKey((k) => k + 1);
    setCopied(false);
    setLinkCopied(false);
    // Update URL without page reload
    const slugs = drawn.map((c) => c.slug).join(",");
    router.replace(`/spread?cards=${slugs}`, { scroll: false });
  };

  const handleCopyLink = async () => {
    if (!spread) return;
    const slugs = spread.map((c) => c.slug).join(",");
    const url = `${window.location.origin}/spread?cards=${slugs}`;
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2500);
    } catch {
      // clipboard not available
    }
  };

  const handleCopyReading = async () => {
    if (!spread) return;
    const text = buildReadingText(spread);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // clipboard not available
    }
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
              animation: "hero-rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
            }}
          >
            Three-Card Spread
          </h1>
          <p
            className="text-sm"
            style={{
              color: "var(--color-silver)",
              opacity: 0.7,
              animation: "hero-rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) 120ms both",
            }}
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

        {spread && (
          <div className="mt-2 flex gap-2 flex-wrap justify-center">
            <button
              onClick={handleCopyReading}
              className="px-5 py-1.5 text-xs uppercase tracking-widest transition-all"
              style={{
                fontFamily: "var(--font-cinzel), serif",
                color: copied ? "var(--color-gold-bright)" : "var(--color-silver)",
                border: `1px solid ${copied ? "rgba(201,168,76,0.4)" : "rgba(192,192,192,0.2)"}`,
                background: "transparent",
                borderRadius: "4px",
                cursor: "pointer",
                touchAction: "manipulation",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {copied ? "✓ Copied" : "Copy Reading"}
            </button>
            <button
              onClick={handleCopyLink}
              className="px-5 py-1.5 text-xs uppercase tracking-widest transition-all"
              style={{
                fontFamily: "var(--font-cinzel), serif",
                color: linkCopied ? "var(--color-gold-bright)" : "var(--color-silver)",
                border: `1px solid ${linkCopied ? "rgba(201,168,76,0.4)" : "rgba(192,192,192,0.2)"}`,
                background: "transparent",
                borderRadius: "4px",
                cursor: "pointer",
                touchAction: "manipulation",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {linkCopied ? "✓ Link Copied" : "Share Link"}
            </button>
          </div>
        )}

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
                  animation: "section-reveal 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
                  animationDelay: `${i * 200}ms`,
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

              {/* Shared TTPs — only shown when 2+ cards share a technique */}
              {reading.sharedTTPs.length > 0 && (
                <div className="mb-6">
                  <div
                    className="text-xs uppercase tracking-widest mb-3 text-center"
                    style={{
                      color: "var(--color-gold)",
                      fontFamily: "var(--font-cinzel), serif",
                      opacity: 0.55,
                    }}
                  >
                    Shared Techniques
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {reading.sharedTTPs.map((ttp) => (
                      <a
                        key={ttp.techniqueId}
                        href={`https://attack.mitre.org/techniques/${ttp.techniqueId.replace(".", "/")}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center px-3 py-2 rounded transition-opacity hover:opacity-100"
                        style={{
                          background: "rgba(201,168,76,0.06)",
                          border: "1px solid rgba(201,168,76,0.2)",
                          textDecoration: "none",
                          opacity: 0.85,
                        }}
                      >
                        <span
                          className="font-mono text-xs"
                          style={{ color: "var(--color-gold)" }}
                        >
                          {ttp.techniqueId}
                        </span>
                        <span
                          className="text-xs mt-0.5"
                          style={{ color: "var(--color-mist)" }}
                        >
                          {ttp.name}
                        </span>
                        <span
                          className="text-xs mt-0.5"
                          style={{ color: "var(--color-silver)", opacity: 0.5, fontSize: "9px" }}
                        >
                          {ttp.tactic}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Priority defenses — controls recommended by 2+ cards */}
              {reading.priorityDefenses.length > 0 && (
                <div className="mb-6">
                  <div
                    className="text-xs uppercase tracking-widest mb-3 text-center"
                    style={{
                      color: "var(--color-gold)",
                      fontFamily: "var(--font-cinzel), serif",
                      opacity: 0.55,
                    }}
                  >
                    Priority Defenses
                  </div>
                  <div className="space-y-1.5 px-2">
                    {reading.priorityDefenses.map((d) => (
                      <div
                        key={d.control}
                        className="flex items-center gap-2 text-xs"
                        style={{ color: "var(--color-mist)" }}
                      >
                        <span style={{ color: "var(--color-gold)", opacity: 0.7, flexShrink: 0 }}>◆</span>
                        <span style={{ opacity: 0.85 }}>{d.control}</span>
                        {d.count === spread.length && (
                          <span
                            className="ml-auto"
                            style={{ color: "var(--color-gold)", opacity: 0.5, fontSize: "9px", flexShrink: 0 }}
                          >
                            all {d.count}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

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

export default function SpreadPage() {
  return (
    <Suspense>
      <SpreadContent />
    </Suspense>
  );
}
