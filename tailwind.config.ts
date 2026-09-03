import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#3f7d24",
          dark: "#2c5a18",
          light: "#eef6e6",
        },
        accent: {
          DEFAULT: "#f4c421",
          dark: "#d9a400",
          light: "#fdf6d8",
        },
        page: "#f0f2e8",
        surface: "#faf9f3",
        charcoal: {
          DEFAULT: "#20241f",
          light: "#2c312a",
        },
        line: "#dfe3d7",
        muted: "#667064",
      },
      fontFamily: {
        sans: [
          "var(--font-manrope)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "sans-serif",
        ],
      },
      borderRadius: {
        card: "1.375rem",
        shell: "1.75rem",
      },
      boxShadow: {
        card: "0 12px 36px -28px rgba(32, 36, 31, 0.45)",
        shell: "0 30px 80px -45px rgba(32, 36, 31, 0.45)",
      },
    },
  },
  plugins: [],
};
export default config;
