import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        mint: {
          DEFAULT: "#18CFC3",
          50: "#EFFDFB",
          100: "#DAFAF5",
          200: "#B0F2E9",
          300: "#7EE6D8",
          400: "#45DBC9",
          500: "#18CFC3",
          600: "#12A89F",
          700: "#0E827B",
          800: "#0B615C",
          900: "#08423F",
        },
        sky: {
          DEFAULT: "#1AA7C8",
          500: "#1AA7C8",
          600: "#1587A3",
        },
        navy: {
          DEFAULT: "#132A4C",
          50: "#EEF2F8",
          100: "#D6DFEC",
          400: "#3C5580",
          600: "#1D3963",
          700: "#16304F",
          800: "#132A4C",
          900: "#0B1A32",
        },
        softmint: {
          DEFAULT: "#EAFBF7",
          50: "#F5FEFC",
          100: "#EAFBF7",
          200: "#DBF6F0",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-pretendard)",
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "sans-serif",
        ],
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #18CFC3 0%, #1AA7C8 100%)",
        "brand-gradient-deep": "linear-gradient(135deg, #45DBC9 0%, #18CFC3 55%, #0E827B 100%)",
        "brand-radial":
          "radial-gradient(120% 120% at 20% 0%, #EAFBF7 0%, #F1FBFE 42%, #ECEEFC 78%, #E8F6FB 100%)",
        "brand-diagonal":
          "linear-gradient(135deg, #E3FBF5 0%, #DDF4FF 45%, #ECE9FF 100%)",
      },
      boxShadow: {
        soft: "0 20px 60px -18px rgba(19, 42, 76, 0.22)",
        card: "0 10px 32px -8px rgba(24, 207, 195, 0.3)",
        glow: "0 8px 24px -4px rgba(24, 207, 195, 0.45)",
      },
      keyframes: {
        "fill-bar": {
          from: { width: "0%" },
          to: { width: "var(--fill-to, 100%)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.94)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        blob: {
          "0%, 100%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(20px, -30px) scale(1.05)" },
          "66%": { transform: "translate(-15px, 15px) scale(0.97)" },
        },
      },
      animation: {
        "fill-bar": "fill-bar 1.1s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "fade-up": "fade-up 0.5s ease-out both",
        "pop-in": "pop-in 0.25s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        blob: "blob 12s infinite ease-in-out",
      },
    },
  },
  plugins: [],
};

export default config;
