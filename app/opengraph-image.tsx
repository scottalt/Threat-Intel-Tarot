import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#0a0a0f",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "serif",
          position: "relative",
        }}
      >
        {/* Background gold star pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 800px 500px at 50% 50%, rgba(201,168,76,0.08) 0%, transparent 70%)",
          }}
        />

        {/* Border */}
        <div
          style={{
            position: "absolute",
            inset: 24,
            border: "1px solid rgba(201,168,76,0.35)",
            borderRadius: 16,
          }}
        />

        {/* Corner glyphs */}
        {["48px 48px", "1152px 48px", "48px 582px", "1152px 582px"].map((pos, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: i % 2 === 0 ? 36 : "auto",
              right: i % 2 === 1 ? 36 : "auto",
              top: i < 2 ? 36 : "auto",
              bottom: i >= 2 ? 36 : "auto",
              color: "rgba(201,168,76,0.5)",
              fontSize: 20,
            }}
          >
            ✦
          </div>
        ))}

        {/* Main content */}
        <div
          style={{
            fontSize: 16,
            letterSpacing: "0.3em",
            color: "rgba(201,168,76,0.7)",
            textTransform: "uppercase",
            marginBottom: 20,
          }}
        >
          Major Arcana · Threat Intelligence
        </div>

        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: "#f0c040",
            textAlign: "center",
            lineHeight: 1.1,
            marginBottom: 16,
          }}
        >
          Threat Intelligence
          <br />
          Tarot
        </div>

        <div
          style={{
            fontSize: 22,
            color: "#c0c0c0",
            marginBottom: 40,
          }}
        >
          Real threat intelligence. Impossible to scroll past.
        </div>

        {/* Category pills */}
        <div style={{ display: "flex", gap: 12 }}>
          {[
            { label: "Nation-State", color: "#2d6a6a" },
            { label: "Criminal", color: "#4a1a6a" },
            { label: "Hacktivist", color: "#8b3a0f" },
          ].map((cat) => (
            <div
              key={cat.label}
              style={{
                padding: "8px 20px",
                borderRadius: 6,
                border: `1px solid ${cat.color}88`,
                background: `${cat.color}33`,
                color: "#c0c0c0",
                fontSize: 14,
                letterSpacing: "0.1em",
              }}
            >
              {cat.label}
            </div>
          ))}
        </div>

        {/* MITRE attribution */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            color: "rgba(192,192,192,0.35)",
            fontSize: 13,
          }}
        >
          Data sourced from MITRE ATT&CK
        </div>
      </div>
    ),
    { ...size }
  );
}
