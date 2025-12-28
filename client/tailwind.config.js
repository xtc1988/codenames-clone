/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Risograph Print Studio テーマ
        paper: {
          cream: '#f7f3eb',       // メイン背景（温かみのある紙）
          warm: '#efe9dc',        // セカンダリ背景
          aged: '#e5ddd0',        // カードベース
        },
        riso: {
          coral: '#e85d4c',       // 赤チーム（コーラル/朱色）
          'coral-light': '#f2887c', // 赤ライト
          'coral-dark': '#c94535',  // 赤ダーク
          teal: '#1a6b6b',        // 青チーム（ディープティール）
          'teal-light': '#2a8a8a', // 青ライト
          'teal-dark': '#0f4a4a',  // 青ダーク
          mustard: '#e8b84c',     // アクセント（マスタード）
          'mustard-light': '#f0cc7a',
          navy: '#2a2725',        // テキスト（ほぼ黒）
        },
        neutral: {
          warm: '#c4bfb6',        // ニュートラルカード
          muted: '#8b8680',       // ミュートテキスト
          soft: '#d9d4cc',        // ソフトボーダー
        },
        assassin: '#2a2725',      // 暗殺者
      },
      fontFamily: {
        // Risograph スタイルフォント
        display: ["'Fraunces'", "'Playfair Display'", 'Georgia', 'serif'],
        body: ["'DM Sans'", "'Outfit'", 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '3px 3px 0 rgba(42,39,37,0.15)',
        'card-hover': '5px 5px 0 rgba(42,39,37,0.2)',
        'card-active': '1px 1px 0 rgba(42,39,37,0.1)',
        'soft': '0 4px 20px rgba(42,39,37,0.08)',
        'inner-soft': 'inset 0 2px 8px rgba(42,39,37,0.06)',
      },
      borderRadius: {
        'riso': '12px',
        'card': '8px',
      },
      backgroundImage: {
        // 紙テクスチャ（リソグラフ風）
        'paper-grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)' opacity='0.04'/%3E%3C/svg%3E\")",
        // 版ズレ効果用グラデーション
        'misprint': 'linear-gradient(135deg, transparent 0%, rgba(232,93,76,0.03) 50%, transparent 100%)',
      },
      animation: {
        'pop-in': 'popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'wiggle': 'wiggle 0.3s ease-in-out',
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
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-2deg)' },
          '75%': { transform: 'rotate(2deg)' },
        },
      },
    },
  },
  plugins: [],
}
