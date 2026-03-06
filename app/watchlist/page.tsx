import type { Metadata } from "next";
import { WatchlistClient } from "@/components/WatchlistClient";
import { cards } from "@/data/cards";
import { SiteNav } from "@/components/SiteNav";
import { BackToTop } from "@/components/BackToTop";

export const metadata: Metadata = {
  title: "Watchlist | Threat Intelligence Tarot",
  description: "Your saved adversary cards — stored locally in your browser.",
};

export default function WatchlistPage() {
  return (
    <main id="main-content" className="min-h-screen px-4 py-12 max-w-5xl mx-auto">
      <SiteNav current="/watchlist" />
      <h1
        className="text-2xl text-center mb-2"
        style={{ fontFamily: "var(--font-cinzel), serif", color: "var(--color-gold-bright)" }}
      >
        Watchlist
      </h1>
      <p className="text-center text-sm mb-8" style={{ color: "var(--color-silver)", opacity: 0.55 }}>
        Your saved adversary cards — stored locally in this browser.
      </p>
      <WatchlistClient cards={cards} />
      <BackToTop />
    </main>
  );
}
