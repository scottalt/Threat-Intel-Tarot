export interface TTP {
  techniqueId: string;
  name: string;
  tactic: string;
}

export interface Defense {
  control: string;
  framework?: string;
}

export type RiskLevel = 1 | 2 | 3 | 4 | 5;
export type Category = "nation-state" | "criminal" | "hacktivist" | "unknown";
export type Arcanum = "major" | "minor";
export type Suit = "swords" | "wands" | "cups" | "pentacles";

export interface TarotCard {
  id: string;
  slug: string;
  name: string;
  aka: string[];
  cardTitle: string;
  arcanum: Arcanum;
  suit?: Suit;
  number: number;
  origin: string;
  category: Category;
  since: string;
  motivation: string[];
  targets: string[];
  ttps: TTP[];
  notableOps: string[];
  flavor: string;
  reversedMeaning: string;
  defenses: Defense[];
  riskLevel: RiskLevel;
  mitreGroupId?: string;
}
