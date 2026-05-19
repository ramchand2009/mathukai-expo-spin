/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#ebf7ed",
          100: "#d5eed7",
          200: "#b8e0ba",
          300: "#8dd293",
          400: "#5bb66a",
          500: "#389c4d",
          600: "#1d7a35",
          700: "#145a25",
          800: "#0e4218",
          900: "#0b3411"
        }
      }
    }
  },
  plugins: []
}
