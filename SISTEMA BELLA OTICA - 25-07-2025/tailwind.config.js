/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        border: "#E5E7EB",
        background: "#ffffff",
        ring: {
          50: "rgba(59, 130, 246, 0.5)",
        }
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
}
