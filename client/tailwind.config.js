/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Gaming-inspired unified dark palette
        game: {
          bg: '#0F0F23',        // Deep purple-navy background
          surface: '#1a1a2e',   // Slightly lighter purple surface
          border: '#2d2d44',    // Soft purple border
          accent: '#7C3AED',    // Vibrant purple accent
        },
        team: {
          red: '#f43f5e',       // Rose 500 - vibrant red
          'red-dark': '#be123c', // Rose 700
          'red-light': '#fda4af', // Rose 300
          blue: '#818cf8',      // Indigo 400 - brighter blue for dark bg
          'blue-dark': '#6366f1', // Indigo 500
          'blue-light': '#c7d2fe', // Indigo 200
        },
        card: {
          default: '#2d2d44',   // Soft purple-slate (matches theme)
          hover: '#3d3d5c',     // Lighter purple on hover
          text: '#e2e8f0',      // Light text on dark cards
          neutral: '#6b7280',   // Gray 500
          assassin: '#1f1f1f',  // Near black
        },
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans JP', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 8px -2px rgba(124, 58, 237, 0.15), 0 4px 12px -4px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 8px 24px -8px rgba(124, 58, 237, 0.25), 0 12px 32px -12px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [],
}
