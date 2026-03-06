# Card Share Image + Share Buttons Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a shareable portrait card image route and a 4-option share popover to card pages and the home draw page.

**Architecture:** A new Next.js Route Handler at `/app/card/[slug]/share-image/route.tsx` uses `ImageResponse` (Satori) to generate a 600x1050px portrait PNG. `ShareButton.tsx` is upgraded from a simple native-share button to a popover with Download / Share to X / Share to LinkedIn / Copy Link. The card page already imports ShareButton; the home page gets it added after draw.

**Tech Stack:** Next.js App Router, `next/og` (ImageResponse / Satori), React useState/useRef for popover, no new dependencies.

---

### Task 1: Create the share-image route

**Files:**
- Create: `app/card/[slug]/share-image/route.tsx`

This is a Next.js Route Handler (not a page) that returns a PNG. It reuses the same Satori approach as `app/card/[slug]/opengraph-image.tsx` but produces a portrait card image at 600x1050px.

**Step 1: Create the file**

```tsx
// app/card/[slug]/share-image/route.tsx
import { ImageResponse } from "next/og";
import { getCardBySlug } from "@/lib/slug";
import { NextRequest } from "next/server";

export const runtime = "edge";

const categoryColor: Record<string, string> = {
  "nation-state": "#2d6a6a",
  criminal: "#4a1a6a",
  hacktivist: "#8b3a0f",
  unknown: "#555",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const card = getCardBySlug(slug);

  if (!card) {
    return new Response("Not found", { status: 404 });
  }

  const accent = categoryColor[card.category] ?? "#555";
  const stars = Array.from({ length: 5 }, (_, i) =>
    i < card.riskLevel ? "★" : "☆"
  ).join(" ");

  const arcanum =
    card.arcanum === "major"
      ? `Major Arcana · ${card.number ?? ""}`
      : `${(card.suit ?? "minor").charAt(0).toUpperCase() + (card.suit ?? "minor").slice(1)} · ${card.number ?? ""}`;

  const ttps = card.ttps.slice(0, 4);

  return new ImageResponse(
    (
      <div
        style={{
          width: 600,
          height: 1050,
          background: "linear-gradient(180deg, #0a0a0f 0%, #1a1a2e 100%)",
          display: "flex",
          flexDirection: "column",
          fontFamily: "serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Category glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse 500px 400px at 50% 30%, ${accent}44 0%, transparent 65%)`,
            display: "flex",
          }}
        />

        {/* Gold border frame */}
        <div
          style={{
            position: "absolute",
            inset: 16,
            border: "1px solid rgba(201,168,76,0.25)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 20,
            border: "1px solid rgba(201,168,76,0.12)",
            display: "flex",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            padding: "48px 48px 32px",
            position: "relative",
          }}
        >
          {/* Arcanum label */}
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.3em",
              color: "rgba(201,168,76,0.6)",
              textTransform: "uppercase",
              marginBottom: 24,
              display: "flex",
            }}
          >
            {arcanum}
          </div>

          {/* Card title */}
          <div
            style={{
              fontSize: 44,
              fontWeight: 700,
              color: "#f0c040",
              lineHeight: 1.1,
              marginBottom: 12,
              display: "flex",
            }}
          >
            {card.cardTitle}
          </div>

          {/* Group name */}
          <div
            style={{
              fontSize: 24,
              color: "#e8e0f0",
              marginBottom: 4,
              display: "flex",
            }}
          >
            {card.name}
          </div>

          {/* Aliases */}
          <div
            style={{
              fontSize: 14,
              color: "rgba(192,192,192,0.55)",
              marginBottom: 20,
              display: "flex",
            }}
          >
            {card.aka.slice(0, 3).join(" / ")}
          </div>

          {/* Origin + risk */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 28,
            }}
          >
            <div
              style={{
                display: "flex",
                background: `${accent}33`,
                border: `1px solid ${accent}66`,
                borderRadius: 4,
                padding: "3px 10px",
                fontSize: 12,
                color: "#e8e0f0",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              {card.origin}
            </div>
            <div style={{ fontSize: 18, color: "#f0c040", display: "flex" }}>
              {stars}
            </div>
          </div>

          {/* Divider */}
          <div
            style={{
              width: "100%",
              height: 1,
              background:
                "linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent)",
              marginBottom: 28,
              display: "flex",
            }}
          />

          {/* TTPs section */}
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.25em",
              color: "rgba(201,168,76,0.7)",
              textTransform: "uppercase",
              marginBottom: 16,
              display: "flex",
            }}
          >
            Key Techniques
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {ttps.map((ttp) => (
              <div
                key={ttp.techniqueId}
                style={{ display: "flex", alignItems: "flex-start", gap: 12 }}
              >
                <div
                  style={{
                    display: "flex",
                    background: "rgba(201,168,76,0.12)",
                    border: "1px solid rgba(201,168,76,0.3)",
                    borderRadius: 4,
                    padding: "2px 8px",
                    fontSize: 12,
                    color: "#f0c040",
                    fontFamily: "monospace",
                    flexShrink: 0,
                  }}
                >
                  {ttp.techniqueId}
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ fontSize: 14, color: "#e8e0f0" }}>
                    {ttp.name}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "rgba(192,192,192,0.45)",
                    }}
                  >
                    {ttp.tactic}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Spacer */}
          <div style={{ flex: 1, display: "flex" }} />

          {/* Divider */}
          <div
            style={{
              width: "100%",
              height: 1,
              background:
                "linear-gradient(90deg, transparent, rgba(201,168,76,0.25), transparent)",
              marginBottom: 16,
              display: "flex",
            }}
          />

          {/* Watermark */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: "rgba(192,192,192,0.3)",
                letterSpacing: "0.12em",
                display: "flex",
              }}
            >
              tarot.scottaltiparmak.com
            </div>
            <div
              style={{
                fontSize: 10,
                color: `${accent}99`,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                display: "flex",
              }}
            >
              {card.category}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 600,
      height: 1050,
    }
  );
}
```

**Step 2: Verify the route works**

Run: `npm run dev`

Navigate to: `http://localhost:3000/card/apt28-fancy-bear/share-image`

Expected: A 600x1050 PNG renders in the browser showing the APT28 card.

**Step 3: Commit**

```bash
git add app/card/[slug]/share-image/route.tsx
git commit -m "feat: add portrait share-image route for card PNG download"
```

---

### Task 2: Upgrade ShareButton to 4-option popover

**Files:**
- Modify: `components/ShareButton.tsx`

The current ShareButton is a simple native share / copy link button. Replace it with a popover showing 4 options. The component props change: instead of `title/text/url`, it takes `card` data needed to build the tweet text and download URL.

**Step 1: Replace ShareButton.tsx**

```tsx
"use client";

import { useState, useRef, useEffect } from "react";

interface ShareButtonProps {
  cardTitle: string;   // e.g. "The Phantom"
  groupName: string;   // e.g. "APT28"
  topTtp?: { name: string; techniqueId: string };
  slug: string;        // e.g. "apt28-fancy-bear"
}

export function ShareButton({ cardTitle, groupName, topTtp, slug }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const cardUrl = `https://tarot.scottaltiparmak.com/card/${slug}`;
  const imageUrl = `/card/${slug}/share-image`;

  const tweetText = topTtp
    ? `I drew ${cardTitle} (${groupName}). ${topTtp.name} (${topTtp.techniqueId}).`
    : `I drew ${cardTitle} (${groupName}).`;

  const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(cardUrl)}`;
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(cardUrl)}`;

  // Close popover on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cardUrl);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setOpen(false);
      }, 2000);
    } catch {
      // Clipboard not available
    }
  };

  const buttonStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    width: "100%",
    padding: "9px 14px",
    background: "transparent",
    border: "none",
    color: "var(--color-silver)",
    fontSize: "11px",
    fontFamily: "var(--font-cinzel), serif",
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
    cursor: "pointer",
    textAlign: "left" as const,
    textDecoration: "none",
    transition: "color 0.15s, background 0.15s",
    WebkitTapHighlightColor: "transparent",
  };

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative overflow-hidden px-5 py-2 text-xs uppercase tracking-widest transition-transform duration-150 active:scale-95"
        style={{
          fontFamily: "var(--font-cinzel), serif",
          color: open ? "var(--color-gold-bright)" : "var(--color-silver)",
          border: `1px solid ${open ? "var(--color-gold)" : "rgba(192,192,192,0.3)"}`,
          background: "transparent",
          cursor: "pointer",
          touchAction: "manipulation",
          WebkitTapHighlightColor: "transparent",
          transition: "color 0.2s, border-color 0.2s",
        }}
      >
        ✦ Share Card
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--color-arcane)",
            border: "1px solid rgba(201,168,76,0.25)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
            minWidth: 220,
            zIndex: 50,
            animation: "section-reveal 0.18s cubic-bezier(0.22,1,0.36,1) both",
          }}
        >
          {/* Download image */}
          <a
            href={imageUrl}
            download={`${slug}.png`}
            style={buttonStyle}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = "var(--color-gold-bright)";
              (e.currentTarget as HTMLAnchorElement).style.background = "rgba(201,168,76,0.06)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = "var(--color-silver)";
              (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
            }}
            onClick={() => setOpen(false)}
          >
            <span style={{ opacity: 0.5, fontSize: 13 }}>↓</span>
            Download Image
          </a>

          <div style={{ height: 1, background: "rgba(201,168,76,0.1)", margin: "0 14px" }} />

          {/* Share to X */}
          <a
            href={xUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={buttonStyle}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = "var(--color-gold-bright)";
              (e.currentTarget as HTMLAnchorElement).style.background = "rgba(201,168,76,0.06)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = "var(--color-silver)";
              (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
            }}
            onClick={() => setOpen(false)}
          >
            <span style={{ opacity: 0.5, fontSize: 13 }}>𝕏</span>
            Share to X
          </a>

          <div style={{ height: 1, background: "rgba(201,168,76,0.1)", margin: "0 14px" }} />

          {/* Share to LinkedIn */}
          <a
            href={linkedInUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={buttonStyle}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = "var(--color-gold-bright)";
              (e.currentTarget as HTMLAnchorElement).style.background = "rgba(201,168,76,0.06)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = "var(--color-silver)";
              (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
            }}
            onClick={() => setOpen(false)}
          >
            <span style={{ opacity: 0.5, fontSize: 11 }}>in</span>
            Share to LinkedIn
          </a>

          <div style={{ height: 1, background: "rgba(201,168,76,0.1)", margin: "0 14px" }} />

          {/* Copy link */}
          <button
            onClick={handleCopy}
            style={{
              ...buttonStyle,
              color: copied ? "var(--color-gold-bright)" : "var(--color-silver)",
            }}
            onMouseEnter={(e) => {
              if (!copied) {
                (e.currentTarget as HTMLButtonElement).style.color = "var(--color-gold-bright)";
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(201,168,76,0.06)";
              }
            }}
            onMouseLeave={(e) => {
              if (!copied) {
                (e.currentTarget as HTMLButtonElement).style.color = "var(--color-silver)";
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              }
            }}
          >
            <span style={{ opacity: 0.5, fontSize: 13 }}>{copied ? "✓" : "⎘"}</span>
            {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Fix the ShareButton usage in the card page**

The card page at `app/card/[slug]/page.tsx` currently calls:
```tsx
<ShareButton
  title={`${card.cardTitle}: ${card.name} | Threat Intelligence Tarot`}
  text={card.flavor}
  url={`https://tarot.scottaltiparmak.com/card/${card.slug}`}
/>
```

Update it to pass the new props:
```tsx
<ShareButton
  cardTitle={card.cardTitle}
  groupName={card.name}
  topTtp={card.ttps[0]}
  slug={card.slug}
/>
```

**Step 3: Verify**

Run: `npm run dev`

Go to any card page, e.g. `http://localhost:3000/card/apt28-fancy-bear`

- Click "✦ Share Card" — popover opens above the button
- "Download Image" link should trigger a PNG download
- "Share to X" should open Twitter intent in a new tab with pre-filled text
- "Share to LinkedIn" should open LinkedIn share in a new tab
- "Copy Link" should copy the URL and show "Copied!" for 2s
- Clicking outside the popover should close it

**Step 4: Commit**

```bash
git add components/ShareButton.tsx app/card/[slug]/page.tsx
git commit -m "feat: upgrade ShareButton to 4-option share popover"
```

---

### Task 3: Add ShareButton to home page after draw

**Files:**
- Modify: `app/page.tsx`

The home page shows a drawn card but currently only has a "View shareable profile →" link below it. Add the ShareButton beside that link so users can share directly from the home draw without navigating to the card page.

**Step 1: Import ShareButton in page.tsx**

Add to the imports at the top of `app/page.tsx`:
```tsx
import { ShareButton } from "@/components/ShareButton";
```

**Step 2: Add ShareButton in the card reveal section**

Find this block (around line 185-201):
```tsx
{card && (
  <div key={key} className="mt-10 card-deal flex flex-col items-center gap-3">
    <TarotCard key={key} card={card} />
    <a
      href={`/card/${card.slug}`}
      ...
    >
      View shareable profile →
    </a>
  </div>
)}
```

Replace with:
```tsx
{card && (
  <div key={key} className="mt-10 card-deal flex flex-col items-center gap-3">
    <TarotCard key={key} card={card} />
    <div
      className="flex items-center gap-4"
      style={{ animation: "section-reveal 0.4s ease-out 0.6s both" }}
    >
      <ShareButton
        cardTitle={card.cardTitle}
        groupName={card.name}
        topTtp={card.ttps[0]}
        slug={card.slug}
      />
      <a
        href={`/card/${card.slug}`}
        className="text-xs uppercase tracking-widest transition-opacity hover:opacity-100"
        style={{
          color: "var(--color-gold)",
          opacity: 0.45,
          fontFamily: "var(--font-cinzel), serif",
        }}
      >
        Full profile →
      </a>
    </div>
  </div>
)}
```

Note: remove the `animation` inline style from the `<a>` since it moves to the wrapper `<div>`.

**Step 3: Verify**

Run: `npm run dev`

Go to `http://localhost:3000`, draw a card.

- Share button appears next to "Full profile →" after draw
- Popover opens, all 4 options work
- Download generates a PNG for the drawn card

**Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat: add share button to home draw reveal"
```

---

### Task 4: Type-check and build

**Step 1: Type check**

Run: `npm run type-check`

Expected: No errors. If there are type errors in ShareButton props usage, fix the prop names to match the new interface.

**Step 2: Build**

Run: `npm run build`

Expected: Build completes with no errors. The share-image route will appear in the build output as an edge function.

**Step 3: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix: type-check corrections for share feature"
```
