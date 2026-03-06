import type { Metadata } from "next";
import { cards } from "@/data/cards";
import { GalleryClient } from "@/components/GalleryClient";
import { Starfield } from "@/components/Starfield";

export const metadata: Metadata = {
  title: "All Adversaries | Threat Intelligence Tarot",
  description:
    "Browse all 78 adversary profiles: the complete tarot deck. Nation-state, criminal, and hacktivist groups from MITRE ATT&CK.",
};

export default function GalleryPage() {
  return (
    <main
      className="relative min-h-screen px-4 py-12"
      style={{
        background: "var(--color-void)",
        paddingBottom: "max(3rem, env(safe-area-inset-bottom))",
      }}
    >
      <Starfield />

      <div className="relative max-w-5xl mx-auto" style={{ zIndex: 2 }}>
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
            href="/spread"
            className="text-xs uppercase tracking-widest transition-opacity hover:opacity-100"
            style={{
              color: "var(--color-gold)",
              opacity: 0.5,
              fontFamily: "var(--font-cinzel), serif",
            }}
          >
            Three-Card Spread
          </a>
          <span style={{ color: "var(--color-gold)", opacity: 0.25 }}>·</span>
          <a
            href="/daily"
            className="text-xs uppercase tracking-widest transition-opacity hover:opacity-100"
            style={{
              color: "var(--color-gold)",
              opacity: 0.5,
              fontFamily: "var(--font-cinzel), serif",
            }}
          >
            Daily Card
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
            href="/sectors"
            className="text-xs uppercase tracking-widest transition-opacity hover:opacity-100"
            style={{
              color: "var(--color-gold)",
              opacity: 0.5,
              fontFamily: "var(--font-cinzel), serif",
            }}
          >
            Sectors
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

        {/* Header */}
        <div className="text-center mb-10">
          <h1
            className="text-2xl sm:text-3xl font-semibold mb-2"
            style={{
              color: "var(--color-gold-bright)",
              fontFamily: "var(--font-cinzel), serif",
            }}
          >
            The Adversary Archive
          </h1>
          <p
            className="text-sm"
            style={{ color: "var(--color-silver)", opacity: 0.7 }}
          >
            {cards.length} adversary profiles across Major and Minor Arcana.
          </p>
          <div
            className="mt-3 w-24 h-px mx-auto"
            style={{
              background:
                "linear-gradient(90deg, transparent, var(--color-gold), transparent)",
            }}
          />
        </div>

        <GalleryClient cards={cards} />

        <div
          className="mt-12 text-xs text-center"
          style={{ color: "var(--color-silver)", opacity: 0.25 }}
        >
          Data sourced from MITRE ATT&CK. For educational purposes.
        </div>
      </div>
    </main>
  );
}
