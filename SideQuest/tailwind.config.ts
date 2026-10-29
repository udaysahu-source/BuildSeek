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
        paper: "#F2F4F7",
        navy: {
          DEFAULT: "#0F1B33",
          950: "#070E1C",
          900: "#0F1B33",
          850: "#13223F",
          800: "#1A2D54",
          700: "#284278",
          border: "#22355A",
          surface: "#14223E",
        },
        signal: {
          yellow: "#FFC629",
          yellowMuted: "#D9A518",
        },
        coral: {
          DEFAULT: "#D83A1F",
          navy: "#FF8A6B",
          light: "#D83A1F",
          subtle: "#FFF1EE",
        },
        boardGreen: {
          DEFAULT: "#17794A",
          navy: "#6EDDA0",
          light: "#17794A",
          subtle: "#EDF9F2",
        },
        mutedText: "#4A5670",

        // Backward compatibility
        parchment: {
          DEFAULT: "#F2F4F7",
          subtle: "#E7EAF0",
          border: "#D1D6E2",
        },
        ink: {
          DEFAULT: "#0F1B33",
          950: "#070E1C",
          900: "#0F1B33",
          800: "#1A2D54",
          700: "#284278",
          500: "#4A5670",
        },
        lime: {
          DEFAULT: "#FFC629",
          light: "#FFF4D1",
          dark: "#B38600",
        },
        urgent: {
          DEFAULT: "#D83A1F",
          light: "#FFF1EE",
        },
        warning: {
          DEFAULT: "#FFC629",
          light: "#FFF4D1",
        },
        accentBlue: {
          soft: "#DDE6F5",
          flag: "#3B6BC7",
        },
      },
      fontFamily: {
        display: ["var(--font-barlow-condensed)", "var(--font-bricolage)", "sans-serif"],
        condensed: ["var(--font-barlow-condensed)", "sans-serif"],
        sans: ["var(--font-barlow)", "var(--font-inter)", "sans-serif"],
      },
      boxShadow: {
        board: "0 2px 8px rgba(15, 27, 51, 0.08)",
        "board-lg": "0 8px 24px rgba(15, 27, 51, 0.14)",
        solid: "2px 2px 0px #0F1B33",
        "solid-sm": "1px 1px 0px #0F1B33",
        "solid-md": "3px 3px 0px #0F1B33",
        "solid-lg": "4px 4px 0px #0F1B33",
        "solid-yellow": "3px 3px 0px #FFC629",
      },
      borderRadius: {
        control: "6px",
        panel: "14px",
        card: "14px",
        pill: "9999px",
      },
      borderWidth: {
        rule: "4px",
      },
    },
  },
  plugins: [],
};

export default config;
