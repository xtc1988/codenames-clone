/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // スパイ・ノワール - Spy Noir / Cold War Espionage
        noir: {
          deep: '#0d0c0a',        // 深い闇（メイン背景）
          smoke: '#1a1612',       // 煙草の煙
          leather: '#2c2a25',     // エイジドレザー
          shadow: '#3d3a33',      // 影
        },
        dossier: {
          manila: '#d4c4a8',      // マニラフォルダ
          aged: '#e8dcc4',        // 古びた書類
          cream: '#f0e6d2',       // クリーム紙
          stain: '#c4b08a',       // コーヒー染み
        },
        stamp: {
          red: '#8b0000',         // 極秘スタンプ（赤）
          'red-glow': '#b31b1b',  // 赤ハイライト
          'red-bg': '#2a1515',    // 赤チーム背景
        },
        ink: {
          navy: '#1a365d',        // ネイビーインク（青）
          'navy-glow': '#2d5a9e', // 青ハイライト
          'navy-bg': '#0f1a2a',   // 青チーム背景
        },
        brass: {
          gold: '#c9a227',        // 真鍮/ゴールド
          tarnish: '#8b7355',     // くすんだ真鍮
          shine: '#dfc35a',       // 輝く真鍮
        },
        neutral: {
          card: '#6b6356',        // ニュートラルカード
          text: '#a09585',        // ミュートテキスト
        },
        assassin: '#0a0908',      // 暗殺者（漆黒）
      },
      fontFamily: {
        // スパイ風フォント
        display: ["'Bebas Neue'", 'Impact', 'sans-serif'],
        mono: ["'IBM Plex Mono'", 'Consolas', 'monospace'],
        hand: ["'Permanent Marker'", 'cursive'],
      },
      boxShadow: {
        'dossier': '4px 4px 0 rgba(0,0,0,0.4), 8px 8px 15px rgba(0,0,0,0.3)',
        'dossier-hover': '6px 6px 0 rgba(0,0,0,0.5), 12px 12px 20px rgba(0,0,0,0.4)',
        'stamp': 'inset 0 0 10px rgba(139,0,0,0.3)',
        'classified': '0 0 20px rgba(201,162,39,0.2)',
        'inner-glow': 'inset 0 0 30px rgba(0,0,0,0.5)',
      },
      borderWidth: {
        '3': '3px',
      },
      backgroundImage: {
        'film-grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E\")",
        'paper-texture': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paper'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.04' numOctaves='5'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paper)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
      animation: {
        'stamp-appear': 'stampAppear 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'typewriter': 'typewriter 0.1s steps(1)',
        'flicker': 'flicker 3s infinite',
      },
      keyframes: {
        stampAppear: {
          '0%': { transform: 'scale(2) rotate(-5deg)', opacity: '0' },
          '100%': { transform: 'scale(1) rotate(-2deg)', opacity: '1' },
        },
        typewriter: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.95' },
          '75%': { opacity: '0.98' },
        },
      },
    },
  },
  plugins: [],
}
