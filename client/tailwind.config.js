/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Tokyo Night inspired - warm, readable, NOT AI-looking
        game: {
          bg: '#1a1b26',         // Warm dark background
          surface: '#24283b',    // Slightly lighter
          border: '#414868',     // Muted purple-blue
          accent: '#9ece6a',     // Success green
          muted: '#565f89',      // Muted text
        },
        team: {
          red: '#f7768e',        // Soft rose
          'red-dark': '#db4b6e',
          'red-light': '#ffb3c1',
          blue: '#7aa2f7',       // Soft blue
          'blue-dark': '#5a7fd4',
          'blue-light': '#b4c8ff',
        },
        card: {
          base: '#c0caf5',       // Light lavender for cards
          surface: '#e0e7ff',    // Warmer white
          text: '#1a1b26',       // Dark text on light cards
          neutral: '#9aa5ce',    // Neutral card
          assassin: '#1a1b26',   // Dark assassin
        },
      },
      fontFamily: {
        // Playful Creative from ui-ux-pro-max
        heading: ['Fredoka', 'sans-serif'],
        body: ['Nunito', 'sans-serif'],
      },
      borderRadius: {
        'card': '1rem',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.15)',
        'glow-red': '0 0 20px rgba(247, 118, 142, 0.4)',
        'glow-blue': '0 0 20px rgba(122, 162, 247, 0.4)',
      },
      transitionDuration: {
        // Flat Design: 150-200ms
        'fast': '150ms',
        'normal': '200ms',
      },
    },
  },
  plugins: [],
}
