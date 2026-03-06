import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: "#0a0a0f",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 6,
          border: "1px solid #c9a84c",
          color: "#f0c040",
          fontSize: 18,
          fontFamily: "serif",
        }}
      >
        ✦
      </div>
    ),
    { ...size }
  );
}
