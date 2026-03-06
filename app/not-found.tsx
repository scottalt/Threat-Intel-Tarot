import { Starfield } from "@/components/Starfield";

export default function NotFound() {
  return (
    <main
      className="relative min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "var(--color-void)" }}
    >
      <Starfield />
      <div
        className="relative text-center"
        style={{ zIndex: 2 }}
      >
        <div
          className="text-6xl mb-6 select-none"
          style={{
            color: "var(--color-gold)",
            animation: "float 3s ease-in-out infinite",
          }}
        >
          ✦
        </div>
        <h1
          className="text-2xl font-semibold mb-3"
          style={{
            color: "var(--color-gold-bright)",
            fontFamily: "var(--font-cinzel), serif",
          }}
        >
          The Card Was Never Drawn
        </h1>
        <p
          className="text-sm mb-8 italic"
          style={{ color: "var(--color-silver)", opacity: 0.65 }}
        >
          This page does not exist. Some adversaries remain beyond the veil.
        </p>
        <div className="flex gap-6 justify-center">
          <a
            href="/"
            className="text-xs uppercase tracking-widest transition-opacity hover:opacity-100"
            style={{
              color: "var(--color-gold)",
              opacity: 0.7,
              fontFamily: "var(--font-cinzel), serif",
            }}
          >
            ← Draw a Card
          </a>
          <a
            href="/gallery"
            className="text-xs uppercase tracking-widest transition-opacity hover:opacity-100"
            style={{
              color: "var(--color-gold)",
              opacity: 0.7,
              fontFamily: "var(--font-cinzel), serif",
            }}
          >
            Browse All Cards
          </a>
        </div>
      </div>
    </main>
  );
}
