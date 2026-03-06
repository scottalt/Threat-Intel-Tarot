# News Feed + Technique Heatmap Design

## Goal

Add a live threat intel news feed with automatic APT group attribution, and a technique frequency heatmap to the existing Technique Explorer.

## Architecture

### News Feed

**Data source:** Five free RSS feeds, no API keys required:
- BleepingComputer
- The Record by Recorded Future
- CISA Cybersecurity Advisories
- Krebs on Security
- Dark Reading

**API route:** `/api/news` — fetches all RSS feeds, parses XML, runs attribution matching, returns structured JSON. Uses `next: { revalidate: 21600 }` (6-hour ISR cache).

**Attribution matching:** For each article, check title + description against every card's `name` and `aka` array. Return matched `{ slug, name, category }` objects per article.

**`/news` page:** Global feed sorted by date. Each article shows title, source, date, and colored card tags for matched adversaries. Clicking a tag navigates to that card.

**Per-card section:** On `/card/[slug]`, a new "In the News" section below defenses. Client component fetches `/api/news` and filters to articles matching this card's identifiers. Shows max 5 articles. Graceful empty state if no matches.

### Technique Frequency Heatmap

**Placement:** New section on `/techniques` page, between the kill-chain bar chart and the technique explorer divider.

**Layout:** 14 tactic columns, technique cells stacked vertically per tactic. Horizontally scrollable on mobile.

**Color scale:** Single-channel gold opacity: `rgba(201,168,76, count/maxCount)`, minimum opacity 0.08. All cells visible.

**Cell content:** Technique ID in mono text. `title` attribute for tooltip (name + count). Click navigates to MITRE ATT&CK page.

**Implementation:** Fully static — computed from `cards.ts` at build time in the server component. No new client component.

## Pages and Files

- `app/api/news/route.ts` — new API route
- `app/news/page.tsx` — new /news page
- `components/NewsCard.tsx` — article card component used on /news and card pages
- `components/CardNewsSection.tsx` — client component for per-card news section
- `app/card/[slug]/page.tsx` — add CardNewsSection below defenses
- `app/techniques/page.tsx` — add heatmap section
- `components/SiteNav.tsx` — add /news link

## Constraints

- No API keys, no paid services
- Vercel free tier safe (ISR caching, not per-request fetching)
- Graceful fallback if RSS fetch fails (empty array, no error thrown)
- Attribution is keyword matching only — not AI, not exact
