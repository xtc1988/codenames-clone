/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        red: {
          team: '#ef4444',
        },
        blue: {
          team: '#3b82f6',
        },
        neutral: {
          card: '#f3f4f6',
        },
        assassin: {
          card: '#1f2937',
        },
      },
    },
  },
  plugins: [],
}
