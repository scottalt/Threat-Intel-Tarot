# Design Upgrade & iOS Compatibility — Design Document

**Goal:** Transform Threat Intelligence Tarot into a cinematic, fully animated educational tool for APT groups that works beautifully on iPhone and desktop. Maximum animation, zero compromise on educational content.

**Tagline:** Real threat intelligence. Impossible to scroll past.

---

## iOS Fixes

- Card width: `min(340px, 92vw)`, height via aspect-ratio to match
- CardFront inner scroll: `overscroll-behavior: contain`, `-webkit-overflow-scrolling: touch`
- Remove desktop hover tilt on touch devices via `@media (hover: none)`
- Safe area padding: `env(safe-area-inset-bottom)` for notch/home indicator
- `touch-action: manipulation` on all interactive elements (eliminates 300ms tap delay)

---

## Home Page

### Starfield Background
- `<canvas>` element, full-screen, fixed behind everything
- 80–100 small dots, slow random drift, subtle opacity variation
- Not distracting — texture, not spectacle

### Category-Reactive Nebula
- Radial gradient blob behind the card area
- Shifts color per drawn card's category:
  - nation-state → teal (`#2d6a6a`)
  - criminal → purple (`#4a1a6a`)
  - hacktivist → ember (`#8b3a0f`)
  - default/undrawn → deep void
- Fades in over 800ms on each new draw

### Draw Button
- Gold shimmer sweep: highlight slides across text every 3s on loop
- Press: subtle scale-down (0.97) then spring release
- "The cards await" hint: slow float animation (translateY ±6px, 3s loop)

---

## Card Back (Face-Down)

- **Outer sigil ring**: continuous slow rotation (20s per revolution)
- **Center eye**: breathe pulse (scale 1.0 → 1.08 → 1.0, 2s loop) + gold glow that syncs
- **Corner glyphs (✦)**: alternating opacity fade, offset timing — alive but subtle
- **Touch tilt**: on mobile, `touchstart` applies 3D tilt toward touch point, `touchend` eases back. Replaces non-functional CSS `:hover` tilt on iOS.

---

## Card Flip

- Existing 3D flip preserved
- **Particle burst**: at ~400ms into flip, 12–16 gold spark `div`s radiate from card center, fade + scale out over 600ms. Pure CSS animation, no canvas.
- **Title shimmer**: after flip completes, card title gets a single shimmer sweep (gold highlight, left-to-right, 800ms, one-shot)

---

## Card Front (Revealed)

- **Category glow**: colored top border radiates 60px radial gradient into card background, matching category color
- **Staggered section reveals**: each section (targets, flavor, TTPs, ops, defenses, reversed) fades + slides up (translateY 12px → 0), 60ms stagger between sections
- **TTP badge entrance**: individual badges slide from left (translateX -8px → 0), 40ms stagger
- **Risk stars**: fill left-to-right on reveal, 100ms between each star, starting 300ms after flip completes

---

## Technical Constraints

- All animations via CSS (transforms, keyframes, transitions) — no heavy JS animation libraries
- Canvas only for starfield (lightweight, no deps)
- Respect `prefers-reduced-motion` — disable all motion animations for accessibility
- No new npm dependencies

---

## Files to Touch

| File | Change |
|---|---|
| `app/globals.css` | iOS fixes, new keyframe animations, reduced-motion media query |
| `app/page.tsx` | Starfield canvas, nebula overlay, button shimmer, float hint |
| `components/CardBack.tsx` | Animated SVG sigil (ring rotation, eye pulse, glyph fade) |
| `components/TarotCard.tsx` | Particle burst on flip, touch tilt handler |
| `components/CardFront.tsx` | Staggered section reveals, category glow, star fill animation |
| `components/TTPBadge.tsx` | Slide-in entrance animation |
| `components/DrawButton.tsx` | Shimmer sweep, press scale |
