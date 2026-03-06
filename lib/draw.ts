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
