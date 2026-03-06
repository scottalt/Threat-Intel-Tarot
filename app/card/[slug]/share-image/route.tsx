import { ImageResponse } from "next/og";
import { getCardBySlug } from "@/lib/slug";
import { NextRequest } from "next/server";

export const runtime = "edge";

const categoryColor: Record<string, string> = {
  "nation-state": "#2d6a6a",
  criminal: "#4a1a6a",
  hacktivist: "#8b3a0f",
  unknown: "#555",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const card = getCardBySlug(slug);

  if (!card) {
    return new Response("Not found", { status: 404 });
  }

  const accent = categoryColor[card.category] ?? "#555";
  const stars = Array.from({ length: 5 }, (_, i) =>
    i < card.riskLevel ? "★" : "☆"
  ).join(" ");

  const arcanum =
    card.arcanum === "major"
      ? `Major Arcana · ${card.number ?? ""}`
      : `${(card.suit ?? "minor").charAt(0).toUpperCase() + (card.suit ?? "minor").slice(1)} · ${card.number ?? ""}`;

  const ttps = card.ttps.slice(0, 4);

  return new ImageResponse(
    (
      <div
        style={{
          width: 600,
          height: 1050,
          background: "linear-gradient(180deg, #0a0a0f 0%, #1a1a2e 100%)",
          display: "flex",
          flexDirection: "column",
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
            background: `radial-gradient(ellipse 500px 400px at 50% 30%, ${accent}44 0%, transparent 65%)`,
            display: "flex",
          }}
        />

        {/* Gold border frame outer */}
        <div
          style={{
            position: "absolute",
            inset: 16,
            border: "1px solid rgba(201,168,76,0.25)",
            display: "flex",
          }}
        />
        {/* Gold border frame inner */}
        <div
          style={{
            position: "absolute",
            inset: 20,
            border: "1px solid rgba(201,168,76,0.12)",
            display: "flex",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            padding: "48px 48px 32px",
            position: "relative",
          }}
        >
          {/* Arcanum label */}
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.3em",
              color: "rgba(201,168,76,0.6)",
              textTransform: "uppercase",
              marginBottom: 24,
              display: "flex",
            }}
          >
            {arcanum}
          </div>

          {/* Card title */}
          <div
            style={{
              fontSize: 44,
              fontWeight: 700,
              color: "#f0c040",
              lineHeight: 1.1,
              marginBottom: 12,
              display: "flex",
            }}
          >
            {card.cardTitle}
          </div>

          {/* Group name */}
          <div
            style={{
              fontSize: 24,
              color: "#e8e0f0",
              marginBottom: 4,
              display: "flex",
            }}
          >
            {card.name}
          </div>

          {/* Aliases */}
          <div
            style={{
              fontSize: 14,
              color: "rgba(192,192,192,0.55)",
              marginBottom: 20,
              display: "flex",
            }}
          >
            {card.aka.slice(0, 3).join(" / ")}
          </div>

          {/* Origin + risk */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 28,
            }}
          >
            <div
              style={{
                display: "flex",
                background: `${accent}33`,
                border: `1px solid ${accent}66`,
                borderRadius: 4,
                padding: "3px 10px",
                fontSize: 12,
                color: "#e8e0f0",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              {card.origin}
            </div>
            <div style={{ fontSize: 18, color: "#f0c040", display: "flex" }}>
              {stars}
            </div>
          </div>

          {/* Divider */}
          <div
            style={{
              width: "100%",
              height: 1,
              background:
                "linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent)",
              marginBottom: 28,
              display: "flex",
            }}
          />

          {/* TTPs section label */}
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.25em",
              color: "rgba(201,168,76,0.7)",
              textTransform: "uppercase",
              marginBottom: 16,
              display: "flex",
            }}
          >
            Key Techniques
          </div>

          {/* TTP rows */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {ttps.map((ttp) => (
              <div
                key={ttp.techniqueId}
                style={{ display: "flex", alignItems: "flex-start", gap: 12 }}
              >
                <div
                  style={{
                    display: "flex",
                    background: "rgba(201,168,76,0.12)",
                    border: "1px solid rgba(201,168,76,0.3)",
                    borderRadius: 4,
                    padding: "2px 8px",
                    fontSize: 12,
                    color: "#f0c040",
                    fontFamily: "monospace",
                    flexShrink: 0,
                  }}
                >
                  {ttp.techniqueId}
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ fontSize: 14, color: "#e8e0f0" }}>
                    {ttp.name}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "rgba(192,192,192,0.45)",
                    }}
                  >
                    {ttp.tactic}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Spacer */}
          <div style={{ flex: 1, display: "flex" }} />

          {/* Bottom divider */}
          <div
            style={{
              width: "100%",
              height: 1,
              background:
                "linear-gradient(90deg, transparent, rgba(201,168,76,0.25), transparent)",
              marginBottom: 16,
              display: "flex",
            }}
          />

          {/* Watermark row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: "rgba(192,192,192,0.3)",
                letterSpacing: "0.12em",
                display: "flex",
              }}
            >
              tarot.scottaltiparmak.com
            </div>
            <div
              style={{
                fontSize: 10,
                color: `${accent}99`,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                display: "flex",
              }}
            >
              {card.category}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 600,
      height: 1050,
    }
  );
}
