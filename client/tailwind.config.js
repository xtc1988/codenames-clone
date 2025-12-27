/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // 新聞/紙風 - Newspaper/Paper Style
        paper: {
          cream: '#f5f0e1',      // メイン背景（古い紙）
          light: '#fff8e7',      // カード背景（明るい紙）
          aged: '#e8e0c8',       // エイジド紙
          border: '#2c2c2c',     // インクボーダー
        },
        ink: {
          black: '#1a1a1a',      // メインテキスト
          gray: '#4a4a4a',       // サブテキスト
          light: '#6b6b6b',      // ミュートテキスト
          red: '#c41e3a',        // 赤インク（チーム赤）
          blue: '#1e3a5f',       // 青インク（チーム青）
          sepia: '#704214',      // セピア
        },
        team: {
          red: '#c41e3a',        // クラシック赤インク
          'red-light': '#e85d75',
          'red-bg': '#fce8ec',   // 赤チーム背景
          blue: '#1e3a5f',       // クラシック青インク
          'blue-light': '#4a6fa5',
          'blue-bg': '#e8f0fc',  // 青チーム背景
        },
        card: {
          neutral: '#d4cdb7',    // ニュートラル（古い紙）
          assassin: '#1a1a1a',   // 暗殺者（黒インク）
        },
      },
      fontFamily: {
        // タイプライター風フォント
        typewriter: ["'Special Elite'", 'Courier New', 'monospace'],
        serif: ["'Playfair Display'", 'Georgia', 'serif'],
      },
      boxShadow: {
        'paper': '2px 2px 0 #2c2c2c',
        'paper-hover': '4px 4px 0 #2c2c2c',
        'inset-paper': 'inset 0 0 10px rgba(0,0,0,0.1)',
      },
      borderWidth: {
        '3': '3px',
      },
    },
  },
  plugins: [],
}
