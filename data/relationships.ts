/**
 * Curated threat group relationships
 *
 * Each entry documents a connection between two adversary groups based on
 * publicly attributed evidence. This is not TTP overlap inference — every
 * relationship here has a named source (indictment, government advisory,
 * vendor report, court filing).
 *
 * Relationship types:
 *   cluster       — Same threat actor under different names/aliases
 *   lineage       — One group directly evolved from or spawned another
 *   personnel     — Documented shared or overlapping operators (often from indictments)
 *   tooling       — Shared custom malware or tools (not commodity tools like Cobalt Strike)
 *   infrastructure — Shared C2 servers, domains, certificates, or hosting
 *   collaboration  — Documented operational partnership or access brokering
 *   sponsor       — Same nation-state or criminal organisation sponsor (different units)
 *   suspected     — Assessed by analysts but not publicly confirmed with hard evidence
 *
 * Strength:
 *   confirmed  — Government indictment, attribution statement, or leaked internal docs
 *   assessed   — Major vendor report with corroborating evidence
 *   suspected  — Analytical assessment, single-source, or circumstantial
 *
 * PROOF OF CONCEPT — covers 5 seed groups and their documented connections
 * within the 78-card deck. Expand by adding entries to the array.
 */

export type RelationshipType =
  | "cluster"
  | "lineage"
  | "personnel"
  | "tooling"
  | "infrastructure"
  | "collaboration"
  | "sponsor"
  | "suspected";

export type RelationshipStrength = "confirmed" | "assessed" | "suspected";

export type Relationship = {
  /** Slugs of both groups (order does not imply direction — all are bidirectional) */
  a: string;
  b: string;
  type: RelationshipType;
  strength: RelationshipStrength;
  /** One-sentence summary shown in the graph tooltip */
  summary: string;
  /** 2-3 sentences with specifics for the detail view */
  detail: string;
  /** Public sources — indictments, advisories, vendor reports */
  sources: string[];
  /** Year(s) the relationship was active or first documented */
  since?: number;
  until?: number;
};

export const relationships: Relationship[] = [

  // ─────────────────────────────────────────────────────────────────────────
  // APT28 / Fancy Bear  (apt28-fancy-bear)
  // Russian GRU Unit 26165 / 85549
  // ─────────────────────────────────────────────────────────────────────────

  {
    a: "apt28-fancy-bear",
    b: "apt29-cozy-bear",
    type: "sponsor",
    strength: "confirmed",
    summary: "Both work for Russian intelligence but different agencies — APT28 for GRU (military), APT29 for SVR (foreign intelligence).",
    detail:
      "APT28 is attributed to GRU Unit 26165; APT29 to the SVR. Both independently targeted the DNC and DCCC in 2016 with no evidence of coordination — consistent with inter-agency competition. The US Intelligence Community Assessment (Jan 2017) and the Mueller Report (2019) attributed both operations separately.",
    sources: [
      "US IC Assessment 'Assessing Russian Activities and Intentions in Recent US Elections' (Jan 2017)",
      "Mueller Report Vol. 1 (2019)",
      "DOJ indictment of 12 GRU officers (Jul 2018)",
    ],
    since: 2014,
  },

  {
    a: "apt28-fancy-bear",
    b: "sandworm-the-destroyer",
    type: "sponsor",
    strength: "confirmed",
    summary: "Both are GRU units — APT28 is Unit 26165, Sandworm is Unit 74455 — operating under the same military intelligence directorate.",
    detail:
      "US DoJ indictments separately identified APT28 as GRU Unit 26165 (targeting elections and espionage) and Sandworm as GRU Unit 74455 (destructive attacks). Limited infrastructure overlap has been observed in some campaigns. UK NCSC and GCHQ jointly attributed Sandworm's NotPetya to GRU in 2018.",
    sources: [
      "DOJ indictment of 7 GRU officers for Sandworm activity (Oct 2018)",
      "DOJ indictment of 12 GRU officers for APT28/DNC hack (Jul 2018)",
      "UK NCSC attribution statement on NotPetya (Feb 2018)",
    ],
    since: 2014,
  },

  {
    a: "apt28-fancy-bear",
    b: "turla-the-serpent",
    type: "sponsor",
    strength: "confirmed",
    summary: "Both attributed to Russian intelligence services — APT28 to GRU, Turla to FSB — sharing the same state sponsor with different tasking.",
    detail:
      "Turla is attributed to Russia's FSB (Federal Security Service) Center 16, while APT28 operates under GRU. No documented collaboration between the two, but both have been observed targeting the same victim sectors. In 2019, NCSC documented that Turla hijacked APT34 (Iranian) infrastructure — demonstrating Russia's willingness to operate through proxy attribution.",
    sources: [
      "NCSC/NSA advisory on Turla (Oct 2019)",
      "CISA advisory AA20-296A on Russian state-sponsored actors",
      "Mandiant 'APT28: At The Center Of The Storm' (2017)",
    ],
    since: 2007,
  },

  {
    a: "apt28-fancy-bear",
    b: "gamaredon-the-hunger",
    type: "sponsor",
    strength: "confirmed",
    summary: "Both Russian state actors, APT28 under GRU and Gamaredon under FSB — different services, overlapping Ukraine targeting.",
    detail:
      "Gamaredon is attributed to FSB officers based in Crimea (Ukrainian SBU indictment named five FSB officers in 2021). Both APT28 and Gamaredon have extensively targeted Ukrainian government and military organisations, often concurrently, but with distinct toolsets and no documented operational coordination.",
    sources: [
      "Ukrainian SBU indictment naming 5 FSB Gamaredon officers (Nov 2021)",
      "CISA advisory AA22-110A 'Russian State-Sponsored Cyber Actors' (2022)",
    ],
    since: 2013,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // APT29 / Cozy Bear  (apt29-cozy-bear)
  // Russian SVR / Foreign Intelligence Service
  // ─────────────────────────────────────────────────────────────────────────

  {
    a: "apt29-cozy-bear",
    b: "unc2452-the-invisible-chain",
    type: "cluster",
    strength: "confirmed",
    summary: "UNC2452 (SolarWinds/SUNBURST) is APT29 operating under a different tracking name — same threat actor, confirmed by US government and five major vendors.",
    detail:
      "FireEye discovered the SolarWinds supply-chain attack in Dec 2020 and tracked it as UNC2452. Microsoft named the same actor NOBELIUM. In Jan 2021, a joint statement by NSA, CISA, FBI, and ODNI formally attributed UNC2452/SUNBURST to the SVR — the same agency responsible for APT29. CrowdStrike, Mandiant, and Volexity all corroborated the attribution.",
    sources: [
      "NSA/CISA/FBI/ODNI Joint Statement on SolarWinds (Jan 2021)",
      "FireEye 'Highly Evasive Attacker Leverages SolarWinds Supply Chain' (Dec 2020)",
      "Microsoft MSTIC 'NOBELIUM' attribution blog (Mar 2021)",
      "CISA Emergency Directive 21-01",
    ],
    since: 2019,
    until: 2021,
  },

  {
    a: "apt29-cozy-bear",
    b: "apt28-fancy-bear",
    type: "sponsor",
    strength: "confirmed",
    summary: "Both attributed to Russian state intelligence but different agencies — rivalry documented by their independent 2016 DNC operations.",
    detail: "See APT28 ↔ APT29 entry above.",
    sources: [
      "US IC Assessment (Jan 2017)",
      "Mueller Report Vol. 1 (2019)",
    ],
    since: 2014,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Lazarus Group  (lazarus-group-the-specter)
  // DPRK RGB (Reconnaissance General Bureau)
  // ─────────────────────────────────────────────────────────────────────────

  {
    a: "lazarus-group-the-specter",
    b: "apt38-the-alchemist",
    type: "lineage",
    strength: "confirmed",
    summary: "APT38 is a financially specialised sub-cluster of Lazarus Group, split off around 2016 to focus exclusively on bank heists via the SWIFT network.",
    detail:
      "Mandiant's 2018 APT38 report documented the split: the broader Lazarus Group continued espionage and destructive ops while APT38 was tasked with generating foreign currency for the DPRK regime. Both share tooling (HOPLIGHT, ELECTRICFISH malware families) and infrastructure, and are attributed to the same parent organisation, the Reconnaissance General Bureau. APT38 is responsible for the $81M Bangladesh Bank heist (2016) and attacks on 16+ banks across 13 countries.",
    sources: [
      "Mandiant 'APT38: Un-usual Suspects' report (Oct 2018)",
      "US Treasury OFAC designation of Lazarus, Bluenoroff, Andariel (Sep 2019)",
      "US DoJ indictment of three North Korean nationals (Feb 2021)",
    ],
    since: 2016,
  },

  {
    a: "lazarus-group-the-specter",
    b: "kimsuky-the-whisperer",
    type: "sponsor",
    strength: "confirmed",
    summary: "Kimsuky and Lazarus Group both operate under DPRK's RGB but are assessed as separate units with distinct targeting and tooling.",
    detail:
      "Kimsuky is assessed as part of RGB Sub-unit 3 (also referred to as 'Kimsuky' or 'Velvet Chollima'), tasked with intelligence collection against South Korean government, think tanks, and COVID-19 researchers. Lazarus operates under a different RGB sub-unit with broader global reach. Both use spear-phishing as primary initial access but have distinct malware families and operational cadence.",
    sources: [
      "US CISA/FBI advisory AA20-301A 'North Korean Advanced Persistent Threat Focus' (Oct 2020)",
      "US Treasury OFAC designation of Lazarus sub-groups (Sep 2019)",
      "South Korean NIS public attribution statements (2022)",
    ],
    since: 2012,
  },

  {
    a: "lazarus-group-the-specter",
    b: "jade-sleet",
    type: "sponsor",
    strength: "assessed",
    summary: "Jade Sleet is a DPRK-nexus threat actor assessed by Microsoft and others as likely linked to the broader Lazarus group apparatus.",
    detail:
      "Microsoft Threat Intelligence (2023) tracked Jade Sleet targeting cryptocurrency firms and blockchain developers — consistent with Lazarus Group's financially motivated operations. Shared tooling characteristics and targeting overlap led analysts to assess Jade Sleet as either a Lazarus sub-cluster or closely coordinated unit. No confirmed indictment-level attribution yet.",
    sources: [
      "Microsoft Threat Intelligence 'Jade Sleet' tracking (2023)",
      "GitHub Advisory on Jade Sleet social engineering campaign targeting developers (Jul 2023)",
    ],
    since: 2022,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // FIN7 / Carbanak  (fin7-the-merchant)
  // Eastern European criminal group
  // ─────────────────────────────────────────────────────────────────────────

  {
    a: "fin7-the-merchant",
    b: "carbanak-the-banker",
    type: "personnel",
    strength: "confirmed",
    summary: "FIN7 and Carbanak overlapping operators were confirmed by DOJ indictments and Europol arrests — initially treated as the same group by some researchers.",
    detail:
      "The 2018 DOJ indictment of three Ukrainian nationals (Fedir Hladyr, Dmytro Fedorov, Andrii Kolpakov) charged them with FIN7 crimes involving POS intrusions. Separately, Europol arrested the 'Carbanak mastermind' in Spain in 2018. FireEye originally tracked them as the same group; later analysis separated them into overlapping but distinct operations sharing infrastructure and some personnel.",
    sources: [
      "DOJ indictment — US v. Hladyr, Fedorov, Kolpakov (Aug 2018)",
      "Europol press release on Carbanak mastermind arrest (Mar 2018)",
      "Mandiant 'FIN7 Evolution and the Phishing LNK' (2017)",
      "FBI flash alert MU-000148-MW",
    ],
    since: 2013,
  },

  {
    a: "fin7-the-merchant",
    b: "darkside-the-dark-dividend",
    type: "collaboration",
    strength: "assessed",
    summary: "FIN7 operated fake pen testing companies that recruited cybercriminals who participated in DarkSide ransomware campaigns.",
    detail:
      "Mandiant documented FIN7 running 'Combi Security' and 'Bastion Secure' — fraudulent cybersecurity recruitment firms used to hire criminal talent while obscuring the group's identity. Analysts assessed that FIN7 monetised compromised network access by selling it to ransomware operators including DarkSide affiliates. Bastion Secure was exposed by Recorded Future in 2021.",
    sources: [
      "Mandiant 'FIN7 Power Hour' report (2020)",
      "Recorded Future 'Bastion Secure' exposure (Oct 2021)",
      "Brian Krebs 'Ransomware Gangs and the Name Game' (2021)",
    ],
    since: 2020,
    until: 2022,
  },

  {
    a: "fin7-the-merchant",
    b: "lockbit-the-locked-tower",
    type: "collaboration",
    strength: "assessed",
    summary: "FIN7 has been documented providing initial network access that resulted in LockBit ransomware deployment.",
    detail:
      "SentinelOne (2022) and other vendors documented intrusion chains where FIN7 TTPs (POWERTRASH, DICELOADER loaders) were followed by LockBit deployment — consistent with FIN7's access brokering model. Analysts assess FIN7 affiliates directly deployed LockBit or sold access to LockBit affiliates. No indictment-level confirmation of a formal arrangement.",
    sources: [
      "SentinelOne 'FIN7 Affiliates Use LockBit 2.0' (Feb 2022)",
      "Mandiant M-Trends 2022 — FIN7 partnerships",
    ],
    since: 2021,
  },

  {
    a: "fin7-the-merchant",
    b: "blackcat-alphv-the-void",
    type: "collaboration",
    strength: "assessed",
    summary: "Microsoft assessed FIN7 as a developer and affiliate of BlackCat/ALPHV ransomware, creating custom tooling for the group.",
    detail:
      "Microsoft Threat Intelligence (2022) attributed the development of a custom tool called 'POORTRY' (a signed malicious driver) to FIN7, used in BlackCat/ALPHV campaigns. This represents a deeper relationship than simple access brokering — FIN7 appears to have acted as a ransomware developer for BlackCat operations.",
    sources: [
      "Microsoft MSTIC 'BlackCat/ALPHV' report (Jun 2022)",
      "Mandiant 'FIN7 and ALPHV/BlackCat' tracking (2022)",
    ],
    since: 2021,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Conti / Wizard Spider  (conti-wizard-spider-the-plague)
  // Russian/Eastern European criminal ransomware group
  // ─────────────────────────────────────────────────────────────────────────

  {
    a: "conti-wizard-spider-the-plague",
    b: "trickbot-the-second-stage",
    type: "lineage",
    strength: "confirmed",
    summary: "Wizard Spider operated both TrickBot and Conti — TrickBot was the initial access loader that evolved the group into the Conti ransomware operation.",
    detail:
      "CrowdStrike and others tracked 'Wizard Spider' as the threat actor operating TrickBot (banking trojan, 2016+), then Ryuk ransomware (2018+), and finally Conti (2020-2022). Conti Leaks (Feb 2022) confirmed the internal structure: TrickBot bots fed Conti operators with initial access. The same leadership managed both operations simultaneously before TrickBot was shut down in 2022.",
    sources: [
      "Conti Leaks internal chat logs (Feb 2022, leaked by Ukrainian researcher)",
      "CrowdStrike 'Wizard Spider' adversary profile",
      "CISA/FBI/HHS advisory AA21-265A 'Conti Ransomware' (Sep 2021)",
      "Europol TrickBot disruption statement (Oct 2020)",
    ],
    since: 2016,
    until: 2022,
  },

  {
    a: "conti-wizard-spider-the-plague",
    b: "emotet-the-delivery-service",
    type: "collaboration",
    strength: "confirmed",
    summary: "Emotet botnet consistently delivered TrickBot payloads, which then led to Conti ransomware — a documented multi-stage delivery chain.",
    detail:
      "CISA advisory AA21-265A explicitly documented the Emotet → TrickBot → Ryuk/Conti delivery chain as the dominant ransomware deployment mechanism in 2020-2021. After Emotet's takedown (Jan 2021) and reemergence (Nov 2021), the same chain resumed. Wizard Spider paid TA542 (Emotet operators) for botnet access as an initial access broker arrangement.",
    sources: [
      "CISA/FBI/HHS advisory AA21-265A (Sep 2021)",
      "Europol Emotet takedown statement (Jan 2021)",
      "ProofPoint 'Emotet is Back' (Nov 2021)",
    ],
    since: 2019,
    until: 2022,
  },

  {
    a: "conti-wizard-spider-the-plague",
    b: "bazaloader-the-side-door",
    type: "tooling",
    strength: "confirmed",
    summary: "BazaLoader (BazaBackdoor) was developed and operated by Wizard Spider as a second loader alongside TrickBot, confirmed by Conti Leaks.",
    detail:
      "Conti Leaks revealed that Wizard Spider maintained BazaLoader as a parallel initial access tool. When targets had TrickBot-resistant defences, BazaLoader campaigns using callback phishing ('BazaCall') were deployed. Unit 42 and Mandiant tracked BazaLoader campaigns that consistently led to Conti ransomware deployment.",
    sources: [
      "Conti Leaks (Feb 2022)",
      "Palo Alto Unit 42 'BazaLoader' report (Jun 2020)",
      "Mandiant 'BazaCall' campaign analysis (2021)",
    ],
    since: 2020,
    until: 2022,
  },

  {
    a: "conti-wizard-spider-the-plague",
    b: "lockbit-the-locked-tower",
    type: "personnel",
    strength: "assessed",
    summary: "After Conti disbanded in May 2022, members dispersed to multiple ransomware operations — LockBit was a documented beneficiary.",
    detail:
      "Following the Conti Leaks and the group's public dissolution in May 2022, Chainalysis and Mandiant tracked former Conti affiliates migrating to at least six other ransomware operations, with LockBit receiving the largest share. This included both technical operators and negotiators. Some Conti sub-teams rebranded as BlackBasta, which maintained ties to the LockBit ecosystem.",
    sources: [
      "Chainalysis 2022 Crypto Crime Report — Conti dissolution",
      "Mandiant 'The Conti Leaks' (2022)",
      "Microsoft MSTIC tracking of Conti successor groups (2022)",
    ],
    since: 2022,
  },

  {
    a: "conti-wizard-spider-the-plague",
    b: "blackcat-alphv-the-void",
    type: "personnel",
    strength: "assessed",
    summary: "BlackCat/ALPHV recruited former Conti and REvil members following the collapse of both groups.",
    detail:
      "Chainalysis and Mandiant documented former Conti operators joining BlackCat/ALPHV, which emerged in Nov 2021 and was notable for being written in Rust — suggesting significant developer investment. BlackCat's sophisticated affiliate model and negotiation tactics showed operational continuity with Conti practices. US DOJ's BlackCat indictment (Dec 2023) corroborated the affiliate-heavy structure Conti pioneered.",
    sources: [
      "Chainalysis — BlackCat/ALPHV recruitment of Conti affiliates (2022)",
      "DOJ indictment and seizure of BlackCat/ALPHV infrastructure (Dec 2023)",
      "Mandiant 'UNC4466 / BlackCat' tracking",
    ],
    since: 2021,
  },

  {
    a: "conti-wizard-spider-the-plague",
    b: "hive-the-hospital-ward",
    type: "suspected",
    strength: "suspected",
    summary: "Overlapping tactics and targeting led analysts to suspect Hive received ex-Conti members or technical knowledge, though no definitive link has been confirmed.",
    detail:
      "Hive ransomware emerged in 2021 and shared Conti's aggressive hospital and healthcare targeting pattern. Code similarity analysis by some researchers found structural resemblances, but Hive's tooling (initially written in Go, later Rust) was distinct from Conti's toolchain. FBI takedown of Hive (Jan 2023) did not publicly attribute any Conti connection.",
    sources: [
      "FBI 'Hive Ransomware' advisory (Nov 2022)",
      "Microsoft MSTIC Hive profiling (2022)",
      "Analyst commentary on Conti→Hive overlap (Group-IB, 2022)",
    ],
    since: 2021,
    until: 2023,
  },

  {
    a: "conti-wizard-spider-the-plague",
    b: "icedid-the-frozen-account",
    type: "collaboration",
    strength: "assessed",
    summary: "IcedID was used as an initial access vector leading to Conti ransomware deployment, forming part of the same criminal-as-a-service supply chain as Emotet.",
    detail:
      "Multiple incident response reports (2021-2022) documented IcedID infections used to deliver Cobalt Strike beacons which then led to Conti ransomware. IcedID operated as an initial access broker in the same ecosystem as Emotet and TrickBot, selling or sharing access with Wizard Spider. The Conti Leaks confirmed Wizard Spider purchased access from multiple initial access brokers.",
    sources: [
      "Conti Leaks (Feb 2022) — references to IAB purchases",
      "Palo Alto Unit 42 'IcedID to Conti Ransomware in 48 Hours' (2021)",
      "DFIR Report IcedID → Conti case studies (2021)",
    ],
    since: 2020,
    until: 2022,
  },

];

/**
 * Helper: get all relationships for a given card slug
 */
export function getRelationshipsForSlug(slug: string): Relationship[] {
  return relationships.filter((r) => r.a === slug || r.b === slug);
}

/**
 * Helper: get the other group slug in a relationship
 */
export function getOtherSlug(rel: Relationship, slug: string): string {
  return rel.a === slug ? rel.b : rel.a;
}
