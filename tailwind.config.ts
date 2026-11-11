import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        terminal: {
          950: "#06090e",
          900: "#0b101b",
          850: "#0f172a",
          800: "#151f38",
          750: "#1e294b",
          700: "#283563",
          border: "#1e293b",
          muted: "#64748b",
          text: "#f1f5f9",
        },
        market: {
          bull: "#10b981",
          bullMuted: "#065f46",
          bullGlow: "rgba(16, 185, 129, 0.2)",
          bear: "#f43f5e",
          bearMuted: "#881337",
          bearGlow: "rgba(244, 63, 94, 0.2)",
          accent: "#38bdf8",
          gold: "#f59e0b",
          violet: "#a855f7",
        },
      },
      fontFamily: {
        mono: [
          "JetBrains Mono",
          "SF Mono",
          "Consolas",
          "Roboto Mono",
          "monospace",
        ],
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        terminal: "0 4px 20px -2px rgba(0, 0, 0, 0.7)",
        glowBull: "0 0 15px rgba(16, 185, 129, 0.25)",
        glowBear: "0 0 15px rgba(244, 63, 94, 0.25)",
        glowAccent: "0 0 15px rgba(56, 189, 248, 0.25)",
      },
      animation: {
        pulseSlow: "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        ticker: "ticker 40s linear infinite",
      },
      keyframes: {
        ticker: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

