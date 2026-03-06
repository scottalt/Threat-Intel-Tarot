import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          background: "#0a0a0f",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 80,
          border: "6px solid #c9a84c",
          color: "#f0c040",
          fontSize: 256,
          fontFamily: "serif",
        }}
      >
        ✦
      </div>
    ),
    { width: 512, height: 512 }
  );
}
