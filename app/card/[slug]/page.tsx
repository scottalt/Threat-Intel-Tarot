import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCardBySlug, getAllSlugs } from "@/lib/slug";
import { TarotCard } from "@/components/TarotCard";
import { ShareButton } from "@/components/ShareButton";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const card = getCardBySlug(slug);
  if (!card) return { title: "Card Not Found" };

  return {
    title: `${card.cardTitle} — ${card.name} | Threat Intelligence Tarot`,
    description: card.flavor,
    openGraph: {
      title: `${card.cardTitle} — ${card.name}`,
      description: card.flavor,
      type: "website",
    },
  };
}

export default async function CardPage({ params }: Props) {
  const { slug } = await params;
  const card = getCardBySlug(slug);

  if (!card) notFound();

  return (
    <main
      className="min-h-screen flex flex-col items-center py-16 px-4"
      style={{ background: "var(--color-void)" }}
    >
      <div className="text-center mb-10">
        <a
          href="/"
          className="text-xs uppercase tracking-widest hover:opacity-100 transition-opacity"
          style={{ color: "var(--color-gold)", opacity: 0.6, fontFamily: "var(--font-cinzel), serif" }}
        >
          ← Threat Intelligence Tarot
        </a>
      </div>

      <TarotCard card={card} startFlipped={true} />

      <div className="mt-6 flex flex-col items-center gap-3">
        <ShareButton
          title={`${card.cardTitle} — ${card.name} | Threat Intelligence Tarot`}
          text={card.flavor}
          url={`https://threat-intel-tarot.vercel.app/card/${card.slug}`}
        />
        <p
          className="text-xs text-center"
          style={{ color: "var(--color-silver)", opacity: 0.4 }}
        >
          Share this adversary profile
        </p>
      </div>
    </main>
  );
}
