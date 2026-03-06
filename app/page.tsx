"use client";

import { useState } from "react";
import { drawRandom } from "@/lib/draw";
import { TarotCard } from "@/components/TarotCard";
import { DrawButton } from "@/components/DrawButton";
import type { TarotCard as TarotCardType } from "@/data/types";

export default function Home() {
  const [card, setCard] = useState<TarotCardType | null>(null);
  const [key, setKey] = useState(0);

  const handleDraw = () => {
    setCard(drawRandom());
    setKey((k) => k + 1);
  };

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-start py-16 px-4"
      style={{ background: "var(--color-void)" }}
    >
      {/* Header */}
      <div className="text-center mb-12">
        <h1
          className="text-3xl sm:text-4xl font-semibold mb-3"
          style={{ color: "var(--color-gold-bright)", fontFamily: "var(--font-cinzel), serif" }}
        >
          Threat Intelligence Tarot
        </h1>
        <p className="text-sm sm:text-base" style={{ color: "var(--color-silver)" }}>
          Real threat intelligence. Impossible to scroll past.
        </p>
        <div
          className="mt-3 w-24 h-px mx-auto"
          style={{ background: "linear-gradient(90deg, transparent, var(--color-gold), transparent)" }}
        />
      </div>

      {/* Draw button */}
      <DrawButton onClick={handleDraw} />

      {/* Card */}
      {card && (
        <div className="mt-10">
          <TarotCard key={key} card={card} />
        </div>
      )}

      {/* Hint before first draw */}
      {!card && (
        <div
          className="mt-16 text-center text-sm italic"
          style={{ color: "var(--color-silver)", opacity: 0.5 }}
        >
          The cards await. Draw to reveal your adversary.
        </div>
      )}

      {/* Footer */}
      <div
        className="mt-auto pt-16 text-xs text-center"
        style={{ color: "var(--color-silver)", opacity: 0.35 }}
      >
        Data sourced from MITRE ATT&CK. For educational purposes.
      </div>
    </main>
  );
}
