"use client";

import { useState, useEffect } from "react";

function getSecondsUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.floor((midnight.getTime() - now.getTime()) / 1000);
}

function formatCountdown(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

export function DailyCountdown() {
  const [seconds, setSeconds] = useState<number | null>(null);

  useEffect(() => {
    setSeconds(getSecondsUntilMidnight());
    const id = setInterval(() => {
      setSeconds(getSecondsUntilMidnight());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  if (seconds === null) return null;

  return (
    <div
      className="text-center mt-4"
      style={{
        animation: "section-reveal 0.4s ease-out 0.5s both",
      }}
    >
      <div
        className="text-xs uppercase tracking-widest mb-1"
        style={{
          color: "var(--color-silver)",
          opacity: 0.45,
          fontFamily: "var(--font-cinzel), serif",
        }}
      >
        Next card in
      </div>
      <div
        className="text-lg font-semibold tabular-nums"
        style={{
          color: "var(--color-gold)",
          fontFamily: "var(--font-cinzel), serif",
          letterSpacing: "0.1em",
        }}
      >
        {formatCountdown(seconds)}
      </div>
    </div>
  );
}
