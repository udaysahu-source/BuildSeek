import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#B6F500",
          borderRadius: "44px",
          border: "10px solid #0B1033",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="110"
          height="110"
          fill="#0B1033"
          stroke="#0B1033"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
