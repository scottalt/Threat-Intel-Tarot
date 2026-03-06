import type { Metadata } from "next";
import { cards } from "@/data/cards";
import { Starfield } from "@/components/Starfield";
import { TechniqueExplorerClient } from "@/components/TechniqueExplorerClient";

export const metadata: Metadata = {
  title: "Technique Explorer | Threat Intelligence Tarot",
  description:
    "Browse all MITRE ATT&CK techniques used across 78 adversary profiles. See which threat groups share the same tactics and techniques.",
};

type TechniqueEntry = {
  techniqueId: string;
  name: string;
  tactic: string;
  count: number;
  groups: { name: string; cardTitle: string; slug: string }[];
};

const TACTIC_ORDER = [
  "Reconnaissance",
  "Resource Development",
  "Initial Access",
  "Execution",
  "Persistence",
  "Privilege Escalation",
  "Defense Evasion",
  "Credential Access",
  "Discovery",
  "Lateral Movement",
  "Collection",
  "Command and Control",
  "Exfiltration",
  "Impact",
];

function buildTechniqueList(): TechniqueEntry[] {
  const map = new Map<string, TechniqueEntry>();
  for (const card of cards) {
    for (const ttp of card.ttps) {
      const existing = map.get(ttp.techniqueId);
      const group = { name: card.name, cardTitle: card.cardTitle, slug: card.slug };
      if (existing) {
        existing.count += 1;
        existing.groups.push(group);
      } else {
        map.set(ttp.techniqueId, {
          techniqueId: ttp.techniqueId,
          name: ttp.name,
          tactic: ttp.tactic,
          count: 1,
          groups: [group],
        });
      }
    }
  }
  // Sort by count desc within each tactic, then return flat sorted list
  return Array.from(map.values()).sort((a, b) => {
    const tacticDiff = TACTIC_ORDER.indexOf(a.tactic) - TACTIC_ORDER.indexOf(b.tactic);
    if (tacticDiff !== 0) return tacticDiff;
    return b.count - a.count;
  });
}

export default function TechniquesPage() {
  const techniques = buildTechniqueList();
  const totalTechniques = techniques.length;
  const totalUses = techniques.reduce((sum, t) => sum + t.count, 0);
  const uniqueTactics = [...new Set(techniques.map((t) => t.tactic))];
  const tacticCount = uniqueTactics.length;
  const mostUsed = [...techniques].sort((a, b) => b.count - a.count).slice(0, 5);

  // Tactic distribution: total TTP uses per tactic (across all cards)
  const tacticUsage = TACTIC_ORDER.filter((t) => uniqueTactics.includes(t)).map((tactic) => {
    const count = techniques.filter((t) => t.tactic === tactic).reduce((sum, t) => sum + t.count, 0);
    return { tactic, count };
  });
  const maxTacticCount = Math.max(...tacticUsage.map((t) => t.count));

  const orderedTactics = [
    ...TACTIC_ORDER.filter((t) => uniqueTactics.includes(t)),
    ...uniqueTactics.filter((t) => !TACTIC_ORDER.includes(t)),
  ];

  function mitreUrl(id: string) {
    return `https://attack.mitre.org/techniques/${id.replace(".", "/")}/`;
  }

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
            href="/spread"
            className="text-xs uppercase tracking-widest transition-opacity hover:opacity-100"
            style={{ color: "var(--color-gold)", opacity: 0.5, fontFamily: "var(--font-cinzel), serif" }}
          >
            Three-Card Spread
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
            Technique Explorer
          </h1>
          <p className="text-sm" style={{ color: "var(--color-silver)", opacity: 0.7 }}>
            {totalTechniques} unique MITRE ATT&amp;CK techniques across {cards.length} adversary profiles
          </p>
          <div
            className="mt-3 w-24 h-px mx-auto"
            style={{ background: "linear-gradient(90deg, transparent, var(--color-gold), transparent)" }}
          />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          {[
            { label: "Unique Techniques", value: totalTechniques },
            { label: "Total TTP Uses", value: totalUses },
            { label: "Tactics Covered", value: tacticCount },
            { label: "Adversary Profiles", value: cards.length },
          ].map((stat) => (
            <div
              key={stat.label}
              className="text-center px-3 py-3 rounded-lg"
              style={{
                background: "var(--color-arcane)",
                border: "1px solid rgba(201,168,76,0.15)",
              }}
            >
              <div
                className="text-xl font-semibold"
                style={{ color: "var(--color-gold-bright)", fontFamily: "var(--font-cinzel), serif" }}
              >
                {stat.value}
              </div>
              <div className="text-xs mt-0.5" style={{ color: "var(--color-silver)", opacity: 0.55 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Tactic distribution */}
        <div className="mb-10">
          <div
            className="text-xs uppercase tracking-widest mb-4"
            style={{ color: "var(--color-gold)", fontFamily: "var(--font-cinzel), serif", opacity: 0.7 }}
          >
            Kill-Chain Coverage
          </div>
          <div className="space-y-1.5">
            {tacticUsage.map(({ tactic, count }) => (
              <div key={tactic} className="flex items-center gap-2">
                <div
                  className="text-xs shrink-0"
                  style={{ color: "var(--color-silver)", opacity: 0.55, width: "160px", fontSize: "10px" }}
                >
                  {tactic}
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <div
                    style={{
                      height: "6px",
                      width: `${Math.round((count / maxTacticCount) * 100)}%`,
                      background: "var(--color-gold)",
                      opacity: 0.45,
                      borderRadius: "3px",
                      minWidth: "4px",
                    }}
                  />
                  <span className="text-xs shrink-0" style={{ color: "var(--color-gold)", opacity: 0.55, fontSize: "10px" }}>
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most used techniques */}
        <div className="mb-10">
          <div
            className="text-xs uppercase tracking-widest mb-4"
            style={{ color: "var(--color-gold)", fontFamily: "var(--font-cinzel), serif", opacity: 0.7 }}
          >
            Most Prevalent Techniques
          </div>
          <div className="space-y-2">
            {mostUsed.map((tech, i) => (
              <div
                key={tech.techniqueId}
                className="flex items-center gap-3 px-3 py-2 rounded"
                style={{
                  background: "var(--color-arcane)",
                  border: "1px solid rgba(201,168,76,0.12)",
                }}
              >
                <span className="text-xs w-5 text-center shrink-0" style={{ color: "var(--color-gold)", opacity: 0.45 }}>
                  {i + 1}
                </span>
                <a
                  href={mitreUrl(tech.techniqueId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs shrink-0 transition-opacity hover:opacity-100"
                  style={{ color: "var(--color-gold)", opacity: 0.7, textDecoration: "none" }}
                >
                  {tech.techniqueId}
                </a>
                <div className="flex-1 min-w-0">
                  <span className="text-sm" style={{ color: "var(--color-mist)" }}>
                    {tech.name}
                  </span>
                  <span className="text-xs ml-2" style={{ color: "var(--color-silver)", opacity: 0.5 }}>
                    {tech.tactic}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <div
                    className="h-1.5 rounded-full"
                    style={{
                      width: `${Math.round((tech.count / mostUsed[0].count) * 64)}px`,
                      background: "var(--color-gold)",
                      opacity: 0.5,
                    }}
                  />
                  <span className="text-xs font-mono" style={{ color: "var(--color-gold)", opacity: 0.7 }}>
                    {tech.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div
          className="w-full h-px mb-10"
          style={{ background: "linear-gradient(90deg, transparent, var(--color-gold), transparent)", opacity: 0.3 }}
        />

        {/* Client-side search + tactic filter + results */}
        <TechniqueExplorerClient techniques={techniques} allTactics={orderedTactics} />

        <div className="mt-12 text-xs text-center" style={{ color: "var(--color-silver)", opacity: 0.25 }}>
          Data sourced from MITRE ATT&amp;CK. For educational purposes.
        </div>
      </div>
    </main>
  );
}
