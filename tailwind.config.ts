import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Kasturi theme — green band + golden-yellow sign
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
      },
    },
  },
  plugins: [],
};
export default config;
