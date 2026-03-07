import type { Metadata } from "next";
import { fetchNews } from "@/lib/news";
import { SiteNav } from "@/components/SiteNav";
import { BackToTop } from "@/components/BackToTop";

// Render on demand; underlying fetch calls are cached 6h by Next.js fetch cache
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Threat Intel News | Threat Intelligence Tarot",
  description: "Latest cybersecurity news automatically tagged to adversary groups from the deck.",
};

const catColor: Record<string, string> = {
  "nation-state": "#4aadad",
  criminal: "#9f7aea",
  hacktivist: "#f97316",
  trickster: "#c026a0",
  unknown: "#b8b8c8",
};

function timeAgo(pubDate: string): string {
  if (!pubDate) return "";
  const diff = Date.now() - new Date(pubDate).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return "< 1h ago";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default async function NewsPage() {
  const articles = await fetchNews();
  const tagged = articles.filter((a) => a.matchedCards.length > 0);
  const untagged = articles.filter((a) => a.matchedCards.length === 0);
  const all = [...tagged, ...untagged];

  return (
    <main id="main-content" className="min-h-screen px-4 py-12 max-w-3xl mx-auto">
      <SiteNav current="/news" />
      <h1
        className="text-2xl text-center mb-2"
        style={{ fontFamily: "var(--font-cinzel), serif", color: "var(--color-gold-bright)" }}
      >
        Threat Intel News
      </h1>
      <p className="text-center text-sm mb-1" style={{ color: "var(--color-silver)", opacity: 0.55 }}>
        {articles.length} articles · {tagged.length} tagged to adversary groups
      </p>
      <p className="text-center text-xs mb-10" style={{ color: "var(--color-silver)", opacity: 0.3 }}>
        Updated every 6 hours · BleepingComputer, The Record, CISA, Krebs, Dark Reading
      </p>

      {all.length === 0 && (
        <div className="text-center py-16" style={{ color: "var(--color-silver)", opacity: 0.4 }}>
          No articles available. Check back shortly.
        </div>
      )}

      <div className="flex flex-col gap-4">
        {all.map((article, i) => (
          <a
            key={article.link || i}
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-4 py-4 rounded-xl transition-opacity hover:opacity-100"
            style={{
              background: "var(--color-arcane)",
              border: "1px solid rgba(201,168,76,0.1)",
              textDecoration: "none",
              opacity: 0.9,
              animation: `section-reveal 0.4s cubic-bezier(0.22, 1, 0.36, 1) ${Math.min(i, 20) * 25}ms both`,
            }}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div
                className="text-sm font-semibold leading-snug"
                style={{ color: "var(--color-mist)", flex: 1 }}
              >
                {article.title}
              </div>
              <span
                className="shrink-0"
                style={{ color: "var(--color-silver)", opacity: 0.4, fontSize: "10px" }}
              >
                ↗
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span
                style={{
                  fontSize: "10px",
                  fontFamily: "var(--font-cinzel), serif",
                  color: "var(--color-gold)",
                  opacity: 0.6,
                  letterSpacing: "0.06em",
                }}
              >
                {article.source}
              </span>
              {article.pubDate && (
                <span style={{ fontSize: "10px", color: "var(--color-silver)", opacity: 0.35 }}>
                  {timeAgo(article.pubDate)}
                </span>
              )}
            </div>

            {article.matchedCards.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {article.matchedCards.map((card) => (
                  <a
                    key={card.slug}
                    href={`/card/${card.slug}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs px-2 py-0.5 rounded transition-opacity hover:opacity-100"
                    style={{
                      background: `${catColor[card.category] ?? "#c9a84c"}18`,
                      border: `1px solid ${catColor[card.category] ?? "#c9a84c"}33`,
                      color: catColor[card.category] ?? "#c9a84c",
                      textDecoration: "none",
                      fontSize: "9px",
                      fontFamily: "var(--font-cinzel), serif",
                      letterSpacing: "0.06em",
                      opacity: 0.85,
                    }}
                  >
                    {card.name}
                  </a>
                ))}
              </div>
            )}
          </a>
        ))}
      </div>
      <BackToTop />
    </main>
  );
}
