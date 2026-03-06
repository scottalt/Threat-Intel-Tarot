import type { Metadata } from "next";
import { CompareClient } from "./CompareClient";

export const metadata: Metadata = {
  title: "Adversary Comparison | Threat Intelligence Tarot",
  description:
    "Compare two adversary profiles side by side. Shared MITRE ATT&CK techniques highlighted in gold. Covers TTPs, targets, motivations, and defenses.",
};

export default function ComparePage() {
  return <CompareClient />;
}
