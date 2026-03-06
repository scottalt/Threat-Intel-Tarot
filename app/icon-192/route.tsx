import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 192,
          height: 192,
          background: "#1a1a2e",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* Outer border */}
        <div
          style={{
            position: "absolute",
            inset: 5,
            border: "1.5px solid #c9a84c",
            borderRadius: 22,
            opacity: 0.85,
          }}
        />
        {/* Inner border */}
        <div
          style={{
            position: "absolute",
            inset: 11,
            border: "1px solid #c9a84c",
            borderRadius: 16,
            opacity: 0.28,
          }}
        />
        {/* Center */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
          }}
        >
          <div style={{ color: "#f0c040", fontSize: 72, lineHeight: 1 }}>✦</div>
          <div
            style={{
              color: "#c9a84c",
              fontSize: 13,
              fontFamily: "serif",
              letterSpacing: "0.18em",
              opacity: 0.75,
            }}
          >
            TI TAROT
          </div>
        </div>
        {/* Corner glyphs */}
        {[
          { top: 16, left: 16 },
          { top: 16, right: 16 },
          { bottom: 16, left: 16 },
          { bottom: 16, right: 16 },
        ].map((pos, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              ...pos,
              color: "#c9a84c",
              fontSize: 10,
              opacity: 0.4,
            }}
          >
            ✦
          </div>
        ))}
      </div>
    ),
    { width: 192, height: 192 }
  );
}
