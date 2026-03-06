"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { cards } from "@/data/cards";
import { getCardBySlug } from "@/lib/slug";
import { Starfield } from "@/components/Starfield";
import { SiteNav } from "@/components/SiteNav";
import type { TarotCard } from "@/data/types";

const categoryAccent: Record<string, string> = {
  "nation-state": "var(--color-teal)",
  criminal: "var(--color-purple)",
  hacktivist: "var(--color-ember)",
  unknown: "var(--color-silver)",
};

function riskStars(level: number) {
  return Array.from({ length: 5 }, (_, i) => (
    <span key={i} style={{ color: i < level ? "var(--color-gold-bright)" : "#333" }}>★</span>
  ));
}

function CardSelector({
  label,
  value,
  onChange,
  exclude,
}: {
  label: string;
  value: string;
  onChange: (slug: string) => void;
  exclude: string;
}) {
  const options = cards.filter((c) => c.slug !== exclude);

  return (
    <div className="flex flex-col gap-1">
      <label
        className="text-xs uppercase tracking-widest"
        style={{ color: "var(--color-gold)", fontFamily: "var(--font-cinzel), serif", opacity: 0.7 }}
      >
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm px-3 py-2 bg-transparent outline-none cursor-pointer"
        style={{
          color: value ? "var(--color-mist)" : "var(--color-silver)",
          border: "1px solid rgba(201,168,76,0.25)",
          borderRadius: "4px",
          background: "var(--color-arcane)",
          fontFamily: "var(--font-garamond), Georgia, serif",
          maxWidth: "280px",
        }}
      >
        <option value="" style={{ background: "var(--color-arcane)" }}>
          Select adversary...
        </option>
        {options.map((c) => (
          <option key={c.slug} value={c.slug} style={{ background: "var(--color-arcane)" }}>
            {c.name} — {c.cardTitle}
          </option>
        ))}
      </select>
    </div>
  );
}

function ComparePanel({ card, accentTtps }: { card: TarotCard; accentTtps: Set<string> }) {
  const accent = categoryAccent[card.category];
  return (
    <div
      className="flex-1 min-w-0 rounded-xl overflow-hidden"
      style={{ background: "var(--color-arcane)", border: `1px solid ${accent}44` }}
    >
      {/* Category bar */}
      <div style={{ height: 4, background: accent }} />

      <div className="p-4">
        {/* Header */}
        <div
          className="text-xs uppercase tracking-widest mb-1 opacity-60"
          style={{ color: "var(--color-gold)", fontFamily: "var(--font-cinzel), serif" }}
        >
          {card.arcanum === "major"
            ? `Major Arcana · ${card.number}`
            : `${card.suit} · ${card.number}`}
        </div>
        <div
          className="text-base font-semibold mb-0.5"
          style={{ color: "var(--color-gold-bright)", fontFamily: "var(--font-cinzel), serif" }}
        >
          {card.cardTitle}
        </div>
        <div className="text-sm font-semibold mb-1" style={{ color: "var(--color-mist)" }}>
          {card.name}
        </div>
        {card.aka.length > 0 && (
          <div className="text-xs mb-2" style={{ color: "var(--color-silver)", opacity: 0.55 }}>
            {card.aka.slice(0, 2).join(" · ")}
          </div>
        )}

        <div className="flex flex-wrap gap-3 mb-4 text-xs" style={{ color: "var(--color-silver)" }}>
          <span>{card.origin}</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>{card.since}</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>{riskStars(card.riskLevel)}</span>
        </div>

        {/* Motivation */}
        <div className="mb-3">
          <div className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--color-gold)", fontFamily: "var(--font-cinzel), serif", opacity: 0.6 }}>
            Motivation
          </div>
          <div className="text-xs" style={{ color: "var(--color-mist)", opacity: 0.85 }}>
            {card.motivation.join(", ")}
          </div>
        </div>

        {/* Targets */}
        <div className="mb-4">
          <div className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--color-gold)", fontFamily: "var(--font-cinzel), serif", opacity: 0.6 }}>
            Targets
          </div>
          <div className="flex flex-wrap gap-1">
            {card.targets.map((t) => (
              <span
                key={t}
                className="text-xs px-1.5 py-0.5 rounded"
                style={{
                  background: `${accent}18`,
                  color: "var(--color-silver)",
                  border: `1px solid ${accent}33`,
                  fontSize: "9px",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* TTPs */}
        <div className="mb-4">
          <div className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--color-gold)", fontFamily: "var(--font-cinzel), serif", opacity: 0.6 }}>
            Techniques ({card.ttps.length})
          </div>
          <div className="space-y-0.5">
            {card.ttps.map((ttp) => {
              const shared = accentTtps.has(ttp.techniqueId);
              return (
                <div
                  key={ttp.techniqueId}
                  className="flex items-center gap-2 px-2 py-1 rounded text-xs"
                  style={{
                    background: shared ? "rgba(201,168,76,0.08)" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${shared ? "rgba(201,168,76,0.25)" : "transparent"}`,
                  }}
                >
                  <a
                    href={`https://attack.mitre.org/techniques/${ttp.techniqueId.replace(".", "/")}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono shrink-0 transition-opacity hover:opacity-80"
                    style={{ color: shared ? "var(--color-gold-bright)" : "var(--color-gold)", opacity: shared ? 1 : 0.6, textDecoration: "none", fontSize: "10px" }}
                  >
                    {ttp.techniqueId}
                  </a>
                  <span style={{ color: "var(--color-mist)", opacity: 0.8 }} className="truncate">
                    {ttp.name}
                  </span>
                  {shared && (
                    <span className="ml-auto shrink-0" style={{ color: "var(--color-gold)", opacity: 0.55, fontSize: "9px" }}>
                      shared
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Defenses */}
        <div>
          <div className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--color-gold)", fontFamily: "var(--font-cinzel), serif", opacity: 0.6 }}>
            Defenses
          </div>
          <div className="space-y-1">
            {card.defenses.map((d) => (
              <div key={d.control} className="flex gap-1.5 text-xs" style={{ color: "var(--color-mist)" }}>
                <span style={{ color: "var(--color-crimson)", flexShrink: 0 }}>◆</span>
                <span style={{ opacity: 0.85 }}>{d.control}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Link to full card */}
        <div className="mt-4 pt-3" style={{ borderTop: "1px solid rgba(201,168,76,0.12)" }}>
          <a
            href={`/card/${card.slug}`}
            className="text-xs uppercase tracking-widest transition-opacity hover:opacity-100"
            style={{ color: "var(--color-gold)", opacity: 0.45, fontFamily: "var(--font-cinzel), serif", textDecoration: "none" }}
          >
            Full profile →
          </a>
        </div>
      </div>
    </div>
  );
}

function CompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [slugA, setSlugA] = useState(searchParams.get("a") ?? "");
  const [slugB, setSlugB] = useState(searchParams.get("b") ?? "");
  const [linkCopied, setLinkCopied] = useState(false);

  const cardA = slugA ? getCardBySlug(slugA) : null;
  const cardB = slugB ? getCardBySlug(slugB) : null;

  // Sync URL when selections change
  useEffect(() => {
    if (slugA && slugB) {
      router.replace(`/compare?a=${slugA}&b=${slugB}`, { scroll: false });
    }
  }, [slugA, slugB, router]);

  // Shared technique IDs
  const sharedTtps = cardA && cardB
    ? new Set(
        cardA.ttps
          .map((t) => t.techniqueId)
          .filter((id) => cardB.ttps.some((t) => t.techniqueId === id))
      )
    : new Set<string>();

  const handleCopyLink = async () => {
    if (!slugA || !slugB) return;
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/compare?a=${slugA}&b=${slugB}`
      );
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
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

      <div className="relative max-w-5xl mx-auto" style={{ zIndex: 2 }}>
        <SiteNav current="/compare" />

        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className="text-2xl sm:text-3xl font-semibold mb-2"
            style={{ color: "var(--color-gold-bright)", fontFamily: "var(--font-cinzel), serif", animation: "hero-rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) both" }}
          >
            Adversary Comparison
          </h1>
          <p className="text-sm" style={{ color: "var(--color-silver)", opacity: 0.7, animation: "hero-rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) 120ms both" }}>
            Side-by-side TTPs, targets, and defenses. Shared techniques highlighted.
          </p>
          <div
            className="mt-3 w-24 h-px mx-auto"
            style={{ background: "linear-gradient(90deg, transparent, var(--color-gold), transparent)" }}
          />
        </div>

        {/* Selectors */}
        <div className="flex flex-wrap gap-6 justify-center mb-8">
          <CardSelector
            label="Adversary A"
            value={slugA}
            onChange={setSlugA}
            exclude={slugB}
          />
          <CardSelector
            label="Adversary B"
            value={slugB}
            onChange={setSlugB}
            exclude={slugA}
          />
          {slugA && slugB && (
            <div className="flex items-end">
              <button
                onClick={handleCopyLink}
                className="text-xs uppercase tracking-widest px-3 py-2 transition-all"
                style={{
                  color: linkCopied ? "var(--color-gold-bright)" : "var(--color-silver)",
                  border: `1px solid ${linkCopied ? "rgba(201,168,76,0.4)" : "rgba(192,192,192,0.2)"}`,
                  borderRadius: "4px",
                  background: "transparent",
                  cursor: "pointer",
                  fontFamily: "var(--font-cinzel), serif",
                  touchAction: "manipulation",
                }}
              >
                {linkCopied ? "✓ Copied" : "Share Link"}
              </button>
            </div>
          )}
        </div>

        {/* Shared TTP summary */}
        {cardA && cardB && sharedTtps.size > 0 && (
          <div
            className="mb-6 p-4 rounded-xl text-center"
            style={{
              background: "rgba(201,168,76,0.04)",
              border: "1px solid rgba(201,168,76,0.2)",
              animation: "section-reveal 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
            }}
          >
            <div
              className="text-xs uppercase tracking-widest mb-1"
              style={{ color: "var(--color-gold)", fontFamily: "var(--font-cinzel), serif", opacity: 0.7 }}
            >
              Shared Techniques
            </div>
            <div
              className="text-2xl font-semibold"
              style={{ color: "var(--color-gold-bright)", fontFamily: "var(--font-cinzel), serif" }}
            >
              {sharedTtps.size}
            </div>
            <div className="text-xs mt-1" style={{ color: "var(--color-silver)", opacity: 0.55 }}>
              out of {cardA.ttps.length} + {cardB.ttps.length} total techniques — highlighted in gold below
            </div>
          </div>
        )}

        {cardA && cardB && sharedTtps.size === 0 && (
          <div
            className="mb-6 text-center text-xs italic"
            style={{ color: "var(--color-silver)", opacity: 0.45 }}
          >
            No shared techniques between these adversaries.
          </div>
        )}

        {/* Comparison panels */}
        {cardA && cardB ? (
          <div
            className="flex flex-col sm:flex-row gap-4"
            style={{ animation: "section-reveal 0.5s cubic-bezier(0.22, 1, 0.36, 1) both" }}
          >
            <ComparePanel card={cardA} accentTtps={sharedTtps} />
            <ComparePanel card={cardB} accentTtps={sharedTtps} />
          </div>
        ) : (
          <div className="text-center py-8">
            <div
              className="text-sm italic mb-8"
              style={{ color: "var(--color-silver)", opacity: 0.4, animation: "float 3.2s ease-in-out infinite" }}
            >
              Select two adversaries to compare their profiles, techniques, and defenses.
            </div>
            <div
              className="text-xs uppercase tracking-widest mb-4"
              style={{ color: "var(--color-gold)", fontFamily: "var(--font-cinzel), serif", opacity: 0.5 }}
            >
              Suggested Matchups
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                { a: "apt28-fancy-bear", b: "apt29-cozy-bear", label: "APT28 vs APT29" },
                { a: "lazarus-group-the-specter", b: "apt38-the-alchemist", label: "Lazarus vs APT38" },
                { a: "apt33-the-flame-keeper", b: "apt34-oilrig", label: "APT33 vs APT34" },
                { a: "lockbit-the-locked-tower", b: "revil-sodinokibi-the-reaper", label: "LockBit vs REvil" },
                { a: "fin7-the-merchant", b: "carbanak-the-banker", label: "FIN7 vs Carbanak" },
              ].map((pair) => (
                <button
                  key={pair.label}
                  onClick={() => { setSlugA(pair.a); setSlugB(pair.b); }}
                  className="px-3 py-1.5 text-xs rounded transition-all"
                  style={{
                    fontFamily: "var(--font-cinzel), serif",
                    fontSize: "9px",
                    letterSpacing: "0.06em",
                    color: "var(--color-silver)",
                    border: "1px solid rgba(192,192,192,0.2)",
                    background: "transparent",
                    cursor: "pointer",
                    opacity: 0.65,
                    touchAction: "manipulation",
                  }}
                >
                  {pair.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10 text-xs text-center" style={{ color: "var(--color-silver)", opacity: 0.25 }}>
          Data sourced from MITRE ATT&CK. For educational purposes.
        </div>
      </div>
    </main>
  );
}

export default function ComparePage() {
  return (
    <Suspense>
      <CompareContent />
    </Suspense>
  );
}
