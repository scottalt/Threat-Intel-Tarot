# News Feed + Technique Heatmap Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a live threat intel news feed with automatic APT group attribution (global `/news` page + per-card section), and a technique frequency heatmap matrix to the Technique Explorer.

**Architecture:** A `lib/news.ts` module handles RSS fetching + XML parsing + attribution matching. A `/api/news` route handler wraps it for client-side use. The `/news` page calls `lib/news` directly as a server component. `CardNewsSection` is a client component that fetches `/api/news` and filters by card identifiers. The heatmap is a pure server-side computation added inline to `app/techniques/page.tsx`.

**Tech Stack:** Next.js 14 App Router, TypeScript, built-in `fetch` with ISR revalidation (`next: { revalidate: 21600 }`), no new npm packages.

---

### Task 1: RSS fetching + attribution library

**Files:**
- Create: `lib/news.ts`

**Step 1: Create `lib/news.ts`**

```typescript
import { cards } from "@/data/cards";

export type CardMeta = { slug: string; name: string; category: string };

export type NewsArticle = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: string;
  matchedCards: CardMeta[];
};

const FEEDS = [
  { name: "BleepingComputer", url: "https://www.bleepingcomputer.com/feed/" },
  { name: "The Record", url: "https://therecord.media/feed" },
  { name: "CISA", url: "https://www.cisa.gov/cybersecurity-advisories/all-advisories.xml" },
  { name: "Krebs on Security", url: "https://krebsonsecurity.com/feed/" },
  { name: "Dark Reading", url: "https://www.darkreading.com/rss.xml" },
];

// Build term -> card lookup once at module load
const CARD_TERMS: { term: string; card: CardMeta }[] = [];
for (const card of cards) {
  const meta: CardMeta = { slug: card.slug, name: card.name, category: card.category };
  CARD_TERMS.push({ term: card.name.toLowerCase(), card: meta });
  for (const alias of card.aka) {
    if (alias.length >= 4) {
      CARD_TERMS.push({ term: alias.toLowerCase(), card: meta });
    }
  }
}

function extractTag(xml: string, tag: string): string {
  const cdataPattern = new RegExp(
    `<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`,
    "i"
  );
  const cdataMatch = xml.match(cdataPattern);
  if (cdataMatch) return cdataMatch[1].trim();
  const plainPattern = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const plainMatch = xml.match(plainPattern);
  return plainMatch ? plainMatch[1].replace(/<[^>]+>/g, "").trim() : "";
}

function extractLink(xml: string): string {
  const betweenMatch = xml.match(/<link>([^<]+)<\/link>/);
  if (betweenMatch) return betweenMatch[1].trim();
  const cdataMatch = xml.match(/<link><!\[CDATA\[([^\]]+)\]\]><\/link>/);
  if (cdataMatch) return cdataMatch[1].trim();
  const atomMatch = xml.match(/<link[^>]+href="([^"]+)"/);
  if (atomMatch) return atomMatch[1].trim();
  return "";
}

function parseItems(xml: string): Array<Pick<NewsArticle, "title" | "link" | "description" | "pubDate">> {
  const items: Array<Pick<NewsArticle, "title" | "link" | "description" | "pubDate">> = [];
  const blocks = xml.match(/<item[\s\S]*?<\/item>/gi) ?? xml.match(/<entry[\s\S]*?<\/entry>/gi) ?? [];
  for (const block of blocks.slice(0, 20)) {
    items.push({
      title: extractTag(block, "title"),
      link: extractLink(block),
      description: extractTag(block, "description") || extractTag(block, "summary") || extractTag(block, "content"),
      pubDate: extractTag(block, "pubDate") || extractTag(block, "published") || extractTag(block, "updated"),
    });
  }
  return items;
}

function matchCards(title: string, description: string): CardMeta[] {
  const haystack = `${title} ${description}`.toLowerCase();
  const matched = new Map<string, CardMeta>();
  for (const { term, card } of CARD_TERMS) {
    if (haystack.includes(term) && !matched.has(card.slug)) {
      matched.set(card.slug, card);
    }
  }
  return Array.from(matched.values());
}

export async function fetchNews(): Promise<NewsArticle[]> {
  const articles: NewsArticle[] = [];

  await Promise.allSettled(
    FEEDS.map(async ({ name, url }) => {
      try {
        const res = await fetch(url, {
          next: { revalidate: 21600 },
          headers: { "User-Agent": "ThreatIntelTarot/1.0 (educational)" },
        });
        if (!res.ok) return;
        const xml = await res.text();
        const items = parseItems(xml);
        for (const item of items) {
          if (!item.title) continue;
          articles.push({
            ...item,
            source: name,
            matchedCards: matchCards(item.title, item.description),
          });
        }
      } catch {
        // Feed unavailable — skip silently
      }
    })
  );

  articles.sort((a, b) => {
    const da = a.pubDate ? new Date(a.pubDate).getTime() : 0;
    const db = b.pubDate ? new Date(b.pubDate).getTime() : 0;
    return db - da;
  });

  return articles;
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: `✓ Compiled successfully`

**Step 3: Commit**

```bash
git add lib/news.ts
git commit -m "feat(news): RSS fetching + attribution matching library"
```

---

### Task 2: API route for client-side news access

**Files:**
- Create: `app/api/news/route.ts`

**Step 1: Create the route handler**

```typescript
import { NextResponse } from "next/server";
import { fetchNews } from "@/lib/news";

export const revalidate = 21600;

export async function GET() {
  const articles = await fetchNews();
  return NextResponse.json(articles);
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: `✓ Compiled successfully`

**Step 3: Commit**

```bash
git add app/api/news/route.ts
git commit -m "feat(news): /api/news route handler with 6h ISR cache"
```

---

### Task 3: /news page (global feed)

**Files:**
- Create: `app/news/page.tsx`

**Step 1: Create `app/news/page.tsx`**

```typescript
import type { Metadata } from "next";
import { fetchNews } from "@/lib/news";
import { SiteNav } from "@/components/SiteNav";
import { BackToTop } from "@/components/BackToTop";

export const revalidate = 21600;

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
                className="shrink-0 text-xs"
                style={{ color: "var(--color-silver)", opacity: 0.4, whiteSpace: "nowrap", fontSize: "10px" }}
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
```

**Step 2: Verify build**

Run: `npm run build`
Expected: `✓ Compiled successfully`, `/news` appears in the route list.

**Step 3: Commit**

```bash
git add app/news/page.tsx
git commit -m "feat(news): /news page — global feed with adversary group tags"
```

---

### Task 4: Add /news to SiteNav

**Files:**
- Modify: `components/SiteNav.tsx`

**Step 1: Add News link to NAV_LINKS array**

Replace the existing `NAV_LINKS` array with:

```typescript
const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/gallery", label: "Gallery" },
  { href: "/daily", label: "Daily" },
  { href: "/spread", label: "Spread" },
  { href: "/techniques", label: "Techniques" },
  { href: "/defenses", label: "Defenses" },
  { href: "/sectors", label: "Sectors" },
  { href: "/map", label: "Map" },
  { href: "/timeline", label: "Timeline" },
  { href: "/news", label: "News" },
  { href: "/compare", label: "Compare" },
  { href: "/watchlist", label: "Watchlist" },
  { href: "/glossary", label: "Glossary" },
  { href: "/about", label: "About" },
];
```

**Step 2: Verify build**

Run: `npm run build`
Expected: `✓ Compiled successfully`

**Step 3: Commit**

```bash
git add components/SiteNav.tsx
git commit -m "feat(nav): add News to site navigation"
```

---

### Task 5: Per-card news section (client component)

**Files:**
- Create: `components/CardNewsSection.tsx`

**Step 1: Create `components/CardNewsSection.tsx`**

```typescript
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
```

**Step 2: Verify build**

Run: `npm run build`
Expected: `✓ Compiled successfully`

**Step 3: Commit**

```bash
git add components/CardNewsSection.tsx
git commit -m "feat(news): CardNewsSection — per-card In the News client component"
```

---

### Task 6: Add CardNewsSection to card page

**Files:**
- Modify: `app/card/[slug]/page.tsx`

**Step 1: Add import at top of file**

After the existing imports, add:

```typescript
import { CardNewsSection } from "@/components/CardNewsSection";
```

**Step 2: Add component to JSX**

Find the Related Adversaries closing `</div>` (the one that closes the `related.length > 0 &&` block, around line 266). Add `CardNewsSection` immediately after it, before the attribution footnote div:

```typescript
        {/* In the News */}
        <CardNewsSection slug={card.slug} category={card.category} />

        <div
          className="mt-12 text-xs text-center"
          style={{ color: "var(--color-silver)", opacity: 0.25 }}
        >
          Data sourced from MITRE ATT&CK. For educational purposes.
        </div>
```

**Step 3: Verify build**

Run: `npm run build`
Expected: `✓ Compiled successfully`

**Step 4: Commit**

```bash
git add app/card/[slug]/page.tsx
git commit -m "feat(news): add In the News section to individual card pages"
```

---

### Task 7: Technique frequency heatmap

**Files:**
- Modify: `app/techniques/page.tsx`

**Step 1: Add heatmap data computation**

In `app/techniques/page.tsx`, after the `const mostUsed = ...` line (around line 73), add:

```typescript
  // Heatmap: techniques grouped by tactic, sorted by cross-deck frequency
  type HeatCell = { id: string; name: string; count: number };
  type HeatCol = { tactic: string; cells: HeatCell[] };

  const heatmap: HeatCol[] = TACTIC_ORDER.filter((t) => uniqueTactics.includes(t)).map((tactic) => ({
    tactic,
    cells: techniques
      .filter((t) => t.tactic === tactic)
      .sort((a, b) => b.count - a.count)
      .map((t) => ({ id: t.techniqueId, name: t.name, count: t.count })),
  }));

  const heatMaxCount = Math.max(...techniques.map((t) => t.count), 1);
```

**Step 2: Add heatmap JSX section**

Find the `{/* Divider */}` comment (around line 246) and insert the following block immediately before it:

```typescript
        {/* Coverage Heatmap */}
        <div className="mb-10">
          <div
            className="text-xs uppercase tracking-widest mb-3"
            style={{ color: "var(--color-gold)", fontFamily: "var(--font-cinzel), serif", opacity: 0.7 }}
          >
            Coverage Heatmap
          </div>
          <p className="text-xs mb-4" style={{ color: "var(--color-silver)", opacity: 0.4 }}>
            Each cell is one technique. Brightness = how many adversary groups use it. Click to open MITRE ATT&CK.
          </p>
          <div style={{ overflowX: "auto", paddingBottom: 8 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${heatmap.length}, minmax(76px, 1fr))`,
                gap: "4px",
                minWidth: `${heatmap.length * 80}px`,
              }}
            >
              {heatmap.map((col) => (
                <div key={col.tactic}>
                  <div
                    style={{
                      fontSize: "8px",
                      fontFamily: "var(--font-cinzel), serif",
                      color: "var(--color-gold)",
                      opacity: 0.6,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      marginBottom: "4px",
                      textAlign: "center",
                      lineHeight: 1.2,
                      minHeight: "24px",
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "center",
                    }}
                  >
                    {col.tactic}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    {col.cells.map((cell) => {
                      const opacity = Math.max(0.08, (cell.count / heatMaxCount) * 0.88);
                      return (
                        <a
                          key={cell.id}
                          href={`https://attack.mitre.org/techniques/${cell.id.replace(".", "/")}/`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`${cell.id} · ${cell.name} · ${cell.count} group${cell.count !== 1 ? "s" : ""}`}
                          style={{
                            display: "block",
                            background: `rgba(201,168,76,${opacity})`,
                            borderRadius: "2px",
                            padding: "3px 4px",
                            fontFamily: "monospace",
                            fontSize: "8px",
                            color: opacity > 0.45 ? "rgba(10,10,15,0.9)" : "rgba(201,168,76,0.9)",
                            textDecoration: "none",
                            lineHeight: 1.3,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {cell.id}
                        </a>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
```

**Step 3: Verify build**

Run: `npm run build`
Expected: `✓ Compiled successfully`

**Step 4: Commit**

```bash
git add app/techniques/page.tsx
git commit -m "feat(techniques): ATT&CK coverage heatmap — frequency matrix by tactic"
```

---

### Task 8: Push all commits

```bash
git push
```

Expected: All commits pushed to `origin/main`. Vercel deployment triggered automatically.

---

## Verification checklist

- `/news` renders articles from at least one RSS source
- Articles mentioning "APT28" or "Fancy Bear" show the APT28 card tag
- Card page for APT28 shows "In the News" section with matching articles
- "In the News" section is absent on cards with no recent news matches (no empty state shown)
- `/techniques` heatmap renders all 14 tactic columns, scrollable horizontally
- Cells are brighter for higher-frequency techniques
- Hovering a cell shows browser tooltip: technique name + count
- Clicking a heatmap cell opens MITRE ATT&CK in a new tab
- `/news` link appears in SiteNav on all pages
