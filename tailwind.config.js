/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        greenKaki: "#A3B18A", // Kaki clair
        greenSauge: "#B7C4A1", // Sauge
        greenEau: "#A8D5BA", // Vert d'eau léger
        greenCeladon: "#B5E2B4", // Céladon
        greenAmande: "#C1D8C3", // Amande
      },
      backgroundImage: {
        "green-gradient": "linear-gradient(to top, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};
