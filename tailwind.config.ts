import type { Config } from "tailwindcss";

/**
 * Design tokens from README.md. The prototype used inline styles; we expose the
 * same values here so the UI can be rebuilt faithfully with utility classes.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "#4f46e5",
          hover: "#4338ca",
          deep: "#3730a3",
          deeper: "#312e81",
        },
        app: "#faf9f7",
        surface: "#ffffff",
        border: {
          DEFAULT: "#ececea",
          inner: "#f0efec",
          input: "#e6e4e0",
          input2: "#e2e0db",
        },
        ink: {
          DEFAULT: "#1d2129",
          2: "#2c313a",
          3: "#4a4f59",
          muted: "#6b7079",
          subtle: "#868c96",
          subtle2: "#9097a0",
          subtle3: "#9aa0ab",
          placeholder: "#aab2bd",
        },
        success: {
          DEFAULT: "#059669",
          2: "#10b981",
          deep: "#047857",
          bg: "#eafaf1",
          bg2: "#dcfce7",
          bg3: "#f0fdf4",
        },
        warning: {
          DEFAULT: "#d97706",
          2: "#ea580c",
          deep: "#c2410c",
          tint: "#e8943a",
          bg: "#fef0e7",
          bg2: "#fff7ed",
        },
        danger: {
          DEFAULT: "#dc2626",
          2: "#ef4444",
          bg: "#fef2f2",
        },
        ai: {
          DEFAULT: "#7c3aed",
          2: "#6d28d9",
          deep: "#5b21b6",
          bg: "#f3eefe",
          bg2: "#ede9fe",
        },
        indigo: {
          tint: "#eef0fc",
          tint2: "#e0e7ff",
          text: "#4338ca",
        },
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "Plus Jakarta Sans", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      borderRadius: {
        card: "16px",
        hero: "18px",
        btn: "10px",
        input: "9px",
        chip: "8px",
        pill: "20px",
        nav: "9px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,.04)",
        hero: "0 12px 30px -12px rgba(79,70,229,.55)",
      },
      keyframes: {
        "pw-fade": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pw-pop": {
          from: { opacity: "0", transform: "scale(.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        spin: { to: { transform: "rotate(360deg)" } },
      },
      animation: {
        "pw-fade": "pw-fade .3s ease both",
        "pw-pop": "pw-pop .35s ease both",
        spin: "spin 1s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
