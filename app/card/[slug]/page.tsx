import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCardBySlug, getAllSlugs } from "@/lib/slug";
import { cards } from "@/data/cards";
import { TarotCard } from "@/components/TarotCard";
import { ShareButton } from "@/components/ShareButton";
import { Starfield } from "@/components/Starfield";
import { CardKeyNav } from "@/components/CardKeyNav";
import { NavigatorExport } from "@/components/NavigatorExport";
import type { TarotCard as TarotCardType } from "@/data/types";

type Props = {
  params: Promise<{ slug: string }>;
};

const categoryAccent: Record<string, string> = {
  "nation-state": "var(--color-teal)",
  criminal: "var(--color-purple)",
  hacktivist: "var(--color-ember)",
  unknown: "var(--color-silver)",
};

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const card = getCardBySlug(slug);
  if (!card) return { title: "Card Not Found" };

  return {
    title: `${card.cardTitle}: ${card.name} | Threat Intelligence Tarot`,
    description: card.flavor,
    openGraph: {
      title: `${card.cardTitle}: ${card.name}`,
      description: card.flavor,
      type: "website",
    },
  };
}

export default async function CardPage({ params }: Props) {
  const { slug } = await params;
  const card = getCardBySlug(slug);

  if (!card) notFound();

  // Prev/next in deck order
  const index = cards.findIndex((c) => c.slug === card.slug);
  const prev: TarotCardType | undefined = index > 0 ? cards[index - 1] : undefined;
  const next: TarotCardType | undefined = index < cards.length - 1 ? cards[index + 1] : undefined;

  // Related: ranked by shared technique IDs, falling back to same category
  const cardTechniques = new Set(card.ttps.map((t) => t.techniqueId));
  const related = cards
    .filter((c) => c.slug !== card.slug)
    .map((c) => ({
      card: c,
      shared: c.ttps.filter((t) => cardTechniques.has(t.techniqueId)).length,
    }))
    .sort((a, b) => b.shared - a.shared || (a.card.category === card.category ? -1 : 1))
    .slice(0, 3);

  const accent = categoryAccent[card.category];

  return (
    <main
      className="relative min-h-screen flex flex-col items-center py-12 px-4"
      style={{
        background: "var(--color-void)",
        paddingBottom: "max(3rem, env(safe-area-inset-bottom))",
      }}
    >
      <Starfield />
      <CardKeyNav prevSlug={prev?.slug} nextSlug={next?.slug} />

      <div
        className="relative flex flex-col items-center w-full max-w-xl"
        style={{ zIndex: 2 }}
      >
        {/* Nav */}
        <div className="flex gap-4 mb-8 self-start">
          <a
            href="/"
            className="text-xs uppercase tracking-widest transition-opacity hover:opacity-100"
            style={{
              color: "var(--color-gold)",
              opacity: 0.5,
              fontFamily: "var(--font-cinzel), serif",
            }}
          >
            ← Home
          </a>
          <span style={{ color: "var(--color-gold)", opacity: 0.25 }}>·</span>
          <a
            href="/gallery"
            className="text-xs uppercase tracking-widest transition-opacity hover:opacity-100"
            style={{
              color: "var(--color-gold)",
              opacity: 0.5,
              fontFamily: "var(--font-cinzel), serif",
            }}
          >
            Gallery
          </a>
          <span style={{ color: "var(--color-gold)", opacity: 0.25 }}>·</span>
          <a
            href="/techniques"
            className="text-xs uppercase tracking-widest transition-opacity hover:opacity-100"
            style={{
              color: "var(--color-gold)",
              opacity: 0.5,
              fontFamily: "var(--font-cinzel), serif",
            }}
          >
            Techniques
          </a>
        </div>

        {/* Card */}
        <TarotCard card={card} startFlipped={true} />

        {/* Share */}
        <div className="mt-6 flex flex-col items-center gap-2">
          <ShareButton
            title={`${card.cardTitle}: ${card.name} | Threat Intelligence Tarot`}
            text={card.flavor}
            url={`https://threat-intel-tarot.vercel.app/card/${card.slug}`}
          />
          <div className="flex items-center gap-4">
            <p
              className="text-xs"
              style={{ color: "var(--color-silver)", opacity: 0.35 }}
            >
              Share this adversary profile
            </p>
            <NavigatorExport card={card} />
          </div>
          {(prev || next) && (
            <>
              <p
                className="text-xs mt-1 hidden sm:block"
                style={{ color: "var(--color-silver)", opacity: 0.25 }}
              >
                ← → arrow keys to browse
              </p>
              <p
                className="text-xs mt-1 sm:hidden"
                style={{ color: "var(--color-silver)", opacity: 0.25 }}
              >
                swipe to browse
              </p>
            </>
          )}
        </div>

        {/* Prev / Next navigation */}
        {(prev || next) && (
          <div className="mt-6 flex justify-between w-full text-xs">
            {prev ? (
              <a
                href={`/card/${prev.slug}`}
                className="flex flex-col gap-0.5 transition-opacity hover:opacity-100"
                style={{
                  color: "var(--color-gold)",
                  opacity: 0.5,
                  fontFamily: "var(--font-cinzel), serif",
                  textDecoration: "none",
                  maxWidth: "45%",
                }}
              >
                <span className="uppercase tracking-widest" style={{ fontSize: "9px" }}>← Previous</span>
                <span className="text-xs" style={{ color: "var(--color-silver)" }}>{prev.cardTitle}</span>
              </a>
            ) : <div />}
            {next ? (
              <a
                href={`/card/${next.slug}`}
                className="flex flex-col gap-0.5 text-right transition-opacity hover:opacity-100"
                style={{
                  color: "var(--color-gold)",
                  opacity: 0.5,
                  fontFamily: "var(--font-cinzel), serif",
                  textDecoration: "none",
                  maxWidth: "45%",
                }}
              >
                <span className="uppercase tracking-widest" style={{ fontSize: "9px" }}>Next →</span>
                <span className="text-xs" style={{ color: "var(--color-silver)" }}>{next.cardTitle}</span>
              </a>
            ) : <div />}
          </div>
        )}

        {/* Related cards */}
        {related.length > 0 && (
          <div className="mt-14 w-full">
            <div
              className="w-full h-px mb-6"
              style={{
                background:
                  "linear-gradient(90deg, transparent, var(--color-gold), transparent)",
              }}
            />
            <div
              className="text-center text-xs uppercase tracking-widest mb-5"
              style={{
                color: "var(--color-gold)",
                fontFamily: "var(--font-cinzel), serif",
                opacity: 0.55,
              }}
            >
              Related Adversaries
            </div>
            <div className="grid grid-cols-3 gap-3">
              {related.map(({ card: rel, shared }) => (
                <a
                  key={rel.slug}
                  href={`/card/${rel.slug}`}
                  className="block rounded-xl overflow-hidden transition-transform duration-200 hover:scale-105 active:scale-95"
                  style={{
                    background: "var(--color-arcane)",
                    border: `1px solid ${accent}44`,
                    boxShadow: `0 0 10px ${accent}18`,
                    textDecoration: "none",
                    touchAction: "manipulation",
                  }}
                >
                  <div style={{ height: 3, background: accent }} />
                  <div className="p-3">
                    <div
                      className="text-xs font-semibold leading-tight mb-1"
                      style={{
                        color: "var(--color-gold-bright)",
                        fontFamily: "var(--font-cinzel), serif",
                        fontSize: "11px",
                      }}
                    >
                      {rel.cardTitle}
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: "var(--color-silver)", opacity: 0.65 }}
                    >
                      {rel.name}
                    </div>
                    {shared > 0 && (
                      <div className="mt-1 text-xs" style={{ color: "var(--color-gold)", opacity: 0.45, fontSize: "9px" }}>
                        {shared} shared TTP{shared !== 1 ? "s" : ""}
                      </div>
                    )}
                    <div className="mt-1.5 text-xs">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span
                          key={i}
                          style={{
                            color:
                              i < rel.riskLevel
                                ? "var(--color-gold-bright)"
                                : "#333",
                          }}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        <div
          className="mt-12 text-xs text-center"
          style={{ color: "var(--color-silver)", opacity: 0.25 }}
        >
          Data sourced from MITRE ATT&CK. For educational purposes.
        </div>
      </div>
    </main>
  );
}
