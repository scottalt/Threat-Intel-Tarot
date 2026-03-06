import type { Metadata } from "next";
import { drawDaily } from "@/lib/draw";
import { TarotCard } from "@/components/TarotCard";
import { ShareButton } from "@/components/ShareButton";

export const metadata: Metadata = {
  title: "Card of the Day — Threat Intelligence Tarot",
  description: "Today's threat intelligence card. A new adversary profile every day.",
};

export default function DailyPage() {
  const card = drawDaily();
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main
      className="min-h-screen flex flex-col items-center py-16 px-4"
      style={{
        background: "var(--color-void)",
        paddingBottom: "max(4rem, env(safe-area-inset-bottom))",
      }}
    >
      <div className="text-center mb-8">
        <a
          href="/"
          className="text-xs uppercase tracking-widest"
          style={{ color: "var(--color-gold)", opacity: 0.6, fontFamily: "var(--font-cinzel), serif" }}
        >
          ← Draw Your Own Card
        </a>
        <div
          className="mt-4 text-xs uppercase tracking-widest"
          style={{ color: "var(--color-silver)", opacity: 0.5, fontFamily: "var(--font-cinzel), serif" }}
        >
          Card of the Day
        </div>
        <h1
          className="text-xl sm:text-2xl font-semibold mt-1"
          style={{ color: "var(--color-gold-bright)", fontFamily: "var(--font-cinzel), serif" }}
        >
          {today}
        </h1>
        <div
          className="mt-3 w-24 h-px mx-auto"
          style={{ background: "linear-gradient(90deg, transparent, var(--color-gold), transparent)" }}
        />
      </div>

      <TarotCard card={card} startFlipped={true} />

      <div className="mt-6">
        <ShareButton
          title={`Today's Threat: ${card.cardTitle} — ${card.name}`}
          text={card.flavor}
          url="https://threat-intel-tarot.vercel.app/daily"
        />
      </div>
    </main>
  );
}
