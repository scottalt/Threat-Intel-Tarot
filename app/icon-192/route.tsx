import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 192,
          height: 192,
          background: "#0a0a0f",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 32,
          border: "3px solid #c9a84c",
          color: "#f0c040",
          fontSize: 96,
          fontFamily: "serif",
        }}
      >
        ✦
      </div>
    ),
    { width: 192, height: 192 }
  );
}
