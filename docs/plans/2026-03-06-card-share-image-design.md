# Design: Card Share Image + Share Buttons

**Date:** 2026-03-06
**Status:** Approved

## Summary

Add a "Share" button to card pages and the home draw page that lets users download a portrait card image or share directly to X/LinkedIn. Zero new infrastructure — pure frontend + a new Satori image route.

---

## Goals

- Make drawn cards shareable as images on social media (X, LinkedIn)
- Watermark every image with `tarot.scottaltiparmak.com` for passive distribution
- Remove friction between drawing a card and posting it

---

## Image Generation

Use Next.js `ImageResponse` (Satori) — the same system already powering OG images.

New route: `/app/card/[slug]/share-image/route.tsx`
- Returns a PNG via `ImageResponse`
- Portrait format: 600x1050px (matches the card's 17/30 aspect ratio)
- No client-side canvas, no `html2canvas`, no new dependencies

### Image contents
- Dark arcane background (`#0a0a0f` to `#1a1a2e` gradient)
- Card title in Cinzel (e.g., "The Phantom")
- Group name + top alias (e.g., "APT28 / Fancy Bear")
- Origin + category
- Risk level (stars)
- Top 3-4 TTPs with technique IDs
- Watermark at bottom: `tarot.scottaltiparmak.com`

---

## Share Button

### Placement
- `/card/[slug]` — individual card page (near existing ATT&CK Navigator / Compare buttons)
- `/` home page — appears after a card is drawn (in the card reveal area)

### Behaviour
Button labelled "Share" opens a small popover with four options:

| Option | Action |
|---|---|
| Download image | Fetches `/card/[slug]/share-image`, triggers browser download as `[card-slug].png` |
| Share to X | Opens `twitter.com/intent/tweet` with pre-filled text |
| Share to LinkedIn | Opens LinkedIn share offsite with card URL |
| Copy link | Copies card permalink to clipboard, button label flips to "Copied" for 2s |

### Pre-filled X tweet text
```
I drew [Card Title] ([Group Name]). [Top TTP name] ([ TechniqueId]).
tarot.scottaltiparmak.com/card/[slug]
```

---

## New Files

| File | Purpose |
|---|---|
| `app/card/[slug]/share-image/route.tsx` | Satori PNG route |
| `components/ShareButton.tsx` | Share popover component |

---

## Out of Scope

- Spread page sharing
- Gallery page sharing
- Any database, cron, or auth

---

## Implementation Notes

- Satori font loading: reuse the same Cinzel font fetch pattern from the existing `opengraph-image.tsx`
- Download trigger: `<a href="/card/[slug]/share-image" download="[slug].png">` — browser handles it natively
- LinkedIn share: `https://www.linkedin.com/sharing/share-offsite/?url=encodeURIComponent(cardUrl)`
- X share: `https://twitter.com/intent/tweet?text=encodeURIComponent(text)&url=encodeURIComponent(cardUrl)`
- Popover: simple absolute-positioned div, close on outside click, no external popover library
