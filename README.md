# Threat Intelligence Tarot

**Real threat intelligence. Impossible to scroll past.**

A full 78-card tarot deck where every card is a real adversary group drawn from MITRE ATT&CK. Each card presents TTPs, targets, motivations, and defensive recommendations — styled as a dark arcane tarot experience.

Live: [threat-intel-tarot.vercel.app](https://threat-intel-tarot.vercel.app)

---

## What It Is

Threat intelligence is dense, technical, and easy to ignore. Packaging it as a card deck makes it memorable, shareable, and engaging without losing the substance.

The tarot format is aesthetics. The threat data is real.

Each card covers a documented adversary group with:
- MITRE ATT&CK technique IDs mapped to kill-chain phases
- Target sectors, origin, active dates, and risk level
- Notable operations and aliases
- Specific defensive control recommendations
- ATT&CK Navigator layer export (import directly into the Navigator)
- Markdown threat brief for reports and documentation

---

## The Deck

78 cards mapped to standard tarot structure:

| Arcana | Suit | Theme | Count |
|---|---|---|---|
| Major | | Iconic APT groups | 22 |
| Minor | Swords | Espionage and Intelligence | 14 |
| Minor | Wands | Disruption and Destruction | 14 |
| Minor | Cups | Social Engineering and Deception | 14 |
| Minor | Pentacles | Financial Crime and Ransomware | 14 |

Groups include: Equation Group, APT28, APT29, Sandworm, Turla, APT41, Lazarus, LockBit, Conti, Scattered Spider, Hafnium, Cl0p, and 66 more.

---

## Features

- **Draw a Card**: random adversary from the full deck
- **Daily Card**: seed-based, same card for everyone each day, resets at midnight
- **Three-Card Spread**: Past, Present, Future threat actors with shared TTP analysis and priority defenses
- **Gallery**: browse all 78 cards with search, category, suit, origin, and sector filters
- **Adversary Comparison**: side-by-side TTP, target, and defense comparison for any two groups, with shared techniques highlighted and a shareable URL
- **Technique Explorer**: all MITRE ATT&CK techniques across the deck, grouped by tactic, ranked by prevalence, with kill-chain distribution chart
- **Defense Index**: security controls ranked by cross-deck coverage to help prioritize what defends against the most adversaries
- **Sector Intelligence**: industries ranked by adversary targeting with average risk scores
- **ATT&CK Navigator Export**: download a Navigator v5 layer file pre-loaded with any adversary's techniques
- **Threat Brief**: copy a clean markdown profile to clipboard for reports, Confluence, or security awareness materials

---

## Data

- **418 TTP entries** across 78 adversary profiles
- **97 unique technique IDs** covering all **14 MITRE ATT&CK Enterprise tactics**
- Sources: MITRE ATT&CK, CISA/NSA/FBI advisories, Mandiant, CrowdStrike, Kaspersky, Citizen Lab
- Validation pipeline at `scripts/validate_data.py`

Flavor text and reversed meanings are creative interpretations. Threat data is factual and sourced.

---

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS v4
- Static card data in `data/cards.ts` (MITRE ATT&CK-sourced, typed)
- Deployed on Vercel

---

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
# Type check
npx tsc --noEmit

# Validate card data
python3 scripts/validate_data.py
```

---

## Built By

**Scott Altiparmak** - Senior Information Security Engineer, CISSP

[scottaltiparmak.com](https://www.scottaltiparmak.com) | [LinkedIn](https://www.linkedin.com/in/scottaltiparmak/)

---

Data sourced from MITRE ATT&CK. For educational purposes.
