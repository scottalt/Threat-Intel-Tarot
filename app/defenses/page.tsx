import type { Metadata } from "next";
import { cards } from "@/data/cards";
import { Starfield } from "@/components/Starfield";

export const metadata: Metadata = {
  title: "Defense Index — Threat Intelligence Tarot",
  description:
    "Which security controls defend against the most threat actors? Ranked by coverage across 78 adversary profiles — prioritized for defenders.",
};

type DefenseEntry = {
  control: string;
  framework: string | null;
  count: number;
  groups: { name: string; cardTitle: string; slug: string; category: string }[];
};

const categoryAccent: Record<string, string> = {
  "nation-state": "var(--color-teal)",
  criminal: "var(--color-purple)",
  hacktivist: "var(--color-ember)",
  unknown: "var(--color-silver)",
};

function frameworkUrl(fw: string): string | null {
  if (fw.startsWith("NIST CSF")) return "https://www.nist.gov/cyberframework";
  if (fw.startsWith("NIST SSDF")) return "https://csrc.nist.gov/Projects/ssdf";
  if (fw.startsWith("NIST SP")) return "https://csrc.nist.gov/publications/sp";
  if (fw.startsWith("CIS Control")) return "https://www.cisecurity.org/controls/cis-controls-list/";
  if (fw.startsWith("ICS-CERT")) return "https://www.cisa.gov/resources-tools/resources/ics-cert";
  return null;
}

function buildDefenseIndex(): DefenseEntry[] {
  // Normalize controls slightly — trim whitespace, lowercase for matching
  const map = new Map<string, DefenseEntry>();

  for (const card of cards) {
    const seenControls = new Set<string>();
    for (const defense of card.defenses) {
      const key = defense.control.trim().toLowerCase();
      if (seenControls.has(key)) continue;
      seenControls.add(key);

      const group = {
        name: card.name,
        cardTitle: card.cardTitle,
        slug: card.slug,
        category: card.category,
      };

      const existing = map.get(key);
      if (existing) {
        existing.count += 1;
        existing.groups.push(group);
      } else {
        map.set(key, {
          control: defense.control.trim(),
          framework: defense.framework ?? null,
          count: 1,
          groups: [group],
        });
      }
    }
  }

  return Array.from(map.values())
    .filter((e) => e.count >= 2) // Only show controls recommended by 2+ groups
    .sort((a, b) => b.count - a.count);
}

export default function DefensesPage() {
  const defenseIndex = buildDefenseIndex();
  const totalCards = cards.length;
  const topDefense = defenseIndex[0];
  const top10Coverage = defenseIndex
    .slice(0, 10)
    .reduce((set, d) => {
      d.groups.forEach((g) => set.add(g.slug));
      return set;
    }, new Set<string>()).size;

  return (
    <main
      className="relative min-h-screen px-4 py-12"
      style={{
        background: "var(--color-void)",
        paddingBottom: "max(3rem, env(safe-area-inset-bottom))",
      }}
    >
      <Starfield />

      <div className="relative max-w-4xl mx-auto" style={{ zIndex: 2 }}>
        {/* Nav */}
        <div className="flex flex-wrap gap-4 mb-8">
          <a
            href="/"
            className="text-xs uppercase tracking-widest transition-opacity hover:opacity-100"
            style={{ color: "var(--color-gold)", opacity: 0.5, fontFamily: "var(--font-cinzel), serif" }}
          >
            ← Home
          </a>
          <span style={{ color: "var(--color-gold)", opacity: 0.25 }}>·</span>
          <a
            href="/gallery"
            className="text-xs uppercase tracking-widest transition-opacity hover:opacity-100"
            style={{ color: "var(--color-gold)", opacity: 0.5, fontFamily: "var(--font-cinzel), serif" }}
          >
            Gallery
          </a>
          <span style={{ color: "var(--color-gold)", opacity: 0.25 }}>·</span>
          <a
            href="/techniques"
            className="text-xs uppercase tracking-widest transition-opacity hover:opacity-100"
            style={{ color: "var(--color-gold)", opacity: 0.5, fontFamily: "var(--font-cinzel), serif" }}
          >
            Techniques
          </a>
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <h1
            className="text-2xl sm:text-3xl font-semibold mb-2"
            style={{ color: "var(--color-gold-bright)", fontFamily: "var(--font-cinzel), serif" }}
          >
            Defense Index
          </h1>
          <p className="text-sm" style={{ color: "var(--color-silver)", opacity: 0.7 }}>
            Controls ranked by how many adversaries they defend against — prioritized for defenders
          </p>
          <div
            className="mt-3 w-24 h-px mx-auto"
            style={{ background: "linear-gradient(90deg, transparent, var(--color-gold), transparent)" }}
          />
        </div>

        {/* Key stat callout */}
        <div
          className="mb-10 p-5 rounded-xl text-center"
          style={{
            background: "rgba(201,168,76,0.04)",
            border: "1px solid rgba(201,168,76,0.2)",
          }}
        >
          <div className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--color-gold)", fontFamily: "var(--font-cinzel), serif", opacity: 0.7 }}>
            Defender&apos;s Insight
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "var(--color-mist)", opacity: 0.85 }}>
            The top 10 controls below cover{" "}
            <span style={{ color: "var(--color-gold-bright)", fontWeight: 600 }}>
              {top10Coverage} of {totalCards}
            </span>{" "}
            adversary profiles ({Math.round((top10Coverage / totalCards) * 100)}%).
            {topDefense && (
              <>
                {" "}The single most effective control —{" "}
                <em style={{ color: "var(--color-mist)" }}>{topDefense.control}</em>{" "}
                — appears across {topDefense.count} adversary profiles.
              </>
            )}
          </p>
        </div>

        {/* Defense list */}
        <div className="space-y-4">
          {defenseIndex.map((defense, i) => {
            const fwUrl = defense.framework ? frameworkUrl(defense.framework) : null;
            const maxCount = defenseIndex[0].count;
            return (
              <div
                key={defense.control}
                className="px-4 py-4 rounded-xl"
                style={{
                  background: "var(--color-arcane)",
                  border: "1px solid rgba(201,168,76,0.1)",
                  animation: "section-reveal 0.35s ease-out both",
                  animationDelay: `${Math.min(i, 20) * 30}ms`,
                }}
              >
                <div className="flex items-start gap-3">
                  {/* Rank */}
                  <div
                    className="text-lg font-semibold shrink-0 w-7 text-right"
                    style={{
                      color: "var(--color-gold)",
                      opacity: i < 3 ? 0.9 : 0.4,
                      fontFamily: "var(--font-cinzel), serif",
                    }}
                  >
                    {i + 1}
                  </div>

                  {/* Main content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="flex-1">
                        <div className="text-sm font-semibold mb-1" style={{ color: "var(--color-mist)" }}>
                          {defense.control}
                        </div>
                        {defense.framework && (
                          fwUrl ? (
                            <a
                              href={fwUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs transition-opacity hover:opacity-100"
                              style={{
                                color: "var(--color-gold)",
                                opacity: 0.45,
                                textDecoration: "none",
                              }}
                            >
                              {defense.framework} ↗
                            </a>
                          ) : (
                            <span className="text-xs" style={{ color: "var(--color-silver)", opacity: 0.45 }}>
                              {defense.framework}
                            </span>
                          )
                        )}
                      </div>

                      {/* Count + bar */}
                      <div className="flex flex-col items-end shrink-0 gap-1">
                        <span
                          className="text-sm font-semibold"
                          style={{ color: "var(--color-gold-bright)", fontFamily: "var(--font-cinzel), serif" }}
                        >
                          {defense.count}
                        </span>
                        <div className="flex items-center gap-1">
                          <div
                            className="h-1.5 rounded-full"
                            style={{
                              width: `${Math.round((defense.count / maxCount) * 80)}px`,
                              background: "var(--color-gold)",
                              opacity: 0.4,
                            }}
                          />
                          <span className="text-xs" style={{ color: "var(--color-silver)", opacity: 0.4 }}>
                            groups
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Category-colored group tags */}
                    <div className="flex flex-wrap gap-1 mt-3">
                      {defense.groups.map((g) => (
                        <a
                          key={g.slug}
                          href={`/card/${g.slug}`}
                          className="text-xs px-1.5 py-0.5 rounded transition-opacity hover:opacity-100"
                          style={{
                            background: `${categoryAccent[g.category]}18`,
                            color: "var(--color-silver)",
                            border: `1px solid ${categoryAccent[g.category]}33`,
                            textDecoration: "none",
                            opacity: 0.75,
                            fontSize: "9px",
                          }}
                        >
                          {g.name}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {defenseIndex.length === 0 && (
          <div className="text-center py-16 text-sm italic" style={{ color: "var(--color-silver)", opacity: 0.45 }}>
            No shared defenses found.
          </div>
        )}

        <div className="mt-12 text-xs text-center" style={{ color: "var(--color-silver)", opacity: 0.25 }}>
          Controls sourced from MITRE ATT&amp;CK mitigations, CIS Controls, and NIST frameworks. For educational purposes.
        </div>
      </div>
    </main>
  );
}
