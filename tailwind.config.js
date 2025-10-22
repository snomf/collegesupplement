/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#0d7ff2",
        "background-light": "#f5f7f8",
        "background-dark": "#101922",
        "card-dark": "#1a242f",
        "text-dark-primary": "#ffffff",
        "text-dark-secondary": "#94a3b8",
        "border-dark": "#334155",
        "accent-green": "#22c55e",
      },
    },
  },
  plugins: [],
}
