import type { Metadata } from "next";
import { SpreadClient } from "./SpreadClient";

export const metadata: Metadata = {
  title: "Three-Card Spread | Threat Intelligence Tarot",
  description:
    "Draw three adversary profiles: past threat, present danger, and emerging risk. Get shared techniques, priority defenses, and a threat landscape reading.",
};

export default function SpreadPage() {
  return <SpreadClient />;
}
