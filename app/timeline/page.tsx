import type { Metadata } from "next";
import { cards } from "@/data/cards";
import { TimelineClient } from "@/components/TimelineClient";
import { SiteNav } from "@/components/SiteNav";
import { BackToTop } from "@/components/BackToTop";

export const metadata: Metadata = {
  title: "Timeline | Threat Intelligence Tarot",
  description: "Chronological history of notable cyber operations across all 106 threat actor groups.",
};

export type TimelineEvent = {
  year: number;
  op: string;
  cardName: string;
  cardTitle: string;
  slug: string;
  category: string;
};

function extractYear(op: string): number | null {
  const match = op.match(/\b(19|20)\d{2}\b/);
  return match ? parseInt(match[0], 10) : null;
}

export default function TimelinePage() {
  const events: TimelineEvent[] = [];

  for (const card of cards) {
    for (const op of card.notableOps) {
      const year = extractYear(op);
      if (year) {
        events.push({
          year,
          op,
          cardName: card.name,
          cardTitle: card.cardTitle,
          slug: card.slug,
          category: card.category,
        });
      }
    }
  }

  events.sort((a, b) => a.year - b.year || a.op.localeCompare(b.op));

  const minYear = events[0]?.year ?? 2000;
  const maxYear = events[events.length - 1]?.year ?? new Date().getFullYear();

  return (
    <main id="main-content" className="min-h-screen px-4 py-12 max-w-4xl mx-auto">
      <SiteNav current="/timeline" />
      <h1
        className="text-2xl text-center mb-2"
        style={{ fontFamily: "var(--font-cinzel), serif", color: "var(--color-gold-bright)" }}
      >
        Operations Timeline
      </h1>
      <p className="text-center text-sm mb-2" style={{ color: "var(--color-silver)", opacity: 0.55 }}>
        {events.length} notable operations across {cards.length} adversaries
      </p>
      <p className="text-center text-xs mb-10" style={{ color: "var(--color-silver)", opacity: 0.35 }}>
        {minYear} — {maxYear}
      </p>
      <TimelineClient events={events} />
      <BackToTop />
    </main>
  );
}
