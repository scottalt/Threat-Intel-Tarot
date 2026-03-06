import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
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
            inset: 14,
            border: "4px solid #c9a84c",
            borderRadius: 58,
            opacity: 0.85,
          }}
        />
        {/* Inner border */}
        <div
          style={{
            position: "absolute",
            inset: 26,
            border: "2px solid #c9a84c",
            borderRadius: 46,
            opacity: 0.28,
          }}
        />
        {/* Center */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div style={{ color: "#f0c040", fontSize: 192, lineHeight: 1 }}>✦</div>
          <div
            style={{
              color: "#c9a84c",
              fontSize: 34,
              fontFamily: "serif",
              letterSpacing: "0.22em",
              opacity: 0.75,
            }}
          >
            TI TAROT
          </div>
        </div>
        {/* Corner glyphs */}
        {[
          { top: 44, left: 44 },
          { top: 44, right: 44 },
          { bottom: 44, left: 44 },
          { bottom: 44, right: 44 },
        ].map((pos, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              ...pos,
              color: "#c9a84c",
              fontSize: 28,
              opacity: 0.38,
            }}
          >
            ✦
          </div>
        ))}
      </div>
    ),
    { width: 512, height: 512 }
  );
}
