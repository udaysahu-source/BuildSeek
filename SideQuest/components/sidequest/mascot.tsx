"use client";

import { useState } from "react";

const QUOTES = [
  "Adventure awaits, builder! ⚔️",
  "Don’t forget to submit your demo early! 🚀",
  "Free pizza & stickers await at offline jams! 🍕",
  "Great projects start with a simple idea! 💡",
  "Level up your skills with real projects! 🛡️",
];

export function Mascot({
  className = "",
  interactive = true,
}: {
  className?: string;
  interactive?: boolean;
}) {
  const [quoteIdx, setQuoteIdx] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);

  const handleClick = () => {
    if (!interactive) return;
    setAnimating(true);
    setQuoteIdx((prev) => (prev === null ? 0 : (prev + 1) % QUOTES.length));
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(20);
      } catch (e) {}
    }
    setTimeout(() => setAnimating(false), 600);
  };

  return (
    <div
      className={`sq-mascot-wrapper ${interactive ? "sq-mascot-interactive" : ""} ${
        animating ? "sq-mascot-bounce" : ""
      }`}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      tabIndex={interactive ? 0 : undefined}
      role={interactive ? "button" : undefined}
      aria-label={
        interactive
          ? "SideQuest Mascot. Click for advice and cheers!"
          : "SideQuest Mascot"
      }
      style={{ position: "relative", display: "inline-block", outline: "none" }}
    >
      {quoteIdx !== null && (
        <div className="sq-mascot-speech-bubble" role="status" aria-live="polite">
          {QUOTES[quoteIdx]}
        </div>
      )}
      <svg
        className={className}
        viewBox="0 0 240 240"
        fill="none"
        role="img"
        aria-hidden="true"
      >
        <ellipse cx="106" cy="218" rx="70" ry="9" fill="var(--ink)" opacity=".09" />
        <path d="M173 48V163" stroke="var(--ink)" strokeWidth="7" strokeLinecap="round" />
        <path
          d="M178 48C199 35 216 58 234 43V95C213 110 199 88 178 99Z"
          fill="var(--periwinkle)"
          stroke="var(--ink)"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <path
          d="M61 181L52 211C60 217 72 216 81 212L86 189M128 188L137 213C147 218 158 214 164 209L154 179"
          fill="var(--brand)"
          stroke="var(--ink)"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <path
          d="M164 132C178 133 185 120 181 112C176 103 168 112 159 114M51 140C29 127 26 151 43 159"
          fill="var(--brand)"
          stroke="var(--ink)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M42 157C38 125 52 107 55 79C58 41 91 30 117 46C138 58 132 74 152 93C174 114 174 146 163 171C151 199 116 205 84 196C63 190 45 181 42 157Z"
          fill="var(--brand)"
          stroke="var(--ink)"
          strokeWidth="4"
        />
        <ellipse cx="91" cy="113" rx="7" ry="11" fill="var(--ink)" />
        <ellipse cx="126" cy="113" rx="7" ry="11" fill="var(--ink)" />
        <path d="M99 138Q111 151 124 136" stroke="var(--ink)" strokeWidth="4" strokeLinecap="round" />
        <path
          d="M56 64L49 57M40 78L29 77M57 44L54 34"
          stroke="var(--ink)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
