"use client";

import { useState, useEffect } from "react";
import { drawRandom } from "@/lib/draw";
import { getCardBySlug } from "@/lib/slug";
import { cards } from "@/data/cards";
import { TarotCard } from "@/components/TarotCard";
import { DrawButton } from "@/components/DrawButton";
import { Starfield } from "@/components/Starfield";
import { SiteNav } from "@/components/SiteNav";
import type { TarotCard as TarotCardType } from "@/data/types";

const UNIQUE_TECHNIQUES = new Set(cards.flatMap((c) => c.ttps.map((t) => t.techniqueId))).size;
const UNIQUE_TACTICS = new Set(cards.flatMap((c) => c.ttps.map((t) => t.tactic))).size;
// Count distinct attributed nations by normalizing origin strings
const UNIQUE_NATIONS = new Set(
  cards.map((c) => c.origin.split("(")[0].trim().split("/")[0].trim())
).size;

const HISTORY_KEY = "ti-tarot-history";
const MAX_HISTORY = 4;

const categoryNebula: Record<string, string> = {
  "nation-state":
    "radial-gradient(ellipse 700px 500px at 50% 65%, rgba(45,106,106,0.22) 0%, transparent 70%)",
  criminal:
    "radial-gradient(ellipse 700px 500px at 50% 65%, rgba(74,26,106,0.28) 0%, transparent 70%)",
  hacktivist:
    "radial-gradient(ellipse 700px 500px at 50% 65%, rgba(139,58,15,0.22) 0%, transparent 70%)",
};

const categoryAccent: Record<string, string> = {
  "nation-state": "var(--color-teal)",
  criminal: "var(--color-purple)",
  hacktivist: "var(--color-ember)",
  unknown: "var(--color-silver)",
};

function loadHistory(): TarotCardType[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const slugs: string[] = JSON.parse(raw);
    return slugs.map((s) => getCardBySlug(s)).filter(Boolean) as TarotCardType[];
  } catch {
    return [];
  }
}

function saveHistory(newSlug: string, current: TarotCardType[]): void {
  try {
    const filtered = current.filter((c) => c.slug !== newSlug).slice(0, MAX_HISTORY - 1);
    const slugs = [newSlug, ...filtered.map((c) => c.slug)];
    localStorage.setItem(HISTORY_KEY, JSON.stringify(slugs));
  } catch {
    // localStorage not available
  }
}

export default function Home() {
  const [card, setCard] = useState<TarotCardType | null>(null);
  const [key, setKey] = useState(0);
  const [nebula, setNebula] = useState<string | null>(null);
  const [history, setHistory] = useState<TarotCardType[]>([]);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const handleDraw = () => {
    const drawn = drawRandom();
    setCard(drawn);
    setKey((k) => k + 1);
    setNebula(categoryNebula[drawn.category] ?? null);
    setHistory((prev) => {
      const next = [drawn, ...prev.filter((c) => c.slug !== drawn.slug)].slice(0, MAX_HISTORY);
      saveHistory(drawn.slug, prev);
      return next;
    });
  };

  return (
    <main
      id="main-content"
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
              animation: "hero-rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
            }}
          >
            Threat Intelligence Tarot
          </h1>
          <p
            className="text-sm sm:text-base"
            style={{
              color: "var(--color-silver)",
              animation: "hero-rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) 120ms both",
            }}
          >
            Real threat intelligence. Impossible to scroll past.
          </p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2"
            style={{ animation: "hero-rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) 220ms both" }}>
            {[
              { value: cards.length, label: "adversaries", href: "/gallery" },
              { value: UNIQUE_TECHNIQUES, label: "techniques", href: "/techniques" },
              { value: UNIQUE_TACTICS, label: "tactics", href: "/techniques" },
              { value: UNIQUE_NATIONS, label: "attributed nations", href: "/sectors" },
            ].map((stat) => (
              <a key={stat.label} href={stat.href}
                className="text-xs transition-opacity hover:opacity-70"
                style={{ color: "var(--color-silver)", opacity: 0.45, textDecoration: "none" }}>
                <span style={{ color: "var(--color-gold)", opacity: 0.8, fontFamily: "var(--font-cinzel), serif" }}>
                  {stat.value}
                </span>
                {" "}{stat.label}
              </a>
            ))}
          </div>
          <div
            className="mt-3 w-24 h-px mx-auto"
            style={{
              background:
                "linear-gradient(90deg, transparent, var(--color-gold), transparent)",
            }}
          />

          {/* Nav links */}
          <div className="mt-4 flex justify-center">
            <SiteNav current="/" className="mb-0" />
          </div>
        </div>

        <DrawButton onClick={handleDraw} />

        {card && (
          <div key={key} className="mt-10 card-deal flex flex-col items-center gap-3">
            <TarotCard key={key} card={card} />
            <a
              href={`/card/${card.slug}`}
              className="text-xs uppercase tracking-widest transition-opacity hover:opacity-100"
              style={{
                color: "var(--color-gold)",
                opacity: 0.45,
                fontFamily: "var(--font-cinzel), serif",
                animation: "section-reveal 0.4s ease-out 0.6s both",
              }}
            >
              View shareable profile →
            </a>
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

        {/* Recently drawn history */}
        {history.length > 0 && (
          <div
            className="mt-12 w-full max-w-md"
            style={{ animation: "section-reveal 0.4s ease-out 0.3s both" }}
          >
            <div
              className="w-full h-px mb-5"
              style={{ background: "linear-gradient(90deg, transparent, var(--color-gold), transparent)", opacity: 0.2 }}
            />
            <div
              className="text-xs uppercase tracking-widest mb-3 text-center"
              style={{ color: "var(--color-gold)", fontFamily: "var(--font-cinzel), serif", opacity: 0.4 }}
            >
              Recently Drawn
            </div>
            <div className="grid grid-cols-2 gap-2">
              {history.map((h) => {
                const accent = categoryAccent[h.category];
                return (
                  <a
                    key={h.slug}
                    href={`/card/${h.slug}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg transition-opacity hover:opacity-100"
                    style={{
                      background: "var(--color-arcane)",
                      border: `1px solid ${accent}33`,
                      textDecoration: "none",
                      opacity: 0.7,
                    }}
                  >
                    <div style={{ width: 3, height: 28, background: accent, borderRadius: 2, flexShrink: 0 }} />
                    <div className="min-w-0">
                      <div
                        className="text-xs font-semibold truncate"
                        style={{ color: "var(--color-gold-bright)", fontFamily: "var(--font-cinzel), serif" }}
                      >
                        {h.cardTitle}
                      </div>
                      <div
                        className="text-xs truncate"
                        style={{ color: "var(--color-silver)", opacity: 0.6 }}
                      >
                        {h.name}
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        <div
          className="mt-auto pt-16 text-xs text-center space-y-1"
          style={{ color: "var(--color-silver)", opacity: 0.3 }}
        >
          <div>Data sourced from MITRE ATT&CK. For educational purposes.</div>
          <div>
            Built by{" "}
            <a
              href="/about"
              style={{ color: "var(--color-gold)", textDecoration: "none", opacity: 0.7 }}
            >
              Scott Altiparmak
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
