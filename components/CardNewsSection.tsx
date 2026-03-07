"use client";

import { useEffect, useState } from "react";
import type { NewsArticle } from "@/lib/news";

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

export function CardNewsSection({
  slug,
  category,
}: {
  slug: string;
  category: string;
}) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/news")
      .then((r) => r.json())
      .then((all: NewsArticle[]) => {
        const matched = all.filter((a) =>
          a.matchedCards.some((c) => c.slug === slug)
        );
        setArticles(matched.slice(0, 5));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const accent = catColor[category] ?? "#c9a84c";

  if (loading) return null;
  if (articles.length === 0) return null;

  return (
    <div className="mt-14 w-full">
      <div
        className="w-full h-px mb-6"
        style={{
          background: "linear-gradient(90deg, transparent, var(--color-gold), transparent)",
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
        In the News
      </div>

      <div className="flex flex-col gap-3">
        {articles.map((article, i) => (
          <a
            key={article.link || i}
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-3 py-3 rounded-lg transition-opacity hover:opacity-100"
            style={{
              background: "var(--color-arcane)",
              border: `1px solid ${accent}22`,
              textDecoration: "none",
              opacity: 0.85,
            }}
          >
            <div
              className="text-sm leading-snug mb-1.5"
              style={{ color: "var(--color-mist)" }}
            >
              {article.title}
            </div>
            <div className="flex items-center gap-2">
              <span
                style={{
                  fontSize: "10px",
                  fontFamily: "var(--font-cinzel), serif",
                  color: "var(--color-gold)",
                  opacity: 0.55,
                }}
              >
                {article.source}
              </span>
              {article.pubDate && (
                <span style={{ fontSize: "10px", color: "var(--color-silver)", opacity: 0.35 }}>
                  {timeAgo(article.pubDate)}
                </span>
              )}
              <span style={{ fontSize: "10px", color: "var(--color-silver)", opacity: 0.3, marginLeft: "auto" }}>
                ↗
              </span>
            </div>
          </a>
        ))}

        <a
          href="/news"
          className="text-xs text-center mt-1 transition-opacity hover:opacity-100"
          style={{
            color: "var(--color-gold)",
            opacity: 0.4,
            fontFamily: "var(--font-cinzel), serif",
            letterSpacing: "0.08em",
            textDecoration: "none",
          }}
        >
          All threat intel news →
        </a>
      </div>
    </div>
  );
}
