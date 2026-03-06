import { cards } from "@/data/cards";
import type { TarotCard } from "@/data/types";

export function drawRandom(): TarotCard {
  return cards[Math.floor(Math.random() * cards.length)];
}

function dateToSeed(date: Date): number {
  return (
    date.getFullYear() * 10000 +
    (date.getMonth() + 1) * 100 +
    date.getDate()
  );
}

export function drawDaily(): TarotCard {
  return cards[dateToSeed(new Date()) % cards.length];
}

export function drawDailyOffset(dayOffset: number): TarotCard {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  return cards[dateToSeed(d) % cards.length];
}

export function drawSpread(count: number): TarotCard[] {
  const shuffled = [...cards].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, cards.length));
}
