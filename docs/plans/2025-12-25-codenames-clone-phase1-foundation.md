# コードネームクローン Phase 1: プロジェクト基盤 実装計画

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Dockerベースの開発環境とTypeScript基盤を構築し、基本的なAPI/DBセットアップを完了する

**Architecture:** モノレポ構成でclient（React）とserver（Express）を分離。PostgreSQL + Prismaでデータ永続化。Docker Composeでローカル開発環境を構築。

**Tech Stack:**
- Backend: Node.js 20, Express 4, TypeScript 5, Prisma 5, Socket.io 4
- Frontend: React 18, Vite 5, TypeScript 5, Tailwind CSS 3
- Database: PostgreSQL 15
- Infrastructure: Docker, Docker Compose

---

## Task 1: プロジェクト基本構造とGit初期化

**Files:**
- Create: `.gitignore`
- Create: `README.md`
- Create: `docker-compose.yml`
- Create: `.env.example`

**Step 1: .gitignoreを作成**

```bash
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment
.env
.env.local

# Build
dist/
build/

# IDEs
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Database
*.sqlite
*.db

# Logs
logs/
*.log
EOF
```

**Step 2: README.mdを作成**

```bash
cat > README.md << 'EOF'
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
EOF
```

**Step 3: docker-compose.ymlを作成**

```yaml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: codenames-db
    environment:
      POSTGRES_USER: codenames
      POSTGRES_PASSWORD: codenames_dev
      POSTGRES_DB: codenames
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U codenames"]
      interval: 10s
      timeout: 5s
      retries: 5

  server:
    build:
      context: ./server
      dockerfile: Dockerfile
    container_name: codenames-server
    environment:
      DATABASE_URL: postgresql://codenames:codenames_dev@postgres:5432/codenames
      PORT: 3000
      NODE_ENV: development
    ports:
      - "3000:3000"
    volumes:
      - ./server:/app
      - /app/node_modules
    depends_on:
      postgres:
        condition: service_healthy
    command: npm run dev

  client:
    build:
      context: ./client
      dockerfile: Dockerfile
    container_name: codenames-client
    environment:
      VITE_API_URL: http://localhost:3000
      VITE_WS_URL: ws://localhost:3000
    ports:
      - "5173:5173"
    volumes:
      - ./client:/app
      - /app/node_modules
    command: npm run dev

volumes:
  postgres_data:
EOF
```

**Step 4: .env.exampleを作成**

```bash
cat > .env.example << 'EOF'
# Database
DATABASE_URL=postgresql://codenames:codenames_dev@localhost:5432/codenames

# Server
PORT=3000
NODE_ENV=development

# Client
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
EOF
```

**Step 5: Gitリポジトリ初期化**

```bash
git init
git add .gitignore README.md docker-compose.yml .env.example
git commit -m "chore: プロジェクト初期セットアップ"
```

---

## Task 2: サーバーサイド基本構造

**Files:**
- Create: `server/package.json`
- Create: `server/tsconfig.json`
- Create: `server/Dockerfile`
- Create: `server/.dockerignore`
- Create: `server/src/index.ts`
- Create: `server/src/app.ts`
- Create: `server/src/config/index.ts`

**Step 1: serverディレクトリ作成とpackage.json**

```bash
mkdir -p server/src/config server/src/routes server/src/controllers server/src/services server/src/socket server/src/types server/src/utils
cd server
```

```json
cat > package.json << 'EOF'
{
  "name": "codenames-server",
  "version": "1.0.0",
  "description": "Codenames clone backend server",
  "main": "dist/index.js",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:seed": "tsx prisma/seed.ts",
    "prisma:studio": "prisma studio"
  },
  "keywords": ["codenames", "game", "websocket"],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.6.1",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "@prisma/client": "^5.8.0",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/uuid": "^9.0.7",
    "typescript": "^5.3.3",
    "tsx": "^4.7.0",
    "prisma": "^5.8.0",
    "@types/jest": "^29.5.11",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.1"
  }
}
EOF
```

**Step 2: tsconfig.jsonを作成**

```json
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF
```

**Step 3: Dockerfileを作成**

```dockerfile
cat > Dockerfile << 'EOF'
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "dev"]
EOF
```

**Step 4: .dockerignoreを作成**

```bash
cat > .dockerignore << 'EOF'
node_modules
npm-debug.log
dist
.env
.git
EOF
```

**Step 5: 基本設定ファイル（config/index.ts）を作成**

```typescript
cat > src/config/index.ts << 'EOF'
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  },
};

export default config;
EOF
```

**Step 6: Expressアプリケーション（app.ts）を作成**

```typescript
cat > src/app.ts << 'EOF'
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import config from './config';

const app: Express = express();

// Middleware
app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// API routes will be added here
app.get('/api', (_req: Request, res: Response) => {
  res.json({ message: 'Codenames API Server' });
});

export default app;
EOF
```

**Step 7: エントリーポイント（index.ts）を作成**

```typescript
cat > src/index.ts << 'EOF'
import http from 'http';
import app from './app';
import config from './config';

const server = http.createServer(app);

server.listen(config.port, () => {
  console.log(`[Server] Running on http://localhost:${config.port}`);
  console.log(`[Server] Environment: ${config.nodeEnv}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('[Server] Server closed');
    process.exit(0);
  });
});
EOF
```

**Step 8: 依存関係をインストール（ローカルテスト用）**

```bash
npm install
```

**Step 9: ローカルでサーバー起動テスト**

```bash
# DATABASE_URLを一時的に設定してテスト
DATABASE_URL="postgresql://codenames:codenames_dev@localhost:5432/codenames" npm run dev
```

期待結果: コンソールに "[Server] Running on http://localhost:3000" が表示される

**Step 10: curlでヘルスチェック**

```bash
curl http://localhost:3000/health
```

期待結果: `{"status":"ok","timestamp":"...","environment":"development"}`

**Step 11: Ctrl+Cでサーバー停止後、コミット**

```bash
git add .
git commit -m "feat(server): Express + TypeScript 基本セットアップ"
```

---

## Task 3: Prisma セットアップとスキーマ定義

**Files:**
- Create: `server/prisma/schema.prisma`
- Create: `server/prisma/seed.ts`

**Step 1: Prismaディレクトリ作成**

```bash
cd server
mkdir -p prisma
```

**Step 2: schema.prismaを作成**

```prisma
cat > prisma/schema.prisma << 'EOF'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model WordPack {
  id                String   @id @default(uuid())
  name              String   @db.VarChar(100)
  description       String?  @db.Text
  isPublic          Boolean  @default(false) @map("is_public")
  isDefault         Boolean  @default(false) @map("is_default")
  language          String   @default("ja") @db.VarChar(10)
  creatorSessionId  String?  @map("creator_session_id") @db.VarChar(255)
  createdAt         DateTime @default(now()) @map("created_at")

  words             Word[]
  rooms             Room[]

  @@map("word_packs")
}

model Word {
  id          String   @id @default(uuid())
  wordPackId  String   @map("word_pack_id")
  word        String   @db.VarChar(100)

  wordPack    WordPack @relation(fields: [wordPackId], references: [id], onDelete: Cascade)

  @@map("words")
  @@index([wordPackId])
}

model Room {
  id            String       @id @default(uuid())
  code          String       @unique @db.VarChar(6)
  name          String       @db.VarChar(100)
  status        RoomStatus   @default(WAITING)
  isPublic      Boolean      @default(true) @map("is_public")
  wordPackId    String       @map("word_pack_id")
  currentTurn   Team?        @map("current_turn")
  winner        Team?
  timerSeconds  Int?         @map("timer_seconds")
  createdAt     DateTime     @default(now()) @map("created_at")
  updatedAt     DateTime     @updatedAt @map("updated_at")

  wordPack      WordPack     @relation(fields: [wordPackId], references: [id])
  players       Player[]
  cards         Card[]
  hints         Hint[]

  @@map("rooms")
  @@index([code])
  @@index([status])
}

model Player {
  id             String         @id @default(uuid())
  roomId         String         @map("room_id")
  nickname       String         @db.VarChar(50)
  team           Team           @default(SPECTATOR)
  role           PlayerRole?
  sessionId      String         @map("session_id") @db.VarChar(255)
  isHost         Boolean        @default(false) @map("is_host")
  spectatorView  SpectatorView  @default(OPERATIVE) @map("spectator_view")
  createdAt      DateTime       @default(now()) @map("created_at")

  room           Room           @relation(fields: [roomId], references: [id], onDelete: Cascade)
  hintsGiven     Hint[]
  cardsRevealed  Card[]

  @@map("players")
  @@index([roomId])
  @@index([sessionId])
}

model Card {
  id          String      @id @default(uuid())
  roomId      String      @map("room_id")
  word        String      @db.VarChar(100)
  position    Int
  type        CardType
  isRevealed  Boolean     @default(false) @map("is_revealed")
  revealedBy  String?     @map("revealed_by")

  room        Room        @relation(fields: [roomId], references: [id], onDelete: Cascade)
  revealer    Player?     @relation(fields: [revealedBy], references: [id])

  @@map("cards")
  @@index([roomId])
}

model Hint {
  id        String   @id @default(uuid())
  roomId    String   @map("room_id")
  playerId  String   @map("player_id")
  word      String   @db.VarChar(100)
  count     Int
  team      Team
  createdAt DateTime @default(now()) @map("created_at")

  room      Room     @relation(fields: [roomId], references: [id], onDelete: Cascade)
  player    Player   @relation(fields: [playerId], references: [id])

  @@map("hints")
  @@index([roomId])
}

enum RoomStatus {
  WAITING
  PLAYING
  FINISHED
}

enum Team {
  RED
  BLUE
  SPECTATOR
}

enum PlayerRole {
  SPYMASTER
  OPERATIVE
}

enum SpectatorView {
  SPYMASTER
  OPERATIVE
}

enum CardType {
  RED
  BLUE
  NEUTRAL
  ASSASSIN
}
EOF
```

**Step 3: seed.tsを作成（日本語デフォルト単語1000語）**

```typescript
cat > prisma/seed.ts << 'EOF'
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 日本語デフォルト単語（カテゴリ別に1000語）
const defaultJapaneseWords = [
  // 自然・動物 (100語)
  '犬', '猫', '鳥', '魚', '馬', '牛', '羊', '豚', '鶏', '猿',
  '象', 'ライオン', '虎', '熊', 'パンダ', 'キリン', 'シマウマ', 'カンガルー', 'コアラ', 'ペンギン',
  '花', '木', '草', '森', '山', '川', '海', '空', '雲', '雨',
  '雪', '風', '太陽', '月', '星', '地球', '火', '水', '土', '石',
  '葉', '根', '枝', '実', '種', '芽', '果物', '野菜', '米', '麦',
  '桜', '梅', '松', '竹', 'バラ', 'チューリップ', 'ひまわり', '蝶', '蜂', '蟻',
  '蛇', 'カエル', 'カメ', 'トカゲ', 'ワニ', 'イルカ', 'クジラ', 'サメ', 'タコ', 'イカ',
  '貝', 'カニ', 'エビ', '海藻', 'サンゴ', '池', '湖', '滝', '谷', '丘',
  '島', '半島', '岬', '砂漠', '氷', '霧', '虹', '雷', '嵐', '台風',
  '地震', '火山', '噴火', '温泉', '鉱物', '金', '銀', '銅', '鉄', 'ダイヤモンド',

  // 食べ物・飲み物 (100語)
  'パン', 'ご飯', '麺', 'ラーメン', 'うどん', 'そば', 'パスタ', 'ピザ', 'ハンバーガー', 'サンドイッチ',
  '寿司', '刺身', '天ぷら', '焼き肉', 'ステーキ', '焼き魚', '煮物', '味噌汁', 'カレー', 'シチュー',
  'サラダ', 'スープ', '卵', 'チーズ', 'バター', '牛乳', 'ヨーグルト', 'アイス', 'ケーキ', 'クッキー',
  'チョコレート', 'キャンディ', 'ガム', 'ポテト', 'フライ', '唐揚げ', 'コロッケ', '餃子', '春巻き', 'シュウマイ',
  '豆腐', '納豆', '味噌', '醤油', 'ソース', 'マヨネーズ', 'ケチャップ', '砂糖', '塩', '胡椒',
  'りんご', 'みかん', 'バナナ', 'ぶどう', 'いちご', 'メロン', 'スイカ', '桃', '梨', '柿',
  'レモン', 'オレンジ', 'グレープフルーツ', 'キウイ', 'パイナップル', 'マンゴー', 'トマト', 'きゅうり', 'レタス', 'キャベツ',
  '人参', '玉ねぎ', 'じゃがいも', 'ピーマン', 'なす', '大根', 'ほうれん草', 'ブロッコリー', 'カボチャ', 'とうもろこし',
  'コーヒー', '紅茶', '緑茶', 'ジュース', 'コーラ', '水', 'ビール', 'ワイン', '日本酒', '焼酎',
  'ウイスキー', 'カクテル', 'ラテ', 'エスプレッソ', 'ミルク', 'ソーダ', 'お茶', '抹茶', '麦茶', 'ココア',

  // 日用品・家具 (100語)
  '机', '椅子', 'テーブル', 'ベッド', 'ソファ', '本棚', 'タンス', '鏡', '時計', 'ランプ',
  'カーテン', 'カーペット', 'クッション', '枕', '布団', 'シーツ', '毛布', 'タオル', '石鹸', 'シャンプー',
  '歯ブラシ', '歯磨き粉', 'ティッシュ', 'トイレットペーパー', 'ゴミ箱', '掃除機', 'ほうき', 'ちりとり', 'バケツ', '雑巾',
  '洗剤', 'スポンジ', '皿', 'コップ', '茶碗', '箸', 'スプーン', 'フォーク', 'ナイフ', 'フライパン',
  '鍋', 'やかん', '炊飯器', '冷蔵庫', '電子レンジ', 'オーブン', 'トースター', 'ミキサー', 'ポット', 'ボウル',
  'まな板', '包丁', 'おたま', '缶切り', '栓抜き', 'ザル', 'フライ返し', 'トング', '計量カップ', '計量スプーン',
  'ハンガー', '洗濯機', '乾燥機', 'アイロン', '物干し', 'バスタオル', '洗面器', 'ドライヤー', '扇風機', 'エアコン',
  'ストーブ', 'こたつ', '電気毛布', '加湿器', '除湿器', '空気清浄機', 'テレビ', 'リモコン', 'ラジオ', 'スピーカー',
  '電話', '携帯', 'スマホ', 'パソコン', 'キーボード', 'マウス', 'モニター', 'プリンター', '充電器', 'バッテリー',
  '電球', '電池', 'コンセント', 'スイッチ', 'ドア', '窓', '鍵', 'ドアノブ', 'ハンドル', 'ネジ',

  // 文房具・本 (50語)
  '本', '雑誌', '新聞', '辞書', '教科書', 'ノート', 'ペン', '鉛筆', '消しゴム', '定規',
  'ハサミ', 'のり', 'テープ', 'ホッチキス', 'クリップ', 'ファイル', '封筒', '切手', 'はがき', '手紙',
  '地図', 'カレンダー', '手帳', 'メモ', '付箋', 'マーカー', 'クレヨン', '絵の具', '筆', 'パレット',
  'スケッチブック', '漫画', '小説', '詩集', '図鑑', '写真集', 'アルバム', '日記', 'レシート', '領収書',
  '契約書', '書類', 'フォルダ', 'バインダー', 'インク', '修正液', 'カッター', '下敷き', 'コンパス', '分度器',

  // 乗り物・交通 (50語)
  '車', 'バス', 'トラック', 'タクシー', '電車', '地下鉄', '新幹線', '飛行機', 'ヘリコプター', '船',
  'ボート', 'ヨット', '潜水艦', '自転車', 'バイク', 'スクーター', 'トラクター', 'ブルドーザー', 'クレーン', 'フォークリフト',
  '救急車', '消防車', 'パトカー', 'ロケット', '人工衛星', '気球', 'パラシュート', 'グライダー', 'スケートボード', 'ローラースケート',
  '道路', '高速道路', '橋', 'トンネル', '駅', '空港', '港', '信号', '標識', '横断歩道',
  '駐車場', 'ガソリンスタンド', '線路', 'プラットフォーム', '改札', '切符', '定期券', 'パスポート', 'チケット', 'シートベルト',

  // 建物・場所 (50語)
  '家', 'ビル', 'マンション', 'アパート', '学校', '病院', '図書館', '博物館', '美術館', '劇場',
  '映画館', 'レストラン', 'カフェ', 'ホテル', '旅館', '温泉', '銀行', '郵便局', '警察署', '消防署',
  '市役所', '役場', '裁判所', '刑務所', '工場', '倉庫', '店', 'スーパー', 'コンビニ', 'デパート',
  '市場', '商店街', 'モール', '公園', '動物園', '水族館', '遊園地', 'プール', '体育館', 'スタジアム',
  '神社', '寺', '教会', '城', '塔', '門', '壁', '屋根', '階段', '廊下',

  // 人・職業 (80語)
  '人', '男', '女', '子供', '赤ちゃん', '少年', '少女', '青年', '大人', '老人',
  '家族', '父', '母', '兄', '弟', '姉', '妹', '祖父', '祖母', '息子',
  '娘', '夫', '妻', '友達', '恋人', '先生', '生徒', '学生', '先輩', '後輩',
  '医者', '看護師', 'パイロット', 'キャビンアテンダント', '警察官', '消防士', '自衛隊', '弁護士', '裁判官', '政治家',
  '社長', '会社員', '店員', 'ウェイター', 'コック', 'パン屋', '農家', '漁師', '大工', '建築家',
  'エンジニア', 'プログラマー', 'デザイナー', '芸術家', '画家', '彫刻家', '音楽家', '歌手', 'ダンサー', '俳優',
  'モデル', 'アナウンサー', '記者', '作家', '詩人', 'カメラマン', '科学者', '研究者', '教授', 'スポーツ選手',
  'サッカー選手', '野球選手', 'テニス選手', '水泳選手', 'ランナー', 'ボクサー', 'レスラー', '力士', '騎手', 'ドライバー',

  // 身体・衣服 (80語)
  '頭', '顔', '目', '鼻', '口', '耳', '歯', '舌', '髪', '眉',
  'まつげ', '頬', '顎', '首', '肩', '腕', '肘', '手', '指', '爪',
  '胸', '背中', '腰', 'お腹', '足', '膝', 'かかと', '爪先', '心臓', '肺',
  '胃', '肝臓', '腎臓', '脳', '骨', '筋肉', '血', '皮膚', '神経', '細胞',
  'シャツ', 'Tシャツ', 'ブラウス', 'セーター', 'カーディガン', 'ジャケット', 'コート', 'ダウン', 'パーカー', 'ベスト',
  'ズボン', 'ジーンズ', 'スカート', 'ワンピース', 'ドレス', 'スーツ', '制服', '浴衣', '着物', 'パジャマ',
  '下着', '靴下', 'ストッキング', 'タイツ', 'マフラー', '手袋', '帽子', 'ヘルメット', 'ベルト', 'ネクタイ',
  '靴', 'スニーカー', 'ブーツ', 'サンダル', 'スリッパ', 'バッグ', 'リュック', '財布', '傘', 'メガネ',

  // スポーツ・趣味 (70語)
  'サッカー', '野球', 'バスケ', 'バレー', 'テニス', 'ゴルフ', '卓球', 'バドミントン', 'ボクシング', 'レスリング',
  '柔道', '剣道', '空手', '弓道', '相撲', 'ラグビー', 'アメフト', 'ホッケー', 'スケート', 'スキー',
  'スノボ', 'サーフィン', 'ダイビング', '水泳', 'マラソン', '短距離', '走り幅跳び', '走り高跳び', '砲丸投げ', 'やり投げ',
  '体操', '新体操', 'トランポリン', 'フィギュアスケート', '登山', 'キャンプ', '釣り', 'サイクリング', 'ジョギング', 'ヨガ',
  '音楽', 'ピアノ', 'ギター', 'ドラム', 'ベース', 'バイオリン', 'フルート', 'サックス', 'トランペット', 'ハーモニカ',
  '絵', '絵画', '写真', '映画', 'アニメ', 'ゲーム', '読書', '料理', 'ガーデニング', '手芸',
  '編み物', '刺繍', '工作', 'プラモデル', 'フィギュア', 'コレクション', 'パズル', '将棋', '囲碁', 'チェス',

  // 自然現象・時間 (50語)
  '春', '夏', '秋', '冬', '朝', '昼', '夕方', '夜', '明け方', '正午',
  '深夜', '今日', '昨日', '明日', '今週', '先週', '来週', '今月', '先月', '来月',
  '今年', '去年', '来年', '世紀', '時代', '過去', '現在', '未来', '時間', '分',
  '秒', '瞬間', '永遠', '日', '週', '月', '年', '季節', '天気', '気温',
  '湿度', '気圧', '晴れ', '曇り', '雨', '雪', '霧', '霜', '露', '氷',

  // 感情・状態 (50語)
  '幸せ', '喜び', '楽しい', '嬉しい', '笑顔', '笑い', '満足', '安心', '平和', '希望',
  '悲しい', '涙', '泣く', '怒り', '怒る', '不安', '心配', '恐怖', '怖い', '驚き',
  '疲れ', '眠い', '退屈', '寂しい', '孤独', '恥ずかしい', '緊張', '興奮', '感動', '愛',
  '憎しみ', '嫉妬', '羨望', 'プライド', '後悔', '反省', '決意', '勇気', '優しさ', '思いやり',
  '親切', '正直', '誠実', '嘘', '秘密', '約束', '信頼', '裏切り', '許し', '感謝',

  // 抽象概念 (50語)
  '生命', '命', '死', '誕生', '成長', '老化', '健康', '病気', 'けが', '治療',
  '平和', '戦争', '勝利', '敗北', '成功', '失敗', '努力', '才能', '運', 'チャンス',
  '問題', '解決', '質問', '答え', '理由', '原因', '結果', '影響', '変化', '進化',
  '革命', '歴史', '文化', '伝統', '習慣', 'ルール', '法律', '権利', '義務', '自由',
  '正義', '悪', '善', '美', '真実', '嘘', '夢', '現実', '想像', '創造',

  // 学問・科学 (50語)
  '数学', '算数', '計算', '数字', 'ゼロ', '一', '二', '三', '四', '五',
  '足し算', '引き算', '掛け算', '割り算', '分数', '小数', '方程式', '幾何学', '三角形', '四角形',
  '円', '直線', '角度', '面積', '体積', '重さ', '長さ', '高さ', '幅', '深さ',
  '物理', '化学', '生物', '地理', '歴史', '国語', '英語', '社会', '理科', '体育',
  '音楽', '美術', '技術', '家庭科', '原子', '分子', '元素', 'エネルギー', '重力', '電気',

  // 色・形 (50語)
  '赤', '青', '黄', '緑', '白', '黒', '灰色', 'ピンク', '紫', 'オレンジ',
  '茶色', '金色', '銀色', '虹色', '透明', '明るい', '暗い', '濃い', '薄い', 'カラフル',
  '丸', '三角', '四角', '星', 'ハート', 'ダイヤ', 'スペード', 'クローバー', '楕円', '長方形',
  '正方形', '六角形', '八角形', '立方体', '球', '円柱', '円錐', 'ピラミッド', '大きい', '小さい',
  '長い', '短い', '太い', '細い', '広い', '狭い', '高い', '低い', '深い', '浅い',

  // 数・量・位置 (50語)
  '多い', '少ない', '全部', '半分', '一部', '最初', '最後', '真ん中', '中心', '端',
  '上', '下', '左', '右', '前', '後ろ', '横', '斜め', '内側', '外側',
  '北', '南', '東', '西', '中央', '周り', '近く', '遠く', '隣', '向かい',
  '一つ', '二つ', '三つ', '四つ', '五つ', '十', '百', '千', '万', '億',
  '第一', '第二', '第三', '倍', '半分', '三分の一', '四分の一', 'パーセント', '全体', '部分',

  // 動作・動詞 (80語)
  '走る', '歩く', '止まる', '座る', '立つ', '寝る', '起きる', '飛ぶ', '跳ぶ', '泳ぐ',
  '食べる', '飲む', '噛む', '飲み込む', '見る', '聞く', '話す', '言う', '叫ぶ', 'ささやく',
  '読む', '書く', '描く', '消す', '切る', '貼る', '折る', '破る', '開ける', '閉める',
  '持つ', '置く', '取る', '渡す', '受け取る', '投げる', '蹴る', '打つ', '押す', '引く',
  '運ぶ', '運転する', '乗る', '降りる', '登る', '下りる', '入る', '出る', '行く', '来る',
  '帰る', '戻る', '進む', '曲がる', '回る', 'ジャンプ', '滑る', '転ぶ', '倒れる', '起こす',
  '作る', '壊す', '建てる', '掘る', '埋める', '植える', '育てる', '収穫する', '料理する', '洗う',
  '掃除する', '拭く', 'アイロンをかける', '縫う', '編む', '組み立てる', '分解する', '修理する', '磨く', 'こする',
];

async function main() {
  console.log('[Seed] データベース初期化開始...');

  // 既存データをクリア
  await prisma.hint.deleteMany();
  await prisma.card.deleteMany();
  await prisma.player.deleteMany();
  await prisma.room.deleteMany();
  await prisma.word.deleteMany();
  await prisma.wordPack.deleteMany();

  console.log('[Seed] 既存データをクリアしました');

  // デフォルト日本語単語パック作成
  const defaultPack = await prisma.wordPack.create({
    data: {
      name: 'デフォルト日本語',
      description: '日本語の基本的な単語1000語を収録',
      isPublic: true,
      isDefault: true,
      language: 'ja',
      words: {
        create: defaultJapaneseWords.map((word) => ({ word })),
      },
    },
  });

  console.log(`[Seed] デフォルト単語パック作成完了: ${defaultPack.name} (${defaultJapaneseWords.length}語)`);

  console.log('[Seed] データベース初期化完了！');
}

main()
  .catch((e) => {
    console.error('[Seed] エラー:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
EOF
```

**Step 4: Prisma Clientを生成**

```bash
npm run prisma:generate
```

期待結果: "Generated Prisma Client" メッセージ

**Step 5: Docker ComposeでPostgreSQLを起動**

```bash
cd ..
docker-compose up -d postgres
```

**Step 6: PostgreSQL起動確認**

```bash
docker-compose ps
```

期待結果: postgres サービスが "healthy" 状態

**Step 7: マイグレーション実行**

```bash
cd server
npm run prisma:migrate
```

入力プロンプト: "Enter a name for the new migration:" → "init"

期待結果: マイグレーション成功メッセージ

**Step 8: シードデータ投入**

```bash
npm run prisma:seed
```

期待結果: "[Seed] データベース初期化完了！" メッセージ

**Step 9: Prisma Studioでデータ確認**

```bash
npm run prisma:studio &
```

ブラウザで http://localhost:5555 にアクセスし、word_packs と words テーブルにデータが存在することを確認

**Step 10: Prisma Studio停止**

```bash
# Ctrl+C または
pkill -f "prisma studio"
```

**Step 11: コミット**

```bash
cd ..
git add server/prisma
git commit -m "feat(db): Prismaスキーマとシードデータ実装"
```

---

## Task 4: クライアントサイド基本構造

**Files:**
- Create: `client/package.json`
- Create: `client/tsconfig.json`
- Create: `client/vite.config.ts`
- Create: `client/tailwind.config.js`
- Create: `client/postcss.config.js`
- Create: `client/Dockerfile`
- Create: `client/.dockerignore`
- Create: `client/index.html`
- Create: `client/src/main.tsx`
- Create: `client/src/App.tsx`
- Create: `client/src/index.css`

**Step 1: clientディレクトリ作成**

```bash
mkdir -p client/src/{components,pages,hooks,stores,services,types,utils}
cd client
```

**Step 2: package.jsonを作成**

```json
cat > package.json << 'EOF'
{
  "name": "codenames-client",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext ts,tsx",
    "test": "vitest"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.0",
    "socket.io-client": "^4.6.1",
    "zustand": "^4.4.7"
  },
  "devDependencies": {
    "@types/react": "^18.2.45",
    "@types/react-dom": "^18.2.18",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.8",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.4.0",
    "vitest": "^1.1.0"
  }
}
EOF
```

**Step 3: tsconfig.jsonを作成**

```json
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOF
```

**Step 4: tsconfig.node.jsonを作成**

```json
cat > tsconfig.node.json << 'EOF'
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
EOF
```

**Step 5: vite.config.tsを作成**

```typescript
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    watch: {
      usePolling: true,
    },
  },
});
EOF
```

**Step 6: tailwind.config.jsを作成**

```javascript
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        red: {
          team: '#DC2626',
        },
        blue: {
          team: '#2563EB',
        },
      },
    },
  },
  plugins: [],
}
EOF
```

**Step 7: postcss.config.jsを作成**

```javascript
cat > postcss.config.js << 'EOF'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF
```

**Step 8: Dockerfileを作成**

```dockerfile
cat > Dockerfile << 'EOF'
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]
EOF
```

**Step 9: .dockerignoreを作成**

```bash
cat > .dockerignore << 'EOF'
node_modules
dist
.env
.git
EOF
```

**Step 10: index.htmlを作成**

```html
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>コードネーム</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF
```

**Step 11: src/index.cssを作成**

```css
cat > src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#root {
  min-height: 100vh;
}
EOF
```

**Step 12: src/App.tsxを作成**

```tsx
cat > src/App.tsx << 'EOF'
import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          🎯 CODENAMES
        </h1>
        <p className="text-xl text-gray-600">
          コードネームクローン
        </p>
        <div className="mt-8 space-y-4">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
            ルームを作成する
          </button>
          <div className="text-gray-500">開発中...</div>
        </div>
      </div>
    </div>
  );
}

export default App;
EOF
```

**Step 13: src/main.tsxを作成**

```tsx
cat > src/main.tsx << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
EOF
```

**Step 14: 依存関係をインストール**

```bash
npm install
```

**Step 15: ローカルで開発サーバー起動テスト**

```bash
npm run dev
```

期待結果: "Local: http://localhost:5173/" が表示される

**Step 16: ブラウザでアクセス確認**

ブラウザで http://localhost:5173 にアクセス

期待結果: "🎯 CODENAMES" タイトルとボタンが表示される

**Step 17: Ctrl+Cで停止後、コミット**

```bash
cd ..
git add client
git commit -m "feat(client): React + Vite + Tailwind CSS 基本セットアップ"
```

---

## Task 5: Docker Compose全体動作確認

**Step 1: .envファイル作成**

```bash
cp .env.example .env
```

**Step 2: Docker Compose全サービス起動**

```bash
docker-compose up --build
```

期待結果: postgres, server, client の3サービスが起動

**Step 3: 別ターミナルでヘルスチェック**

```bash
# サーバーヘルスチェック
curl http://localhost:3000/health

# クライアントアクセス確認
curl -I http://localhost:5173
```

期待結果:
- サーバー: `{"status":"ok",...}`
- クライアント: HTTP 200

**Step 4: ブラウザで最終確認**

- フロントエンド: http://localhost:5173 → UIが表示される
- バックエンドAPI: http://localhost:3000/api → `{"message":"Codenames API Server"}`

**Step 5: Docker Composeログ確認**

```bash
docker-compose logs server
docker-compose logs client
```

期待結果: エラーがないこと

**Step 6: Ctrl+Cで全サービス停止**

**Step 7: 最終コミット**

```bash
git add .env.example docker-compose.yml
git commit -m "feat: Docker Compose統合環境構築完了"
```

---

## 完了条件

✅ プロジェクト基本構造が完成している
✅ Git初期化とコミットが完了している
✅ Docker Composeで全サービスが起動する
✅ PostgreSQLが正常動作している
✅ Prismaマイグレーションとシードが成功している
✅ バックエンドAPIが http://localhost:3000 で応答する
✅ フロントエンドが http://localhost:5173 で表示される
✅ 日本語1000語のデフォルト単語パックがDBに登録されている

---

## Next Steps (Phase 2)

Phase 1完了後、以下を実装予定：

1. **REST API実装** (ルーム作成・参加、単語パック管理)
2. **WebSocket通信基盤** (Socket.io統合)
3. **ゲームロジック** (カード配置、ターン管理、勝敗判定)
4. **フロントエンドUI** (ページコンポーネント、状態管理)

Phase 2の詳細計画は別途作成します。
