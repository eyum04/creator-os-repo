/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#2D2D2D",
        accent: "#7C9A7E",
        surface: "#383838",
        textPrimary: "#F5F5F0",
        textSecondary: "#A0A0A0",
        border: "#444444",
      },
    },
  },
  plugins: [],
}