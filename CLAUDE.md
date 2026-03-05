# Threat Intelligence Tarot — CLAUDE.md

## Project Overview

A tarot-style web app where each card draw reveals a randomized adversary profile drawn from real MITRE ATT&CK threat groups. Cards present TTPs, motivations, likely targets, and defensive guidance — styled as mystical tarot cards with a dark arcane aesthetic.

**Tagline:** Real threat intelligence. Impossible to scroll past.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS + custom CSS for card animations |
| Animations | CSS 3D transforms (card flip) |
| Data | Static TypeScript dataset (MITRE ATT&CK-sourced, structure ready for live API) |
| Deployment | Static export first → Vercel when needed |
| OG Images | Next.js `ImageResponse` (opengraph-image.tsx per card route) |

---

## Architecture

```
/app
  /page.tsx                  # Home: card draw UI, single card reveal
  /card/[slug]/page.tsx      # Individual card permalink
  /card/[slug]/opengraph-image.tsx  # Dynamic OG image per card
  /layout.tsx                # Global layout, fonts, metadata

/components
  /TarotCard.tsx             # Card component with 3D flip animation
  /CardFront.tsx             # Face-up: full adversary profile
  /CardBack.tsx              # Face-down: arcane back design
  /DrawButton.tsx            # "Draw a Card" CTA
  /TTPBadge.tsx              # Individual TTP tag component
  /DefenseList.tsx           # Defensive recommendations list

/data
  /cards.ts                  # Full 78-card dataset (exported typed array)
  /types.ts                  # TypeScript types for card data
  /mitre-reference.ts        # MITRE ATT&CK technique ID mappings

/lib
  /draw.ts                   # Card draw logic (random + daily seed)
  /slug.ts                   # Slug generation and lookup helpers

/public
  /card-back.svg             # SVG for card back design
  /fonts/                    # Local font files if needed
```

---

## Card Data Structure

```typescript
// data/types.ts
interface TarotCard {
  id: string;                    // e.g. "apt28"
  slug: string;                  // URL slug, e.g. "apt28-fancy-bear"
  name: string;                  // "APT28"
  aka: string[];                 // ["Fancy Bear", "STRONTIUM", "Sofacy"]
  cardTitle: string;             // Tarot-style card name: "The Phantom of the Kremlin"
  arcanum: "major" | "minor";    // Major = iconic groups, Minor = others
  suit?: "swords" | "wands" | "cups" | "pentacles"; // Minor arcana suit
  number?: number;               // Card number within suit or major arcana
  origin: string;                // "Russia" / "China" / "Criminal" / etc.
  category: "nation-state" | "criminal" | "hacktivist" | "unknown";
  since: string;                 // "Active since ~2004"
  motivation: string[];          // ["Espionage", "Political influence"]
  targets: string[];             // ["Government", "Defense", "Energy"]
  ttps: TTP[];                   // MITRE ATT&CK techniques
  notableOps: string[];          // ["DNC hack (2016)", "Bundestag breach"]
  flavor: string;                // Tarot-style narrative description (2-3 sentences)
  reversedMeaning: string;       // "Reversed" card meaning (their failures/weaknesses)
  defenses: Defense[];           // How to defend against this archetype
  riskLevel: 1 | 2 | 3 | 4 | 5; // Threat severity
  mitreGroupId?: string;         // e.g. "G0007" — for future live API linkage
}

interface TTP {
  techniqueId: string;           // "T1566.001"
  name: string;                  // "Spearphishing Attachment"
  tactic: string;                // "Initial Access"
}

interface Defense {
  control: string;               // "Email filtering with attachment sandboxing"
  framework?: string;            // "NIST CSF: PR.AT" or "CIS Control 9"
}
```

---

## The 78 Cards

### Major Arcana (22 cards) — The Icons

| # | Card Title | Group | Origin |
|---|---|---|---|
| 0 | The Ghost | Equation Group | USA (NSA-linked) |
| 1 | The Phantom | APT28 / Fancy Bear | Russia |
| 2 | The Shadow Court | APT29 / Cozy Bear | Russia |
| 3 | The Destroyer | Sandworm | Russia |
| 4 | The Serpent | Turla | Russia |
| 5 | The Archivist | APT1 / Comment Crew | China |
| 6 | The Ten Thousand | APT41 / Winnti | China |
| 7 | The Silent Dragon | Volt Typhoon | China |
| 8 | The Specter | Lazarus Group | North Korea |
| 9 | The Alchemist | APT38 | North Korea |
| 10 | The Whisperer | Kimsuky | North Korea |
| 11 | The Flame Keeper | APT33 / Elfin | Iran |
| 12 | The Oracle | APT34 / OilRig | Iran |
| 13 | The Charmed One | APT35 / Charming Kitten | Iran |
| 14 | The Merchant | FIN7 | Criminal |
| 15 | The Reaper | REvil / Sodinokibi | Criminal |
| 16 | The Locked Tower | LockBit | Criminal |
| 17 | The Plague | Conti / Wizard Spider | Criminal |
| 18 | The Shape Shifter | Scattered Spider | Criminal |
| 19 | The Void | BlackCat / ALPHV | Criminal |
| 20 | The Thousand Masks | Anonymous | Hacktivist |
| 21 | The Storm | KillNet | Hacktivist |

### Minor Arcana (56 cards) — Four Suits

**Swords (Espionage & Intelligence) — 14 cards**
APT10, APT40, Hafnium, Bronze Butler, Mustang Panda, Salt Typhoon, Gamaredon, Callisto Group, Bitter, SideWinder, Patchwork, Transparent Tribe, TA413, MuddyWater

**Wands (Disruption & Destruction) — 14 cards**
Predatory Sparrow, Moses Staff, Cyber Av3ngers, Operation Aurora operators, Stuxnet operators, GhostSec, AnonymousSudan, IT Army of Ukraine, UNC2452 (SolarWinds), Yellow Garuda, RedHack, UserSec, Guacamaya, APT-C-36

**Cups (Social Engineering & Deception) — 14 cards**
Lapsus$, UNC3944, FIN4, FIN8, TA505, TA558, Tortoiseshell, Molerats / Gaza Cybergang, Bahamut, Evilnum, UNC1151, SilverFish, Gorgon Group, Machete

**Pentacles (Financial Crime & Ransomware) — 14 cards**
Cl0p, DarkSide, BlackMatter, Hive, Vice Society, FIN6, Carbanak, TrickBot / Ryuk, Emotet / Mealybug, BazaLoader, IcedID / Bokbot, FIN5, Magecart, TA2101

---

## Development Commands

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Type check
npm run type-check

# Build for production
npm run build

# Export static site
npm run export
```

---

## Visual Design System

### Color Palette
```css
--color-void: #0a0a0f;          /* Near-black background */
--color-arcane: #1a1a2e;        /* Card background */
--color-gold: #c9a84c;          /* Primary gold */
--color-gold-bright: #f0c040;   /* Highlighted gold */
--color-crimson: #8b0000;       /* Danger / high-risk accents */
--color-silver: #c0c0c0;        /* Secondary text */
--color-mist: #e8e0f0;          /* Light text on dark */
--color-teal: #2d6a6a;          /* Nation-state accent */
--color-purple: #4a1a6a;        /* Criminal accent */
--color-ember: #8b3a0f;         /* Hacktivist accent */
```

### Typography
- **Display / card titles:** Cinzel (serif, classical Roman feel)
- **Body / flavor text:** EB Garamond (elegant serif)
- **Monospace / TTP codes:** JetBrains Mono or Fira Code
- All via Google Fonts

### Card Anatomy (Face-up)
```
┌─────────────────────────────┐
│  [NUMBER]   [SUIT SYMBOL]   │  ← top bar, gold on black
│                             │
│     ╔═══════════════╗       │
│     ║   [SIGIL /    ║       │  ← central illustration area
│     ║  SYMBOL ART]  ║       │     (CSS/SVG geometric sigil)
│     ╚═══════════════╝       │
│                             │
│  ✦ THE PHANTOM ✦            │  ← tarot-style card name
│  APT28 • Fancy Bear         │  ← real group name + aliases
│  ─────────────────────      │
│  🎯 Targets: Gov • Defense  │
│  ⚡ Since: ~2004 • Russia   │
│                             │
│  [ FLAVOR TEXT ]            │  ← 2-3 sentence arcane description
│                             │
│  TACTICS          TTPs      │
│  Initial Access   T1566.001 │
│  Lateral Movement T1021.001 │
│                             │
│  ── DEFENSES ──             │
│  • MFA everywhere           │
│  • Email sandboxing         │
│                             │
│  ░ RISK: ★★★★☆ ░           │  ← bottom bar
└─────────────────────────────┘
```

---

## Data Layer Notes

The static dataset in `/data/cards.ts` is structured to mirror what a live MITRE ATT&CK STIX/TAXII API would return. When upgrading to live data:

1. MITRE ATT&CK STIX endpoint: `https://raw.githubusercontent.com/mitre/cti/master/enterprise-attack/enterprise-attack.json`
2. Group objects have `type: "intrusion-set"` in STIX
3. Map `external_references` array for technique IDs and MITRE group IDs
4. The `mitreGroupId` field on each card (e.g. `"G0007"`) provides the join key

---

## Shareability & OG Images

Each card at `/card/[slug]` renders:
- Full card UI
- Dynamic OG image via Next.js `ImageResponse` showing the card face
- Meta tags: `og:title`, `og:description`, `twitter:card: summary_large_image`

OG image dimensions: **1200×630px** (standard for LinkedIn/Twitter)

---

## Future Enhancements (Not In Scope Now)

- Three-card spread mode (Past threat / Present threat / Future threat)
- Daily card mode (seed-based on date, same card for everyone each day)
- Claude API integration for dynamic flavor text generation
- Live MITRE ATT&CK API data refresh
- Card collection / tracker ("I've defended against these")
- Printable PDF deck
