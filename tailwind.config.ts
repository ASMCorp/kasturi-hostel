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
          DEFAULT: "#7c2d5c",
          dark: "#5c1f44",
          light: "#f7ecf3",
        },
      },
    },
  },
  plugins: [],
};
export default config;
