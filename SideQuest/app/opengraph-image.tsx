import { ImageResponse } from "next/og";

export const alt = "SideQuest — Every Hackathon. One Place. Never Miss a Deadline.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 80px",
          background: "#0d1117",
          color: "#ffffff",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background: "#B6F500",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "26px",
              fontWeight: 900,
              color: "#000000",
            }}
          >
            ⚡
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "32px",
              fontWeight: 800,
              letterSpacing: "-0.5px",
            }}
          >
            sidequest.
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: "58px",
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: "-1.5px",
            }}
          >
            <div>Every hackathon. One place.</div>
            <div style={{ color: "#B6F500" }}>Never miss a deadline.</div>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "24px",
              color: "#94a3b8",
              maxWidth: "800px",
            }}
          >
            Real-time radar aggregating Devpost, Devfolio, Unstop &amp; campus challenges.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            fontSize: "18px",
            color: "#B6F500",
            fontWeight: 700,
          }}
        >
          <div>🎯 Live Deadline Radar</div>
          <div>•</div>
          <div>⚡ 100% Free for Students</div>
          <div>•</div>
          <div>🇮🇳 Built for India&apos;s Builders</div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
