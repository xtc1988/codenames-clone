# コードネームクローン 設計書

## 1. 概要

### 1.1 プロジェクト概要
ボードゲーム「コードネーム（Codenames）」のWebクローンアプリケーション。
ブラウザ上でリアルタイムマルチプレイが可能。

### 1.2 基本ルール
- 5×5の25枚の単語カードを使用
- 赤チーム（9枚）、青チーム（8枚）、一般市民（7枚）、暗殺者（1枚）
- 各チームにスパイマスター（ヒントを出す人）とオペレーティブ（推測する人）がいる
- スパイマスターが「単語 + 数字」のヒントを出し、オペレーティブがカードを推測
- 暗殺者を選んだら即敗北
- 先に自チームのカードを全て見つけたチームの勝利

### 1.3 確定仕様

| 項目 | 仕様 |
|------|------|
| 認証 | ゲストプレイのみ（ニックネーム入力） |
| 単語パック | 誰でも作成可、公開/非公開選択 |
| ボイスチャット | なし（外部ツール併用想定） |
| 初期単語 | 日本語1000語 |
| ゲーム履歴 | 保存しない（終了時削除） |
| ルーム有効期限 | 最終アクティビティから12時間 |
| 最大人数 | 12人/ルーム |
| 観戦者 | スパイマスター/オペレーティブビュー選択可 |

---

## 2. 技術スタック

### 2.1 フロントエンド
| 技術 | バージョン | 用途 |
|------|-----------|------|
| React | 18.x | UIフレームワーク |
| TypeScript | 5.x | 型安全な開発 |
| Vite | 5.x | ビルドツール |
| Tailwind CSS | 3.x | スタイリング |
| React Router | 6.x | ルーティング |
| Zustand | 4.x | 状態管理 |
| @supabase/supabase-js | 2.x | Supabaseクライアント |

### 2.2 バックエンド（Supabase）
| 機能 | 用途 |
|------|------|
| PostgreSQL | データベース |
| Realtime | リアルタイム同期（Broadcast/Presence） |
| Edge Functions | 複雑なゲームロジック（必要に応じて） |
| RLS (Row Level Security) | データアクセス制御 |

### 2.3 インフラ
| 技術 | 用途 |
|------|------|
| Supabase | BaaS（ホスティング含む） |
| Vercel / Netlify | フロントエンドホスティング |

---

## 3. 機能一覧

### 3.1 ルーム管理

| ID | 機能名 | 説明 | 優先度 |
|----|--------|------|--------|
| R-01 | ルーム作成 | 新規ルームを作成し、ホストになる | 必須 |
| R-02 | ルーム参加 | ルームコードまたはURLでルームに参加 | 必須 |
| R-03 | 公開ルーム一覧 | 公開ルームの一覧を表示・参加 | 必須 |
| R-04 | ルーム設定 | 単語パック選択、公開/非公開設定 | 必須 |
| R-05 | ルーム自動削除 | 12時間非アクティブで自動削除 | 必須 |

### 3.2 プレイヤー管理

| ID | 機能名 | 説明 | 優先度 |
|----|--------|------|--------|
| P-01 | ニックネーム設定 | ゲーム参加時にニックネームを入力 | 必須 |
| P-02 | チーム選択 | 赤/青/観戦者から選択 | 必須 |
| P-03 | 役割選択 | スパイマスター/オペレーティブから選択 | 必須 |
| P-04 | 観戦ビュー選択 | 観戦時のビューモード選択 | 必須 |

### 3.3 ゲームプレイ

| ID | 機能名 | 説明 | 優先度 |
|----|--------|------|--------|
| G-01 | ゲーム開始 | ホストがゲームを開始（条件チェック） | 必須 |
| G-02 | ボード生成 | 25枚のカードをランダム配置 | 必須 |
| G-03 | スパイマスタービュー | 全カードの色が見える特別ビュー | 必須 |
| G-04 | ヒント入力 | スパイマスターがヒント単語と数字を入力 | 必須 |
| G-05 | カード選択 | オペレーティブがカードを選択 | 必須 |
| G-06 | ターン管理 | パス機能、推測回数管理 | 必須 |
| G-07 | 勝敗判定 | 勝利条件・敗北条件のチェック | 必須 |
| G-08 | ゲーム終了 | 結果表示、再戦オプション | 必須 |
| G-09 | チャット | ルーム内テキストチャット | 任意 |
| G-10 | ターンタイマー | 制限時間設定（オプション） | 任意 |

### 3.4 単語パック

| ID | 機能名 | 説明 | 優先度 |
|----|--------|------|--------|
| W-01 | デフォルトパック | 日本語1000語のシステムパック | 必須 |
| W-02 | パック作成 | ユーザーが単語パックを作成 | 必須 |
| W-03 | パック編集 | 作成したパックの編集 | 必須 |
| W-04 | パック公開設定 | 公開/非公開の切り替え | 必須 |
| W-05 | 公開パック一覧 | 公開されたパックの一覧・選択 | 必須 |

---

## 4. データベース設計

### 4.1 ER図

```
┌──────────────┐       ┌──────────────┐
│  word_packs  │       │    words     │
├──────────────┤       ├──────────────┤
│ id (PK)      │───────│ id (PK)      │
│ name         │   1:N │ word_pack_id │
│ description  │       │ word         │
│ is_public    │       └──────────────┘
│ is_default   │
│ language     │
│ creator_id   │
│ created_at   │
└──────────────┘
        │
        │ 1:N
        ▼
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    rooms     │       │   players    │       │    hints     │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │───────│ id (PK)      │───────│ id (PK)      │
│ code         │   1:N │ room_id (FK) │   1:N │ room_id (FK) │
│ name         │       │ nickname     │       │ player_id    │
│ status       │       │ team         │       │ word         │
│ is_public    │       │ role         │       │ count        │
│ word_pack_id │       │ is_host      │       │ team         │
│ current_turn │       │ spectator_   │       │ created_at   │
│ winner       │       │   view       │       └──────────────┘
│ timer_sec    │       │ created_at   │
│ guesses_left │       └──────────────┘
│ created_at   │
│ updated_at   │               │
└──────────────┘               │
        │                      │
        │ 1:N                  │
        ▼                      │
┌──────────────┐               │
│    cards     │               │
├──────────────┤               │
│ id (PK)      │               │
│ room_id (FK) │               │
│ word         │               │
│ position     │               │
│ type         │               │
│ is_revealed  │               │
│ revealed_by  │───────────────┘
└──────────────┘
```

### 4.2 Supabase SQL スキーマ

```sql
-- ENUMの代わりにCHECK制約を使用（Supabase推奨）

-- ルームテーブル
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(6) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'waiting' 
    CHECK (status IN ('waiting', 'playing', 'finished')),
  is_public BOOLEAN NOT NULL DEFAULT true,
  word_pack_id UUID REFERENCES word_packs(id),
  current_turn VARCHAR(10) CHECK (current_turn IN ('red', 'blue')),
  winner VARCHAR(10) CHECK (winner IN ('red', 'blue')),
  current_hint_word VARCHAR(100),
  current_hint_count INTEGER,
  guesses_left INTEGER,
  timer_seconds INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- プレイヤーテーブル
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  nickname VARCHAR(50) NOT NULL,
  team VARCHAR(20) NOT NULL DEFAULT 'spectator'
    CHECK (team IN ('red', 'blue', 'spectator')),
  role VARCHAR(20) CHECK (role IN ('spymaster', 'operative')),
  is_host BOOLEAN NOT NULL DEFAULT false,
  spectator_view VARCHAR(20) DEFAULT 'operative'
    CHECK (spectator_view IN ('spymaster', 'operative')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- カードテーブル
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  word VARCHAR(100) NOT NULL,
  position INTEGER NOT NULL CHECK (position >= 0 AND position <= 24),
  type VARCHAR(20) NOT NULL 
    CHECK (type IN ('red', 'blue', 'neutral', 'assassin')),
  is_revealed BOOLEAN NOT NULL DEFAULT false,
  revealed_by UUID REFERENCES players(id),
  UNIQUE(room_id, position)
);

-- ヒント履歴テーブル
CREATE TABLE hints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id),
  word VARCHAR(100) NOT NULL,
  count INTEGER NOT NULL,
  team VARCHAR(10) NOT NULL CHECK (team IN ('red', 'blue')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 単語パックテーブル
CREATE TABLE word_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  is_default BOOLEAN NOT NULL DEFAULT false,
  language VARCHAR(10) NOT NULL DEFAULT 'ja',
  creator_id VARCHAR(255),  -- ゲストなのでセッションID等
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 単語テーブル
CREATE TABLE words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word_pack_id UUID NOT NULL REFERENCES word_packs(id) ON DELETE CASCADE,
  word VARCHAR(100) NOT NULL
);

-- チャットメッセージテーブル（任意機能）
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_rooms_code ON rooms(code);
CREATE INDEX idx_rooms_is_public ON rooms(is_public);
CREATE INDEX idx_rooms_updated_at ON rooms(updated_at);
CREATE INDEX idx_players_room_id ON players(room_id);
CREATE INDEX idx_cards_room_id ON cards(room_id);
CREATE INDEX idx_words_word_pack_id ON words(word_pack_id);
CREATE INDEX idx_word_packs_is_public ON word_packs(is_public);

-- updated_at自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER rooms_updated_at
  BEFORE UPDATE ON rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

### 4.3 Row Level Security (RLS)

```sql
-- RLSを有効化
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE hints ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE words ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- ルーム: 誰でも参照可能、作成可能
CREATE POLICY "rooms_select" ON rooms FOR SELECT USING (true);
CREATE POLICY "rooms_insert" ON rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "rooms_update" ON rooms FOR UPDATE USING (true);
CREATE POLICY "rooms_delete" ON rooms FOR DELETE USING (true);

-- プレイヤー: 誰でも操作可能
CREATE POLICY "players_all" ON players FOR ALL USING (true);

-- カード: 誰でも参照可能、ゲーム中の操作はアプリ側で制御
CREATE POLICY "cards_all" ON cards FOR ALL USING (true);

-- ヒント: 誰でも操作可能
CREATE POLICY "hints_all" ON hints FOR ALL USING (true);

-- 単語パック: 公開パックは誰でも参照可能
CREATE POLICY "word_packs_select" ON word_packs FOR SELECT USING (true);
CREATE POLICY "word_packs_insert" ON word_packs FOR INSERT WITH CHECK (true);
CREATE POLICY "word_packs_update" ON word_packs FOR UPDATE USING (true);
CREATE POLICY "word_packs_delete" ON word_packs FOR DELETE USING (true);

-- 単語: パックに紐づいて操作
CREATE POLICY "words_all" ON words FOR ALL USING (true);

-- チャット: ルームのメンバーのみ
CREATE POLICY "chat_all" ON chat_messages FOR ALL USING (true);
```

### 4.4 クリーンアップ用SQL関数

```sql
-- 12時間以上非アクティブなルームを削除
CREATE OR REPLACE FUNCTION cleanup_inactive_rooms()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM rooms 
  WHERE updated_at < NOW() - INTERVAL '12 hours';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Supabase Cron (pg_cron) で定期実行
-- SELECT cron.schedule('cleanup-rooms', '0 * * * *', 'SELECT cleanup_inactive_rooms()');
```

---

## 5. Supabase Realtime 設計

### 5.1 チャンネル構成

| チャンネル名 | 用途 | タイプ |
|-------------|------|--------|
| `room:{roomId}` | ルーム内のゲームイベント | Broadcast |
| `room:{roomId}:presence` | プレイヤーのオンライン状態 | Presence |

### 5.2 Broadcast イベント

#### クライアント → サーバー（他クライアント）

| イベント名 | ペイロード | 説明 |
|-----------|-----------|------|
| player_joined | `{ player }` | プレイヤー参加 |
| player_left | `{ playerId }` | プレイヤー退出 |
| team_changed | `{ playerId, team, role }` | チーム/役割変更 |
| game_started | `{ cards, currentTurn }` | ゲーム開始 |
| hint_given | `{ hint }` | ヒント送信 |
| card_selected | `{ position, result }` | カード選択結果 |
| turn_ended | `{ nextTurn }` | ターン終了 |
| game_over | `{ winner }` | ゲーム終了 |
| chat_message | `{ playerId, nickname, message }` | チャット |

### 5.3 Presence

```typescript
// プレイヤーのオンライン状態を追跡
interface PresenceState {
  odenames-clone/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── index.html
├── .env.local                    # Supabase接続情報
├── .env.example
│
├── public/
│   └── favicon.ico
│
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   │
│   ├── components/
│   │   ├── ui/                   # 共通UIコンポーネント
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Modal.tsx
│   │   │
│   │   ├── game/                 # ゲーム関連コンポーネント
│   │   │   ├── Board.tsx         # 5x5ボード
│   │   │   ├── GameCard.tsx      # 単語カード
│   │   │   ├── HintInput.tsx     # ヒント入力
│   │   │   ├── HintDisplay.tsx   # ヒント表示
│   │   │   ├── TeamScore.tsx     # チームスコア
│   │   │   └── GameResult.tsx    # 結果表示
│   │   │
│   │   ├── room/                 # ルーム関連コンポーネント
│   │   │   ├── PlayerList.tsx    # プレイヤー一覧
│   │   │   ├── TeamPanel.tsx     # チーム選択パネル
│   │   │   ├── RoomSettings.tsx  # ルーム設定
│   │   │   └── Chat.tsx          # チャット
│   │   │
│   │   └── layout/               # レイアウト
│   │       ├── Header.tsx
│   │       └── Layout.tsx
│   │
│   ├── pages/
│   │   ├── TopPage.tsx
│   │   ├── CreateRoomPage.tsx
│   │   ├── JoinRoomPage.tsx
│   │   ├── RoomListPage.tsx
│   │   ├── LobbyPage.tsx
│   │   ├── GamePage.tsx
│   │   ├── WordPackListPage.tsx
│   │   ├── WordPackCreatePage.tsx
│   │   └── WordPackEditPage.tsx
│   │
│   ├── hooks/
│   │   ├── useSupabase.ts        # Supabaseクライアント
│   │   ├── useRoom.ts            # ルーム操作
│   │   ├── useGame.ts            # ゲームロジック
│   │   ├── useRealtime.ts        # Realtime購読
│   │   └── usePresence.ts        # Presence管理
│   │
│   ├── stores/                   # Zustand
│   │   ├── playerStore.ts        # 自分のプレイヤー情報
│   │   ├── roomStore.ts          # ルーム状態
│   │   └── gameStore.ts          # ゲーム状態
│   │
│   ├── lib/
│   │   ├── supabase.ts           # Supabaseクライアント初期化
│   │   └── constants.ts          # 定数
│   │
│   ├── services/
│   │   ├── roomService.ts        # ルームCRUD
│   │   ├── gameService.ts        # ゲームロジック
│   │   ├── wordPackService.ts    # 単語パックCRUD
│   │   └── realtimeService.ts    # Realtime処理
│   │
│   ├── types/
│   │   ├── database.ts           # Supabase生成型
│   │   └── index.ts              # アプリ固有型
│   │
│   └── utils/
│       ├── codeGenerator.ts      # ルームコード生成
│       ├── cardGenerator.ts      # カード配置ロジック
│       └── helpers.ts
│
└── supabase/
    ├── config.toml               # Supabase設定
    ├── seed.sql                  # 初期データ（単語1000語）
    └── migrations/
        └── 20250101000000_init.sql
```

---

## 7. 型定義

### 7.1 データベース型（Supabase生成）

```typescript
// types/database.ts
// `supabase gen types typescript` で生成

export interface Database {
  public: {
    Tables: {
      rooms: {
        Row: {
          id: string
          code: string
          name: string
          status: 'waiting' | 'playing' | 'finished'
          is_public: boolean
          word_pack_id: string | null
          current_turn: 'red' | 'blue' | null
          winner: 'red' | 'blue' | null
          current_hint_word: string | null
          current_hint_count: number | null
          guesses_left: number | null
          timer_seconds: number | null
          created_at: string
          updated_at: string
        }
        Insert: { ... }
        Update: { ... }
      }
      players: { ... }
      cards: { ... }
      hints: { ... }
      word_packs: { ... }
      words: { ... }
      chat_messages: { ... }
    }
  }
}
```

### 7.2 アプリケーション型

```typescript
// types/index.ts

export type Team = 'red' | 'blue' | 'spectator'
export type Role = 'spymaster' | 'operative'
export type CardType = 'red' | 'blue' | 'neutral' | 'assassin'
export type RoomStatus = 'waiting' | 'playing' | 'finished'
export type SpectatorView = 'spymaster' | 'operative'

export interface Player {
  id: string
  roomId: string
  nickname: string
  team: Team
  role: Role | null
  isHost: boolean
  spectatorView: SpectatorView
  isOnline: boolean  // Presenceから
}

export interface Card {
  id: string
  word: string
  position: number
  type: CardType
  isRevealed: boolean
  revealedBy: string | null
}

export interface Hint {
  id: string
  playerId: string
  word: string
  count: number
  team: 'red' | 'blue'
  createdAt: string
}

export interface Room {
  id: string
  code: string
  name: string
  status: RoomStatus
  isPublic: boolean
  wordPackId: string | null
  currentTurn: 'red' | 'blue' | null
  winner: 'red' | 'blue' | null
  currentHint: { word: string; count: number } | null
  guessesLeft: number | null
  timerSeconds: number | null
  players: Player[]
  cards: Card[]
  hints: Hint[]
}

export interface WordPack {
  id: string
  name: string
  description: string | null
  isPublic: boolean
  isDefault: boolean
  language: string
  wordCount: number
}

// Realtimeイベント
export type RealtimeEvent = 
  | { type: 'player_joined'; player: Player }
  | { type: 'player_left'; playerId: string }
  | { type: 'team_changed'; playerId: string; team: Team; role: Role | null }
  | { type: 'game_started'; cards: Card[]; currentTurn: 'red' | 'blue' }
  | { type: 'hint_given'; hint: Hint }
  | { type: 'card_selected'; position: number; card: Card; nextTurn?: 'red' | 'blue'; gameOver?: boolean; winner?: 'red' | 'blue' }
  | { type: 'turn_ended'; nextTurn: 'red' | 'blue' }
  | { type: 'game_over'; winner: 'red' | 'blue' }
  | { type: 'chat_message'; playerId: string; nickname: string; message: string; timestamp: string }
```

---

## 8. 主要サービス実装

### 8.1 Supabaseクライアント初期化

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

### 8.2 ルームサービス

```typescript
// services/roomService.ts
import { supabase } from '@/lib/supabase'
import { generateRoomCode } from '@/utils/codeGenerator'

export const roomService = {
  // ルーム作成
  async createRoom(params: {
    name: string
    isPublic: boolean
    wordPackId: string
    hostNickname: string
    timerSeconds?: number
  }) {
    const code = generateRoomCode()
    
    // ルーム作成
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .insert({
        code,
        name: params.name,
        is_public: params.isPublic,
        word_pack_id: params.wordPackId,
        timer_seconds: params.timerSeconds ?? null,
      })
      .select()
      .single()
    
    if (roomError) throw roomError
    
    // ホストプレイヤー作成
    const { data: player, error: playerError } = await supabase
      .from('players')
      .insert({
        room_id: room.id,
        nickname: params.hostNickname,
        is_host: true,
      })
      .select()
      .single()
    
    if (playerError) throw playerError
    
    return { room, player }
  },

  // 公開ルーム一覧
  async getPublicRooms() {
    const { data, error } = await supabase
      .from('rooms')
      .select(`
        *,
        players(count)
      `)
      .eq('is_public', true)
      .eq('status', 'waiting')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // ルームコードで取得
  async getRoomByCode(code: string) {
    const { data, error } = await supabase
      .from('rooms')
      .select(`
        *,
        players(*),
        cards(*),
        hints(*)
      `)
      .eq('code', code.toUpperCase())
      .single()
    
    if (error) throw error
    return data
  },

  // ルーム参加
  async joinRoom(roomId: string, nickname: string) {
    // 人数チェック
    const { count } = await supabase
      .from('players')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', roomId)
    
    if (count && count >= 12) {
      throw new Error('ルームが満員です')
    }
    
    const { data, error } = await supabase
      .from('players')
      .insert({
        room_id: roomId,
        nickname,
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // チーム/役割変更
  async updatePlayer(playerId: string, updates: {
    team?: 'red' | 'blue' | 'spectator'
    role?: 'spymaster' | 'operative' | null
    spectatorView?: 'spymaster' | 'operative'
  }) {
    const { data, error } = await supabase
      .from('players')
      .update(updates)
      .eq('id', playerId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // プレイヤー退出
  async leaveRoom(playerId: string) {
    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', playerId)
    
    if (error) throw error
  },
}
```

### 8.3 ゲームサービス

```typescript
// services/gameService.ts
import { supabase } from '@/lib/supabase'
import { generateCards } from '@/utils/cardGenerator'

export const gameService = {
  // ゲーム開始
  async startGame(roomId: string, wordPackId: string) {
    // 単語取得
    const { data: words } = await supabase
      .from('words')
      .select('word')
      .eq('word_pack_id', wordPackId)
    
    if (!words || words.length < 25) {
      throw new Error('単語が不足しています')
    }
    
    // カード生成
    const cards = generateCards(words.map(w => w.word))
    
    // カード挿入
    const { error: cardsError } = await supabase
      .from('cards')
      .insert(cards.map((card, index) => ({
        room_id: roomId,
        word: card.word,
        position: index,
        type: card.type,
      })))
    
    if (cardsError) throw cardsError
    
    // ルーム状態更新
    const { error: roomError } = await supabase
      .from('rooms')
      .update({
        status: 'playing',
        current_turn: 'red',  // 赤先攻
      })
      .eq('id', roomId)
    
    if (roomError) throw roomError
    
    return cards
  },

  // ヒント送信
  async giveHint(roomId: string, playerId: string, word: string, count: number, team: 'red' | 'blue') {
    // ヒント記録
    const { error: hintError } = await supabase
      .from('hints')
      .insert({
        room_id: roomId,
        player_id: playerId,
        word,
        count,
        team,
      })
    
    if (hintError) throw hintError
    
    // ルーム更新（現在のヒント、残り推測回数）
    const { error: roomError } = await supabase
      .from('rooms')
      .update({
        current_hint_word: word,
        current_hint_count: count,
        guesses_left: count + 1,  // ヒント数 + 1回
      })
      .eq('id', roomId)
    
    if (roomError) throw roomError
  },

  // カード選択
  async selectCard(roomId: string, playerId: string, position: number) {
    // カード取得
    const { data: card } = await supabase
      .from('cards')
      .select('*')
      .eq('room_id', roomId)
      .eq('position', position)
      .single()
    
    if (!card || card.is_revealed) {
      throw new Error('無効なカードです')
    }
    
    // カード公開
    await supabase
      .from('cards')
      .update({
        is_revealed: true,
        revealed_by: playerId,
      })
      .eq('id', card.id)
    
    // ルーム状態取得
    const { data: room } = await supabase
      .from('rooms')
      .select('*, cards(*)')
      .eq('id', roomId)
      .single()
    
    // 勝敗判定
    const result = this.checkGameResult(room, card)
    
    if (result.gameOver) {
      await supabase
        .from('rooms')
        .update({
          status: 'finished',
          winner: result.winner,
        })
        .eq('id', roomId)
    } else if (result.turnEnded) {
      const nextTurn = room.current_turn === 'red' ? 'blue' : 'red'
      await supabase
        .from('rooms')
        .update({
          current_turn: nextTurn,
          current_hint_word: null,
          current_hint_count: null,
          guesses_left: null,
        })
        .eq('id', roomId)
    } else {
      // 推測継続
      await supabase
        .from('rooms')
        .update({
          guesses_left: (room.guesses_left ?? 1) - 1,
        })
        .eq('id', roomId)
    }
    
    return { card, ...result }
  },

  // ターン終了（パス）
  async endTurn(roomId: string) {
    const { data: room } = await supabase
      .from('rooms')
      .select('current_turn')
      .eq('id', roomId)
      .single()
    
    const nextTurn = room?.current_turn === 'red' ? 'blue' : 'red'
    
    await supabase
      .from('rooms')
      .update({
        current_turn: nextTurn,
        current_hint_word: null,
        current_hint_count: null,
        guesses_left: null,
      })
      .eq('id', roomId)
    
    return nextTurn
  },

  // 勝敗判定ロジック
  checkGameResult(room: any, selectedCard: any) {
    const cards = room.cards
    const currentTurn = room.current_turn
    
    // 暗殺者 → 即敗北
    if (selectedCard.type === 'assassin') {
      return {
        gameOver: true,
        winner: currentTurn === 'red' ? 'blue' : 'red',
        turnEnded: true,
      }
    }
    
    // 全カード公開チェック
    const redRevealed = cards.filter((c: any) => c.type === 'red' && c.is_revealed).length
    const blueRevealed = cards.filter((c: any) => c.type === 'blue' && c.is_revealed).length
    
    // 自チーム全公開 → 勝利（選択したカード含む）
    const newRedRevealed = selectedCard.type === 'red' ? redRevealed + 1 : redRevealed
    const newBlueRevealed = selectedCard.type === 'blue' ? blueRevealed + 1 : blueRevealed
    
    if (newRedRevealed === 9) {
      return { gameOver: true, winner: 'red' as const, turnEnded: true }
    }
    if (newBlueRevealed === 8) {
      return { gameOver: true, winner: 'blue' as const, turnEnded: true }
    }
    
    // 相手チームまたは中立 → ターン終了
    if (selectedCard.type !== currentTurn) {
      return { gameOver: false, turnEnded: true }
    }
    
    // 自チーム → 推測継続（残り回数チェック）
    if ((room.guesses_left ?? 1) <= 1) {
      return { gameOver: false, turnEnded: true }
    }
    
    return { gameOver: false, turnEnded: false }
  },

  // 再戦
  async restartGame(roomId: string, wordPackId: string) {
    // 古いカード削除
    await supabase.from('cards').delete().eq('room_id', roomId)
    await supabase.from('hints').delete().eq('room_id', roomId)
    
    // ルームリセット
    await supabase
      .from('rooms')
      .update({
        status: 'waiting',
        current_turn: null,
        winner: null,
        current_hint_word: null,
        current_hint_count: null,
        guesses_left: null,
      })
      .eq('id', roomId)
  },
}
```

### 8.4 Realtimeサービス

```typescript
// services/realtimeService.ts
import { supabase } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

export const realtimeService = {
  channel: null as RealtimeChannel | null,

  // ルームに接続
  joinRoom(roomId: string, player: { id: string; nickname: string }) {
    this.channel = supabase.channel(`room:${roomId}`, {
      config: {
        presence: { key: player.id },
      },
    })

    // Presence設定
    this.channel.on('presence', { event: 'sync' }, () => {
      const state = this.channel?.presenceState()
      console.log('Presence sync:', state)
    })

    this.channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log('Player joined:', key, newPresences)
    })

    this.channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log('Player left:', key, leftPresences)
    })

    // 購読開始
    this.channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await this.channel?.track({
          id: player.id,
          nickname: player.nickname,
          online_at: new Date().toISOString(),
        })
      }
    })

    return this.channel
  },

  // イベント送信
  broadcast(event: string, payload: any) {
    this.channel?.send({
      type: 'broadcast',
      event,
      payload,
    })
  },

  // イベント購読
  onBroadcast(event: string, callback: (payload: any) => void) {
    this.channel?.on('broadcast', { event }, ({ payload }) => {
      callback(payload)
    })
  },

  // DB変更購読
  onTableChange(table: string, filter: string, callback: (payload: any) => void) {
    this.channel?.on(
      'postgres_changes',
      { event: '*', schema: 'public', table, filter },
      callback
    )
  },

  // 切断
  leave() {
    if (this.channel) {
      supabase.removeChannel(this.channel)
      this.channel = null
    }
  },
}
```

---

## 9. 画面設計

### 9.1 画面一覧

| 画面ID | 画面名 | パス | 説明 |
|--------|--------|------|------|
| S-01 | トップ | / | ルーム作成・参加の入り口 |
| S-02 | ルーム作成 | /create | ルーム設定入力 |
| S-03 | ルーム参加 | /join | ルームコード入力 |
| S-04 | 公開ルーム一覧 | /rooms | 公開ルームの一覧 |
| S-05 | ロビー | /room/:code | ゲーム開始前の待機画面 |
| S-06 | ゲーム | /room/:code/game | ゲームプレイ画面 |
| S-07 | 単語パック一覧 | /word-packs | パック一覧・管理 |
| S-08 | 単語パック作成 | /word-packs/create | 新規パック作成 |
| S-09 | 単語パック編集 | /word-packs/:id/edit | パック編集 |

### 9.2 画面詳細

#### S-01: トップ画面
```
┌─────────────────────────────────────────────┐
│                                             │
│             🎯 CODENAMES                    │
│                                             │
│    ┌─────────────────────────────────┐      │
│    │      ルームを作成する           │      │
│    └─────────────────────────────────┘      │
│                                             │
│    ┌─────────────────────────────────┐      │
│    │      ルームに参加する           │      │
│    └─────────────────────────────────┘      │
│                                             │
│    ┌─────────────────────────────────┐      │
│    │      公開ルーム一覧             │      │
│    └─────────────────────────────────┘      │
│                                             │
│    ┌─────────────────────────────────┐      │
│    │      単語パック管理             │      │
│    └─────────────────────────────────┘      │
│                                             │
└─────────────────────────────────────────────┘
```

#### S-05: ロビー画面
```
┌─────────────────────────────────────────────────────────────────┐
│  ルーム: 友達とコードネーム          コード: ABC123   [コピー]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────┐       ┌─────────────────────┐          │
│  │      🔴 赤チーム     │       │      🔵 青チーム     │          │
│  ├─────────────────────┤       ├─────────────────────┤          │
│  │ 👑 スパイマスター    │       │ 👑 スパイマスター    │          │
│  │   太郎 ●            │       │   (空き)            │          │
│  │ [選択]              │       │   [選択]            │          │
│  ├─────────────────────┤       ├─────────────────────┤          │
│  │ 🔍 オペレーティブ    │       │ 🔍 オペレーティブ    │          │
│  │   花子 ●            │       │   次郎 ●            │          │
│  │   [選択]            │       │   [選択]            │          │
│  └─────────────────────┘       └─────────────────────┘          │
│                                                                 │
│  ┌─────────────────────────────────────────────────────┐        │
│  │ 👁 観戦者: 山田 ●                                    │        │
│  │ ビュー: [スパイマスター ▼]                           │        │
│  │ [観戦者になる]                                       │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                 │
│  ● = オンライン                                                 │
│  単語パック: デフォルト日本語                                    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────┐        │
│  │              🎮 ゲームを開始する                     │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### S-06: ゲーム画面（オペレーティブビュー）
```
┌─────────────────────────────────────────────────────────────────┐
│  🔴 赤: 6/9    🔵 青: 5/8    ターン: 🔴赤チーム                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ヒント: 「動物 3」 (残り推測: 2)                                │
│                                                                 │
│  ┌─────────┬─────────┬─────────┬─────────┬─────────┐           │
│  │         │  🔴     │         │         │  🔵     │           │
│  │  りんご  │  東京   │  電車   │  猫     │  海    │           │
│  │         │(公開済) │         │         │(公開済) │           │
│  ├─────────┼─────────┼─────────┼─────────┼─────────┤           │
│  │         │         │         │  🔴     │         │           │
│  │  山     │  本     │  月    │  花     │  空     │           │
│  │         │         │         │(公開済) │         │           │
│  ├─────────┼─────────┼─────────┼─────────┼─────────┤           │
│  │  🔵     │         │         │         │  ⬜     │           │
│  │  水     │  火     │  木     │  金     │  土     │           │
│  │(公開済) │         │         │         │(中立)   │           │
│  ├─────────┼─────────┼─────────┼─────────┼─────────┤           │
│  │         │  🔴     │         │         │         │           │
│  │  雨     │  雪     │  風     │  雲     │  虹     │           │
│  │         │(公開済) │         │         │         │           │
│  ├─────────┼─────────┼─────────┼─────────┼─────────┤           │
│  │         │         │  🔵     │         │         │           │
│  │  星     │  月     │  太陽   │  地球   │  宇宙   │           │
│  │         │         │(公開済) │         │         │           │
│  └─────────┴─────────┴─────────┴─────────┴─────────┘           │
│                                                                 │
│  ┌──────────────────────────────────────────────────────┐       │
│  │              ターン終了（パス）                       │       │
│  └──────────────────────────────────────────────────────┘       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### S-06: ゲーム画面（スパイマスタービュー）
```
┌─────────────────────────────────────────────────────────────────┐
│  🔴 赤: 6/9    🔵 青: 5/8    ターン: 🔴赤チーム（あなた）        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────┬─────────┬─────────┬─────────┬─────────┐           │
│  │  ⬜     │  🔴     │  🔴     │  🔵     │  🔵     │           │
│  │  りんご  │  東京   │  電車   │  猫     │  海    │           │
│  │ neutral │ 公開済  │  red    │  blue   │ 公開済  │           │
│  ├─────────┼─────────┼─────────┼─────────┼─────────┤           │
│  │  🔵     │  🔴     │  ⬛     │  🔴     │  ⬜     │           │
│  │  山     │  本     │  月    │  花     │  空     │           │
│  │  blue   │  red    │assassin │ 公開済  │ neutral │           │
│  ├─────────┼─────────┼─────────┼─────────┼─────────┤           │
│  │  🔵     │  ⬜     │  🔴     │  🔵     │  ⬜     │           │
│  │  水     │  火     │  木     │  金     │  土     │           │
│  │ 公開済  │ neutral │  red    │  blue   │ 公開済  │           │
│  └─────────┴─────────┴─────────┴─────────┴─────────┘           │
│  (以下略)                                                       │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ ヒント: [          ]  数字: [▼]  [ヒントを送信]           │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 10. ゲームロジック詳細

### 10.1 ゲーム開始条件
- 両チームに最低1人ずつプレイヤーがいる
- 両チームにスパイマスターが1人ずついる
- ホストのみがゲーム開始可能

### 10.2 カード配置生成

```typescript
// utils/cardGenerator.ts

import type { CardType } from '@/types'

interface GeneratedCard {
  word: string
  type: CardType
}

export function generateCards(words: string[]): GeneratedCard[] {
  // ランダムに25語選択
  const shuffledWords = [...words].sort(() => Math.random() - 0.5)
  const selectedWords = shuffledWords.slice(0, 25)
  
  // カードタイプの配列を作成
  const types: CardType[] = [
    ...Array(9).fill('red'),      // 赤9枚（先攻）
    ...Array(8).fill('blue'),     // 青8枚
    ...Array(7).fill('neutral'),  // 中立7枚
    'assassin',                   // 暗殺者1枚
  ]
  
  // タイプをシャッフル
  const shuffledTypes = types.sort(() => Math.random() - 0.5)
  
  // カード生成
  return selectedWords.map((word, index) => ({
    word,
    type: shuffledTypes[index],
  }))
}
```

### 10.3 ターン進行
1. スパイマスターがヒント（単語 + 数字）を入力
2. オペレーティブがカードを選択
3. カード結果に応じて:
   - 自チームカード → 推測継続可能（残り回数-1）
   - 相手チームカード → ターン終了
   - 一般市民 → ターン終了
   - 暗殺者 → 即敗北
4. 推測回数は「ヒントの数字 + 1」まで
5. パスでターン終了

### 10.4 勝利条件
- 自チームのカードを全て公開
- 相手チームが暗殺者を選択

### 10.5 ヒントのルール（UIで案内）
- ボード上の単語は使用不可
- 数字のみのヒントは不可
- 「0」は「関連なし、好きに推測して」の意味
- 「∞（無制限）」も選択可能

---

## 11. エラーハンドリング

### 11.1 エラーコード

| コード | 説明 |
|--------|------|
| ROOM_NOT_FOUND | ルームが存在しない |
| ROOM_FULL | ルームが満員（12人） |
| GAME_ALREADY_STARTED | ゲームは既に開始済み |
| NOT_YOUR_TURN | あなたのターンではない |
| INVALID_ROLE | この操作を行う権限がない |
| INVALID_HINT | 無効なヒント |
| WORD_PACK_NOT_FOUND | 単語パックが存在しない |
| INSUFFICIENT_WORDS | 単語パックの単語数が25未満 |
| INVALID_CARD | 無効なカード選択 |

---

## 12. 環境変数

```env
# .env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 13. デプロイ

### 13.1 Supabase設定
1. Supabaseプロジェクト作成
2. SQLスキーマ実行（マイグレーション）
3. seed.sql実行（初期単語データ）
4. Realtime有効化（rooms, players, cards, hints テーブル）
5. pg_cronでクリーンアップジョブ設定

### 13.2 フロントエンド
1. Vercel / Netlifyにデプロイ
2. 環境変数設定
3. ビルド & デプロイ

---

## 14. 今後の拡張案

- [ ] ユーザー登録・ログイン機能（Supabase Auth）
- [ ] ゲーム履歴・統計
- [ ] AIスパイマスター（LLMでヒント自動生成）
- [ ] 英語版単語パック追加
- [ ] カスタムテーマ（デュエット、アンダーカバー等）
- [ ] モバイルアプリ（React Native + Supabase）
- [ ] Edge Functionsでサーバーサイドバリデーション強化

---

## 15. 参考リンク

- [Codenames 公式ルール](https://czechgames.com/files/rules/codenames-rules-en.pdf)
- [Supabase ドキュメント](https://supabase.com/docs)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)