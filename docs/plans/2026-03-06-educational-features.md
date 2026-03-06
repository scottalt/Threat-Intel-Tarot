# Educational & Practitioner Features — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add high-value educational and practitioner features to Threat Intelligence Tarot without adding game mechanics.

**Architecture:** All features are client-side only (localStorage for persistence, no backend). New pages follow the existing Next.js App Router pattern (server page.tsx + client *Client.tsx). All data comes from the existing static `cards` array.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS v4, localStorage for persistence. No new dependencies.

**Note on Tier 1 Item 1:** TTP IDs already link to attack.mitre.org via `components/TTPBadge.tsx`. Skip that task.

---

## Task 1: "Currently Active" field + Gallery filter

Adds an `active` boolean to the card type, marks all 106 cards, and adds a filter toggle to the Gallery.

**Files:**
- Modify: `data/types.ts`
- Modify: `data/cards.ts` (bulk sed, then verify)
- Modify: `components/GalleryClient.tsx`

**Step 1: Add field to type**

In `data/types.ts`, add after the `since` field:
```typescript
  active: boolean;           // true = group still operational as of 2026
```

**Step 2: Mark all cards active/inactive**

Run this Python script to add `active: true` to all cards as a baseline:
```bash
python3 -c "
import re
content = open('data/cards.ts', encoding='utf-8').read()
# Insert active: true after each 'since:' line
content = re.sub(r'(since:\s*\"[^\"]+\",)', r'\1\n    active: true,', content)
open('data/cards.ts', 'w', encoding='utf-8').write(content)
print('done')
"
```

**Step 3: Mark known-disbanded/inactive groups as active: false**

Open `data/cards.ts` and manually set `active: false` for these groups (search by `id`):
- `conti-wizard-spider` — Conti disbanded May 2022
- `revil-sodinokibi` — REvil arrested/disrupted 2022
- `darkside` — DarkSide disbanded May 2021
- `blackmatter` — BlackMatter shut down Nov 2021
- `hive` — Hive taken down by FBI Jan 2023
- `apt1-comment-crew` — APT1 went dark after 2014 Mandiant report
- `operation-aurora` — one-time campaign group (Yellow Garuda card)
- `stuxnet-operators` — one-time campaign group
- `anonymous` — decentralized, effectively dormant as organized group

Run build to confirm no TypeScript errors:
```bash
npm run build
```
Expected: clean build, 124 pages.

**Step 4: Add active filter to GalleryClient**

In `components/GalleryClient.tsx`:

Add state:
```typescript
const [activeOnly, setActiveOnly] = useState(false);
```

Add to restore/save state (update `GalleryState` type and `loadState` default):
```typescript
type GalleryState = {
  // ... existing fields ...
  activeOnly: boolean;
};
// loadState default: activeOnly: false
// saveState: include activeOnly
// restore: setActiveOnly(s.activeOnly ?? false)
```

Add to the `.filter()` chain in `filtered`:
```typescript
const activeMatch = !activeOnly || c.active === true;
return categoryMatch && arcanaMatch && searchMatch && originMatch && volumeMatch && activeMatch;
```

Add toggle button UI — place it in the filter row area, after the Volume filter:
```tsx
{/* Active groups toggle */}
<div className="flex justify-center mb-3">
  <button
    onClick={() => setActiveOnly((v) => !v)}
    style={{
      fontFamily: "var(--font-cinzel), serif",
      fontSize: "9px",
      letterSpacing: "0.07em",
      textTransform: "uppercase",
      padding: "4px 14px",
      borderRadius: "4px",
      border: `1px solid ${activeOnly ? "rgba(74,173,173,0.5)" : "rgba(192,192,192,0.15)"}`,
      background: activeOnly ? "rgba(74,173,173,0.1)" : "transparent",
      color: activeOnly ? "var(--color-teal)" : "rgba(192,192,192,0.45)",
      cursor: "pointer",
      transition: "all 0.18s ease",
    }}
  >
    {activeOnly ? "Active Groups Only" : "All Groups (incl. disbanded)"}
  </button>
</div>
```

Update clear button to also reset `activeOnly`:
```typescript
onClick={() => { setFilter("all"); setArcana("all"); setQuery(""); setOriginFilter(""); setSort("deck"); setVolume("all"); setActiveOnly(false); }}
```

Update the results condition to include `activeOnly`:
```typescript
{(query.trim() || filter !== "all" || arcana !== "all" || originFilter || volume !== "all" || activeOnly) && (
```

**Step 5: Build and verify**
```bash
npm run build
```
Expected: clean build.

**Step 6: Commit**
```bash
git add data/types.ts data/cards.ts components/GalleryClient.tsx
git commit -m "feat(gallery): active/inactive group field + gallery filter toggle"
```

---

## Task 2: Copy TTP ID to clipboard on click

Clicking a technique ID badge copies `T1566.001` to clipboard and shows a brief "Copied!" flash.

**Files:**
- Modify: `components/TTPBadge.tsx`

**Step 1: Add copy-on-click to the technique ID anchor**

Replace the `<a>` in `TTPBadge.tsx` with a button that both navigates (on middle-click/right-click via anchor wrapper) and copies on left-click:

```tsx
"use client";

import { useState } from "react";
import type { TTP } from "@/data/types";

export function TTPBadge({ ttp, index = 0 }: { ttp: TTP; index?: number }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(ttp.techniqueId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    });
  };

  return (
    <div
      className="flex items-start gap-2 py-1"
      style={{
        animation: "badge-slide 0.35s cubic-bezier(0.22, 1, 0.36, 1) both",
        animationDelay: `${Math.min(index * 45, 350)}ms`,
      }}
    >
      <div style={{ position: "relative", flexShrink: 0 }}>
        <a
          href={`https://attack.mitre.org/techniques/${ttp.techniqueId.replace(".", "/")}/`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleCopy}
          className="block text-xs font-mono px-1.5 py-0.5 rounded mt-0.5 transition-opacity hover:opacity-80"
          style={{
            background: copied ? "rgba(74,173,173,0.25)" : "rgba(201,168,76,0.15)",
            color: copied ? "var(--color-teal)" : "var(--color-gold-bright)",
            border: `1px solid ${copied ? "rgba(74,173,173,0.5)" : "rgba(201,168,76,0.3)"}`,
            textDecoration: "none",
            touchAction: "manipulation",
            transition: "background 0.2s, color 0.2s, border-color 0.2s",
            cursor: "copy",
            userSelect: "none",
          }}
          title="Click to copy · Opens MITRE ATT&CK in new tab"
        >
          {copied ? "Copied!" : ttp.techniqueId}
        </a>
      </div>
      <div className="min-w-0">
        <div className="text-sm" style={{ color: "var(--color-mist)" }}>
          {ttp.name}
        </div>
        <div className="text-xs" style={{ color: "var(--color-silver)", opacity: 0.7 }}>
          {ttp.tactic}
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Build**
```bash
npm run build
```
Expected: clean build.

**Step 3: Commit**
```bash
git add components/TTPBadge.tsx
git commit -m "feat(ux): copy technique ID to clipboard on click + MITRE link preserved"
```

---

## Task 3: Bookmark / Watchlist

Lets users save cards to a personal watchlist stored in localStorage. Accessible from each card page and from a new `/watchlist` page.

**Files:**
- Create: `lib/bookmarks.ts`
- Create: `components/BookmarkButton.tsx`
- Create: `app/watchlist/page.tsx`
- Modify: `components/CardFront.tsx`
- Modify: `components/SiteNav.tsx`

**Step 1: Create bookmark utility**

Create `lib/bookmarks.ts`:
```typescript
const KEY = "ti-tarot-bookmarks";

export function getBookmarks(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function toggleBookmark(slug: string): boolean {
  const current = getBookmarks();
  const isBookmarked = current.includes(slug);
  const updated = isBookmarked
    ? current.filter((s) => s !== slug)
    : [...current, slug];
  localStorage.setItem(KEY, JSON.stringify(updated));
  return !isBookmarked;
}

export function isBookmarked(slug: string): boolean {
  return getBookmarks().includes(slug);
}
```

**Step 2: Create BookmarkButton component**

Create `components/BookmarkButton.tsx`:
```tsx
"use client";

import { useState, useEffect } from "react";
import { toggleBookmark, isBookmarked } from "@/lib/bookmarks";

export function BookmarkButton({ slug }: { slug: string }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isBookmarked(slug));
  }, [slug]);

  const handleToggle = () => {
    const nowSaved = toggleBookmark(slug);
    setSaved(nowSaved);
  };

  return (
    <button
      onClick={handleToggle}
      aria-label={saved ? "Remove from watchlist" : "Add to watchlist"}
      title={saved ? "Remove from watchlist" : "Save to watchlist"}
      style={{
        background: "none",
        border: `1px solid ${saved ? "rgba(201,168,76,0.5)" : "rgba(201,168,76,0.2)"}`,
        borderRadius: "4px",
        padding: "4px 10px",
        cursor: "pointer",
        fontFamily: "var(--font-cinzel), serif",
        fontSize: "9px",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: saved ? "var(--color-gold-bright)" : "rgba(201,168,76,0.45)",
        background: saved ? "rgba(201,168,76,0.08)" : "transparent",
        transition: "all 0.2s ease",
      }}
    >
      {saved ? "Saved" : "Save"}
    </button>
  );
}
```

**Step 3: Add BookmarkButton to CardFront**

In `components/CardFront.tsx`, import and place the BookmarkButton near the top action area. Search for where the share button or MITRE group link renders (around line 355). Add the import at the top:
```typescript
import { BookmarkButton } from "./BookmarkButton";
```

Find the action row (where the MITRE group link is) and add:
```tsx
<BookmarkButton slug={card.slug} />
```

**Step 4: Create watchlist page**

Create `app/watchlist/page.tsx`:
```tsx
import type { Metadata } from "next";
import { WatchlistClient } from "@/components/WatchlistClient";
import { cards } from "@/data/cards";
import { SiteNav } from "@/components/SiteNav";

export const metadata: Metadata = {
  title: "Watchlist | Threat Intelligence Tarot",
  description: "Your saved adversary cards.",
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
    </main>
  );
}
```

Create `components/WatchlistClient.tsx`:
```tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { TarotCard } from "@/data/types";
import { getBookmarks, toggleBookmark } from "@/lib/bookmarks";

const categoryAccent: Record<string, string> = {
  "nation-state": "var(--color-teal)",
  criminal: "var(--color-purple)",
  hacktivist: "var(--color-ember)",
  trickster: "var(--color-trickster)",
  unknown: "var(--color-silver)",
};

export function WatchlistClient({ cards }: { cards: TarotCard[] }) {
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    setSlugs(getBookmarks());
  }, []);

  const saved = cards.filter((c) => slugs.includes(c.slug));

  const handleRemove = (slug: string) => {
    toggleBookmark(slug);
    setSlugs(getBookmarks());
  };

  if (saved.length === 0) {
    return (
      <div className="text-center py-20" style={{ color: "var(--color-silver)", opacity: 0.45 }}>
        <div style={{ fontSize: "32px", marginBottom: "12px", opacity: 0.3 }}>—</div>
        <p style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "13px", letterSpacing: "0.08em" }}>
          No cards saved yet.
        </p>
        <p className="text-xs mt-2">Use the Save button on any card to add it here.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {saved.map((card) => {
        const accent = categoryAccent[card.category] ?? "var(--color-gold)";
        return (
          <div
            key={card.slug}
            style={{
              background: "var(--color-arcane)",
              border: `1px solid ${accent}44`,
              borderRadius: "12px",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div style={{ height: 3, background: accent }} />
            <div className="p-3">
              <Link
                href={`/card/${card.slug}`}
                style={{ textDecoration: "none", display: "block" }}
              >
                <div
                  className="text-sm font-semibold leading-tight mb-0.5"
                  style={{ color: "var(--color-gold-bright)", fontFamily: "var(--font-cinzel), serif" }}
                >
                  {card.cardTitle}
                </div>
                <div className="text-xs mb-2" style={{ color: "var(--color-silver)", opacity: 0.7 }}>
                  {card.name}
                </div>
                <div className="text-xs" style={{ color: "var(--color-silver)", opacity: 0.4, fontSize: "9px" }}>
                  {card.origin}
                </div>
              </Link>
              <button
                onClick={() => handleRemove(card.slug)}
                style={{
                  marginTop: "8px",
                  background: "none",
                  border: "1px solid rgba(192,192,192,0.15)",
                  borderRadius: "3px",
                  padding: "2px 8px",
                  fontSize: "9px",
                  color: "rgba(192,192,192,0.4)",
                  cursor: "pointer",
                  fontFamily: "var(--font-cinzel), serif",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                Remove
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

**Step 5: Add Watchlist to SiteNav**

In `components/SiteNav.tsx`, add to the NAV_LINKS array after Compare:
```typescript
{ href: "/watchlist", label: "Watchlist" },
```

**Step 6: Build**
```bash
npm run build
```
Expected: clean build, `/watchlist` appears in route output.

**Step 7: Commit**
```bash
git add lib/bookmarks.ts components/BookmarkButton.tsx components/WatchlistClient.tsx app/watchlist/page.tsx components/CardFront.tsx components/SiteNav.tsx
git commit -m "feat(watchlist): save cards to localStorage watchlist, accessible from card page and nav"
```

---

## Task 4: Glossary page

A single educational reference page explaining core CTI/MITRE concepts. No new data needed — all content is static.

**Files:**
- Create: `app/glossary/page.tsx`
- Modify: `components/SiteNav.tsx`

**Step 1: Create the page**

Create `app/glossary/page.tsx` with sections:
- What is a Threat Actor Group
- What is MITRE ATT&CK
- What are TTPs (Tactics, Techniques, Procedures)
- How to read a card (anatomy walkthrough)
- The four suits explained
- The five categories explained
- Risk level explained
- Useful external resources (MITRE ATT&CK, CISA, etc.)

Each section uses the existing visual language: gold Cinzel headings, Garamond body text, arcane border styling. No new CSS classes needed.

The page is a pure server component (no `"use client"` needed — all static content).

```tsx
import type { Metadata } from "next";
import { SiteNav } from "@/components/SiteNav";

export const metadata: Metadata = {
  title: "Glossary | Threat Intelligence Tarot",
  description: "Reference guide: threat actors, MITRE ATT&CK, TTPs, and how to read the cards.",
};

const SECTIONS = [
  {
    title: "Threat Actor Groups",
    body: `A threat actor group is an organized team of attackers attributed — with varying confidence — to a specific nation-state, criminal enterprise, hacktivist movement, or unknown origin. Names like "APT28" are analytical labels assigned by researchers; the same group may have dozens of vendor-assigned aliases (Fancy Bear, STRONTIUM, Sofacy). The cards use the most widely recognized name.`,
  },
  {
    title: "MITRE ATT&CK",
    body: `ATT&CK (Adversarial Tactics, Techniques & Common Knowledge) is a globally accessible knowledge base of adversary behavior. It documents how real-world attackers operate — from initial access through impact — organized into 14 tactics and hundreds of techniques. Each technique has a stable ID (e.g. T1566.001) used across the security industry in detection rules, threat reports, and tooling.`,
  },
  {
    title: "TTPs: Tactics, Techniques, Procedures",
    body: `Tactics are the adversary's goal at a given stage (e.g. Initial Access, Lateral Movement). Techniques are the specific method used to achieve that goal (e.g. Spearphishing Attachment). Sub-techniques add further specificity. Procedures are the concrete implementation — the actual malware or tool used. Defenders map their controls to TTPs to find gaps. Clicking any technique ID on a card opens its MITRE ATT&CK page.`,
  },
  {
    title: "How to Read a Card",
    body: `Each card represents one threat actor group. The card title is an arcane label capturing the group's character. Below it: the real group name, aliases, origin, and active status. The sigil color and shape indicates the category. Risk level (1-5 stars) reflects sophistication, reach, and historical damage — not a precise score. The tactic heatmap shows which ATT&CK phases this group covers. Defenses are concrete controls mapped to frameworks like NIST CSF and CIS Controls.`,
  },
  {
    title: "The Four Suits",
    body: `Swords represent espionage and intelligence collection — groups whose primary mission is stealing data, IP, or state secrets. Wands represent disruption and destruction — groups focused on sabotage, DDoS, or disruptive attacks. Cups represent social engineering and deception — groups that use human manipulation, phishing, and fraud as their primary weapon. Pentacles represent financial crime and ransomware — groups motivated primarily by money.`,
  },
  {
    title: "The Five Categories",
    body: `Nation-State: Attributed to a government or military intelligence apparatus. These groups have significant resources and long operational timelines. Criminal: Financially motivated, typically operating outside any state mandate. Hacktivist: Ideologically motivated, often with loose or decentralized structure. Trickster: Social engineering specialists and identity manipulators — groups like Scattered Spider and Lapsus$ who blur the line between criminal and performance. Unknown: Insufficient attribution to assign a category with confidence.`,
  },
  {
    title: "Risk Level",
    body: `Risk is rated 1-5 stars based on a combination of: operational sophistication (custom tooling, zero-days), breadth of targeting (single sector vs. global), historical damage (confirmed incidents and their severity), and longevity. A 5-star group like Equation Group or Sandworm represents top-tier national capability with confirmed destructive impact. A 1-star group may be unsophisticated but still relevant to specific sectors.`,
  },
];

const RESOURCES = [
  { label: "MITRE ATT&CK Enterprise", href: "https://attack.mitre.org/groups/" },
  { label: "CISA Known Exploited Vulnerabilities", href: "https://www.cisa.gov/known-exploited-vulnerabilities-catalog" },
  { label: "CISA Advisories", href: "https://www.cisa.gov/news-events/cybersecurity-advisories" },
  { label: "Mandiant APT Groups", href: "https://www.mandiant.com/resources/blog/apt-groups" },
  { label: "MITRE Groups Reference", href: "https://attack.mitre.org/groups/" },
];

export default function GlossaryPage() {
  return (
    <main id="main-content" className="min-h-screen px-4 py-12 max-w-3xl mx-auto">
      <SiteNav current="/glossary" />
      <h1
        className="text-2xl text-center mb-2"
        style={{ fontFamily: "var(--font-cinzel), serif", color: "var(--color-gold-bright)" }}
      >
        Reference Glossary
      </h1>
      <p className="text-center text-sm mb-10" style={{ color: "var(--color-silver)", opacity: 0.55 }}>
        Core concepts for reading and using Threat Intelligence Tarot
      </p>

      <div className="flex flex-col gap-6">
        {SECTIONS.map((s) => (
          <div
            key={s.title}
            style={{
              background: "rgba(26,26,46,0.6)",
              border: "1px solid rgba(201,168,76,0.15)",
              borderRadius: "10px",
              padding: "20px 24px",
            }}
          >
            <h2
              className="text-sm mb-3"
              style={{
                fontFamily: "var(--font-cinzel), serif",
                color: "var(--color-gold)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              {s.title}
            </h2>
            <p style={{ color: "var(--color-mist)", lineHeight: 1.75, fontSize: "14px", opacity: 0.85 }}>
              {s.body}
            </p>
          </div>
        ))}

        {/* External resources */}
        <div
          style={{
            background: "rgba(26,26,46,0.6)",
            border: "1px solid rgba(201,168,76,0.15)",
            borderRadius: "10px",
            padding: "20px 24px",
          }}
        >
          <h2
            className="text-sm mb-3"
            style={{
              fontFamily: "var(--font-cinzel), serif",
              color: "var(--color-gold)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            External Resources
          </h2>
          <ul className="flex flex-col gap-2">
            {RESOURCES.map((r) => (
              <li key={r.label}>
                <a
                  href={r.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "var(--color-gold-bright)",
                    fontSize: "13px",
                    opacity: 0.8,
                    textDecoration: "underline",
                    textDecorationColor: "rgba(201,168,76,0.3)",
                  }}
                >
                  {r.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
```

**Step 2: Add Glossary to SiteNav**

In `components/SiteNav.tsx`, add after About:
```typescript
{ href: "/glossary", label: "Glossary" },
```

**Step 3: Build**
```bash
npm run build
```
Expected: `/glossary` in static output.

**Step 4: Commit**
```bash
git add app/glossary/page.tsx components/SiteNav.tsx
git commit -m "feat(glossary): reference page covering ATT&CK, TTPs, card anatomy, categories"
```

---

## Task 5: Notable Operations Timeline

A chronological view of all `notableOps` data across 106 cards, giving historical context to the threat landscape.

**Files:**
- Create: `app/timeline/page.tsx`
- Create: `components/TimelineClient.tsx`
- Modify: `components/SiteNav.tsx`

**Step 1: Parse timeline data**

The `notableOps` field on each card is `string[]` with entries like `"DNC hack (2016)"` or `"Operation Aurora (2009-2010)"`. Extract years with a regex.

In `app/timeline/page.tsx` (server component):

```tsx
import type { Metadata } from "next";
import { cards } from "@/data/cards";
import { TimelineClient } from "@/components/TimelineClient";
import { SiteNav } from "@/components/SiteNav";

export const metadata: Metadata = {
  title: "Timeline | Threat Intelligence Tarot",
  description: "Chronological history of notable cyber operations across all 106 threat actor groups.",
};

export type TimelineEvent = {
  year: number;
  op: string;
  cardName: string;
  cardTitle: string;
  slug: string;
  category: string;
};

function extractYear(op: string): number | null {
  const match = op.match(/\b(19|20)\d{2}\b/);
  return match ? parseInt(match[0], 10) : null;
}

export default function TimelinePage() {
  const events: TimelineEvent[] = [];

  for (const card of cards) {
    for (const op of card.notableOps) {
      const year = extractYear(op);
      if (year) {
        events.push({
          year,
          op,
          cardName: card.name,
          cardTitle: card.cardTitle,
          slug: card.slug,
          category: card.category,
        });
      }
    }
  }

  events.sort((a, b) => a.year - b.year || a.op.localeCompare(b.op));

  return (
    <main id="main-content" className="min-h-screen px-4 py-12 max-w-4xl mx-auto">
      <SiteNav current="/timeline" />
      <h1
        className="text-2xl text-center mb-2"
        style={{ fontFamily: "var(--font-cinzel), serif", color: "var(--color-gold-bright)" }}
      >
        Operations Timeline
      </h1>
      <p className="text-center text-sm mb-10" style={{ color: "var(--color-silver)", opacity: 0.55 }}>
        {events.length} notable operations across {cards.length} adversaries
      </p>
      <TimelineClient events={events} />
    </main>
  );
}
```

**Step 2: Create TimelineClient**

Create `components/TimelineClient.tsx`:

```tsx
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { TimelineEvent } from "@/app/timeline/page";

const catColor: Record<string, string> = {
  "nation-state": "#4aadad",
  criminal: "#9f7aea",
  hacktivist: "#f97316",
  trickster: "#e040a0",
  unknown: "#b8b8c8",
};

export function TimelineClient({ events }: { events: TimelineEvent[] }) {
  const [query, setQuery] = useState("");
  const [yearFrom, setYearFrom] = useState<number | "">("");
  const [yearTo, setYearTo] = useState<number | "">("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return events.filter((e) => {
      const matchesQuery = !q || e.op.toLowerCase().includes(q) || e.cardName.toLowerCase().includes(q);
      const matchesFrom = yearFrom === "" || e.year >= yearFrom;
      const matchesTo = yearTo === "" || e.year <= yearTo;
      return matchesQuery && matchesFrom && matchesTo;
    });
  }, [events, query, yearFrom, yearTo]);

  // Group by year
  const byYear = useMemo(() => {
    const map = new Map<number, TimelineEvent[]>();
    for (const e of filtered) {
      const list = map.get(e.year) ?? [];
      list.push(e);
      map.set(e.year, list);
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [filtered]);

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 justify-center mb-8">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search operations or groups..."
          className="px-4 py-2 text-sm bg-transparent outline-none"
          style={{
            color: "var(--color-mist)",
            border: "1px solid rgba(201,168,76,0.25)",
            borderRadius: "4px",
            fontFamily: "var(--font-garamond), Georgia, serif",
            width: "260px",
          }}
        />
        <input
          type="number"
          value={yearFrom}
          onChange={(e) => setYearFrom(e.target.value ? parseInt(e.target.value) : "")}
          placeholder="From year"
          style={{
            width: "100px",
            padding: "8px 12px",
            background: "transparent",
            border: "1px solid rgba(201,168,76,0.2)",
            borderRadius: "4px",
            color: "var(--color-silver)",
            fontFamily: "var(--font-cinzel), serif",
            fontSize: "12px",
            outline: "none",
          }}
        />
        <input
          type="number"
          value={yearTo}
          onChange={(e) => setYearTo(e.target.value ? parseInt(e.target.value) : "")}
          placeholder="To year"
          style={{
            width: "100px",
            padding: "8px 12px",
            background: "transparent",
            border: "1px solid rgba(201,168,76,0.2)",
            borderRadius: "4px",
            color: "var(--color-silver)",
            fontFamily: "var(--font-cinzel), serif",
            fontSize: "12px",
            outline: "none",
          }}
        />
      </div>

      {/* Timeline */}
      <div style={{ position: "relative" }}>
        {/* Vertical line */}
        <div
          style={{
            position: "absolute",
            left: "72px",
            top: 0,
            bottom: 0,
            width: "1px",
            background: "rgba(201,168,76,0.12)",
          }}
        />

        {byYear.map(([year, yearEvents]) => (
          <div key={year} className="mb-6" style={{ display: "flex", gap: "0" }}>
            {/* Year label */}
            <div
              style={{
                width: "72px",
                flexShrink: 0,
                paddingRight: "16px",
                paddingTop: "2px",
                textAlign: "right",
                fontFamily: "var(--font-cinzel), serif",
                fontSize: "11px",
                color: "var(--color-gold)",
                opacity: 0.7,
                letterSpacing: "0.05em",
              }}
            >
              {year}
            </div>

            {/* Events for this year */}
            <div style={{ flex: 1, paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
              {yearEvents.map((e, i) => {
                const color = catColor[e.category] ?? "#c9a84c";
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                    }}
                  >
                    {/* Dot on the line */}
                    <div
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: color,
                        flexShrink: 0,
                        marginTop: "5px",
                        marginLeft: "-23px",
                        boxShadow: `0 0 6px ${color}88`,
                      }}
                    />
                    <div>
                      <div style={{ fontSize: "13px", color: "var(--color-mist)", lineHeight: 1.4 }}>
                        {e.op}
                      </div>
                      <Link
                        href={`/card/${e.slug}`}
                        style={{
                          fontSize: "10px",
                          color: color,
                          opacity: 0.75,
                          textDecoration: "none",
                          fontFamily: "var(--font-cinzel), serif",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {e.cardName}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16" style={{ color: "var(--color-silver)", opacity: 0.4 }}>
            No operations match your filters.
          </div>
        )}
      </div>

      <div className="text-center mt-8" style={{ color: "var(--color-silver)", fontSize: "11px", opacity: 0.35 }}>
        {filtered.length} of {events.length} operations shown
      </div>
    </>
  );
}
```

**Step 3: Add Timeline to SiteNav**

In `components/SiteNav.tsx`, add after Map:
```typescript
{ href: "/timeline", label: "Timeline" },
```

**Step 4: Build**
```bash
npm run build
```
Expected: `/timeline` in static output.

**Step 5: Commit**
```bash
git add app/timeline/page.tsx components/TimelineClient.tsx components/SiteNav.tsx
git commit -m "feat(timeline): chronological view of notable operations across all 106 adversary groups"
```

---

## Task 6: Defensive Coverage Tracker

Let practitioners mark which defenses their organization has implemented. Stored in localStorage. Shows a coverage percentage on the Defense Index page.

**Files:**
- Create: `lib/coverage.ts`
- Modify: `components/DefenseIndexClient.tsx`

**Step 1: Create coverage utility**

Create `lib/coverage.ts`:
```typescript
const KEY = "ti-tarot-coverage";

export function getCoverage(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return new Set(raw as string[]);
  } catch {
    return new Set();
  }
}

export function toggleCoverage(control: string): Set<string> {
  const current = getCoverage();
  if (current.has(control)) {
    current.delete(control);
  } else {
    current.add(control);
  }
  localStorage.setItem(KEY, JSON.stringify([...current]));
  return current;
}
```

**Step 2: Modify DefenseIndexClient**

Read `components/DefenseIndexClient.tsx` first. Then:

Add import at top:
```typescript
import { getCoverage, toggleCoverage } from "@/lib/coverage";
```

Add state:
```typescript
const [covered, setCovered] = useState<Set<string>>(new Set());

useEffect(() => {
  setCovered(getCoverage());
}, []);

const handleToggleCoverage = (control: string) => {
  setCovered(toggleCoverage(control));
};
```

Add coverage summary bar above the results list (after the search/filter row):
```tsx
{covered.size > 0 && (
  <div
    className="mb-4 px-4 py-3 rounded-lg"
    style={{ background: "rgba(74,173,173,0.08)", border: "1px solid rgba(74,173,173,0.2)" }}
  >
    <div className="flex items-center justify-between mb-1.5">
      <span style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "10px", color: "var(--color-teal)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
        Coverage Tracker
      </span>
      <span style={{ fontSize: "11px", color: "var(--color-teal)" }}>
        {covered.size} / {defenses.length} implemented
      </span>
    </div>
    <div style={{ height: "4px", background: "rgba(74,173,173,0.15)", borderRadius: "2px", overflow: "hidden" }}>
      <div
        style={{
          height: "100%",
          width: `${Math.round((covered.size / defenses.length) * 100)}%`,
          background: "var(--color-teal)",
          borderRadius: "2px",
          transition: "width 0.3s ease",
        }}
      />
    </div>
  </div>
)}
```

For each defense item in the list, add a checkbox-style toggle button on the right side of the row. Find where each defense item is rendered and add:
```tsx
<button
  onClick={() => handleToggleCoverage(defense.control)}
  title={covered.has(defense.control) ? "Mark as not implemented" : "Mark as implemented"}
  style={{
    flexShrink: 0,
    width: "18px",
    height: "18px",
    borderRadius: "3px",
    border: `1px solid ${covered.has(defense.control) ? "rgba(74,173,173,0.6)" : "rgba(192,192,192,0.2)"}`,
    background: covered.has(defense.control) ? "rgba(74,173,173,0.2)" : "transparent",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--color-teal)",
    fontSize: "10px",
    transition: "all 0.18s ease",
  }}
>
  {covered.has(defense.control) ? "✓" : ""}
</button>
```

**Step 3: Build**
```bash
npm run build
```
Expected: clean build.

**Step 4: Commit**
```bash
git add lib/coverage.ts components/DefenseIndexClient.tsx
git commit -m "feat(defenses): coverage tracker — mark implemented controls, localStorage progress bar"
```

---

## Task 7: Global Search (keyboard shortcut `/`)

A floating search overlay triggered by pressing `/` from any page. Searches across card names, aliases, TTPs, and defenses simultaneously.

**Files:**
- Create: `components/GlobalSearch.tsx`
- Modify: `app/layout.tsx`

**Step 1: Create GlobalSearch component**

Create `components/GlobalSearch.tsx`:

```tsx
"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { cards } from "@/data/cards";

type Result = {
  type: "card" | "technique";
  label: string;
  sub: string;
  href: string;
};

function search(query: string): Result[] {
  const q = query.toLowerCase().trim();
  if (!q || q.length < 2) return [];
  const results: Result[] = [];

  for (const card of cards) {
    const matchesCard =
      card.name.toLowerCase().includes(q) ||
      card.cardTitle.toLowerCase().includes(q) ||
      card.aka.some((a) => a.toLowerCase().includes(q)) ||
      card.origin.toLowerCase().includes(q);

    if (matchesCard) {
      results.push({
        type: "card",
        label: card.cardTitle,
        sub: `${card.name} · ${card.origin}`,
        href: `/card/${card.slug}`,
      });
    }

    for (const ttp of card.ttps) {
      if (
        ttp.techniqueId.toLowerCase().includes(q) ||
        ttp.name.toLowerCase().includes(q)
      ) {
        if (!results.find((r) => r.href.includes(ttp.techniqueId))) {
          results.push({
            type: "technique",
            label: ttp.techniqueId,
            sub: `${ttp.name} · ${ttp.tactic}`,
            href: `/techniques`,
          });
        }
      }
    }

    if (results.length >= 8) break;
  }

  return results.slice(0, 8);
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const results = useMemo(() => search(query), [query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "/") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(10,10,15,0.85)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "80px",
      }}
      onClick={() => setOpen(false)}
    >
      <div
        style={{
          width: "min(560px, 90vw)",
          background: "var(--color-arcane)",
          border: "1px solid rgba(201,168,76,0.3)",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid rgba(201,168,76,0.1)" }}>
          <span style={{ color: "rgba(201,168,76,0.4)", fontFamily: "monospace", marginRight: "10px" }}>/</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search adversaries, techniques, aliases..."
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              color: "var(--color-mist)",
              fontFamily: "var(--font-garamond), Georgia, serif",
              fontSize: "15px",
            }}
          />
          <kbd
            style={{
              fontSize: "10px",
              color: "rgba(201,168,76,0.35)",
              border: "1px solid rgba(201,168,76,0.15)",
              borderRadius: "3px",
              padding: "2px 5px",
              fontFamily: "monospace",
            }}
          >
            Esc
          </kbd>
        </div>

        {results.length > 0 && (
          <div>
            {results.map((r, i) => (
              <button
                key={i}
                onClick={() => { router.push(r.href); setOpen(false); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  width: "100%",
                  padding: "10px 16px",
                  background: "none",
                  border: "none",
                  borderBottom: "1px solid rgba(201,168,76,0.06)",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.06)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "none"; }}
              >
                <span
                  style={{
                    fontSize: "9px",
                    fontFamily: "var(--font-cinzel), serif",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: r.type === "card" ? "var(--color-gold)" : "var(--color-teal)",
                    opacity: 0.7,
                    width: "60px",
                    flexShrink: 0,
                  }}
                >
                  {r.type}
                </span>
                <div>
                  <div style={{ fontSize: "13px", color: "var(--color-mist)" }}>{r.label}</div>
                  <div style={{ fontSize: "11px", color: "var(--color-silver)", opacity: 0.55 }}>{r.sub}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {query.length >= 2 && results.length === 0 && (
          <div style={{ padding: "20px 16px", color: "var(--color-silver)", fontSize: "13px", opacity: 0.45, textAlign: "center" }}>
            No results for &ldquo;{query}&rdquo;
          </div>
        )}

        {query.length < 2 && (
          <div style={{ padding: "12px 16px", color: "var(--color-silver)", fontSize: "11px", opacity: 0.35 }}>
            Type to search across {cards.length} adversaries and their techniques
          </div>
        )}
      </div>
    </div>
  );
}
```

**Step 2: Add GlobalSearch to layout**

In `app/layout.tsx`, import and render `<GlobalSearch />` inside the `<body>`:
```tsx
import { GlobalSearch } from "@/components/GlobalSearch";
// Inside <body>:
<GlobalSearch />
```

**Step 3: Build**
```bash
npm run build
```
Expected: clean build.

**Step 4: Update keyboard shortcuts display**

In `components/KeyboardShortcuts.tsx`, add `/` to the shortcuts list:
```typescript
{ key: "/", desc: "Open global search (any page)" },
```

**Step 5: Commit**
```bash
git add components/GlobalSearch.tsx app/layout.tsx components/KeyboardShortcuts.tsx
git commit -m "feat(search): global search overlay — press / from any page to search cards and techniques"
```

---

## Final: Push all commits

```bash
git push
```

---

## Order of execution

1. Task 1 (active filter) — touches data, verify build after
2. Task 2 (copy TTP) — tiny, isolated
3. Task 3 (watchlist) — multiple files, most complex of Tier 1
4. Task 4 (glossary) — pure content, no risk
5. Task 5 (timeline) — data extraction + new page
6. Task 6 (coverage tracker) — localStorage, modifies existing component
7. Task 7 (global search) — layout-level change, test last
