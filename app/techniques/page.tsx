import type { Metadata } from "next";
import { cards } from "@/data/cards";
import { Starfield } from "@/components/Starfield";

export const metadata: Metadata = {
  title: "Technique Explorer — Threat Intelligence Tarot",
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

function buildTechniqueMap(): Map<string, TechniqueEntry> {
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
  return map;
}

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

const TACTIC_SHORT: Record<string, string> = {
  Reconnaissance: "RECON",
  "Resource Development": "RESOURCE",
  "Initial Access": "INIT ACCESS",
  Execution: "EXEC",
  Persistence: "PERSIST",
  "Privilege Escalation": "PRIV ESC",
  "Defense Evasion": "DEF EVASION",
  "Credential Access": "CRED ACCESS",
  Discovery: "DISCOVERY",
  "Lateral Movement": "LAT MOVE",
  Collection: "COLLECTION",
  "Command and Control": "C2",
  Exfiltration: "EXFIL",
  Impact: "IMPACT",
};

function mitreUrl(id: string): string {
  return `https://attack.mitre.org/techniques/${id.replace(".", "/")}/`;
}

export default function TechniquesPage() {
  const techniqueMap = buildTechniqueMap();
  const allTechniques = Array.from(techniqueMap.values());

  // Group by tactic
  const byTactic = new Map<string, TechniqueEntry[]>();
  for (const tech of allTechniques) {
    const list = byTactic.get(tech.tactic) ?? [];
    list.push(tech);
    byTactic.set(tech.tactic, list);
  }

  // Sort techniques within each tactic by count desc
  for (const [tactic, list] of byTactic) {
    byTactic.set(tactic, list.sort((a, b) => b.count - a.count));
  }

  const totalTechniques = allTechniques.length;
  const totalUses = allTechniques.reduce((sum, t) => sum + t.count, 0);
  const mostUsed = [...allTechniques].sort((a, b) => b.count - a.count).slice(0, 5);

  // Get ordered tactics (only those that exist in our data)
  const orderedTactics = [
    ...TACTIC_ORDER.filter((t) => byTactic.has(t)),
    ...[...byTactic.keys()].filter((t) => !TACTIC_ORDER.includes(t)),
  ];

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
            { label: "Tactics Covered", value: orderedTactics.length },
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
                <span
                  className="text-xs w-5 text-center shrink-0"
                  style={{ color: "var(--color-gold)", opacity: 0.45 }}
                >
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

        {/* Techniques by tactic */}
        <div className="space-y-10">
          {orderedTactics.map((tactic) => {
            const techniques = byTactic.get(tactic) ?? [];
            const maxCount = techniques[0]?.count ?? 1;
            return (
              <div key={tactic}>
                {/* Tactic header */}
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="text-xs px-2 py-0.5 rounded font-mono"
                    style={{
                      background: "rgba(201,168,76,0.1)",
                      color: "var(--color-gold)",
                      border: "1px solid rgba(201,168,76,0.2)",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {TACTIC_SHORT[tactic] ?? tactic.toUpperCase()}
                  </span>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "var(--color-gold-bright)", fontFamily: "var(--font-cinzel), serif" }}
                  >
                    {tactic}
                  </span>
                  <span className="text-xs" style={{ color: "var(--color-silver)", opacity: 0.4 }}>
                    {techniques.length} technique{techniques.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Technique rows */}
                <div className="space-y-1.5">
                  {techniques.map((tech) => (
                    <div
                      key={tech.techniqueId}
                      className="flex items-start gap-3 px-3 py-2 rounded group"
                      style={{
                        background: "var(--color-arcane)",
                        border: "1px solid rgba(201,168,76,0.08)",
                      }}
                    >
                      {/* Technique ID */}
                      <a
                        href={mitreUrl(tech.techniqueId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs shrink-0 transition-opacity hover:opacity-100"
                        style={{
                          color: "var(--color-gold)",
                          opacity: 0.6,
                          textDecoration: "none",
                          minWidth: "72px",
                          marginTop: "2px",
                        }}
                      >
                        {tech.techniqueId}
                      </a>

                      {/* Name + groups */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm" style={{ color: "var(--color-mist)" }}>
                          {tech.name}
                        </div>
                        {tech.count > 1 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {tech.groups.map((g) => (
                              <a
                                key={g.slug}
                                href={`/card/${g.slug}`}
                                className="text-xs px-1.5 py-0.5 rounded transition-opacity hover:opacity-100"
                                style={{
                                  background: "rgba(192,192,192,0.08)",
                                  color: "var(--color-silver)",
                                  border: "1px solid rgba(192,192,192,0.15)",
                                  textDecoration: "none",
                                  opacity: 0.75,
                                  fontSize: "9px",
                                }}
                              >
                                {g.name}
                              </a>
                            ))}
                          </div>
                        )}
                        {tech.count === 1 && (
                          <div className="text-xs mt-0.5" style={{ color: "var(--color-silver)", opacity: 0.4 }}>
                            <a
                              href={`/card/${tech.groups[0].slug}`}
                              style={{ color: "inherit", textDecoration: "none" }}
                            >
                              {tech.groups[0].name}
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Count bar */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {tech.count > 1 && (
                          <div
                            className="h-1 rounded-full opacity-40"
                            style={{
                              width: `${Math.max(8, Math.round((tech.count / maxCount) * 40))}px`,
                              background: "var(--color-gold)",
                            }}
                          />
                        )}
                        <span
                          className="text-xs font-mono"
                          style={{ color: "var(--color-silver)", opacity: tech.count > 1 ? 0.7 : 0.3 }}
                        >
                          {tech.count}×
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-xs text-center" style={{ color: "var(--color-silver)", opacity: 0.25 }}>
          Data sourced from MITRE ATT&amp;CK. For educational purposes.
        </div>
      </div>
    </main>
  );
}
