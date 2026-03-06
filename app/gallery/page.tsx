import type { Metadata } from "next";
import { cards } from "@/data/cards";
import { GalleryClient } from "@/components/GalleryClient";

export const metadata: Metadata = {
  title: "All Adversaries — Threat Intelligence Tarot",
  description: "Browse all 22 Major Arcana threat actor profiles. Nation-state, criminal, and hacktivist groups from MITRE ATT&CK.",
};

export default function GalleryPage() {
  return (
    <main
      className="min-h-screen px-4 py-16"
      style={{ background: "var(--color-void)" }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <a
            href="/"
            className="text-xs uppercase tracking-widest"
            style={{ color: "var(--color-gold)", opacity: 0.6, fontFamily: "var(--font-cinzel), serif" }}
          >
            ← Draw a Card
          </a>
          <h1
            className="text-2xl sm:text-3xl font-semibold mt-4 mb-2"
            style={{ color: "var(--color-gold-bright)", fontFamily: "var(--font-cinzel), serif" }}
          >
            The 22 Major Arcana
          </h1>
          <p className="text-sm" style={{ color: "var(--color-silver)", opacity: 0.7 }}>
            All known adversaries. Choose your study.
          </p>
          <div
            className="mt-3 w-24 h-px mx-auto"
            style={{ background: "linear-gradient(90deg, transparent, var(--color-gold), transparent)" }}
          />
        </div>

        <GalleryClient cards={cards} />
      </div>
    </main>
  );
}
