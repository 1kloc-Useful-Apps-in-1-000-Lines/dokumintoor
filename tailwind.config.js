/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2B6CB0", // Blue
        secondary: "#68D391", // Green
        background: "#1A202C", // Dark background
        text: "#F7FAFC", // Light text
      },
    },
  },
  plugins: [],
};
