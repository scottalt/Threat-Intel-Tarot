import type { Metadata } from "next";
import { cards } from "@/data/cards";
import { Starfield } from "@/components/Starfield";
import { DefenseIndexClient } from "@/components/DefenseIndexClient";

export const metadata: Metadata = {
  title: "Defense Index | Threat Intelligence Tarot",
  description:
    "Which security controls defend against the most threat actors? Ranked by coverage across 78 adversary profiles, prioritized for defenders.",
};

type DefenseEntry = {
  control: string;
  framework: string | null;
  count: number;
  groups: { name: string; cardTitle: string; slug: string; category: string }[];
};

function buildDefenseIndex(): DefenseEntry[] {
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
    .filter((e) => e.count >= 2)
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
          <span style={{ color: "var(--color-gold)", opacity: 0.25 }}>·</span>
          <a
            href="/sectors"
            className="text-xs uppercase tracking-widest transition-opacity hover:opacity-100"
            style={{ color: "var(--color-gold)", opacity: 0.5, fontFamily: "var(--font-cinzel), serif" }}
          >
            Sectors
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
            Controls ranked by how many adversaries they defend against, prioritized for defenders
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
          <div
            className="text-xs uppercase tracking-widest mb-3"
            style={{ color: "var(--color-gold)", fontFamily: "var(--font-cinzel), serif", opacity: 0.7 }}
          >
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
                {" "}The single most effective control,{" "}
                <em style={{ color: "var(--color-mist)" }}>{topDefense.control}</em>
                , appears across {topDefense.count} adversary profiles.
              </>
            )}
          </p>
        </div>

        {/* Defense list — client component with search + framework filter */}
        <DefenseIndexClient defenses={defenseIndex} />

        <div className="mt-12 text-xs text-center" style={{ color: "var(--color-silver)", opacity: 0.25 }}>
          Controls sourced from MITRE ATT&amp;CK mitigations, CIS Controls, and NIST frameworks. For educational purposes.
        </div>
      </div>
    </main>
  );
}
