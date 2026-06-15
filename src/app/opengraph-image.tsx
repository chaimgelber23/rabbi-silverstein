import { ImageResponse } from "next/og";

export const alt = "Rabbi Odom Silverstein | Torah Shiurim";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          background: "linear-gradient(135deg, #150F0C 0%, #1E1513 55%, #3A2820 100%)",
          padding: "0 80px",
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 700, color: "#C4A265", letterSpacing: -1 }}>
          Rabbi Odom Silverstein
        </div>
        <div style={{ fontSize: 32, color: "rgba(255,255,255,0.72)", marginTop: 24 }}>
          Torah Shiurim &middot; Nefesh HaChaim &middot; Tanya &middot; Bitachon
        </div>
        <div
          style={{
            marginTop: 36,
            width: 120,
            height: 4,
            background: "#C4A265",
            borderRadius: 2,
          }}
        />
      </div>
    ),
    { ...size }
  );
}
