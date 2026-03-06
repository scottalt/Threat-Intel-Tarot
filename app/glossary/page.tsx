import type { Metadata } from "next";
import { SiteNav } from "@/components/SiteNav";
import { BackToTop } from "@/components/BackToTop";

export const metadata: Metadata = {
  title: "Glossary | Threat Intelligence Tarot",
  description: "Reference guide: threat actors, MITRE ATT&CK, TTPs, and how to read the cards.",
};

const SECTIONS = [
  {
    title: "Threat Actor Groups",
    body: "A threat actor group is an organized team of attackers attributed — with varying confidence — to a specific nation-state, criminal enterprise, hacktivist movement, or unknown origin. Names like APT28 are analytical labels assigned by researchers; the same group may have dozens of vendor-assigned aliases (Fancy Bear, STRONTIUM, Sofacy). The cards use the most widely recognized name. Attribution is probabilistic, not forensic certainty.",
  },
  {
    title: "MITRE ATT&CK",
    body: "ATT&CK (Adversarial Tactics, Techniques and Common Knowledge) is a globally accessible knowledge base of adversary behavior maintained by MITRE. It documents how real-world attackers operate, from initial access through impact, organized into 14 tactics and hundreds of techniques. Each technique has a stable ID (e.g. T1566.001) used across the security industry in detection rules, threat reports, and security tooling. Clicking any technique ID on a card opens its MITRE ATT&CK page.",
  },
  {
    title: "TTPs: Tactics, Techniques, Procedures",
    body: "Tactics are the adversary's goal at a given stage (e.g. Initial Access, Lateral Movement, Impact). Techniques are the specific method used to achieve that goal (e.g. Spearphishing Attachment). Sub-techniques add further specificity (T1566.001 vs T1566.002). Procedures are the concrete implementation: the actual malware, tool, or command used in a real incident. Defenders map their detection and prevention controls to TTPs to find coverage gaps.",
  },
  {
    title: "How to Read a Card",
    body: "Each card represents one threat actor group. The card title is an arcane label capturing the group's character. Below it: the real group name, aliases, origin, and active status. The sigil color and shape indicates the category. Risk level (1-5 stars) reflects sophistication, reach, and historical damage. The tactic heatmap shows which of the 14 ATT&CK phases this group operates across. Defenses at the bottom are concrete controls mapped to frameworks like NIST CSF and CIS Controls. The reversed meaning captures the group's known weaknesses and historical failures.",
  },
  {
    title: "The Four Suits",
    body: "Swords represent espionage and intelligence collection: groups whose primary mission is stealing data, intellectual property, or state secrets. Wands represent disruption and destruction: groups focused on sabotage, DDoS, wipers, or operational technology attacks. Cups represent social engineering and deception: groups that use human manipulation, phishing, and psychological tactics as their primary weapon. Pentacles represent financial crime and ransomware: groups motivated primarily by monetary gain.",
  },
  {
    title: "The Five Categories",
    body: "Nation-State: attributed to a government or military intelligence apparatus, with significant resources and long operational timelines. Criminal: financially motivated, typically operating independently of any state mandate. Hacktivist: ideologically motivated, often with loose or decentralized structure and publicly stated goals. Trickster: social engineering specialists and identity manipulators who blur the line between criminal and performance art — groups like Scattered Spider and Lapsus$ who rely on social manipulation over technical exploits. Unknown: insufficient attribution to assign a category with confidence.",
  },
  {
    title: "Risk Level",
    body: "Risk is rated 1-5 stars based on: operational sophistication (custom tooling, zero-days), breadth of targeting (single sector vs. global), historical damage (confirmed incidents and their severity), and longevity. A 5-star group like Equation Group or Sandworm represents top-tier national capability with confirmed destructive impact at scale. A 1-star group may be unsophisticated but still relevant to specific sectors or geographies.",
  },
  {
    title: "Volume II: The Unbound Arcana",
    body: "The core deck of 78 cards covers the most widely recognized and documented threat actor groups. Volume II adds 28 expansion cards for groups that are operationally significant but less frequently covered in mainstream threat intelligence. Expansion cards are marked with a II prefix in the gallery and on each card.",
  },
];

const RESOURCES = [
  { label: "MITRE ATT&CK Enterprise Matrix", href: "https://attack.mitre.org/" },
  { label: "MITRE ATT&CK Groups Reference", href: "https://attack.mitre.org/groups/" },
  { label: "CISA Cybersecurity Advisories", href: "https://www.cisa.gov/news-events/cybersecurity-advisories" },
  { label: "CISA Known Exploited Vulnerabilities", href: "https://www.cisa.gov/known-exploited-vulnerabilities-catalog" },
  { label: "Mandiant APT Research", href: "https://www.mandiant.com/resources/research" },
  { label: "CIS Controls", href: "https://www.cisecurity.org/controls/cis-controls-list/" },
  { label: "NIST Cybersecurity Framework", href: "https://www.nist.gov/cyberframework" },
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

      <div className="flex flex-col gap-5">
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
            <p
              style={{
                color: "var(--color-mist)",
                lineHeight: 1.75,
                fontSize: "14px",
                opacity: 0.85,
              }}
            >
              {s.body}
            </p>
          </div>
        ))}

        <div
          style={{
            background: "rgba(26,26,46,0.6)",
            border: "1px solid rgba(201,168,76,0.15)",
            borderRadius: "10px",
            padding: "20px 24px",
          }}
        >
          <h2
            className="text-sm mb-4"
            style={{
              fontFamily: "var(--font-cinzel), serif",
              color: "var(--color-gold)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            External Resources
          </h2>
          <ul className="flex flex-col gap-2.5">
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
                    transition: "opacity 0.15s",
                  }}
                >
                  {r.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <BackToTop />
    </main>
  );
}
