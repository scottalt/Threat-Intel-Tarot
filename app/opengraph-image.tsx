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
        {/* Background gold radial glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 800px 500px at 50% 50%, rgba(201,168,76,0.08) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Border */}
        <div
          style={{
            position: "absolute",
            inset: 24,
            border: "1px solid rgba(201,168,76,0.35)",
            borderRadius: 16,
            display: "flex",
          }}
        />

        {/* Corner glyphs */}
        <div style={{ position: "absolute", left: 36, top: 36, color: "rgba(201,168,76,0.5)", fontSize: 20, display: "flex" }}>*</div>
        <div style={{ position: "absolute", left: 1152, top: 36, color: "rgba(201,168,76,0.5)", fontSize: 20, display: "flex" }}>*</div>
        <div style={{ position: "absolute", left: 36, top: 570, color: "rgba(201,168,76,0.5)", fontSize: 20, display: "flex" }}>*</div>
        <div style={{ position: "absolute", left: 1152, top: 570, color: "rgba(201,168,76,0.5)", fontSize: 20, display: "flex" }}>*</div>

        {/* Eyebrow label */}
        <div
          style={{
            fontSize: 16,
            letterSpacing: "0.3em",
            color: "rgba(201,168,76,0.7)",
            textTransform: "uppercase",
            marginBottom: 20,
            display: "flex",
          }}
        >
          Major Arcana · Threat Intelligence
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            fontSize: 72,
            fontWeight: 700,
            color: "#f0c040",
            textAlign: "center",
            lineHeight: 1.1,
            marginBottom: 16,
          }}
        >
          <span>Threat Intelligence</span>
          <span>Tarot</span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 22,
            color: "#c0c0c0",
            marginBottom: 40,
            display: "flex",
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
                display: "flex",
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
            display: "flex",
          }}
        >
          Data sourced from MITRE ATT&CK
        </div>
      </div>
    ),
    { ...size }
  );
}
