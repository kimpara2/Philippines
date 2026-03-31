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
          DEFAULT: "#7c3aed",  // ディープパープル
          hover: "#6d28d9",
          light: "#ede9fe",
        },
        accent: {
          DEFAULT: "#f59e0b",  // アンバーゴールド
          hover: "#d97706",
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
