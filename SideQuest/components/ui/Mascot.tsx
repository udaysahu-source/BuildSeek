import React from "react";

interface MascotProps {
  className?: string;
  size?: number;
  showFlag?: boolean;
  expression?: "happy" | "excited" | "sleeping" | "determined";
}

export const Mascot: React.FC<MascotProps> = ({
  className = "",
  size = 120,
  showFlag = true,
  expression = "happy",
}) => {
  const width = size;
  const height = (size * 170) / 160;

  return (
    <svg
      aria-hidden="true"
      className={className}
      width={width}
      height={height}
      viewBox="0 0 160 170"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Flag pole and Quest Flag */}
      {showFlag && (
        <>
          <line
            x1="96"
            y1="6"
            x2="96"
            y2="50"
            stroke="#0B1033"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M98 8L136 20L98 34Z"
            fill="#8A9BFF"
            stroke="#0B1033"
            strokeWidth="4"
            strokeLinejoin="round"
          />
        </>
      )}

      {/* Main Slime Body */}
      <path
        d="M24 120C14 70 50 44 84 46C122 48 150 78 140 122C134 150 108 162 80 162C50 162 28 150 24 120Z"
        fill="#B6F500"
        stroke="#0B1033"
        strokeWidth="5"
      />

      {/* Eyes & Catchlights based on expression */}
      {expression === "sleeping" ? (
        <>
          <path
            d="M54 94Q62 102 70 94"
            fill="none"
            stroke="#0B1033"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M98 94Q106 102 114 94"
            fill="none"
            stroke="#0B1033"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <circle cx="62" cy="94" r="9" fill="#0B1033" />
          <circle cx="106" cy="94" r="9" fill="#0B1033" />
          <circle cx="65" cy="91" r="3" fill="#FFFFFF" />
          <circle cx="109" cy="91" r="3" fill="#FFFFFF" />
        </>
      )}

      {/* Mouth */}
      {expression === "excited" ? (
        <path
          d="M66 114Q84 138 102 114Z"
          fill="#0B1033"
          stroke="#0B1033"
          strokeWidth="3"
        />
      ) : expression === "sleeping" ? (
        <ellipse cx="84" cy="120" rx="3" ry="5" fill="#0B1033" />
      ) : (
        <path
          d="M68 118Q84 134 100 118"
          fill="none"
          stroke="#0B1033"
          strokeWidth="5"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
};

export default Mascot;
