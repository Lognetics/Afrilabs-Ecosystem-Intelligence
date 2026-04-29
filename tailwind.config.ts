import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f9f4",
          100: "#dcefe2",
          200: "#bce0c8",
          300: "#8ec9a3",
          400: "#5fae7d",
          500: "#3d9462",
          600: "#2c764e",
          700: "#245d40",
          800: "#1f4a35",
          900: "#1b3d2d",
          950: "#0d2218",
        },
        accent: {
          50: "#fff8ed",
          100: "#ffefd4",
          200: "#ffdba8",
          300: "#ffbf71",
          400: "#ff9a38",
          500: "#fb7d12",
          600: "#ec6308",
          700: "#c44a09",
          800: "#9c3b10",
          900: "#7e3211",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
