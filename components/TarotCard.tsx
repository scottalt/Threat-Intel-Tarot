"use client";

import { useState } from "react";
import type { TarotCard as TarotCardType } from "@/data/types";
import { CardBack } from "./CardBack";
import { CardFront } from "./CardFront";

export function TarotCard({ card, startFlipped = false }: { card: TarotCardType; startFlipped?: boolean }) {
  const [flipped, setFlipped] = useState(startFlipped);

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="card-scene arcane-border"
        onClick={() => setFlipped((f) => !f)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setFlipped((f) => !f);
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={flipped ? `${card.name} — click to flip back` : "Click to reveal card"}
        style={{ borderRadius: "16px" }}
      >
        <div className={`card-wrapper ${flipped ? "is-flipped" : ""}`}>
          <div className="card-face card-face--back">
            <CardBack />
          </div>
          <div className="card-face card-face--front">
            <CardFront card={card} />
          </div>
        </div>
      </div>
      {!flipped && (
        <p
          className="text-xs uppercase tracking-widest animate-pulse"
          style={{ color: "var(--color-gold)", opacity: 0.7, fontFamily: "var(--font-cinzel), serif" }}
        >
          Click to reveal
        </p>
      )}
    </div>
  );
}
