import { ImageResponse } from "next/og";
import { getCardBySlug } from "@/lib/slug";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ slug: string }> };

export default async function CardOgImage({ params }: Props) {
  const { slug } = await params;
  const card = getCardBySlug(slug);

  if (!card) {
    return new ImageResponse(
      <div style={{ width: 1200, height: 630, background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", color: "#c9a84c", fontSize: 32, fontFamily: "serif" }}>
        Threat Intelligence Tarot
      </div>,
      { ...size }
    );
  }

  const categoryColor: Record<string, string> = {
    "nation-state": "#2d6a6a",
    criminal: "#4a1a6a",
    hacktivist: "#8b3a0f",
    unknown: "#555",
  };

  const accent = categoryColor[card.category] ?? "#555";
  const stars = Array.from({ length: 5 }, (_, i) => (i < card.riskLevel ? "★" : "☆")).join(" ");

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#0a0a0f",
          display: "flex",
          fontFamily: "serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Category glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse 700px 400px at 30% 50%, ${accent}33 0%, transparent 70%)`,
          }}
        />

        {/* Left panel — card info */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px 64px",
            position: "relative",
          }}
        >
          <div
            style={{
              fontSize: 13,
              letterSpacing: "0.3em",
              color: "rgba(201,168,76,0.7)",
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            Major Arcana · {card.number}
          </div>

          <div
            style={{
              fontSize: 52,
              fontWeight: 700,
              color: "#f0c040",
              lineHeight: 1.1,
              marginBottom: 12,
            }}
          >
            {card.cardTitle}
          </div>

          <div style={{ fontSize: 28, color: "#e8e0f0", marginBottom: 6 }}>
            {card.name}
          </div>

          <div style={{ fontSize: 16, color: "rgba(192,192,192,0.6)", marginBottom: 24 }}>
            {card.aka.slice(0, 3).join(" · ")}
          </div>

          <div style={{ fontSize: 22, color: "#f0c040", marginBottom: 16 }}>
            {stars}
          </div>

          <div
            style={{
              fontSize: 15,
              color: "#c0c0c0",
              lineHeight: 1.6,
              maxWidth: 480,
              fontStyle: "italic",
            }}
          >
            {card.flavor.slice(0, 160)}…
          </div>
        </div>

        {/* Right panel — TTPs */}
        <div
          style={{
            width: 340,
            background: "#1a1a2e",
            borderLeft: `4px solid ${accent}`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "40px 32px",
          }}
        >
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.25em",
              color: "rgba(201,168,76,0.8)",
              textTransform: "uppercase",
              marginBottom: 20,
            }}
          >
            Key Techniques
          </div>

          {card.ttps.slice(0, 4).map((ttp) => (
            <div key={ttp.techniqueId} style={{ marginBottom: 14 }}>
              <div
                style={{
                  display: "inline-block",
                  background: "rgba(201,168,76,0.15)",
                  border: "1px solid rgba(201,168,76,0.3)",
                  borderRadius: 4,
                  padding: "2px 8px",
                  fontSize: 12,
                  color: "#f0c040",
                  fontFamily: "monospace",
                  marginBottom: 4,
                }}
              >
                {ttp.techniqueId}
              </div>
              <div style={{ fontSize: 14, color: "#e8e0f0" }}>{ttp.name}</div>
              <div style={{ fontSize: 11, color: "rgba(192,192,192,0.5)" }}>{ttp.tactic}</div>
            </div>
          ))}

          <div
            style={{
              marginTop: "auto",
              paddingTop: 20,
              borderTop: "1px solid rgba(201,168,76,0.15)",
              fontSize: 11,
              color: "rgba(192,192,192,0.4)",
              letterSpacing: "0.1em",
            }}
          >
            threat-intel-tarot.vercel.app
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
