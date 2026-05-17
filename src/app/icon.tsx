import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 64,
          height: 64,
          background: "linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)",
          border: "2px solid #e2e8f0",
          borderRadius: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", gap: 6 }}>
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 14,
                background: "linear-gradient(135deg, #38bdf8, #2563eb)",
              }}
            />
            <div style={{ width: 14, height: 14, borderRadius: 14, background: "#0f172a" }} />
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <div style={{ width: 14, height: 14, borderRadius: 14, background: "#0f172a" }} />
            <div style={{ width: 14, height: 14, borderRadius: 14, background: "#0f172a" }} />
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
