import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // サイトのメインカラー
        primary: {
          DEFAULT: "#db2777",  // ホットピンク
          hover: "#be185d",
          light: "#fce7f3",
        },
        accent: {
          DEFAULT: "#facc15",  // 金色
          hover: "#eab308",
        },
        dark: {
          DEFAULT: "#0f172a",  // 濃い紺（背景）
          card: "#1e293b",     // カード背景
          border: "#334155",   // ボーダー
        },
      },
      fontFamily: {
        sans: ["var(--font-noto-sans-jp)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
