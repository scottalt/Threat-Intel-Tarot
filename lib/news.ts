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
  const blocks =
    xml.match(/<item[\s\S]*?<\/item>/gi) ??
    xml.match(/<entry[\s\S]*?<\/entry>/gi) ??
    [];
  for (const block of blocks.slice(0, 20)) {
    items.push({
      title: extractTag(block, "title"),
      link: extractLink(block),
      description:
        extractTag(block, "description") ||
        extractTag(block, "summary") ||
        extractTag(block, "content"),
      pubDate:
        extractTag(block, "pubDate") ||
        extractTag(block, "published") ||
        extractTag(block, "updated"),
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
