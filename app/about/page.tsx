import type { Metadata } from "next";
import { Starfield } from "@/components/Starfield";
import { cards } from "@/data/cards";

export const metadata: Metadata = {
  title: "About — Threat Intelligence Tarot",
  description:
    "Threat Intelligence Tarot: real MITRE ATT&CK data for 78 adversary groups, presented as a tarot card deck.",
};

export default function AboutPage() {
  const majorCount = cards.filter((c) => c.arcanum === "major").length;
  const minorCount = cards.filter((c) => c.arcanum === "minor").length;

  const suitCounts = {
    swords: cards.filter((c) => c.suit === "swords").length,
    wands: cards.filter((c) => c.suit === "wands").length,
    cups: cards.filter((c) => c.suit === "cups").length,
    pentacles: cards.filter((c) => c.suit === "pentacles").length,
  };

  return (
    <main
      className="relative min-h-screen px-4 py-12"
      style={{
        background: "var(--color-void)",
        paddingBottom: "max(3rem, env(safe-area-inset-bottom))",
      }}
    >
      <Starfield />

      <div
        className="relative max-w-2xl mx-auto"
        style={{ zIndex: 2 }}
      >
        {/* Nav */}
        <div className="flex gap-4 mb-8">
          <a
            href="/"
            className="text-xs uppercase tracking-widest transition-opacity hover:opacity-100"
            style={{
              color: "var(--color-gold)",
              opacity: 0.5,
              fontFamily: "var(--font-cinzel), serif",
            }}
          >
            ← Home
          </a>
          <span style={{ color: "var(--color-gold)", opacity: 0.25 }}>·</span>
          <a
            href="/gallery"
            className="text-xs uppercase tracking-widest transition-opacity hover:opacity-100"
            style={{
              color: "var(--color-gold)",
              opacity: 0.5,
              fontFamily: "var(--font-cinzel), serif",
            }}
          >
            Gallery
          </a>
          <span style={{ color: "var(--color-gold)", opacity: 0.25 }}>·</span>
          <a
            href="/techniques"
            className="text-xs uppercase tracking-widest transition-opacity hover:opacity-100"
            style={{
              color: "var(--color-gold)",
              opacity: 0.5,
              fontFamily: "var(--font-cinzel), serif",
            }}
          >
            Techniques
          </a>
        </div>

        <h1
          className="text-2xl sm:text-3xl font-semibold mb-2"
          style={{
            color: "var(--color-gold-bright)",
            fontFamily: "var(--font-cinzel), serif",
          }}
        >
          About This Deck
        </h1>
        <div
          className="w-16 h-px mb-8"
          style={{
            background: "linear-gradient(90deg, var(--color-gold), transparent)",
          }}
        />

        <div
          className="space-y-8 text-sm leading-relaxed"
          style={{ color: "var(--color-mist)" }}
        >
          <section>
            <h2
              className="text-xs uppercase tracking-widest mb-3"
              style={{
                color: "var(--color-gold)",
                fontFamily: "var(--font-cinzel), serif",
                opacity: 0.8,
              }}
            >
              What This Is
            </h2>
            <p style={{ opacity: 0.85 }}>
              Threat Intelligence Tarot is an educational tool for information security practitioners.
              Each card in the deck represents a real threat actor group, drawn from{" "}
              <a
                href="https://attack.mitre.org/groups/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--color-gold)", textDecoration: "underline" }}
              >
                MITRE ATT&CK
              </a>{" "}
              and documented threat intelligence reports.
            </p>
            <p className="mt-3" style={{ opacity: 0.85 }}>
              The tarot format is deliberate. Real threat intelligence is dense and technical — easy to ignore,
              hard to internalize. Packaging it as a card game makes it memorable, shareable, and
              impossible to scroll past. The mystical framing is aesthetics. The threat data is real.
            </p>
          </section>

          <section>
            <h2
              className="text-xs uppercase tracking-widest mb-3"
              style={{
                color: "var(--color-gold)",
                fontFamily: "var(--font-cinzel), serif",
                opacity: 0.8,
              }}
            >
              The Deck
            </h2>
            <p style={{ opacity: 0.85 }}>
              The full 78-card deck maps directly to tarot structure:
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                { label: "Major Arcana", count: majorCount, desc: "The most iconic APT groups" },
                { label: "Swords", count: suitCounts.swords, desc: "Espionage & Intelligence" },
                { label: "Wands", count: suitCounts.wands, desc: "Disruption & Destruction" },
                { label: "Cups", count: suitCounts.cups, desc: "Social Engineering & Deception" },
                { label: "Pentacles", count: suitCounts.pentacles, desc: "Financial Crime & Ransomware" },
              ].map((suit) => (
                <div
                  key={suit.label}
                  className="p-3 rounded"
                  style={{
                    background: "rgba(201,168,76,0.04)",
                    border: "1px solid rgba(201,168,76,0.15)",
                  }}
                >
                  <div
                    className="text-xs font-semibold mb-0.5"
                    style={{ color: "var(--color-gold-bright)", fontFamily: "var(--font-cinzel), serif" }}
                  >
                    {suit.label}
                  </div>
                  <div className="text-xs" style={{ color: "var(--color-silver)", opacity: 0.55 }}>
                    {suit.count} cards · {suit.desc}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2
              className="text-xs uppercase tracking-widest mb-3"
              style={{
                color: "var(--color-gold)",
                fontFamily: "var(--font-cinzel), serif",
                opacity: 0.8,
              }}
            >
              How to Use It
            </h2>
            <ul className="space-y-2" style={{ opacity: 0.85 }}>
              <li className="flex gap-2">
                <span style={{ color: "var(--color-crimson)", flexShrink: 0 }}>◆</span>
                <span><strong style={{ color: "var(--color-mist)" }}>Draw a Card</strong> — random adversary from the full deck. Flip to reveal their TTPs, targets, and defenses.</span>
              </li>
              <li className="flex gap-2">
                <span style={{ color: "var(--color-crimson)", flexShrink: 0 }}>◆</span>
                <span><strong style={{ color: "var(--color-mist)" }}>Three-Card Spread</strong> — draw Past, Present, and Future threat actors. Get a reading of your threat landscape.</span>
              </li>
              <li className="flex gap-2">
                <span style={{ color: "var(--color-crimson)", flexShrink: 0 }}>◆</span>
                <span><strong style={{ color: "var(--color-mist)" }}>Card of the Day</strong> — seed-based daily adversary. Same card for everyone on a given day, refreshes at midnight.</span>
              </li>
              <li className="flex gap-2">
                <span style={{ color: "var(--color-crimson)", flexShrink: 0 }}>◆</span>
                <span><strong style={{ color: "var(--color-mist)" }}>Gallery</strong> — browse all 78 cards. Filter by threat category or suit. Search by group name, alias, or origin country.</span>
              </li>
              <li className="flex gap-2">
                <span style={{ color: "var(--color-crimson)", flexShrink: 0 }}>◆</span>
                <span><strong style={{ color: "var(--color-mist)" }}>Technique Explorer</strong> — view all MITRE ATT&amp;CK techniques used across the full deck, grouped by tactic and ranked by prevalence across threat actors.</span>
              </li>
            </ul>
          </section>

          <section>
            <h2
              className="text-xs uppercase tracking-widest mb-3"
              style={{
                color: "var(--color-gold)",
                fontFamily: "var(--font-cinzel), serif",
                opacity: 0.8,
              }}
            >
              Reading a Card
            </h2>
            <p style={{ opacity: 0.85 }}>
              Each card shows the group's <strong>tarot identity</strong>, real group name and aliases, active years, origin, and risk level. Below that: the sectors they target, their MITRE ATT&CK techniques (click any technique ID to open the full MITRE reference), notable operations, and specific defensive recommendations.
            </p>
            <p className="mt-3" style={{ opacity: 0.85 }}>
              The <em>Reversed Meaning</em> section — borrowed from tarot tradition — documents the group's known failures, operational security mistakes, and the circumstances that led to their exposure or disruption.
            </p>
          </section>

          <section>
            <h2
              className="text-xs uppercase tracking-widest mb-3"
              style={{
                color: "var(--color-gold)",
                fontFamily: "var(--font-cinzel), serif",
                opacity: 0.8,
              }}
            >
              Data Sources
            </h2>
            <p style={{ opacity: 0.85 }}>
              Threat actor data is drawn from{" "}
              <a
                href="https://attack.mitre.org"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--color-gold)", textDecoration: "underline" }}
              >
                MITRE ATT&CK
              </a>
              , public government advisories (CISA, NSA, FBI, NCSC), and documented security research from Mandiant, CrowdStrike, Kaspersky, Citizen Lab, and others. All information is publicly available. This tool is for educational purposes only.
            </p>
          </section>
        </div>

        <div
          className="mt-12 pt-8 text-xs text-center"
          style={{
            borderTop: "1px solid rgba(201,168,76,0.1)",
            color: "var(--color-silver)",
            opacity: 0.35,
          }}
        >
          Data sourced from MITRE ATT&CK. For educational purposes only.
        </div>
      </div>
    </main>
  );
}
