import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          DEFAULT: "#FFFBE8",
          subtle: "#F2F0E2",
          border: "#D9D6C4",
        },
        ink: {
          DEFAULT: "#0B1033",
          950: "#0B1033",
          900: "#1C2350",
          800: "#262D63",
          700: "#3A4070",
          500: "#6A6F94",
        },
        lime: {
          DEFAULT: "#B6F500",
          light: "#EAF8C8",
          dark: "#1F6B00",
        },
        urgent: {
          DEFAULT: "#C62F3A",
          light: "#FFEAEA",
        },
        warning: {
          DEFAULT: "#FFB020",
          light: "#FFF4D6",
        },
        accentBlue: {
          soft: "#DDE2FF",
          flag: "#8A9BFF",
        },
      },
      fontFamily: {
        display: ["var(--font-bricolage)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      boxShadow: {
        solid: "2px 2px 0px #0B1033",
        "solid-sm": "1px 1px 0px #0B1033",
        "solid-md": "3px 3px 0px #0B1033",
        "solid-lg": "4px 4px 0px #0B1033",
        "solid-xl": "6px 6px 0px #0B1033",
        "solid-lime": "3px 3px 0px #B6F500",
      },
      borderRadius: {
        card: "16px",
        pill: "9999px",
      },
    },
  },
  plugins: [],
};

export default config;
