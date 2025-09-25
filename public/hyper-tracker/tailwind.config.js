/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: [
          "Roboto Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
      colors: {
        ink: "#0b0b0c",
        card: "#111214",
        accent: "#b9b39a",
        accent2: "#e2d7b7",
        warn: "#d8a657",
        danger: "#d65a5a",
        moss: "#2a2d27",
        soil: "#151719",
        sand: "#cfc8ad",
      },
    },
  },
  plugins: [],
};
