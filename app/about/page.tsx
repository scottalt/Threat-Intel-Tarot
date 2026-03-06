import type { Metadata } from "next";
import { Starfield } from "@/components/Starfield";
import { cards } from "@/data/cards";

export const metadata: Metadata = {
  title: "About | Threat Intelligence Tarot",
  description:
    "Threat Intelligence Tarot: real MITRE ATT&CK data for 78 adversary groups, presented as a tarot card deck.",
};

export default function AboutPage() {
  const majorCount = cards.filter((c) => c.arcanum === "major").length;

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
            Home
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
          <span style={{ color: "var(--color-gold)", opacity: 0.25 }}>·</span>
          <a
            href="/defenses"
            className="text-xs uppercase tracking-widest transition-opacity hover:opacity-100"
            style={{
              color: "var(--color-gold)",
              opacity: 0.5,
              fontFamily: "var(--font-cinzel), serif",
            }}
          >
            Defenses
          </a>
          <span style={{ color: "var(--color-gold)", opacity: 0.25 }}>·</span>
          <a
            href="/compare"
            className="text-xs uppercase tracking-widest transition-opacity hover:opacity-100"
            style={{
              color: "var(--color-gold)",
              opacity: 0.5,
              fontFamily: "var(--font-cinzel), serif",
            }}
          >
            Compare
          </a>
        </div>

        <h1
          className="text-2xl sm:text-3xl font-semibold mb-2"
          style={{
            color: "var(--color-gold-bright)",
            fontFamily: "var(--font-cinzel), serif",
            animation: "hero-rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
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
              The tarot format is deliberate. Real threat intelligence is dense and technical: easy to ignore,
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
                <span><strong style={{ color: "var(--color-mist)" }}>Draw a Card:</strong> random adversary from the full deck. Flip to reveal their TTPs, targets, and defenses.</span>
              </li>
              <li className="flex gap-2">
                <span style={{ color: "var(--color-crimson)", flexShrink: 0 }}>◆</span>
                <span><strong style={{ color: "var(--color-mist)" }}>Three-Card Spread:</strong> draw Past, Present, and Future threat actors. Get a reading of your threat landscape with shared TTPs and priority defenses across all three.</span>
              </li>
              <li className="flex gap-2">
                <span style={{ color: "var(--color-crimson)", flexShrink: 0 }}>◆</span>
                <span><strong style={{ color: "var(--color-mist)" }}>Card of the Day:</strong> seed-based daily adversary. Same card for everyone on a given day, refreshes at midnight.</span>
              </li>
              <li className="flex gap-2">
                <span style={{ color: "var(--color-crimson)", flexShrink: 0 }}>◆</span>
                <span><strong style={{ color: "var(--color-mist)" }}>Gallery:</strong> browse all 78 cards. Filter by threat category, suit, or origin country. Search by group name, alias, technique ID, or targeted sector.</span>
              </li>
              <li className="flex gap-2">
                <span style={{ color: "var(--color-crimson)", flexShrink: 0 }}>◆</span>
                <span><strong style={{ color: "var(--color-mist)" }}>Technique Explorer:</strong> view all MITRE ATT&amp;CK techniques across the full deck, grouped by tactic, ranked by prevalence, with a kill-chain distribution chart.</span>
              </li>
              <li className="flex gap-2">
                <span style={{ color: "var(--color-crimson)", flexShrink: 0 }}>◆</span>
                <span><strong style={{ color: "var(--color-mist)" }}>Defense Index:</strong> discover which security controls defend against the most adversaries. Ranked by cross-deck coverage to help prioritize controls with the broadest impact.</span>
              </li>
              <li className="flex gap-2">
                <span style={{ color: "var(--color-crimson)", flexShrink: 0 }}>◆</span>
                <span><strong style={{ color: "var(--color-mist)" }}>ATT&amp;CK Navigator Export:</strong> from any card or daily page, download a Navigator v5 layer file pre-loaded with that adversary's techniques. Import directly into{" "}
                  <a href="https://mitre-attack.github.io/attack-navigator/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-gold)", textDecoration: "underline" }}>
                    ATT&CK Navigator
                  </a>
                  {" "}for deeper analysis.</span>
              </li>
              <li className="flex gap-2">
                <span style={{ color: "var(--color-crimson)", flexShrink: 0 }}>◆</span>
                <span><strong style={{ color: "var(--color-mist)" }}>Threat Brief:</strong> copy a clean markdown adversary profile to your clipboard. Paste into reports, Confluence, or security awareness materials.</span>
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
              Each card shows the group's <strong>tarot identity</strong>, real group name and aliases, active years, origin, and risk level. Below that: the sectors they target, their MITRE ATT&CK techniques with a kill-chain coverage heatmap (click any technique ID to open the full MITRE reference), notable operations, and specific defensive recommendations.
            </p>
            <p className="mt-3" style={{ opacity: 0.85 }}>
              The <em>Reversed Meaning</em> section (borrowed from tarot tradition) documents the group's known failures, operational security mistakes, and the circumstances that led to their exposure or disruption.
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
              , public government advisories (CISA, NSA, FBI, NCSC), and documented security research from Mandiant, CrowdStrike, Kaspersky, Citizen Lab, and others. All information is publicly available. Flavor text and reversed meanings are creative interpretations; threat data is factual.
            </p>
          </section>
        </div>

        {/* Author */}
        <div
          className="mt-10 p-5 rounded-xl"
          style={{
            background: "rgba(201,168,76,0.03)",
            border: "1px solid rgba(201,168,76,0.12)",
          }}
        >
          <div
            className="text-xs uppercase tracking-widest mb-2"
            style={{ color: "var(--color-gold)", fontFamily: "var(--font-cinzel), serif", opacity: 0.7 }}
          >
            Built by
          </div>
          <div className="text-sm mb-1" style={{ color: "var(--color-mist)", opacity: 0.85 }}>
            <strong>Scott Altiparmak</strong>, Senior Information Security Engineer, CISSP
          </div>
          <div className="text-xs mb-2" style={{ color: "var(--color-silver)", opacity: 0.55 }}>
            Live at{" "}
            <a
              href="https://tarot.scottaltiparmak.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--color-gold)", opacity: 0.8, textDecoration: "none" }}
            >
              tarot.scottaltiparmak.com
            </a>
          </div>
          <div className="flex gap-4 mt-2">
            <a
              href="https://www.scottaltiparmak.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs transition-opacity hover:opacity-100"
              style={{ color: "var(--color-gold)", opacity: 0.5, textDecoration: "none" }}
            >
              scottaltiparmak.com
            </a>
            <a
              href="https://www.linkedin.com/in/scottaltiparmak/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs transition-opacity hover:opacity-100"
              style={{ color: "var(--color-gold)", opacity: 0.5, textDecoration: "none" }}
            >
              LinkedIn
            </a>
            <a
              href="https://github.com/scottalt"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs transition-opacity hover:opacity-100"
              style={{ color: "var(--color-gold)", opacity: 0.5, textDecoration: "none" }}
            >
              GitHub
            </a>
          </div>
        </div>

        <div
          className="mt-8 pt-6 text-xs text-center"
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
