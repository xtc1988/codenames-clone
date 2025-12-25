# OKANAME 🎯

ボードゲーム「コードネーム（Codenames）」をベースにしたWebゲームアプリケーション。
ブラウザ上でリアルタイムマルチプレイが可能です。

## 🎮 機能

- ✅ リアルタイムマルチプレイ（最大12人）
- ✅ ルーム作成・参加（ルームコードで簡単参加）
- ✅ 公開/非公開ルーム設定
- ✅ チーム・役割選択（赤/青チーム、スパイマスター/オペレーティブ）
- ✅ スパイマスタービュー（全カードの色が見える）
- ✅ 観戦者モード（スパイマスター/オペレーティブビュー切替）
- ✅ 単語パック作成・管理（公開/非公開設定）
- ✅ デフォルト日本語単語パック（1000語）

## 🎲 ゲームルール

- 5×5の25枚の単語カードを使用
- 赤チーム（9枚）、青チーム（8枚）、一般市民（7枚）、暗殺者（1枚）
- スパイマスターが「単語 + 数字」のヒントを出す
- オペレーティブがヒントを頼りにカードを推測
- 暗殺者を選んだら即敗北
- 先に自チームのカードを全て見つけたチームの勝利

## 🛠 技術スタック

### フロントエンド
- React 18 + TypeScript
- Vite（ビルドツール）
- Tailwind CSS（スタイリング）
- Zustand（状態管理）
- React Router（ルーティング）

### バックエンド
- Supabase（データベース・リアルタイム通信）
- PostgreSQL（データベース）

### テスト
- Vitest（ユニットテスト）
- Playwright（E2Eテスト）

## 📋 必要環境

- Node.js 20.x 以上
- npm または yarn
- Supabaseアカウント（無料プランで可）

## 🚀 セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/xtc1988/codenames-clone.git
cd codenames-clone
```

### 2. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com/) にアクセスしてプロジェクトを作成
2. Project Settings > API から以下の情報を取得：
   - `Project URL`
   - `anon public` API Key

### 3. データベースマイグレーション

Supabase の SQL Editor で以下のマイグレーションを実行：

```bash
# server/prisma/migrations/ 内の各マイグレーションファイルを順番に実行
```

または、Prisma経由で実行：

```bash
cd server
npm install
npx prisma migrate deploy
npx prisma db seed
```

### 4. 環境変数の設定

#### クライアント側（client/.env）

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### サーバー側（server/.env）

```env
DATABASE_URL=your_supabase_database_url
DIRECT_URL=your_supabase_direct_database_url
```

### 5. 依存関係のインストールと起動

```bash
# クライアント
cd client
npm install
npm run dev
# => http://localhost:5173

# サーバー（別ターミナル）
cd server
npm install
npm run dev
# => http://localhost:3000
```

## 🧪 テスト

### ユニットテスト

```bash
cd client
npm run test
```

### E2Eテスト

```bash
cd client
npm run test:e2e
```

## 📦 デプロイ（Vercel）

### 1. Vercelプロジェクトの作成

```bash
# Vercel CLIをインストール
npm i -g vercel

# クライアントをデプロイ
cd client
vercel
```

### 2. 環境変数の設定

Vercelダッシュボードで以下の環境変数を設定：

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### 3. デプロイ

```bash
vercel --prod
```

## 📁 プロジェクト構成

```
okaname/
├── client/                  # フロントエンド
│   ├── src/
│   │   ├── components/      # UIコンポーネント
│   │   ├── pages/           # ページコンポーネント
│   │   ├── hooks/           # カスタムフック
│   │   ├── services/        # API・Supabase通信
│   │   ├── stores/          # Zustand状態管理
│   │   └── types/           # 型定義
│   ├── e2e/                 # E2Eテスト
│   └── __tests__/           # ユニットテスト
│
└── server/                  # バックエンド（Prismaスキーマ・マイグレーション）
    └── prisma/
        ├── schema.prisma
        ├── migrations/
        └── seed.ts
```

## 🤝 コントリビューション

プルリクエストを歓迎します！

## 📄 ライセンス

MIT License

## 🎯 今後の拡張予定

- [ ] ユーザー登録・ログイン機能
- [ ] ゲーム履歴・統計機能
- [ ] AIスパイマスター（LLMでヒント自動生成）
- [ ] 英語版単語パック追加
- [ ] カスタムテーマ（デュエット、アンダーカバー等）
- [ ] モバイルアプリ対応
