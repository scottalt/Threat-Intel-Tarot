# Threat Intelligence Tarot — Initial Build Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a working tarot-style web app that draws random adversary profile cards from a 22-card Major Arcana dataset of real MITRE ATT&CK threat groups.

**Architecture:** Next.js 14 App Router with TypeScript and Tailwind CSS v4. Static data layer in `data/cards.ts`. Client-side card flip animation via CSS 3D transforms. No backend required for MVP — all data is hardcoded and typed.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS v4, Google Fonts (Cinzel, EB Garamond, JetBrains Mono), CSS 3D transforms for flip animation.

---

## Current State

- `data/types.ts` — TypeScript interfaces already exist. Do not modify.
- `app/page.tsx` — Default Next.js boilerplate. Will be replaced entirely.
- `app/globals.css` — Default Tailwind setup. Will be replaced with design system.
- `app/layout.tsx` — Default layout. Will be updated with fonts and metadata.
- No components directory exists yet.
- No `data/cards.ts`, `lib/draw.ts`, or `lib/slug.ts` exist yet.

---

## Verification Command

After each task, run this to catch TypeScript errors early:
```bash
cd "C:\Users\scott\Github Projects\Threat-Intel-Tarot\Threat-Intel-Tarot" && npx tsc --noEmit
```

---

## Task 1: Design System — globals.css + layout.tsx

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

**Step 1: Replace globals.css with the design system**

```css
/* app/globals.css */
@import "tailwindcss";

:root {
  --color-void: #0a0a0f;
  --color-arcane: #1a1a2e;
  --color-arcane-light: #16213e;
  --color-gold: #c9a84c;
  --color-gold-bright: #f0c040;
  --color-crimson: #8b0000;
  --color-silver: #c0c0c0;
  --color-mist: #e8e0f0;
  --color-teal: #2d6a6a;
  --color-purple: #4a1a6a;
  --color-ember: #8b3a0f;
}

@theme inline {
  --color-void: var(--color-void);
  --color-arcane: var(--color-arcane);
  --color-gold: var(--color-gold);
  --color-gold-bright: var(--color-gold-bright);
  --color-crimson: var(--color-crimson);
  --color-silver: var(--color-silver);
  --color-mist: var(--color-mist);
}

body {
  background: var(--color-void);
  color: var(--color-mist);
  font-family: 'EB Garamond', Georgia, serif;
}

/* Card flip 3D animation */
.card-scene {
  perspective: 1200px;
  cursor: pointer;
  width: 340px;
  height: 600px;
}

.card-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.75s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-wrapper.is-flipped {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  border-radius: 16px;
  overflow: hidden;
}

.card-face--front {
  transform: rotateY(180deg);
}

/* Gold shimmer on hover */
.card-scene:hover .card-wrapper:not(.is-flipped) {
  transform: rotateY(8deg) rotateX(-2deg);
}

/* Arcane border glow */
.arcane-border {
  border: 1px solid var(--color-gold);
  box-shadow:
    0 0 8px rgba(201, 168, 76, 0.2),
    inset 0 0 8px rgba(201, 168, 76, 0.05);
}

/* Risk star styling */
.risk-star-filled {
  color: var(--color-gold-bright);
}

.risk-star-empty {
  color: #333;
}
```

**Step 2: Update layout.tsx with Google Fonts and metadata**

```tsx
// app/layout.tsx
import type { Metadata } from "next";
import { Cinzel, EB_Garamond } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  weight: ["400", "600", "700"],
});

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-garamond",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Threat Intelligence Tarot",
  description:
    "Real threat intelligence. Impossible to scroll past. Draw a card to reveal an adversary profile drawn from MITRE ATT&CK.",
  openGraph: {
    title: "Threat Intelligence Tarot",
    description: "Real threat intelligence. Impossible to scroll past.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${cinzel.variable} ${ebGaramond.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
```

**Step 3: Verify no TypeScript errors**

```bash
npx tsc --noEmit
```

Expected: No errors.

**Step 4: Commit**

```bash
git add app/globals.css app/layout.tsx
git commit -m "feat: add design system CSS vars, card flip animation, and Google Fonts"
```

---

## Task 2: Card Data — 22 Major Arcana

**Files:**
- Create: `data/cards.ts`

**Step 1: Create data/cards.ts with all 22 Major Arcana**

```typescript
// data/cards.ts
import type { TarotCard } from "./types";

export const cards: TarotCard[] = [
  {
    id: "equation-group",
    slug: "equation-group-the-ghost",
    name: "Equation Group",
    aka: ["EQGRP", "Tilded Team"],
    cardTitle: "The Ghost",
    arcanum: "major",
    number: 0,
    origin: "USA (NSA-linked)",
    category: "nation-state",
    since: "Active since ~2001",
    motivation: ["Intelligence collection", "Cyber espionage", "Capability pre-positioning"],
    targets: ["Iran", "Russia", "China", "Middle East telecoms", "Nuclear facilities"],
    ttps: [
      { techniqueId: "T1542.001", name: "System Firmware", tactic: "Persistence" },
      { techniqueId: "T1014", name: "Rootkit", tactic: "Defense Evasion" },
      { techniqueId: "T1078", name: "Valid Accounts", tactic: "Persistence" },
      { techniqueId: "T1119", name: "Automated Collection", tactic: "Collection" },
    ],
    notableOps: [
      "Stuxnet (joint with Unit 8200, 2010)",
      "Flame malware (2012)",
      "DoubleFantasy / GrayFish implants",
      "HDD firmware persistence (2015)",
    ],
    flavor:
      "It was here before you named it. Its implants survive reformats, live in firmware, and wake on command from the void. The intelligence community does not confirm its existence. Neither does it deny.",
    reversedMeaning:
      "When The Ghost stumbles, it leaves traces in registry keys and firewall logs — the telltale signatures that gave Kaspersky researchers their finest decade.",
    defenses: [
      { control: "Supply chain verification for hardware firmware", framework: "NIST CSF: ID.SC" },
      { control: "Network segmentation for sensitive systems", framework: "CIS Control 12" },
      { control: "Threat intelligence program tracking nation-state TTPs", framework: "NIST CSF: DE.AE" },
      { control: "Air-gapping critical infrastructure", framework: "ICS-CERT guidance" },
    ],
    riskLevel: 5,
    mitreGroupId: "G0020",
  },
  {
    id: "apt28",
    slug: "apt28-fancy-bear",
    name: "APT28",
    aka: ["Fancy Bear", "STRONTIUM", "Sofacy", "Pawn Storm", "Sednit"],
    cardTitle: "The Phantom",
    arcanum: "major",
    number: 1,
    origin: "Russia (GRU Unit 26165)",
    category: "nation-state",
    since: "Active since ~2004",
    motivation: ["Espionage", "Political influence", "Disinformation"],
    targets: ["Government", "Defense", "Political organizations", "Media", "NATO countries"],
    ttps: [
      { techniqueId: "T1566.001", name: "Spearphishing Attachment", tactic: "Initial Access" },
      { techniqueId: "T1059.001", name: "PowerShell", tactic: "Execution" },
      { techniqueId: "T1078", name: "Valid Accounts", tactic: "Persistence" },
      { techniqueId: "T1003.001", name: "LSASS Memory Credential Dumping", tactic: "Credential Access" },
      { techniqueId: "T1566.002", name: "Spearphishing Link", tactic: "Initial Access" },
    ],
    notableOps: [
      "DNC hack and email leak (2016)",
      "Bundestag breach (2015)",
      "WADA doping agency hack (2016)",
      "French election interference (2017)",
      "Olympic Destroyer (2018)",
    ],
    flavor:
      "A phantom built for embarrassment as much as intelligence. It does not merely steal — it releases. The document dump, the timed leak, the hack-and-dump: these are its weapons of political theatre.",
    reversedMeaning:
      "Fancy Bear's operational security failures have been its undoing: the same Cyrillic keyboard registered the X-Agent compiler; the same VPN exited at the same IP. Attribution came from their own carelessness.",
    defenses: [
      { control: "Phishing-resistant MFA (FIDO2/hardware keys)", framework: "NIST SP 800-63B" },
      { control: "Email sandboxing and attachment filtering", framework: "CIS Control 9" },
      { control: "Credential Guard on Windows endpoints", framework: "CIS Control 5" },
      { control: "Network traffic monitoring for C2 beaconing", framework: "NIST CSF: DE.CM" },
    ],
    riskLevel: 5,
    mitreGroupId: "G0007",
  },
  {
    id: "apt29",
    slug: "apt29-cozy-bear",
    name: "APT29",
    aka: ["Cozy Bear", "The Dukes", "NOBELIUM", "Midnight Blizzard"],
    cardTitle: "The Shadow Court",
    arcanum: "major",
    number: 2,
    origin: "Russia (SVR)",
    category: "nation-state",
    since: "Active since ~2008",
    motivation: ["Long-term espionage", "Intelligence collection", "Supply chain access"],
    targets: ["Government", "Think tanks", "Healthcare", "Technology firms"],
    ttps: [
      { techniqueId: "T1195.002", name: "Compromise Software Supply Chain", tactic: "Initial Access" },
      { techniqueId: "T1566.002", name: "Spearphishing Link", tactic: "Initial Access" },
      { techniqueId: "T1053.005", name: "Scheduled Task", tactic: "Persistence" },
      { techniqueId: "T1550.001", name: "Application Access Token", tactic: "Lateral Movement" },
      { techniqueId: "T1078", name: "Valid Accounts", tactic: "Defense Evasion" },
    ],
    notableOps: [
      "SolarWinds SUNBURST (2020)",
      "DNC breach (2016, separate from APT28)",
      "COVID-19 vaccine research targeting (2020)",
      "Microsoft senior leadership email access (2024)",
    ],
    flavor:
      "It does not break down doors. It waits for you to open one, then slips through with your own key. Months pass. Years. By the time you find it, it has already read everything it needed.",
    reversedMeaning:
      "The Shadow Court's patience is also its vulnerability: long dwell times mean more opportunities for behavioral analytics to catch the anomaly. Its sophistication is detectable precisely because it behaves too perfectly.",
    defenses: [
      { control: "Software supply chain integrity verification (code signing, SBOMs)", framework: "NIST SSDF" },
      { control: "Conditional Access policies and OAuth app auditing", framework: "CIS Control 6" },
      { control: "User and Entity Behavior Analytics (UEBA)", framework: "NIST CSF: DE.AE" },
      { control: "Privileged access workstations for sensitive accounts", framework: "CIS Control 12" },
    ],
    riskLevel: 5,
    mitreGroupId: "G0016",
  },
  {
    id: "sandworm",
    slug: "sandworm-the-destroyer",
    name: "Sandworm",
    aka: ["Sandworm Team", "BlackEnergy Group", "Voodoo Bear", "IRIDIUM"],
    cardTitle: "The Destroyer",
    arcanum: "major",
    number: 3,
    origin: "Russia (GRU Unit 74455)",
    category: "nation-state",
    since: "Active since ~2009",
    motivation: ["Destruction", "Disruption", "Coercive signaling"],
    targets: ["Energy", "Critical infrastructure", "Government", "Media"],
    ttps: [
      { techniqueId: "T1561.001", name: "Disk Content Wipe", tactic: "Impact" },
      { techniqueId: "T1499", name: "Endpoint Denial of Service", tactic: "Impact" },
      { techniqueId: "T1059.005", name: "Visual Basic", tactic: "Execution" },
      { techniqueId: "T1078", name: "Valid Accounts", tactic: "Initial Access" },
      { techniqueId: "T1489", name: "Service Stop", tactic: "Impact" },
    ],
    notableOps: [
      "Ukraine power grid attacks (2015, 2016)",
      "NotPetya global wiper (2017, $10B+ damage)",
      "Olympic Destroyer (2018 Winter Olympics)",
      "Georgia election infrastructure (2019)",
    ],
    flavor:
      "It does not want your data. It wants your darkness. Sandworm is a weapon of punishment, sent to demonstrate that the lights can go out, the trains can stop, the hospitals can fall silent.",
    reversedMeaning:
      "NotPetya's indiscriminate spread was a strategic miscalculation — it hit Russian companies too, and the blast radius destroyed any plausible deniability Russia might have maintained.",
    defenses: [
      { control: "OT/ICS network segmentation and unidirectional gateways", framework: "IEC 62443" },
      { control: "Immutable offline backups with tested restoration procedures", framework: "CIS Control 11" },
      { control: "Industrial protocol monitoring (Modbus, DNP3 anomalies)", framework: "NIST CSF: DE.CM" },
      { control: "Emergency response playbooks for power/utility disruption", framework: "NIST SP 800-82" },
    ],
    riskLevel: 5,
    mitreGroupId: "G0034",
  },
  {
    id: "turla",
    slug: "turla-the-serpent",
    name: "Turla",
    aka: ["Snake", "Uroburos", "Waterbug", "Venomous Bear", "Krypton"],
    cardTitle: "The Serpent",
    arcanum: "major",
    number: 4,
    origin: "Russia (FSB)",
    category: "nation-state",
    since: "Active since ~1996",
    motivation: ["Long-term espionage", "Diplomatic intelligence", "Counter-intelligence"],
    targets: ["Government", "Military", "Embassies", "Defense contractors"],
    ttps: [
      { techniqueId: "T1090.004", name: "Domain Fronting", tactic: "Command and Control" },
      { techniqueId: "T1071.003", name: "Mail Protocols", tactic: "Command and Control" },
      { techniqueId: "T1560", name: "Archive Collected Data", tactic: "Collection" },
      { techniqueId: "T1014", name: "Rootkit", tactic: "Defense Evasion" },
      { techniqueId: "T1584.004", name: "Compromise Infrastructure: Server", tactic: "Resource Development" },
    ],
    notableOps: [
      "Moonlight Maze (1996–1999, attributed)",
      "Agent.BTZ (Pentagon USB worm, 2008)",
      "Carbon malware framework (ongoing)",
      "Hijacking Iranian APT34 infrastructure (2019)",
    ],
    flavor:
      "The oldest of the Russian intelligence snakes. It coils around your infrastructure for years, whispering intelligence through mail protocol tunnels, moving slowly so as never to disturb the air.",
    reversedMeaning:
      "Turla's longevity is also its exposure. Malware strains linked back to Moonlight Maze-era code have allowed researchers to trace its lineage across 25 years of operations.",
    defenses: [
      { control: "DNS monitoring and filtering for tunneling behaviors", framework: "CIS Control 9" },
      { control: "USB device control and removable media policies", framework: "CIS Control 10" },
      { control: "Email header analysis and C2 traffic inspection", framework: "NIST CSF: DE.CM" },
      { control: "Kernel integrity monitoring for rootkit detection", framework: "CIS Control 10" },
    ],
    riskLevel: 4,
    mitreGroupId: "G0010",
  },
  {
    id: "apt1",
    slug: "apt1-comment-crew",
    name: "APT1",
    aka: ["Comment Crew", "Comment Panda", "Shanghai Group", "Unit 61398"],
    cardTitle: "The Archivist",
    arcanum: "major",
    number: 5,
    origin: "China (PLA Unit 61398)",
    category: "nation-state",
    since: "Active since ~2006",
    motivation: ["Intellectual property theft", "Economic espionage", "Strategic intelligence"],
    targets: ["Aerospace", "Energy", "Telecommunications", "IT", "20 identified industries"],
    ttps: [
      { techniqueId: "T1071.001", name: "Web Protocols", tactic: "Command and Control" },
      { techniqueId: "T1005", name: "Data from Local System", tactic: "Collection" },
      { techniqueId: "T1566.001", name: "Spearphishing Attachment", tactic: "Initial Access" },
      { techniqueId: "T1083", name: "File and Directory Discovery", tactic: "Discovery" },
    ],
    notableOps: [
      "Mandiant APT1 report exposure (2013)",
      "Theft of F-35 design documents",
      "Dual-use technology exfiltration campaign",
      "Hundreds of terabytes stolen over years",
    ],
    flavor:
      "It does not want power. It wants knowledge — specifically, your knowledge. Blueprints, contracts, research data: The Archivist catalogs and carries everything across the Pacific for the benefit of state industry.",
    reversedMeaning:
      "The 2013 Mandiant report named APT1's operators by name, photographed their building, and published their real-person identities. Exposure forced a years-long operational pause.",
    defenses: [
      { control: "Data Loss Prevention (DLP) on egress channels", framework: "CIS Control 13" },
      { control: "Classification and tagging of sensitive IP", framework: "NIST CSF: PR.DS" },
      { control: "Outbound traffic inspection and proxy enforcement", framework: "CIS Control 9" },
      { control: "Insider threat and data exfiltration behavioral monitoring", framework: "NIST CSF: DE.CM" },
    ],
    riskLevel: 4,
    mitreGroupId: "G0006",
  },
  {
    id: "apt41",
    slug: "apt41-winnti",
    name: "APT41",
    aka: ["Winnti", "Double Dragon", "BARIUM", "Wicked Panda"],
    cardTitle: "The Ten Thousand",
    arcanum: "major",
    number: 6,
    origin: "China (MSS-affiliated)",
    category: "nation-state",
    since: "Active since ~2012",
    motivation: ["Espionage", "Financial gain", "Supply chain compromise"],
    targets: ["Healthcare", "Technology", "Gaming", "Telecommunications", "Governments"],
    ttps: [
      { techniqueId: "T1190", name: "Exploit Public-Facing Application", tactic: "Initial Access" },
      { techniqueId: "T1078", name: "Valid Accounts", tactic: "Persistence" },
      { techniqueId: "T1059.003", name: "Windows Command Shell", tactic: "Execution" },
      { techniqueId: "T1195.002", name: "Compromise Software Supply Chain", tactic: "Initial Access" },
      { techniqueId: "T1486", name: "Data Encrypted for Impact", tactic: "Impact" },
    ],
    notableOps: [
      "Asus Live Update supply chain attack (2019)",
      "Video game currency theft campaigns",
      "COVID-19 vaccine research targeting (2020)",
      "US state government systems compromise (2021)",
    ],
    flavor:
      "It wears two faces and hides neither. By day it serves the Ministry, filing intelligence on pharmaceutical research and government networks. By night it steals game currency and sells exploits. It operates at the intersection of patriotism and profit.",
    reversedMeaning:
      "APT41's indictment of five members by the US DOJ in 2020 revealed the group's real names, companies, and methods — a consequence of operating for personal profit while using state infrastructure.",
    defenses: [
      { control: "Software supply chain controls and build pipeline integrity", framework: "NIST SSDF" },
      { control: "Patch management program prioritizing public-facing systems", framework: "CIS Control 7" },
      { control: "Network segmentation isolating gaming/financial systems", framework: "CIS Control 12" },
      { control: "Threat intelligence monitoring for dual-use group activity", framework: "NIST CSF: ID.RA" },
    ],
    riskLevel: 5,
    mitreGroupId: "G0096",
  },
  {
    id: "volt-typhoon",
    slug: "volt-typhoon-the-silent-dragon",
    name: "Volt Typhoon",
    aka: ["BRONZE SILHOUETTE", "Vanguard Panda", "DEV-0391"],
    cardTitle: "The Silent Dragon",
    arcanum: "major",
    number: 7,
    origin: "China (PLA-linked)",
    category: "nation-state",
    since: "Active since ~2021",
    motivation: ["Pre-positioning for conflict", "Critical infrastructure disruption", "Espionage"],
    targets: ["Communications", "Energy", "Water", "Transportation", "US critical infrastructure"],
    ttps: [
      { techniqueId: "T1078", name: "Valid Accounts", tactic: "Defense Evasion" },
      { techniqueId: "T1133", name: "External Remote Services", tactic: "Initial Access" },
      { techniqueId: "T1090.002", name: "External Proxy", tactic: "Command and Control" },
      { techniqueId: "T1036", name: "Masquerading (LOLBins)", tactic: "Defense Evasion" },
      { techniqueId: "T1087", name: "Account Discovery", tactic: "Discovery" },
    ],
    notableOps: [
      "US critical infrastructure pre-positioning (2021–present)",
      "Guam military communications targeting",
      "Five Eyes joint advisory (2023)",
      "SOHO router botnet for traffic proxying",
    ],
    flavor:
      "It does not come to steal your secrets. It comes to be ready. Volt Typhoon burrows into power grids and water systems not to disrupt them now, but to hold the trigger for the moment it is needed.",
    reversedMeaning:
      "Living off the land means your presence is only as hidden as the baseline you're mimicking. In environments with strong behavioral baselines, Volt Typhoon's use of native tools becomes the anomaly.",
    defenses: [
      { control: "Behavioral baselining for LOLBin and admin tool usage", framework: "NIST CSF: DE.AE" },
      { control: "SOHO router firmware patching and replacement lifecycle", framework: "CIS Control 7" },
      { control: "Network flow analysis for unusual outbound connections", framework: "CIS Control 13" },
      { control: "Critical infrastructure asset inventory and exposure reduction", framework: "NIST CSF: ID.AM" },
    ],
    riskLevel: 5,
    mitreGroupId: "G1017",
  },
  {
    id: "lazarus-group",
    slug: "lazarus-group-the-specter",
    name: "Lazarus Group",
    aka: ["Hidden Cobra", "Zinc", "Guardians of Peace", "APT38 (financial ops)"],
    cardTitle: "The Specter",
    arcanum: "major",
    number: 8,
    origin: "North Korea (Reconnaissance General Bureau)",
    category: "nation-state",
    since: "Active since ~2009",
    motivation: ["Sanctions evasion", "Financial theft", "Espionage", "Retaliation"],
    targets: ["Financial institutions", "Cryptocurrency exchanges", "Defense", "Media"],
    ttps: [
      { techniqueId: "T1566.001", name: "Spearphishing Attachment", tactic: "Initial Access" },
      { techniqueId: "T1486", name: "Data Encrypted for Impact", tactic: "Impact" },
      { techniqueId: "T1204.002", name: "Malicious File", tactic: "Execution" },
      { techniqueId: "T1059.001", name: "PowerShell", tactic: "Execution" },
      { techniqueId: "T1105", name: "Ingress Tool Transfer", tactic: "Command and Control" },
    ],
    notableOps: [
      "Sony Pictures hack (2014)",
      "WannaCry ransomware (2017)",
      "Bangladesh Bank SWIFT heist ($81M, 2016)",
      "$625M Ronin Network crypto theft (2022)",
    ],
    flavor:
      "A ghost that needs money. It haunts financial networks and cryptocurrency protocols, not for intelligence, but for the hard currency a sanctioned nation cannot otherwise earn. It has stolen billions. It will steal billions more.",
    reversedMeaning:
      "WannaCry's killswitch — a single unregistered domain that a British researcher registered for £8 — halted one of history's most damaging cyberattacks. Lazarus Group's urgency became its undoing.",
    defenses: [
      { control: "SWIFT Customer Security Programme controls for financial institutions", framework: "SWIFT CSP" },
      { control: "Cryptocurrency transaction monitoring and wallet screening", framework: "FinCEN guidance" },
      { control: "Email attachment sandboxing and macro blocking", framework: "CIS Control 9" },
      { control: "Network segmentation isolating SWIFT / payment systems", framework: "CIS Control 12" },
    ],
    riskLevel: 5,
    mitreGroupId: "G0032",
  },
  {
    id: "apt38",
    slug: "apt38-the-alchemist",
    name: "APT38",
    aka: ["Bluenoroff", "TEMP.Hermit"],
    cardTitle: "The Alchemist",
    arcanum: "major",
    number: 9,
    origin: "North Korea (Reconnaissance General Bureau, financial unit)",
    category: "nation-state",
    since: "Active since ~2014",
    motivation: ["Currency generation", "Sanctions evasion", "Financial system manipulation"],
    targets: ["Banks", "SWIFT network participants", "Financial services globally"],
    ttps: [
      { techniqueId: "T1531", name: "Account Access Removal", tactic: "Impact" },
      { techniqueId: "T1485", name: "Data Destruction", tactic: "Impact" },
      { techniqueId: "T1071.001", name: "Web Protocols", tactic: "Command and Control" },
      { techniqueId: "T1565.001", name: "Stored Data Manipulation", tactic: "Impact" },
    ],
    notableOps: [
      "Bangladesh Bank $81M SWIFT heist (2016)",
      "Banco de Chile $10M theft (2018)",
      "Taiwan Far Eastern Bank targeting",
      "Multiple African and Asian bank intrusions",
    ],
    flavor:
      "It turns network packets into gold. APT38 is the finance department of a rogue state — patient, methodical, willing to spend months inside a bank network learning its SWIFT workflows before issuing fraudulent transfers and then burning the evidence on the way out.",
    reversedMeaning:
      "The Bangladesh Bank heist almost succeeded perfectly — but the fraudulent transfers were partially flagged by the Federal Reserve Bank of New York, and a typo in one transfer instruction ('fandation' vs 'foundation') triggered a review.",
    defenses: [
      { control: "SWIFT Customer Security Programme mandatory controls", framework: "SWIFT CSP" },
      { control: "Dual-control authorization for large wire transfers", framework: "FFIEC guidance" },
      { control: "Anomaly detection on SWIFT message patterns", framework: "NIST CSF: DE.AE" },
      { control: "Out-of-band verification for large or unusual transactions", framework: "FFIEC guidance" },
    ],
    riskLevel: 4,
    mitreGroupId: "G0082",
  },
  {
    id: "kimsuky",
    slug: "kimsuky-the-whisperer",
    name: "Kimsuky",
    aka: ["Thallium", "Black Banshee", "Velvet Chollima", "APT-C-55"],
    cardTitle: "The Whisperer",
    arcanum: "major",
    number: 10,
    origin: "North Korea (RGB)",
    category: "nation-state",
    since: "Active since ~2012",
    motivation: ["Intelligence collection", "Policy research", "Sanctions monitoring"],
    targets: ["Think tanks", "Academic researchers", "Journalists", "South Korean government", "Nuclear experts"],
    ttps: [
      { techniqueId: "T1566.001", name: "Spearphishing Attachment", tactic: "Initial Access" },
      { techniqueId: "T1056.001", name: "Keylogging", tactic: "Collection" },
      { techniqueId: "T1102", name: "Web Service", tactic: "Command and Control" },
      { techniqueId: "T1114.002", name: "Remote Email Collection", tactic: "Collection" },
    ],
    notableOps: [
      "Operation Smoke Screen (South Korean targets)",
      "COVID-19 vaccine researcher targeting",
      "Nuclear policy think tank access",
      "Operation Stolen Pencil (academic credential theft)",
    ],
    flavor:
      "It reads your emails about nuclear policy before you send the reply. It listens to your research conversations and reports to Pyongyang on what the outside world thinks of North Korea's next move. It is an ear pressed against the wall of every room that matters.",
    reversedMeaning:
      "Kimsuky's targeting is sometimes so narrow that victims can identify the operation simply by recognizing they received an email. Its precision is a double-edged sword — targeted actors are more likely to report it.",
    defenses: [
      { control: "Phishing awareness training with political and research themes", framework: "NIST CSF: PR.AT" },
      { control: "Google Workspace / M365 advanced threat protection", framework: "CIS Control 9" },
      { control: "Browser isolation for high-risk researcher workflows", framework: "CIS Control 9" },
      { control: "Endpoint keylogger detection and process monitoring", framework: "CIS Control 10" },
    ],
    riskLevel: 3,
    mitreGroupId: "G0094",
  },
  {
    id: "apt33",
    slug: "apt33-the-flame-keeper",
    name: "APT33",
    aka: ["Elfin", "Refined Kitten", "Magnallium", "HOLMIUM"],
    cardTitle: "The Flame Keeper",
    arcanum: "major",
    number: 11,
    origin: "Iran (IRGC-affiliated)",
    category: "nation-state",
    since: "Active since ~2013",
    motivation: ["Espionage", "Sabotage", "Destabilization"],
    targets: ["Aviation", "Energy", "Petrochemical", "Saudi Arabia", "US defense"],
    ttps: [
      { techniqueId: "T1566.001", name: "Spearphishing Attachment", tactic: "Initial Access" },
      { techniqueId: "T1059.001", name: "PowerShell", tactic: "Execution" },
      { techniqueId: "T1486", name: "Data Encrypted for Impact", tactic: "Impact" },
      { techniqueId: "T1204.002", name: "Malicious File", tactic: "Execution" },
    ],
    notableOps: [
      "Shamoon 2 campaign (linked, Saudi Aramco targeting)",
      "Aviation sector credential harvesting",
      "US defense contractor targeting",
      "Leafminer / Raspite malware deployment",
    ],
    flavor:
      "It was born of regional rivalry — a tool to burn what it cannot own. The Flame Keeper watches petrochemical plants and aviation systems with patient hostility, waiting for the instruction to ignite.",
    reversedMeaning:
      "APT33's use of commodity tools and publicly available malware complicates attribution — a double-edged sword. When investigators can't confirm the actor, the political pressure on Iran is reduced.",
    defenses: [
      { control: "OT/ICS monitoring for petrochemical and energy environments", framework: "IEC 62443" },
      { control: "Application whitelisting on industrial workstations", framework: "CIS Control 2" },
      { control: "Macro and script execution controls on endpoints", framework: "CIS Control 10" },
      { control: "Threat intelligence feeds covering Iranian TTPs", framework: "NIST CSF: ID.RA" },
    ],
    riskLevel: 4,
    mitreGroupId: "G0064",
  },
  {
    id: "apt34",
    slug: "apt34-oilrig",
    name: "APT34",
    aka: ["OilRig", "Helix Kitten", "Chrysene", "EUROPIUM"],
    cardTitle: "The Oracle",
    arcanum: "major",
    number: 12,
    origin: "Iran (Ministry of Intelligence)",
    category: "nation-state",
    since: "Active since ~2014",
    motivation: ["Regional espionage", "Intelligence on adversaries", "Government surveillance"],
    targets: ["Financial sector", "Government", "Energy", "Telecom (Middle East)"],
    ttps: [
      { techniqueId: "T1566.001", name: "Spearphishing Attachment", tactic: "Initial Access" },
      { techniqueId: "T1071.001", name: "Web Protocols", tactic: "Command and Control" },
      { techniqueId: "T1136.001", name: "Create Local Account", tactic: "Persistence" },
      { techniqueId: "T1572", name: "Protocol Tunneling", tactic: "Command and Control" },
      { techniqueId: "T1040", name: "Network Sniffing", tactic: "Credential Access" },
    ],
    notableOps: [
      "DNSpionage campaign (DNS hijacking, 2018)",
      "RDAT malware email C2 via Exchange",
      "Middle East government ministry targeting",
      "Leaked toolset published by Lab Dookhtegan (2019)",
    ],
    flavor:
      "It knows the DNS of your kingdom's gatekeepers. It reads the mail of ministers. The Oracle does not predict the future — it reads the present correspondence of everyone who might shape it, and reports accordingly.",
    reversedMeaning:
      "APT34's entire toolset was leaked by a hacktivist persona in 2019, exposing its malware, victims, and operators. The Oracle was read.",
    defenses: [
      { control: "DNS monitoring with anomaly detection for hijacking", framework: "CIS Control 9" },
      { control: "DNSSEC implementation for authoritative zones", framework: "NIST SP 800-81" },
      { control: "Email gateway controls and Exchange security hardening", framework: "CIS Control 9" },
      { control: "Multi-factor authentication on all remote access", framework: "NIST SP 800-63B" },
    ],
    riskLevel: 4,
    mitreGroupId: "G0049",
  },
  {
    id: "apt35",
    slug: "apt35-charming-kitten",
    name: "APT35",
    aka: ["Charming Kitten", "Phosphorus", "Mint Sandstorm", "Magic Hound"],
    cardTitle: "The Charmed One",
    arcanum: "major",
    number: 13,
    origin: "Iran (IRGC)",
    category: "nation-state",
    since: "Active since ~2014",
    motivation: ["Surveillance", "Espionage", "Targeting dissidents and journalists"],
    targets: ["Journalists", "Activists", "Academic researchers", "Nuclear negotiators", "Government officials"],
    ttps: [
      { techniqueId: "T1566.002", name: "Spearphishing Link", tactic: "Initial Access" },
      { techniqueId: "T1078", name: "Valid Accounts", tactic: "Defense Evasion" },
      { techniqueId: "T1056.001", name: "Keylogging", tactic: "Collection" },
      { techniqueId: "T1598.003", name: "Spearphishing Link (Reconnaissance)", tactic: "Reconnaissance" },
    ],
    notableOps: [
      "Targeting JCPOA nuclear deal negotiators",
      "COVID-19 vaccine research espionage",
      "Journalist and activist credential harvesting",
      "Fake interview social engineering campaign",
    ],
    flavor:
      "It charms. It sends friendly emails from plausible names. It schedules interviews that never happen. It builds rapport, earns trust, and then steals the credentials of everyone who believed in its warmth.",
    reversedMeaning:
      "Charming Kitten's social engineering requires direct human interaction — a vulnerability. Targets who report suspicious contact provide investigators with tradecraft details that erode its effectiveness over time.",
    defenses: [
      { control: "Journalist and researcher security training on social engineering", framework: "NIST CSF: PR.AT" },
      { control: "Hardware security keys for email and account access", framework: "NIST SP 800-63B" },
      { control: "Secure communication tools for sensitive sources (Signal)", framework: "EFF guidance" },
      { control: "Domain and email header verification practices", framework: "CIS Control 9" },
    ],
    riskLevel: 3,
    mitreGroupId: "G0059",
  },
  {
    id: "fin7",
    slug: "fin7-the-merchant",
    name: "FIN7",
    aka: ["Carbanak Group", "Carbon Spider", "ALPHV affiliate"],
    cardTitle: "The Merchant",
    arcanum: "major",
    number: 14,
    origin: "Criminal (Eastern Europe)",
    category: "criminal",
    since: "Active since ~2015",
    motivation: ["Financial theft", "Point-of-sale compromise", "Ransomware deployment"],
    targets: ["Restaurants", "Hospitality", "Retail", "Financial services"],
    ttps: [
      { techniqueId: "T1566.001", name: "Spearphishing Attachment", tactic: "Initial Access" },
      { techniqueId: "T1059.001", name: "PowerShell", tactic: "Execution" },
      { techniqueId: "T1071.001", name: "Web Protocols", tactic: "Command and Control" },
      { techniqueId: "T1056.001", name: "Input Capture", tactic: "Collection" },
      { techniqueId: "T1105", name: "Ingress Tool Transfer", tactic: "Command and Control" },
    ],
    notableOps: [
      "Applebee's, Arby's, Chipotle POS compromise",
      "Over $1B stolen from global businesses",
      "Fake security company 'Combi Security' as recruitment cover",
      "Carbanak malware campaigns against banks",
    ],
    flavor:
      "It wears a suit and carries a business card. FIN7 built a fake cybersecurity firm to hire penetration testers, then sent them to work against real targets. It is organized crime with a org chart and an HR department.",
    reversedMeaning:
      "FIN7's elaborate organizational structure became its weakness — three members were identified, arrested, and convicted, in part because of the operational paper trail that comes with running a fake company.",
    defenses: [
      { control: "Point-of-sale network isolation and P2PE encryption", framework: "PCI DSS" },
      { control: "Email filtering blocking macro-enabled documents", framework: "CIS Control 9" },
      { control: "Employee security awareness for restaurant/hospitality staff", framework: "NIST CSF: PR.AT" },
      { control: "Endpoint detection and response on POS terminals", framework: "CIS Control 10" },
    ],
    riskLevel: 4,
    mitreGroupId: "G0046",
  },
  {
    id: "revil",
    slug: "revil-sodinokibi-the-reaper",
    name: "REvil",
    aka: ["Sodinokibi", "GOLD SOUTHFIELD"],
    cardTitle: "The Reaper",
    arcanum: "major",
    number: 15,
    origin: "Criminal (Russia, CIS-based)",
    category: "criminal",
    since: "Active since ~2019",
    motivation: ["Ransomware extortion", "Double extortion", "Affiliate revenue"],
    targets: ["MSPs", "Law firms", "Food and agriculture", "Technology"],
    ttps: [
      { techniqueId: "T1486", name: "Data Encrypted for Impact", tactic: "Impact" },
      { techniqueId: "T1190", name: "Exploit Public-Facing Application", tactic: "Initial Access" },
      { techniqueId: "T1078", name: "Valid Accounts", tactic: "Persistence" },
      { techniqueId: "T1048", name: "Exfiltration Over Alternative Protocol", tactic: "Exfiltration" },
    ],
    notableOps: [
      "Kaseya VSA supply chain attack (1,500+ companies, 2021)",
      "JBS Foods $11M ransom (2021)",
      "$70M ransom demand (largest at the time)",
      "Law firm Grubman Shire data leak threat",
    ],
    flavor:
      "It sweeps through managed service providers like a scythe through wheat — one compromise, a thousand victims. The Reaper is not interested in your data. It is interested in what your data is worth to you when it is gone.",
    reversedMeaning:
      "After the Colonial Pipeline political fallout, the US government engaged with Russia directly. REvil's servers were taken down from within, allegedly by allied cyber operations — suggesting nation-state enablers can become nation-state targets.",
    defenses: [
      { control: "MSP supply chain risk management and vendor vetting", framework: "NIST SP 800-161" },
      { control: "Immutable offline backups with 3-2-1 architecture", framework: "CIS Control 11" },
      { control: "RDP hardening and external exposure elimination", framework: "CIS Control 12" },
      { control: "Ransomware-specific incident response playbooks", framework: "NIST CSF: RC.RP" },
    ],
    riskLevel: 5,
    mitreGroupId: "G0115",
  },
  {
    id: "lockbit",
    slug: "lockbit-the-locked-tower",
    name: "LockBit",
    aka: ["LockBit 3.0", "LockBit Black", "ABCD ransomware (early)"],
    cardTitle: "The Locked Tower",
    arcanum: "major",
    number: 16,
    origin: "Criminal (Russia-linked, global affiliates)",
    category: "criminal",
    since: "Active since ~2019",
    motivation: ["Ransomware extortion", "Affiliate revenue maximization", "Double/triple extortion"],
    targets: ["Manufacturing", "Professional services", "Healthcare", "Government"],
    ttps: [
      { techniqueId: "T1486", name: "Data Encrypted for Impact", tactic: "Impact" },
      { techniqueId: "T1078", name: "Valid Accounts", tactic: "Initial Access" },
      { techniqueId: "T1021.001", name: "Remote Desktop Protocol", tactic: "Lateral Movement" },
      { techniqueId: "T1562.001", name: "Disable or Modify Tools", tactic: "Defense Evasion" },
    ],
    notableOps: [
      "Most prolific ransomware group 2022–2024",
      "Royal Mail UK attack (2023)",
      "Boeing data leak (2023)",
      "Operation Cronos law enforcement takedown (2024)",
    ],
    flavor:
      "The most professional ransomware operation ever built: a dark web affiliate portal, a customer service desk, bug bounties for its own malware. The Locked Tower ran ransomware-as-a-business with KPIs and contractor relationships.",
    reversedMeaning:
      "Operation Cronos in 2024 seized LockBit's infrastructure, published its affiliate list, and posted the gang leader's photo on their own dark web site. The Tower fell — but the affiliates scattered to rebuild elsewhere.",
    defenses: [
      { control: "MFA on all remote access including RDP and VPN", framework: "CIS Control 6" },
      { control: "EDR with ransomware behavioral detection", framework: "CIS Control 10" },
      { control: "Privileged access management limiting lateral movement", framework: "CIS Control 5" },
      { control: "Network segmentation to limit ransomware blast radius", framework: "CIS Control 12" },
    ],
    riskLevel: 5,
    mitreGroupId: "G0114",
  },
  {
    id: "conti",
    slug: "conti-wizard-spider-the-plague",
    name: "Conti",
    aka: ["Wizard Spider", "GOLD ULRICK", "TrickBot Group"],
    cardTitle: "The Plague",
    arcanum: "major",
    number: 17,
    origin: "Criminal (Russia, St. Petersburg-linked)",
    category: "criminal",
    since: "Active since ~2020",
    motivation: ["Ransomware extortion", "Data theft", "Disruption"],
    targets: ["Healthcare", "Government", "Critical infrastructure", "Schools"],
    ttps: [
      { techniqueId: "T1486", name: "Data Encrypted for Impact", tactic: "Impact" },
      { techniqueId: "T1078", name: "Valid Accounts", tactic: "Persistence" },
      { techniqueId: "T1059.003", name: "Windows Command Shell", tactic: "Execution" },
      { techniqueId: "T1021.002", name: "SMB/Windows Admin Shares", tactic: "Lateral Movement" },
      { techniqueId: "T1003.001", name: "LSASS Memory", tactic: "Credential Access" },
    ],
    notableOps: [
      "Ireland Health Service Executive (HSE) attack — shutdown national healthcare",
      "Costa Rica government ($20M demanded, national emergency declared)",
      "Internal chat logs leaked by Ukrainian researcher (2022)",
      "400+ healthcare attacks during COVID-19",
    ],
    flavor:
      "It spread through hospital networks while patients were wheeled into corridors. The Plague does not distinguish between a defense contractor and an ICU — everything encrypts the same. Its leaked chat logs revealed an organization of 100+ people with department heads and vacation policies.",
    reversedMeaning:
      "When Conti publicly sided with Russia after the Ukraine invasion, a Ukrainian security researcher leaked two years of internal chat logs — exposing everything from the group's internal disputes to its cryptocurrency wallets.",
    defenses: [
      { control: "Healthcare-specific ransomware response plans (HHS 405(d))", framework: "HHS 405(d)" },
      { control: "SMB signing enforcement to block lateral movement", framework: "CIS Control 12" },
      { control: "LSASS protection (Credential Guard, PPL)", framework: "CIS Control 5" },
      { control: "Network segmentation isolating clinical systems", framework: "NIST CSF: PR.AC" },
    ],
    riskLevel: 5,
    mitreGroupId: "G0092",
  },
  {
    id: "scattered-spider",
    slug: "scattered-spider-the-shape-shifter",
    name: "Scattered Spider",
    aka: ["UNC3944", "Muddled Libra", "Octo Tempest", "0ktapus"],
    cardTitle: "The Shape Shifter",
    arcanum: "major",
    number: 18,
    origin: "Criminal (Anglophone, primarily US/UK teens)",
    category: "criminal",
    since: "Active since ~2022",
    motivation: ["Financial theft", "SIM swapping", "Ransomware deployment", "Social clout"],
    targets: ["BPO firms", "Telecom", "Hospitality", "Gaming", "Identity providers"],
    ttps: [
      { techniqueId: "T1621", name: "Multi-Factor Authentication Request Generation", tactic: "Credential Access" },
      { techniqueId: "T1566.004", name: "Spearphishing Voice (Vishing)", tactic: "Initial Access" },
      { techniqueId: "T1078", name: "Valid Accounts", tactic: "Defense Evasion" },
      { techniqueId: "T1539", name: "Steal Web Session Cookie", tactic: "Credential Access" },
      { techniqueId: "T1534", name: "Internal Spearphishing", tactic: "Lateral Movement" },
    ],
    notableOps: [
      "MGM Resorts attack — $100M+ impact, 10-minute social engineering call",
      "Caesars Palace $15M ransom paid",
      "Twilio and Cloudflare phishing campaign (2022)",
      "0ktapus campaign — 130+ companies via Okta credential phishing",
    ],
    flavor:
      "It picks up the phone, says it's from IT, and asks your help desk to reset the CEO's MFA. It speaks your company's internal language because it researched your org chart on LinkedIn first. It does not look like a threat actor. It sounds like a colleague.",
    reversedMeaning:
      "Scattered Spider's reliance on vishing and social engineering means that a well-trained, skeptical help desk is its most powerful counter. Its members — many teenagers — have been identified and arrested through standard law enforcement channels.",
    defenses: [
      { control: "Phishing-resistant MFA (FIDO2) eliminating OTP/push", framework: "NIST SP 800-63B" },
      { control: "Strict help desk identity verification protocols for account changes", framework: "CIS Control 6" },
      { control: "SIM swap protections with carrier accounts", framework: "FCC guidance" },
      { control: "Privileged action approval workflows with out-of-band verification", framework: "CIS Control 5" },
    ],
    riskLevel: 4,
    mitreGroupId: "G1015",
  },
  {
    id: "blackcat-alphv",
    slug: "blackcat-alphv-the-void",
    name: "BlackCat / ALPHV",
    aka: ["ALPHV", "Noberus", "GOLD BLAZER"],
    cardTitle: "The Void",
    arcanum: "major",
    number: 19,
    origin: "Criminal (Russia-linked, RaaS)",
    category: "criminal",
    since: "Active since ~2021",
    motivation: ["Ransomware extortion", "Data extortion", "Triple extortion"],
    targets: ["Healthcare", "Energy", "Government", "Critical infrastructure"],
    ttps: [
      { techniqueId: "T1486", name: "Data Encrypted for Impact", tactic: "Impact" },
      { techniqueId: "T1190", name: "Exploit Public-Facing Application", tactic: "Initial Access" },
      { techniqueId: "T1078", name: "Valid Accounts", tactic: "Persistence" },
      { techniqueId: "T1567.002", name: "Exfiltration to Cloud Storage", tactic: "Exfiltration" },
    ],
    notableOps: [
      "Change Healthcare attack — disrupted US pharmacy systems nationwide (2024)",
      "MGM Resorts (in partnership with Scattered Spider)",
      "Written in Rust — cross-platform, Windows and Linux/ESXi variants",
      "Largest healthcare ransom payment: $22M",
    ],
    flavor:
      "Built in Rust, it encrypts Windows, Linux, and ESXi hosts with equal indifference. The Void is not personal — it is systematic. It chose Change Healthcare because Change Healthcare was everywhere, and when it encrypted, a third of US pharmacies went dark.",
    reversedMeaning:
      "BlackCat collapsed after the $22M Change Healthcare ransom payment, when its operators allegedly exit-scammed their own affiliates — keeping the payment and shutting down the infrastructure, destroying trust in the brand permanently.",
    defenses: [
      { control: "VMware ESXi and hypervisor hardening and patching", framework: "CIS VMware Benchmark" },
      { control: "Healthcare data segmentation and minimum-necessary access", framework: "HIPAA Security Rule" },
      { control: "Vulnerability management prioritizing internet-facing systems", framework: "CIS Control 7" },
      { control: "Cyber insurance and tested incident response retainer", framework: "NIST CSF: RC" },
    ],
    riskLevel: 5,
    mitreGroupId: "G1006",
  },
  {
    id: "anonymous",
    slug: "anonymous-the-thousand-masks",
    name: "Anonymous",
    aka: ["Anon", "AnonOps", "Various splinter cells"],
    cardTitle: "The Thousand Masks",
    arcanum: "major",
    number: 20,
    origin: "Hacktivist (decentralized, global)",
    category: "hacktivist",
    since: "Active since ~2003",
    motivation: ["Political protest", "Anti-censorship", "Corporate accountability", "Lulz"],
    targets: ["Governments", "Corporations", "Law enforcement", "Controversial organizations"],
    ttps: [
      { techniqueId: "T1498.001", name: "Direct Network Flood", tactic: "Impact" },
      { techniqueId: "T1190", name: "Exploit Public-Facing Application", tactic: "Initial Access" },
      { techniqueId: "T1530", name: "Data from Cloud Storage", tactic: "Collection" },
      { techniqueId: "T1491.002", name: "External Defacement", tactic: "Impact" },
    ],
    notableOps: [
      "Operation Payback (RIAA/MPAA DDoS, 2010)",
      "HBGary Federal breach and email release (2011)",
      "Arab Spring support operations",
      "OpISIS following Paris attacks (2015)",
      "Russia leaks following Ukraine invasion (2022)",
    ],
    flavor:
      "It is not an organization. It has no leader, no members, no headquarters. It is a decision — made independently, simultaneously, by thousands of people wearing the same mask. When it chooses a target, the target knows. Everyone knows.",
    reversedMeaning:
      "The lack of central coordination is Anonymous's tactical weakness. Operations are uneven, sometimes counterproductive, and frequently claimed by unaffiliated actors. The mask is available to anyone, including those with poor judgment.",
    defenses: [
      { control: "DDoS mitigation service (Cloudflare, Akamai)", framework: "NIST CSF: PR.DS" },
      { control: "Web application firewall for public-facing sites", framework: "CIS Control 13" },
      { control: "Incident response plan for reputational and data leak events", framework: "NIST CSF: RS.CO" },
      { control: "Cloud storage access controls and public bucket auditing", framework: "CIS Control 13" },
    ],
    riskLevel: 2,
    mitreGroupId: undefined,
  },
  {
    id: "killnet",
    slug: "killnet-the-storm",
    name: "KillNet",
    aka: ["KillMilk (leader alias)", "sub-groups: Legion, Zarya, Infinity"],
    cardTitle: "The Storm",
    arcanum: "major",
    number: 21,
    origin: "Russia (pro-Kremlin hacktivist)",
    category: "hacktivist",
    since: "Active since ~2022",
    motivation: ["Political disruption", "Pro-Russia propaganda", "Anti-NATO signaling"],
    targets: ["NATO member governments", "Healthcare", "Airports", "Financial services", "Media"],
    ttps: [
      { techniqueId: "T1498.001", name: "Direct Network Flood", tactic: "Impact" },
      { techniqueId: "T1499.002", name: "Service Exhaustion Flood", tactic: "Impact" },
      { techniqueId: "T1491.002", name: "External Defacement", tactic: "Impact" },
    ],
    notableOps: [
      "Romanian and Lithuanian government DDoS (2022)",
      "US airport websites DDoS (2022)",
      "Attack on European healthcare following Ukraine support",
      "US Treasury and congressional websites targeting (2023)",
    ],
    flavor:
      "It is loud and it wants you to know it. KillNet does not steal data — it makes noise. The DDoS is the message. The communique on Telegram is the message. The Storm is geopolitical signaling wrapped in network packets.",
    reversedMeaning:
      "KillNet's operations are largely nuisance-level — short-duration DDoS attacks that rarely cause lasting damage. Its strategic value to Russia is in narrative, not effect. When compared to Sandworm's actual capabilities, KillNet is theater.",
    defenses: [
      { control: "DDoS mitigation service with scrubbing capacity", framework: "NIST CSF: PR.DS" },
      { control: "Rate limiting and traffic shaping on web properties", framework: "CIS Control 13" },
      { control: "Anycast network diffusion for DNS and web services", framework: "NIST CSF: PR.DS" },
      { control: "Monitoring and alerting for volumetric traffic anomalies", framework: "NIST CSF: DE.CM" },
    ],
    riskLevel: 2,
    mitreGroupId: undefined,
  },
];

export const getCardBySlug = (slug: string): TarotCard | undefined =>
  cards.find((c) => c.slug === slug);

export const drawRandomCard = (): TarotCard =>
  cards[Math.floor(Math.random() * cards.length)];
```

**Step 2: Verify types compile**

```bash
npx tsc --noEmit
```

Expected: No errors.

**Step 3: Commit**

```bash
git add data/cards.ts
git commit -m "feat: add 22 Major Arcana card dataset with full MITRE ATT&CK data"
```

---

## Task 3: Utility Libraries

**Files:**
- Create: `lib/draw.ts`
- Create: `lib/slug.ts`

**Step 1: Create lib/draw.ts**

```typescript
// lib/draw.ts
import { cards } from "@/data/cards";
import type { TarotCard } from "@/data/types";

export function drawRandom(): TarotCard {
  return cards[Math.floor(Math.random() * cards.length)];
}

export function drawDaily(): TarotCard {
  const today = new Date();
  const seed =
    today.getFullYear() * 10000 +
    (today.getMonth() + 1) * 100 +
    today.getDate();
  return cards[seed % cards.length];
}
```

**Step 2: Create lib/slug.ts**

```typescript
// lib/slug.ts
import { cards } from "@/data/cards";
import type { TarotCard } from "@/data/types";

export function getCardBySlug(slug: string): TarotCard | undefined {
  return cards.find((c) => c.slug === slug);
}

export function getAllSlugs(): string[] {
  return cards.map((c) => c.slug);
}
```

**Step 3: Verify**

```bash
npx tsc --noEmit
```

**Step 4: Commit**

```bash
git add lib/draw.ts lib/slug.ts
git commit -m "feat: add draw and slug utility libraries"
```

---

## Task 4: CardBack Component

**Files:**
- Create: `components/CardBack.tsx`

**Step 1: Create CardBack.tsx**

This is the face-down card design — dark arcane aesthetic with geometric SVG sigil.

```tsx
// components/CardBack.tsx
export function CardBack() {
  return (
    <div
      className="w-full h-full flex items-center justify-center relative"
      style={{ background: "var(--color-arcane)" }}
    >
      {/* Outer gold border */}
      <div className="absolute inset-2 rounded-xl border border-yellow-600/60" />
      <div className="absolute inset-3 rounded-xl border border-yellow-600/30" />

      {/* Central sigil */}
      <svg
        viewBox="0 0 200 200"
        className="w-48 h-48 opacity-70"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer circle */}
        <circle cx="100" cy="100" r="90" fill="none" stroke="#c9a84c" strokeWidth="1" opacity="0.6" />
        {/* Inner circle */}
        <circle cx="100" cy="100" r="65" fill="none" stroke="#c9a84c" strokeWidth="0.5" opacity="0.4" />
        {/* Pentagram */}
        <polygon
          points="100,15 120,75 185,75 132,112 152,172 100,135 48,172 68,112 15,75 80,75"
          fill="none"
          stroke="#c9a84c"
          strokeWidth="0.8"
          opacity="0.5"
        />
        {/* Center eye */}
        <ellipse cx="100" cy="100" rx="18" ry="11" fill="none" stroke="#c9a84c" strokeWidth="1" opacity="0.8" />
        <circle cx="100" cy="100" r="5" fill="#c9a84c" opacity="0.6" />
        {/* Corner glyphs */}
        <text x="20" y="30" fill="#c9a84c" fontSize="10" opacity="0.5" fontFamily="serif">✦</text>
        <text x="168" y="30" fill="#c9a84c" fontSize="10" opacity="0.5" fontFamily="serif">✦</text>
        <text x="20" y="182" fill="#c9a84c" fontSize="10" opacity="0.5" fontFamily="serif">✦</text>
        <text x="168" y="182" fill="#c9a84c" fontSize="10" opacity="0.5" fontFamily="serif">✦</text>
      </svg>

      {/* Bottom text */}
      <div
        className="absolute bottom-6 text-center tracking-widest text-xs uppercase"
        style={{ color: "var(--color-gold)", fontFamily: "var(--font-cinzel), serif", opacity: 0.7 }}
      >
        Threat Intelligence Tarot
      </div>
    </div>
  );
}
```

**Step 2: Verify**

```bash
npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add components/CardBack.tsx
git commit -m "feat: add CardBack component with arcane sigil design"
```

---

## Task 5: TTPBadge and DefenseList Components

**Files:**
- Create: `components/TTPBadge.tsx`
- Create: `components/DefenseList.tsx`

**Step 1: Create TTPBadge.tsx**

```tsx
// components/TTPBadge.tsx
import type { TTP } from "@/data/types";

export function TTPBadge({ ttp }: { ttp: TTP }) {
  return (
    <div className="flex items-start gap-2 py-1">
      <span
        className="shrink-0 text-xs font-mono px-1.5 py-0.5 rounded mt-0.5"
        style={{
          background: "rgba(201,168,76,0.15)",
          color: "var(--color-gold-bright)",
          border: "1px solid rgba(201,168,76,0.3)",
        }}
      >
        {ttp.techniqueId}
      </span>
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

**Step 2: Create DefenseList.tsx**

```tsx
// components/DefenseList.tsx
import type { Defense } from "@/data/types";

export function DefenseList({ defenses }: { defenses: Defense[] }) {
  return (
    <ul className="space-y-2">
      {defenses.map((d, i) => (
        <li key={i} className="flex items-start gap-2">
          <span style={{ color: "var(--color-gold)", marginTop: "2px" }} className="shrink-0 text-sm">
            ▸
          </span>
          <div>
            <div className="text-sm" style={{ color: "var(--color-mist)" }}>
              {d.control}
            </div>
            {d.framework && (
              <div className="text-xs mt-0.5" style={{ color: "var(--color-silver)", opacity: 0.6 }}>
                {d.framework}
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
```

**Step 3: Verify**

```bash
npx tsc --noEmit
```

**Step 4: Commit**

```bash
git add components/TTPBadge.tsx components/DefenseList.tsx
git commit -m "feat: add TTPBadge and DefenseList components"
```

---

## Task 6: CardFront Component

**Files:**
- Create: `components/CardFront.tsx`

**Step 1: Create CardFront.tsx**

This renders all the adversary data on the face-up card. Note the category-to-color mapping for the accent border.

```tsx
// components/CardFront.tsx
import type { TarotCard } from "@/data/types";
import { TTPBadge } from "./TTPBadge";
import { DefenseList } from "./DefenseList";

const categoryColor: Record<string, string> = {
  "nation-state": "var(--color-teal)",
  criminal: "var(--color-purple)",
  hacktivist: "var(--color-ember)",
  unknown: "var(--color-silver)",
};

const riskStars = (level: number) =>
  Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={i < level ? "risk-star-filled" : "risk-star-empty"}>
      ★
    </span>
  ));

export function CardFront({ card }: { card: TarotCard }) {
  const accent = categoryColor[card.category];

  return (
    <div
      className="w-full h-full overflow-y-auto text-left"
      style={{
        background: "var(--color-arcane)",
        borderTop: `4px solid ${accent}`,
        fontFamily: "var(--font-garamond), Georgia, serif",
      }}
    >
      {/* Header bar */}
      <div
        className="px-4 pt-4 pb-3 flex items-center justify-between border-b"
        style={{ borderColor: "rgba(201,168,76,0.2)" }}
      >
        <div>
          <div
            className="text-xs uppercase tracking-widest mb-0.5"
            style={{ color: "var(--color-gold)", fontFamily: "var(--font-cinzel), serif", opacity: 0.8 }}
          >
            {card.arcanum === "major" ? `Major Arcana · ${card.number}` : `${card.suit} · ${card.number}`}
          </div>
          <div className="text-xs" style={{ color: "var(--color-silver)" }}>
            {card.origin}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm" style={{ color: "var(--color-gold)" }}>
            {riskStars(card.riskLevel)}
          </div>
          <div className="text-xs mt-0.5" style={{ color: "var(--color-silver)", opacity: 0.6 }}>
            risk level {card.riskLevel}/5
          </div>
        </div>
      </div>

      {/* Card title + name */}
      <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(201,168,76,0.2)" }}>
        <div
          className="text-lg font-semibold leading-tight"
          style={{ color: "var(--color-gold-bright)", fontFamily: "var(--font-cinzel), serif" }}
        >
          ✦ {card.cardTitle} ✦
        </div>
        <div className="mt-1 text-sm font-semibold" style={{ color: "var(--color-mist)" }}>
          {card.name}
        </div>
        {card.aka.length > 0 && (
          <div className="text-xs mt-0.5" style={{ color: "var(--color-silver)", opacity: 0.7 }}>
            {card.aka.join(" · ")}
          </div>
        )}
      </div>

      {/* Targets + Since */}
      <div className="px-4 py-2 border-b" style={{ borderColor: "rgba(201,168,76,0.2)" }}>
        <div className="flex flex-wrap gap-1 mb-1">
          {card.targets.map((t) => (
            <span
              key={t}
              className="text-xs px-1.5 py-0.5 rounded"
              style={{ background: `${accent}22`, color: "var(--color-silver)", border: `1px solid ${accent}44` }}
            >
              {t}
            </span>
          ))}
        </div>
        <div className="text-xs mt-1" style={{ color: "var(--color-silver)", opacity: 0.6 }}>
          {card.since} · {card.motivation.join(", ")}
        </div>
      </div>

      {/* Flavor text */}
      <div className="px-4 py-3 border-b italic text-sm leading-relaxed" style={{ color: "var(--color-mist)", borderColor: "rgba(201,168,76,0.2)" }}>
        {card.flavor}
      </div>

      {/* TTPs */}
      <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(201,168,76,0.2)" }}>
        <div
          className="text-xs uppercase tracking-widest mb-2"
          style={{ color: "var(--color-gold)", fontFamily: "var(--font-cinzel), serif" }}
        >
          Tactics & Techniques
        </div>
        <div className="space-y-0.5">
          {card.ttps.map((ttp) => (
            <TTPBadge key={ttp.techniqueId} ttp={ttp} />
          ))}
        </div>
      </div>

      {/* Notable Ops */}
      <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(201,168,76,0.2)" }}>
        <div
          className="text-xs uppercase tracking-widest mb-2"
          style={{ color: "var(--color-gold)", fontFamily: "var(--font-cinzel), serif" }}
        >
          Notable Operations
        </div>
        <ul className="space-y-1">
          {card.notableOps.map((op) => (
            <li key={op} className="text-sm flex gap-2" style={{ color: "var(--color-mist)" }}>
              <span style={{ color: "var(--color-crimson)" }}>◆</span> {op}
            </li>
          ))}
        </ul>
      </div>

      {/* Defenses */}
      <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(201,168,76,0.2)" }}>
        <div
          className="text-xs uppercase tracking-widest mb-2"
          style={{ color: "var(--color-gold)", fontFamily: "var(--font-cinzel), serif" }}
        >
          Defenses
        </div>
        <DefenseList defenses={card.defenses} />
      </div>

      {/* Reversed meaning */}
      <div className="px-4 py-3">
        <div
          className="text-xs uppercase tracking-widest mb-2"
          style={{ color: "var(--color-silver)", fontFamily: "var(--font-cinzel), serif", opacity: 0.6 }}
        >
          Reversed — Their Weakness
        </div>
        <div className="text-sm italic leading-relaxed" style={{ color: "var(--color-silver)", opacity: 0.8 }}>
          {card.reversedMeaning}
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Verify**

```bash
npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add components/CardFront.tsx
git commit -m "feat: add CardFront component with full adversary profile layout"
```

---

## Task 7: TarotCard Component (3D Flip)

**Files:**
- Create: `components/TarotCard.tsx`

**Step 1: Create TarotCard.tsx**

This is a Client Component because it uses `useState` for the flip. It wraps CardBack and CardFront in the CSS 3D flip mechanism defined in globals.css.

```tsx
// components/TarotCard.tsx
"use client";

import { useState } from "react";
import type { TarotCard as TarotCardType } from "@/data/types";
import { CardBack } from "./CardBack";
import { CardFront } from "./CardFront";

export function TarotCard({ card, startFlipped = false }: { card: TarotCardType; startFlipped?: boolean }) {
  const [flipped, setFlipped] = useState(startFlipped);

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="card-scene arcane-border"
        onClick={() => setFlipped((f) => !f)}
        role="button"
        aria-label={flipped ? `${card.name} — click to flip back` : "Click to reveal card"}
        style={{ borderRadius: "16px" }}
      >
        <div className={`card-wrapper ${flipped ? "is-flipped" : ""}`}>
          <div className="card-face card-face--back">
            <CardBack />
          </div>
          <div className="card-face card-face--front">
            <CardFront card={card} />
          </div>
        </div>
      </div>
      {!flipped && (
        <p
          className="text-xs uppercase tracking-widest animate-pulse"
          style={{ color: "var(--color-gold)", opacity: 0.7, fontFamily: "var(--font-cinzel), serif" }}
        >
          Click to reveal
        </p>
      )}
    </div>
  );
}
```

**Step 2: Verify**

```bash
npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add components/TarotCard.tsx
git commit -m "feat: add TarotCard component with CSS 3D flip animation"
```

---

## Task 8: DrawButton Component

**Files:**
- Create: `components/DrawButton.tsx`

**Step 1: Create DrawButton.tsx**

```tsx
// components/DrawButton.tsx
export function DrawButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="group relative px-8 py-3 text-sm uppercase tracking-widest transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        fontFamily: "var(--font-cinzel), serif",
        color: "var(--color-gold)",
        border: "1px solid var(--color-gold)",
        background: "transparent",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "rgba(201,168,76,0.1)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
      }}
    >
      ✦ Draw a Card ✦
    </button>
  );
}
```

**Step 2: Verify**

```bash
npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add components/DrawButton.tsx
git commit -m "feat: add DrawButton component"
```

---

## Task 9: Home Page

**Files:**
- Modify: `app/page.tsx`

**Step 1: Read the current page.tsx first**

The current file is default Next.js boilerplate. We will replace it entirely.

**Step 2: Replace app/page.tsx**

```tsx
// app/page.tsx
"use client";

import { useState } from "react";
import { drawRandom } from "@/lib/draw";
import { TarotCard } from "@/components/TarotCard";
import { DrawButton } from "@/components/DrawButton";
import type { TarotCard as TarotCardType } from "@/data/types";

export default function Home() {
  const [card, setCard] = useState<TarotCardType | null>(null);
  const [key, setKey] = useState(0); // force remount to reset flip state on redraw

  const handleDraw = () => {
    setCard(drawRandom());
    setKey((k) => k + 1);
  };

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-start py-16 px-4"
      style={{ background: "var(--color-void)" }}
    >
      {/* Header */}
      <div className="text-center mb-12">
        <h1
          className="text-3xl sm:text-4xl font-semibold mb-3"
          style={{ color: "var(--color-gold-bright)", fontFamily: "var(--font-cinzel), serif" }}
        >
          Threat Intelligence Tarot
        </h1>
        <p className="text-sm sm:text-base" style={{ color: "var(--color-silver)" }}>
          Real threat intelligence. Impossible to scroll past.
        </p>
        <div
          className="mt-3 w-24 h-px mx-auto"
          style={{ background: "linear-gradient(90deg, transparent, var(--color-gold), transparent)" }}
        />
      </div>

      {/* Draw button */}
      <DrawButton onClick={handleDraw} />

      {/* Card */}
      {card && (
        <div className="mt-10" key={key}>
          <TarotCard card={card} />
        </div>
      )}

      {/* Hint before first draw */}
      {!card && (
        <div
          className="mt-16 text-center text-sm italic"
          style={{ color: "var(--color-silver)", opacity: 0.5 }}
        >
          The cards await. Draw to reveal your adversary.
        </div>
      )}

      {/* Footer */}
      <div
        className="mt-auto pt-16 text-xs text-center"
        style={{ color: "var(--color-silver)", opacity: 0.35 }}
      >
        Data sourced from MITRE ATT&CK. For educational purposes.
      </div>
    </main>
  );
}
```

**Step 3: Verify**

```bash
npx tsc --noEmit
```

**Step 4: Start dev server and visually confirm**

```bash
npm run dev
```

Open `http://localhost:3000`. You should see:
- Dark background (`--color-void`)
- Gold title "Threat Intelligence Tarot"
- "Draw a Card" button
- Clicking the button draws a random card face-down
- Clicking the card flips it to reveal the adversary profile

**Step 5: Commit**

```bash
git add app/page.tsx
git commit -m "feat: build home page with card draw UI and flip interaction"
```

---

## Task 10: Card Permalink Page

**Files:**
- Create: `app/card/[slug]/page.tsx`

**Step 1: Create app/card/[slug]/page.tsx**

This is a Server Component. It renders the card face-up (no click required).

```tsx
// app/card/[slug]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCardBySlug } from "@/lib/slug";
import { getAllSlugs } from "@/lib/slug";
import { TarotCard } from "@/components/TarotCard";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const card = getCardBySlug(slug);
  if (!card) return { title: "Card Not Found" };

  return {
    title: `${card.cardTitle} — ${card.name} | Threat Intelligence Tarot`,
    description: card.flavor,
    openGraph: {
      title: `${card.cardTitle} — ${card.name}`,
      description: card.flavor,
      type: "website",
    },
  };
}

export default async function CardPage({ params }: Props) {
  const { slug } = await params;
  const card = getCardBySlug(slug);

  if (!card) notFound();

  return (
    <main
      className="min-h-screen flex flex-col items-center py-16 px-4"
      style={{ background: "var(--color-void)" }}
    >
      <div className="text-center mb-10">
        <a
          href="/"
          className="text-xs uppercase tracking-widest hover:opacity-100 transition-opacity"
          style={{ color: "var(--color-gold)", opacity: 0.6, fontFamily: "var(--font-cinzel), serif" }}
        >
          ← Threat Intelligence Tarot
        </a>
      </div>

      <TarotCard card={card} startFlipped={true} />
    </main>
  );
}
```

**Step 2: Verify**

```bash
npx tsc --noEmit
```

**Step 3: Test in dev server**

Navigate to `http://localhost:3000/card/apt28-fancy-bear`. The card should render face-up showing the APT28 profile.

**Step 4: Commit**

```bash
git add app/card/
git commit -m "feat: add card permalink page with static params and OG metadata"
```

---

## Task 11: Production Build Verification

**Step 1: Run a full build**

```bash
npm run build
```

Expected: Build succeeds. You will see 22 card routes generated under `/card/[slug]`.

**Step 2: Fix any build errors before continuing**

Common issues:
- Missing `"use client"` on components that use hooks
- Type errors in card data (check `number?` vs `number` on the TarotCard interface — the `data/types.ts` has `number` as required; all cards must have it)
- Import path errors (use `@/` prefix for all imports)

**Step 3: Commit**

```bash
git add -A
git commit -m "fix: resolve any build-time type or import errors"
```

---

## Task 12: Deploy to Vercel

Use the vercel:deploy skill to deploy.

```bash
# If not already linked:
npx vercel link

# Deploy:
npx vercel --prod
```

Verify the deployed URL loads and the card flip works.

---

## Notes

- The `card-scene` height of `600px` works well on desktop. On mobile, the card will be full-width but may need scrolling on the CardFront. This is acceptable for MVP.
- The `key={key}` prop on `<TarotCard>` in the home page forces a full remount on redraw, resetting the flip state to face-down. This is intentional.
- Google Fonts are loaded via `next/font/google` for performance (no FLIT, self-hosted by Next.js). Cinzel is the display font, EB Garamond is body.
- All card data is in `data/cards.ts`. Future Minor Arcana cards follow the exact same structure — just add to the array.
