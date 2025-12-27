/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Modern refined palette
        game: {
          bg: '#0f172a',        // Slate 900 - deep dark background
          surface: '#1e293b',   // Slate 800 - card surfaces
          border: '#334155',    // Slate 700 - borders
        },
        team: {
          red: '#f43f5e',       // Rose 500 - vibrant but refined red
          'red-dark': '#be123c', // Rose 700
          'red-light': '#fda4af', // Rose 300
          blue: '#6366f1',      // Indigo 500 - modern blue
          'blue-dark': '#4338ca', // Indigo 700
          'blue-light': '#a5b4fc', // Indigo 300
        },
        card: {
          default: '#f8fafc',   // Slate 50 - unrevealed card
          hover: '#e2e8f0',     // Slate 200
          neutral: '#94a3b8',   // Slate 400
          assassin: '#18181b',  // Zinc 900
        },
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans JP', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 8px -2px rgba(0, 0, 0, 0.1), 0 4px 12px -4px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 8px 24px -8px rgba(0, 0, 0, 0.15), 0 12px 32px -12px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
}
