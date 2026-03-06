"use client";

import { useState } from "react";
import { drawRandom } from "@/lib/draw";
import { TarotCard } from "@/components/TarotCard";
import { DrawButton } from "@/components/DrawButton";
import { Starfield } from "@/components/Starfield";
import type { TarotCard as TarotCardType } from "@/data/types";

const categoryNebula: Record<string, string> = {
  "nation-state":
    "radial-gradient(ellipse 700px 500px at 50% 65%, rgba(45,106,106,0.22) 0%, transparent 70%)",
  criminal:
    "radial-gradient(ellipse 700px 500px at 50% 65%, rgba(74,26,106,0.28) 0%, transparent 70%)",
  hacktivist:
    "radial-gradient(ellipse 700px 500px at 50% 65%, rgba(139,58,15,0.22) 0%, transparent 70%)",
};

export default function Home() {
  const [card, setCard] = useState<TarotCardType | null>(null);
  const [key, setKey] = useState(0);
  const [nebula, setNebula] = useState<string | null>(null);

  const handleDraw = () => {
    const drawn = drawRandom();
    setCard(drawn);
    setKey((k) => k + 1);
    setNebula(categoryNebula[drawn.category] ?? null);
  };

  return (
    <main
      className="relative min-h-screen flex flex-col items-center justify-start py-16 px-4"
      style={{
        background: "var(--color-void)",
        paddingBottom: "max(4rem, env(safe-area-inset-bottom))",
      }}
    >
      <Starfield />

      {nebula && (
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            background: nebula,
            zIndex: 1,
            pointerEvents: "none",
            animation: "nebula-in 0.8s ease-out both",
          }}
        />
      )}

      <div
        className="relative flex flex-col items-center w-full"
        style={{ zIndex: 2 }}
      >
        <div className="text-center mb-12">
          <h1
            className="text-3xl sm:text-4xl font-semibold mb-3"
            style={{
              color: "var(--color-gold-bright)",
              fontFamily: "var(--font-cinzel), serif",
            }}
          >
            Threat Intelligence Tarot
          </h1>
          <p
            className="text-sm sm:text-base"
            style={{ color: "var(--color-silver)" }}
          >
            Real threat intelligence. Impossible to scroll past.
          </p>
          <div
            className="mt-3 w-24 h-px mx-auto"
            style={{
              background:
                "linear-gradient(90deg, transparent, var(--color-gold), transparent)",
            }}
          />
        </div>

        <DrawButton onClick={handleDraw} />

        {card && (
          <div className="mt-10">
            <TarotCard key={key} card={card} />
          </div>
        )}

        {!card && (
          <div
            className="mt-16 text-center text-sm italic select-none"
            style={{
              color: "var(--color-silver)",
              opacity: 0.45,
              animation: "float 3.2s ease-in-out infinite",
            }}
          >
            The cards await. Draw to reveal your adversary.
          </div>
        )}

        <div
          className="mt-auto pt-16 text-xs text-center"
          style={{ color: "var(--color-silver)", opacity: 0.3 }}
        >
          Data sourced from MITRE ATT&CK. For educational purposes.
        </div>
      </div>
    </main>
  );
}
