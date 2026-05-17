import { ImageResponse } from "next/og";
import { SITE } from "@/lib/seo";

export const runtime = "edge";

/**
 * Dynamic Open Graph image generator.
 *
 * Usage:
 *   /api/og                        — default brand card
 *   /api/og?title=Pricing          — custom title
 *   /api/og?title=...&subtitle=... — title + subtitle
 *
 * Cached on Vercel's edge for 24h.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") ?? SITE.tagline;
  const subtitle = searchParams.get("subtitle") ?? SITE.name;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "radial-gradient(1200px 600px at 50% -10%, #eef2ff 0%, transparent 60%), radial-gradient(800px 500px at 10% 30%, #f5f3ff 0%, transparent 60%), radial-gradient(900px 500px at 90% 20%, #ecfeff 0%, transparent 60%), #ffffff",
          padding: 80,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <Mark size={56} />
          <span style={{ fontSize: 28, fontWeight: 600, color: "#0f172a" }}>
            {subtitle}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            marginTop: 40,
          }}
        >
          <div
            style={{
              fontSize: 84,
              fontWeight: 700,
              color: "#0f172a",
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#64748b",
              marginTop: 24,
              maxWidth: 900,
            }}
          >
            Audit-ready performance management for modern teams.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 20,
            color: "#94a3b8",
          }}
        >
          <span>{SITE.url.replace("https://", "")}</span>
          <span style={{ fontFamily: "monospace" }}>v1.0</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    },
  );
}

function Mark({ size }: { size: number }) {
  const dot = size * 0.22;
  return (
    <div
      style={{
        width: size,
        height: size,
        background:
          "linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)",
        border: "1px solid #e2e8f0",
        borderRadius: size * 0.27,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow:
          "0 1px 2px rgba(15,23,42,0.05), 0 12px 32px -8px rgba(15,23,42,0.10)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: dot * 0.32,
        }}
      >
        <div style={{ display: "flex", gap: dot * 0.32 }}>
          <div
            style={{
              width: dot,
              height: dot,
              borderRadius: dot,
              background: "linear-gradient(135deg, #38bdf8, #2563eb)",
            }}
          />
          <div style={{ width: dot, height: dot, borderRadius: dot, background: "#0f172a" }} />
        </div>
        <div style={{ display: "flex", gap: dot * 0.32 }}>
          <div style={{ width: dot, height: dot, borderRadius: dot, background: "#0f172a" }} />
          <div style={{ width: dot, height: dot, borderRadius: dot, background: "#0f172a" }} />
        </div>
      </div>
    </div>
  );
}
