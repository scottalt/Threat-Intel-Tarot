import type { Metadata } from "next";
import { cards } from "@/data/cards";
import { Starfield } from "@/components/Starfield";
import { SiteNav } from "@/components/SiteNav";
import { BackToTop } from "@/components/BackToTop";
import { MapClient } from "@/components/MapClient";

export const metadata: Metadata = {
  title: "Map | Threat Intelligence Tarot",
  description:
    "Global threat actor origin map. See where the world's most dangerous adversaries operate, clustered by region and category across 78 APT profiles.",
};

export default function MapPage() {
  const nationStateCount = cards.filter((c) => c.category === "nation-state").length;
  const criminalCount    = cards.filter((c) => c.category === "criminal").length;
  const hacktivistCount  = cards.filter((c) => c.category === "hacktivist").length;

  return (
    <main
      id="main-content"
      className="relative min-h-screen px-4 py-12"
      style={{
        background: "var(--color-void)",
        paddingBottom: "max(3rem, env(safe-area-inset-bottom))",
      }}
    >
      <Starfield />
      <BackToTop />

      <div className="relative max-w-6xl mx-auto" style={{ zIndex: 2 }}>
        <SiteNav current="/map" />

        {/* Header */}
        <div className="text-center mb-10">
          <h1
            className="text-2xl sm:text-3xl font-semibold mb-2"
            style={{
              color: "var(--color-gold-bright)",
              fontFamily: "var(--font-cinzel), serif",
              animation: "hero-rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
            }}
          >
            Threat Landscape Map
          </h1>
          <p
            className="text-sm"
            style={{
              color: "var(--color-silver)",
              opacity: 0.7,
              animation: "hero-rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) 120ms both",
            }}
          >
            Global origin map across {cards.length} adversary profiles. Click a node to explore.
          </p>
          <div
            className="mt-3 w-24 h-px mx-auto"
            style={{
              background: "linear-gradient(90deg, transparent, var(--color-gold), transparent)",
            }}
          />
        </div>

        {/* Stat callout */}
        <div
          className="mb-8 p-5 rounded-xl"
          style={{
            background: "rgba(201,168,76,0.04)",
            border: "1px solid rgba(201,168,76,0.15)",
          }}
        >
          <div className="flex flex-wrap justify-center gap-8">
            <div className="text-center">
              <div
                className="text-xl font-semibold"
                style={{ color: "#4aadad", fontFamily: "var(--font-cinzel), serif" }}
              >
                {nationStateCount}
              </div>
              <div
                className="text-xs uppercase tracking-widest mt-1"
                style={{ color: "var(--color-silver)", opacity: 0.55, fontFamily: "var(--font-cinzel), serif" }}
              >
                Nation-State
              </div>
            </div>
            <div className="text-center">
              <div
                className="text-xl font-semibold"
                style={{ color: "#9f7aea", fontFamily: "var(--font-cinzel), serif" }}
              >
                {criminalCount}
              </div>
              <div
                className="text-xs uppercase tracking-widest mt-1"
                style={{ color: "var(--color-silver)", opacity: 0.55, fontFamily: "var(--font-cinzel), serif" }}
              >
                Criminal
              </div>
            </div>
            <div className="text-center">
              <div
                className="text-xl font-semibold"
                style={{ color: "#f97316", fontFamily: "var(--font-cinzel), serif" }}
              >
                {hacktivistCount}
              </div>
              <div
                className="text-xs uppercase tracking-widest mt-1"
                style={{ color: "var(--color-silver)", opacity: 0.55, fontFamily: "var(--font-cinzel), serif" }}
              >
                Hacktivist
              </div>
            </div>
          </div>
        </div>

        <MapClient cards={cards} />

        <div className="mt-10 text-xs text-center" style={{ color: "var(--color-silver)", opacity: 0.25 }}>
          Origin data sourced from MITRE ATT&CK and public threat intelligence reporting. For educational purposes.
        </div>
      </div>
    </main>
  );
}
