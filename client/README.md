# Codenames Clone - Client

Codenamesボードゲームのクライアントアプリケーション（React + Vite + Tailwind CSS + Supabase）

## 技術スタック

- **React 18**: UIフレームワーク
- **TypeScript 5**: 型安全な開発
- **Vite 5**: 高速ビルドツール
- **Tailwind CSS 3**: ユーティリティファーストCSS
- **React Router 6**: SPAルーティング
- **Zustand**: 軽量状態管理
- **Supabase**: BaaS（PostgreSQL + Realtime）

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local`ファイルを作成し、Supabaseの接続情報を設定：

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173/` にアクセス

## スクリプト

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番ビルド |
| `npm run preview` | ビルド結果のプレビュー |
| `npm run lint` | ESLintによるコード検査 |

## ディレクトリ構造

```
src/
├── components/        # コンポーネント
│   ├── ui/           # 汎用UIコンポーネント
│   ├── game/         # ゲーム関連コンポーネント
│   ├── room/         # ルーム関連コンポーネント
│   └── layout/       # レイアウトコンポーネント
├── pages/            # ページコンポーネント
├── hooks/            # カスタムフック
├── stores/           # Zustandストア
├── lib/              # ライブラリ初期化
│   └── supabase.ts   # Supabase client
├── services/         # ビジネスロジック
├── types/            # TypeScript型定義
└── utils/            # ユーティリティ関数
```

## 実装済み機能

- ✅ プロジェクト基本構造
- ✅ ルーティング設定（9ページ）
- ✅ Supabase接続設定
- ✅ 型定義（Prismaスキーマと一致）
- ✅ Tailwind CSSカスタム設定

## 次のステップ

Phase 2以降で以下を実装予定：

- [ ] ルーム作成・参加機能
- [ ] ロビー画面
- [ ] ゲームボード・カードコンポーネント
- [ ] Supabase Realtimeによる同期
- [ ] 単語パック管理
