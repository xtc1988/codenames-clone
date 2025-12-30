/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Forest Nature テーマ
        forest: {
          bg: '#f5f2eb',          // メイン背景（温かみのある紙）
          primary: '#2d5a3d',     // 深い緑（プライマリ）
          moss: '#6b8e50',        // 苔色（アクセント）
          bark: '#5c4a3a',        // 樹皮色（テキスト）
          cream: '#faf7f0',       // クリーム（カード背景）
        },
        // チームカラー
        team: {
          berry: '#a65d57',       // ベリー（赤チーム）
          'berry-light': '#c07970',
          'berry-dark': '#8a4a45',
          sky: '#7ca3b7',         // 空色（青チーム）
          'sky-light': '#98b9c9',
          'sky-dark': '#5c8599',
        },
        neutral: {
          warm: '#c4bfb6',        // ニュートラルカード
          muted: '#8b8680',       // ミュートテキスト
          soft: '#d9d4cc',        // ソフトボーダー
        },
        assassin: '#2a2725',      // 暗殺者
      },
      fontFamily: {
        // Forest Nature フォント
        display: ["'Libre Baskerville'", 'Georgia', 'serif'],
        body: ["'Quicksand'", 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 20px rgba(45,90,61,0.08)',
        'card-hover': '0 8px 30px rgba(45,90,61,0.15)',
        'soft': '0 10px 40px rgba(45,90,61,0.1)',
      },
      borderRadius: {
        'nature': '20px',
        'card': '12px',
      },
      backgroundImage: {
        // 木のパターン（Forest Nature風）
        'tree-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5 L35 15 L30 12 L25 15 Z' fill='%232d5a3d' opacity='0.05'/%3E%3C/svg%3E\")",
      },
      animation: {
        'pop-in': 'popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        popIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
    },
  },
  plugins: [],
}
