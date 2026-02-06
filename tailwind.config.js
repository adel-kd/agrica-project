/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#ecfdf3",
          100: "#d1fadf",
          500: "#16a34a",
          600: "#15803d",
          700: "#166534"
        }
      }
    }
  },
  plugins: []
};

