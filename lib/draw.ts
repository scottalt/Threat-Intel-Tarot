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

export function drawSpread(count: number): TarotCard[] {
  const shuffled = [...cards].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, cards.length));
}
