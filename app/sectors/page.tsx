import type { Metadata } from "next";
import { cards } from "@/data/cards";
import { Starfield } from "@/components/Starfield";
import { SectorIndexClient } from "@/components/SectorIndexClient";

export const metadata: Metadata = {
  title: "Sector Intelligence | Threat Intelligence Tarot",
  description:
    "Which industries are targeted by the most threat actors? Ranked by adversary count across 78 groups, with risk profiles for each sector.",
};

type SectorEntry = {
  sector: string;
  count: number;
  avgRisk: number;
  groups: { name: string; cardTitle: string; slug: string; category: string; riskLevel: number }[];
};

function buildSectorIndex(): SectorEntry[] {
  const map = new Map<string, SectorEntry>();

  for (const card of cards) {
    const seenSectors = new Set<string>();
    for (const sector of card.targets) {
      const key = sector.trim().toLowerCase();
      if (seenSectors.has(key)) continue;
      seenSectors.add(key);

      const group = {
        name: card.name,
        cardTitle: card.cardTitle,
        slug: card.slug,
        category: card.category,
        riskLevel: card.riskLevel,
      };

      const existing = map.get(key);
      if (existing) {
        existing.count += 1;
        existing.groups.push(group);
        // Recompute avg risk
        existing.avgRisk =
          existing.groups.reduce((s, g) => s + g.riskLevel, 0) / existing.groups.length;
      } else {
        map.set(key, {
          sector: sector.trim(),
          count: 1,
          avgRisk: card.riskLevel,
          groups: [group],
        });
      }
    }
  }

  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}

export default function SectorsPage() {
  const sectors = buildSectorIndex();
  const topSector = sectors[0];
  const highRiskSectors = sectors.filter((s) => s.avgRisk >= 4).length;

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
            Home
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
            href="/defenses"
            className="text-xs uppercase tracking-widest transition-opacity hover:opacity-100"
            style={{ color: "var(--color-gold)", opacity: 0.5, fontFamily: "var(--font-cinzel), serif" }}
          >
            Defenses
          </a>
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <h1
            className="text-2xl sm:text-3xl font-semibold mb-2"
            style={{ color: "var(--color-gold-bright)", fontFamily: "var(--font-cinzel), serif" }}
          >
            Sector Intelligence
          </h1>
          <p className="text-sm" style={{ color: "var(--color-silver)", opacity: 0.7 }}>
            Industries ranked by threat actor targeting across {cards.length} adversary profiles
          </p>
          <div
            className="mt-3 w-24 h-px mx-auto"
            style={{ background: "linear-gradient(90deg, transparent, var(--color-gold), transparent)" }}
          />
        </div>

        {/* Stat callout */}
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
            Sector Risk Summary
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "var(--color-mist)", opacity: 0.85 }}>
            {topSector && (
              <>
                <span style={{ color: "var(--color-gold-bright)", fontWeight: 600 }}>
                  {topSector.sector}
                </span>{" "}
                is targeted by the most adversaries ({topSector.count} groups).{" "}
              </>
            )}
            <span style={{ color: "var(--color-gold-bright)", fontWeight: 600 }}>
              {highRiskSectors}
            </span>{" "}
            sector{highRiskSectors !== 1 ? "s" : ""} face an average threat actor risk of 4/5 or higher.
          </p>
        </div>

        <SectorIndexClient sectors={sectors} />

        <div className="mt-12 text-xs text-center" style={{ color: "var(--color-silver)", opacity: 0.25 }}>
          Targeting data sourced from MITRE ATT&CK and public threat intelligence reports. For educational purposes.
        </div>
      </div>
    </main>
  );
}
