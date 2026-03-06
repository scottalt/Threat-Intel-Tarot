import type { Metadata } from "next";
import { drawDaily, drawDailyOffset } from "@/lib/draw";
import { SiteNav } from "@/components/SiteNav";
import { TarotCard } from "@/components/TarotCard";
import { ShareButton } from "@/components/ShareButton";
import { Starfield } from "@/components/Starfield";
import { DailyCountdown } from "@/components/DailyCountdown";
import { NavigatorExport } from "@/components/NavigatorExport";
import { ThreatBrief } from "@/components/ThreatBrief";

export const metadata: Metadata = {
  title: "Card of the Day | Threat Intelligence Tarot",
  description:
    "Today's threat intelligence card. A new adversary profile every day.",
};

export default function DailyPage() {
  const card = drawDaily();
  const yesterday = drawDailyOffset(-1);
  const tomorrow = drawDailyOffset(1);
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main
      id="main-content"
      className="relative min-h-screen flex flex-col items-center py-12 px-4"
      style={{
        background: "var(--color-void)",
        paddingBottom: "max(4rem, env(safe-area-inset-bottom))",
      }}
    >
      <Starfield />

      <div
        className="relative flex flex-col items-center w-full max-w-xl"
        style={{ zIndex: 2 }}
      >
        <div className="self-start w-full">
          <SiteNav current="/daily" />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="text-xs uppercase tracking-widest mb-1"
            style={{
              color: "var(--color-silver)",
              opacity: 0.5,
              fontFamily: "var(--font-cinzel), serif",
              animation: "hero-rise 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
            }}
          >
            Card of the Day
          </div>
          <h1
            className="text-xl sm:text-2xl font-semibold"
            style={{
              color: "var(--color-gold-bright)",
              fontFamily: "var(--font-cinzel), serif",
              animation: "hero-rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) 100ms both",
            }}
          >
            {today}
          </h1>
          <div
            className="mt-3 w-24 h-px mx-auto"
            style={{
              background:
                "linear-gradient(90deg, transparent, var(--color-gold), transparent)",
            }}
          />
        </div>

        <div className="card-deal">
          <TarotCard card={card} startFlipped={true} />
        </div>

        <div className="mt-6 flex flex-col items-center gap-3">
          <ShareButton
            cardTitle={card.cardTitle}
            groupName={card.name}
            topTtp={card.ttps[0]}
            slug={card.slug}
          />
          <div className="flex flex-wrap items-center justify-center gap-4">
            <p
              className="text-xs"
              style={{ color: "var(--color-silver)", opacity: 0.35 }}
            >
              Export for reports
            </p>
            <NavigatorExport card={card} />
            <ThreatBrief card={card} />
          </div>
        </div>

        <DailyCountdown />

        {/* Yesterday / Tomorrow */}
        <div className="mt-10 w-full flex justify-between text-xs">
          <div className="flex flex-col gap-0.5 max-w-[45%]">
            <span className="uppercase tracking-widest" style={{ color: "var(--color-gold)", opacity: 0.35, fontSize: "9px" }}>
              Yesterday
            </span>
            <a
              href={`/card/${yesterday.slug}`}
              className="transition-opacity hover:opacity-100"
              style={{ color: "var(--color-silver)", opacity: 0.5, textDecoration: "none" }}
            >
              {yesterday.cardTitle}
            </a>
            <span style={{ color: "var(--color-silver)", opacity: 0.3, fontSize: "9px" }}>
              {yesterday.name}
            </span>
          </div>

          <div className="flex flex-col gap-0.5 text-right max-w-[45%]">
            <span className="uppercase tracking-widest" style={{ color: "var(--color-gold)", opacity: 0.35, fontSize: "9px" }}>
              Tomorrow
            </span>
            <a
              href={`/card/${tomorrow.slug}`}
              className="transition-opacity hover:opacity-100"
              style={{ color: "var(--color-silver)", opacity: 0.5, textDecoration: "none" }}
            >
              {tomorrow.cardTitle}
            </a>
            <span style={{ color: "var(--color-silver)", opacity: 0.3, fontSize: "9px" }}>
              {tomorrow.name}
            </span>
          </div>
        </div>

        <div
          className="mt-10 text-xs text-center"
          style={{ color: "var(--color-silver)", opacity: 0.25 }}
        >
          Data sourced from MITRE ATT&CK. For educational purposes.
        </div>
      </div>
    </main>
  );
}
