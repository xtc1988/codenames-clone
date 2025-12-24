# コードネームクローン

ボードゲーム「コードネーム（Codenames）」のWebクローンアプリケーション。

## 必要環境

- Docker & Docker Compose
- Node.js 20.x (ローカル開発時)

## セットアップ

```bash
# 環境変数設定
cp .env.example .env

# Docker起動
docker-compose up -d

# データベースマイグレーション
cd server
npm run prisma:migrate

# 初期データ投入
npm run prisma:seed
```

## 開発

```bash
# 全サービス起動
docker-compose up

# フロントエンド: http://localhost:5173
# バックエンド: http://localhost:3000
```

## 技術スタック

- Frontend: React 18 + TypeScript + Vite + Tailwind CSS
- Backend: Node.js + Express + TypeScript + Socket.io
- Database: PostgreSQL + Prisma
- Infrastructure: Docker Compose
