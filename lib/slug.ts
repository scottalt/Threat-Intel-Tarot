import { cards } from "@/data/cards";
import type { TarotCard } from "@/data/types";

export function getCardBySlug(slug: string): TarotCard | undefined {
  return cards.find((c) => c.slug === slug);
}

export function getAllSlugs(): string[] {
  return cards.map((c) => c.slug);
}
