# OKANAME アーキテクチャ解説書

> **対象読者**: プログラミング1年目の開発者
> **最終更新**: 2025-12-25

このドキュメントは、OKANAMEプロジェクトの全体像と詳細を理解するための解説書です。

---

## 📚 目次

1. [プロジェクト概要](#プロジェクト概要)
2. [全体アーキテクチャ](#全体アーキテクチャ)
3. [ディレクトリ構造](#ディレクトリ構造)
4. [データベース設計](#データベース設計)
5. [フロントエンド詳細](#フロントエンド詳細)
6. [バックエンド詳細](#バックエンド詳細)
7. [主要な処理フロー](#主要な処理フロー)
8. [重要な概念とパターン](#重要な概念とパターン)
9. [よくある質問](#よくある質問)

---

## プロジェクト概要

### 何を作っているか？

**OKANAME**は、ボードゲーム「コードネーム（Codenames）」をベースにしたWebゲームアプリケーションです。

- **リアルタイムマルチプレイ**: 友達と一緒にオンラインでプレイ可能
- **最大12人**: 1つのルームに最大12人が参加可能
- **観戦モード**: ゲームに参加せずに観戦することも可能

### 技術スタック

| 分類 | 技術 | 説明 |
|------|------|------|
| **フロントエンド** | React 18 + TypeScript | ユーザーインターフェース |
| **ルーティング** | React Router v6 | ページ遷移管理 |
| **状態管理** | Zustand | グローバルな状態（ゲーム状態など） |
| **スタイリング** | Tailwind CSS | デザイン・レイアウト |
| **ビルドツール** | Vite | 高速な開発環境 |
| **バックエンド** | Supabase | データベース + リアルタイム通信 |
| **データベース** | PostgreSQL | データ保存 |
| **ORM** | Prisma | データベース操作 |
| **テスト** | Vitest + Playwright | ユニット・E2Eテスト |

---

## 全体アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                         ブラウザ                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  React App（フロントエンド）                          │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │   │
│  │  │   Pages    │  │  Services  │  │   Stores   │     │   │
│  │  │ (画面表示)  │  │ (API通信)  │  │ (状態管理)  │     │   │
│  │  └────────────┘  └────────────┘  └────────────┘     │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↕                                  │
│                    Supabase Client                           │
│                 (データベース・リアルタイム通信)              │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                      Supabase（クラウド）                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  PostgreSQL Database                                 │   │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │   │
│  │  │Rooms │ │Player│ │Cards │ │Hints │ │Words │      │   │
│  │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Realtime (リアルタイム通信)                          │   │
│  │  - データ変更の購読                                   │   │
│  │  - プレイヤー同士の同期                               │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### データフロー

```
ユーザー操作
    ↓
Reactコンポーネント（Pages）
    ↓
Service関数を呼び出し
    ↓
Supabase APIにリクエスト
    ↓
PostgreSQLにデータ保存
    ↓
Realtimeで他のユーザーに通知
    ↓
各ユーザーのStoreが更新
    ↓
画面が自動的に再レンダリング
```

---

## ディレクトリ構造

```
codenames-clone/
├── client/                          # フロントエンド（React）
│   ├── src/
│   │   ├── main.tsx                 # エントリーポイント（アプリの起動地点）
│   │   ├── App.tsx                  # ルート定義（どのURLでどのページを表示するか）
│   │   │
│   │   ├── pages/                   # 各ページのコンポーネント
│   │   │   ├── TopPage.tsx          # トップページ（/）
│   │   │   ├── CreateRoomPage.tsx   # ルーム作成ページ（/create）
│   │   │   ├── LobbyPage.tsx        # ロビーページ（/room/:code）
│   │   │   ├── GamePage.tsx         # ゲーム画面（/room/:code/game）
│   │   │   └── ...                  # その他のページ
│   │   │
│   │   ├── components/              # 再利用可能なUIパーツ
│   │   │   ├── game/                # ゲーム関連コンポーネント
│   │   │   │   └── GameCard.tsx     # ゲームカード表示
│   │   │   ├── room/                # ルーム関連コンポーネント
│   │   │   ├── layout/              # レイアウト関連
│   │   │   └── ui/                  # 汎用UIコンポーネント
│   │   │
│   │   ├── services/                # API通信・ビジネスロジック
│   │   │   ├── roomService.ts       # ルーム関連のAPI呼び出し
│   │   │   ├── gameService.ts       # ゲーム関連のAPI呼び出し
│   │   │   ├── wordPackService.ts   # 単語パック関連
│   │   │   └── realtimeService.ts   # リアルタイム通信
│   │   │
│   │   ├── stores/                  # 状態管理（Zustand）
│   │   │   ├── gameStore.ts         # ゲーム状態（カード、ヒント等）
│   │   │   ├── roomStore.ts         # ルーム情報
│   │   │   └── playerStore.ts       # プレイヤー情報
│   │   │
│   │   ├── hooks/                   # カスタムReactフック
│   │   │   └── useRealtime.ts       # リアルタイム通信用フック
│   │   │
│   │   ├── utils/                   # ユーティリティ関数
│   │   │   └── gameLogic.ts         # ゲームロジック（勝敗判定等）
│   │   │
│   │   ├── types/                   # TypeScript型定義
│   │   │   ├── index.ts             # メイン型定義
│   │   │   └── supabase.ts          # Supabase型定義
│   │   │
│   │   └── lib/                     # ライブラリ設定
│   │       └── supabase.ts          # Supabaseクライアント設定
│   │
│   ├── e2e/                         # E2Eテスト（Playwright）
│   ├── __tests__/                   # ユニットテスト（Vitest）
│   └── package.json                 # 依存パッケージ管理
│
├── server/                          # バックエンド（Prismaスキーマ）
│   └── prisma/
│       ├── schema.prisma            # データベーススキーマ定義
│       ├── migrations/              # DBマイグレーションファイル
│       └── seed.ts                  # 初期データ投入スクリプト
│
├── docs/                            # ドキュメント
│   ├── ARCHITECTURE.md              # このファイル
│   └── plans/                       # 実装計画書
│
├── README.md                        # プロジェクト概要
└── CLAUDE.md                        # 設計書
```

### 各ディレクトリの役割

| ディレクトリ | 役割 | 例 |
|-------------|------|-----|
| `pages/` | 各URLに対応するページコンポーネント | TopPage.tsx = トップページ |
| `components/` | 再利用可能なUI部品 | GameCard = カード表示 |
| `services/` | APIとの通信を担当 | roomService = ルーム作成・取得 |
| `stores/` | アプリ全体で共有する状態 | gameStore = カード・ヒントの状態 |
| `utils/` | 共通で使う便利な関数 | gameLogic = 勝敗判定 |
| `types/` | TypeScriptの型定義 | Room, Player, Card等 |

---

## データベース設計

### ER図（エンティティ関係図）

```
┌──────────────┐       ┌──────────────┐
│  word_packs  │───┐   │    words     │
│              │   │   │              │
│ id           │   └──→│ word_pack_id │
│ name         │       │ word         │
│ is_public    │       └──────────────┘
└──────────────┘
        │
        │ 1:N（1つの単語パックに複数のルーム）
        ▼
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    rooms     │───┐   │   players    │   ┌──│    cards     │
│              │   │   │              │   │  │              │
│ id           │   └──→│ room_id      │   │  │ room_id      │
│ code (ABC123)│       │ nickname     │   │  │ word         │
│ status       │       │ team         │   │  │ type         │
│ current_turn │       │ role         │   │  │ is_revealed  │
└──────────────┘       └──────────────┘   │  └──────────────┘
        │                      │           │
        │                      │           │
        │ 1:N                  │ 1:N       │ 1:N
        ▼                      ▼           │
┌──────────────┐       ┌──────────────┐   │
│    hints     │       │              │   │
│              │       │              │   │
│ room_id      │       │              │   │
│ player_id    │───────┘              │   │
│ word         │                      │   │
│ count        │                      │   │
└──────────────┘                      └───┘
```

### 主要なテーブル

#### 1. **rooms**（ルーム）

ゲームの部屋を管理します。

| カラム | 型 | 説明 | 例 |
|--------|-----|------|-----|
| `id` | UUID | ルームの一意なID | `550e8400-e29b-41d4-a716-446655440000` |
| `code` | VARCHAR(6) | 参加用の6桁コード | `ABC123` |
| `name` | VARCHAR(100) | ルーム名 | `友達とプレイ` |
| `status` | ENUM | ゲーム状態 | `WAITING`, `PLAYING`, `FINISHED` |
| `is_public` | BOOLEAN | 公開ルームか | `true` / `false` |
| `word_pack_id` | UUID | 使用する単語パック | UUID |
| `current_turn` | ENUM | 現在のターン | `RED` / `BLUE` |
| `winner` | ENUM | 勝者 | `RED` / `BLUE` / `null` |
| `timer_seconds` | INT | ターン制限時間（秒） | `60` / `null` |

#### 2. **players**（プレイヤー）

ルームに参加しているプレイヤー情報。

| カラム | 型 | 説明 | 例 |
|--------|-----|------|-----|
| `id` | UUID | プレイヤーID | UUID |
| `room_id` | UUID | 所属ルーム | UUID |
| `nickname` | VARCHAR(50) | ニックネーム | `太郎` |
| `team` | ENUM | チーム | `RED` / `BLUE` / `SPECTATOR` |
| `role` | ENUM | 役割 | `SPYMASTER` / `OPERATIVE` / `null` |
| `session_id` | VARCHAR | ブラウザごとの識別子 | `session_xxx` |
| `is_host` | BOOLEAN | ホストか | `true` / `false` |
| `spectator_view` | ENUM | 観戦時のビュー | `SPYMASTER` / `OPERATIVE` |

**重要**:
- `session_id`はブラウザごとに生成される一意なIDです
- 同じブラウザで複数のタブを開いても同じ`session_id`になります
- これにより「自分のプレイヤー」を識別できます

#### 3. **cards**（カード）

ゲームボード上の25枚のカード。

| カラム | 型 | 説明 | 例 |
|--------|-----|------|-----|
| `id` | UUID | カードID | UUID |
| `room_id` | UUID | 所属ルーム | UUID |
| `word` | VARCHAR(100) | 単語 | `りんご` |
| `position` | INT | 位置（0-24） | `5` |
| `type` | ENUM | カードの種類 | `RED` / `BLUE` / `NEUTRAL` / `ASSASSIN` |
| `is_revealed` | BOOLEAN | 公開済みか | `true` / `false` |
| `revealed_by` | UUID | 公開したプレイヤー | UUID / `null` |

**カードタイプ**:
- `RED`: 赤チームのカード（9枚）
- `BLUE`: 青チームのカード（8枚）
- `NEUTRAL`: 中立カード（7枚）
- `ASSASSIN`: 暗殺者（1枚）- これを引いたら即負け！

#### 4. **hints**（ヒント）

スパイマスターが出したヒントの履歴。

| カラム | 型 | 説明 | 例 |
|--------|-----|------|-----|
| `id` | UUID | ヒントID | UUID |
| `room_id` | UUID | 所属ルーム | UUID |
| `player_id` | UUID | ヒントを出したプレイヤー | UUID |
| `word` | VARCHAR(100) | ヒント単語 | `動物` |
| `count` | INT | 推測可能数 | `3` |
| `team` | ENUM | チーム | `RED` / `BLUE` |
| `created_at` | TIMESTAMP | 作成日時 | `2025-01-01 12:00:00` |

#### 5. **word_packs**（単語パック）

ゲームで使用する単語のセット。

| カラム | 型 | 説明 | 例 |
|--------|-----|------|-----|
| `id` | UUID | パックID | UUID |
| `name` | VARCHAR(100) | パック名 | `デフォルト日本語` |
| `description` | TEXT | 説明 | `基本的な日本語単語` |
| `is_public` | BOOLEAN | 公開パックか | `true` / `false` |
| `is_default` | BOOLEAN | システムデフォルトか | `true` / `false` |
| `language` | VARCHAR(10) | 言語 | `ja` / `en` |

#### 6. **words**（単語）

各単語パックに含まれる単語。

| カラム | 型 | 説明 | 例 |
|--------|-----|------|-----|
| `id` | UUID | 単語ID | UUID |
| `word_pack_id` | UUID | 所属パック | UUID |
| `word` | VARCHAR(100) | 単語 | `りんご` |

---

## フロントエンド詳細

### エントリーポイント: `main.tsx`

```tsx
// アプリの起動地点
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>  {/* ルーティング機能を有効化 */}
      <App />        {/* メインアプリコンポーネント */}
    </BrowserRouter>
  </React.StrictMode>
);
```

**役割**:
1. HTMLの`<div id="root">`要素を見つける
2. そこにReactアプリを「マウント」（描画）する
3. `BrowserRouter`でルーティング機能を有効化

### ルート定義: `App.tsx`

```tsx
function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<TopPage />} />
        <Route path="/create" element={<CreateRoomPage />} />
        <Route path="/room/:code" element={<LobbyPage />} />
        <Route path="/room/:code/game" element={<GamePage />} />
        {/* ... 他のルート */}
      </Routes>
    </div>
  );
}
```

**URLとページの対応**:

| URL | ページコンポーネント | 説明 |
|-----|---------------------|------|
| `/` | TopPage | トップページ |
| `/create` | CreateRoomPage | ルーム作成ページ |
| `/join` | JoinRoomPage | ルーム参加ページ |
| `/rooms` | RoomListPage | 公開ルーム一覧 |
| `/room/ABC123` | LobbyPage | ロビー（ゲーム開始前） |
| `/room/ABC123/game` | GamePage | ゲーム画面 |
| `/word-packs` | WordPackListPage | 単語パック管理 |

**`:code`の意味**:
- `:code`はURL内の**パラメータ**です
- 例: `/room/ABC123`なら`code = "ABC123"`
- コンポーネント内で`useParams()`を使って取得できます

```tsx
import { useParams } from 'react-router-dom';

function LobbyPage() {
  const { code } = useParams(); // code = "ABC123"
  // ...
}
```

### 型定義: `types/index.ts`

TypeScriptの型定義ファイルです。データの「形」を定義します。

```typescript
// Enumは定数のセット
export enum Team {
  RED = 'RED',        // 赤チーム
  BLUE = 'BLUE',      // 青チーム
  SPECTATOR = 'SPECTATOR'  // 観戦者
}

// Interfaceはオブジェクトの形を定義
export interface Player {
  id: string;
  roomId: string;
  nickname: string;
  team: Team;  // ← Team enumを使用
  role: PlayerRole | null;
  // ...
}
```

**なぜ型定義が重要？**
- **タイプミス防止**: `player.nicname`と書いたらエディタがエラーを表示
- **自動補完**: `player.`と打つとプロパティ一覧が出る
- **バグの早期発見**: コンパイル時に型エラーを検出

### Supabase設定: `lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

// 環境変数から接続情報を取得
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 環境変数がない場合はエラー
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase環境変数が設定されていません。.env.localファイルを確認してください。'
  );
}

// Supabaseクライアントを作成
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,  // リアルタイム更新の頻度
    },
  },
});
```

**`import.meta.env`とは？**
- Viteが提供する環境変数へのアクセス方法
- `.env.local`ファイルに書いた値を読み込む
- `VITE_`で始まる変数のみアクセス可能（セキュリティのため）

### サービス層: `services/`

サービス層はAPIとの通信を担当します。

#### `roomService.ts` - ルーム関連

```typescript
/**
 * ルームを作成
 */
export async function createRoom(params: {
  roomName: string;
  hostNickname: string;
  wordPackId: string;
  isPublic: boolean;
  timerSeconds: number | null;
}): Promise<CreateRoomResponse> {
  const code = generateRoomCode();  // ランダムな6桁コード生成
  const sessionId = getSessionId(); // ブラウザごとの識別子取得

  // 1. ルーム作成
  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .insert({
      code,
      name: params.roomName,
      status: RoomStatus.WAITING,
      // ...
    })
    .select()
    .single();

  // エラーチェック
  if (roomError || !room) {
    throw new Error('ルームの作成に失敗しました');
  }

  // 2. ホストプレイヤー作成
  const { data: player, error: playerError } = await supabase
    .from('players')
    .insert({
      room_id: room.id,
      nickname: params.hostNickname,
      team: 'SPECTATOR',
      is_host: true,  // ホストフラグ
      // ...
    })
    .select()
    .single();

  return { room, player };
}
```

**処理の流れ**:
1. 6桁のルームコード（例: `ABC123`）を生成
2. `session_id`（ブラウザ識別子）を取得
3. Supabaseの`rooms`テーブルに新規ルームを挿入
4. `players`テーブルにホストプレイヤーを挿入
5. 作成したルームとプレイヤー情報を返す

#### `gameService.ts` - ゲーム関連

```typescript
/**
 * ゲームを開始
 */
export async function startGame(
  roomId: string,
  wordPackId: string
): Promise<Card[]> {
  // 1. 単語パックから単語を取得（最大1000語）
  const { data: words } = await supabase
    .from('words')
    .select('word')
    .eq('word_pack_id', wordPackId)
    .limit(1000);

  // 2. ランダムに25個選択
  const selectedWords = selectRandomWords(
    words.map(w => w.word),
    25
  );

  // 3. カード配置生成（赤9、青8、中立7、暗殺者1）
  const cardTypes = generateCardLayout();

  // 4. カードをDBに保存
  const cardsToInsert = selectedWords.map((word, index) => ({
    room_id: roomId,
    word,
    position: index,      // 0-24の位置
    type: cardTypes[index], // RED/BLUE/NEUTRAL/ASSASSIN
    is_revealed: false,
  }));

  const { data: cards } = await supabase
    .from('cards')
    .insert(cardsToInsert)
    .select();

  // 5. ルームステータスを「PLAYING」に更新
  await supabase
    .from('rooms')
    .update({
      status: RoomStatus.PLAYING,
      current_turn: Team.RED,  // 赤チームから開始
    })
    .eq('id', roomId);

  return cards;
}
```

**ゲーム開始の流れ**:
1. 選択された単語パックから単語を取得
2. ランダムに25個選ぶ
3. カードタイプを割り当て（赤9、青8、中立7、暗殺者1）
4. シャッフルして配置を決定
5. データベースに保存
6. ルームステータスを「プレイ中」に変更

### 状態管理: `stores/gameStore.ts`

Zustandを使ったグローバル状態管理。

```typescript
interface GameState {
  cards: Card[];       // カード一覧
  hints: Hint[];       // ヒント履歴
  currentTurn: Team | null;  // 現在のターン
  winner: Team | null;       // 勝者

  // 状態を更新する関数
  setCards: (cards: Card[]) => void;
  addHint: (hint: Hint) => void;
  revealCard: (cardId: string, revealedBy: string) => void;
  // ...
}

export const useGameStore = create<GameState>((set) => ({
  // 初期状態
  cards: [],
  hints: [],
  currentTurn: null,
  winner: null,

  // カード一覧をセット
  setCards: (cards) => set({ cards }),

  // ヒントを追加
  addHint: (hint) => set((state) => ({
    hints: [...state.hints, hint],
  })),

  // カードを公開
  revealCard: (cardId, revealedBy) => set((state) => ({
    cards: state.cards.map((card) =>
      card.id === cardId
        ? { ...card, isRevealed: true, revealedBy }
        : card
    ),
  })),

  // ゲーム状態をクリア
  clearGame: () => set({
    cards: [],
    hints: [],
    currentTurn: null,
    winner: null,
  }),
}));
```

**使い方（コンポーネント内）**:

```tsx
function GamePage() {
  // Storeから状態と関数を取得
  const { cards, currentTurn, revealCard } = useGameStore();

  const handleCardClick = (cardId: string) => {
    // カードを公開
    revealCard(cardId, myPlayerId);
  };

  return (
    <div>
      <p>現在のターン: {currentTurn}</p>
      {cards.map(card => (
        <GameCard
          key={card.id}
          card={card}
          onClick={() => handleCardClick(card.id)}
        />
      ))}
    </div>
  );
}
```

**Zustandの仕組み**:
```
┌────────────────────────────────────────┐
│  useGameStore (グローバルStore)        │
│  ┌────────────────────────────────┐   │
│  │ State: { cards, hints, ... }   │   │
│  └────────────────────────────────┘   │
│           ↓          ↑                 │
│      読み取り      更新関数             │
└────────────────────────────────────────┘
           ↓          ↑
    ┌───────────┐  ┌───────────┐
    │Component A│  │Component B│
    └───────────┘  └───────────┘
```

### ゲームロジック: `utils/gameLogic.ts`

```typescript
/**
 * カード配置を生成
 * 赤9枚、青8枚、中立7枚、暗殺者1枚の合計25枚
 */
export function generateCardLayout(): CardType[] {
  const layout: CardType[] = [];

  // 赤9枚
  for (let i = 0; i < 9; i++) {
    layout.push(CardType.RED);
  }

  // 青8枚
  for (let i = 0; i < 8; i++) {
    layout.push(CardType.BLUE);
  }

  // 中立7枚
  for (let i = 0; i < 7; i++) {
    layout.push(CardType.NEUTRAL);
  }

  // 暗殺者1枚
  layout.push(CardType.ASSASSIN);

  // Fisher-Yatesアルゴリズムでシャッフル
  return shuffleArray(layout);
}

/**
 * 勝利判定
 */
export function checkWinner(
  cards: Array<{ type: CardType; isRevealed: boolean }>
): Team | null {
  // 赤チームのカードが全て公開されたか
  const redCards = cards.filter(c => c.type === CardType.RED);
  const redRevealed = redCards.filter(c => c.isRevealed);

  if (redCards.length === redRevealed.length && redCards.length > 0) {
    return Team.RED;  // 赤チームの勝利
  }

  // 青チームのカードが全て公開されたか
  const blueCards = cards.filter(c => c.type === CardType.BLUE);
  const blueRevealed = blueCards.filter(c => c.isRevealed);

  if (blueCards.length === blueRevealed.length && blueCards.length > 0) {
    return Team.BLUE;  // 青チームの勝利
  }

  return null;  // まだ勝者なし
}
```

**Fisher-Yatesシャッフルとは？**
```
配列を均等にランダム化するアルゴリズム

例: [RED, RED, BLUE, NEUTRAL, ASSASSIN]

1. 最後の要素を選ぶ
2. ランダムな位置と入れ替え
3. 最後から2番目の要素を選ぶ
4. ランダムな位置と入れ替え
5. これを繰り返す

結果: 完全にランダムな配列
```

---

## バックエンド詳細

### Prismaスキーマ: `server/prisma/schema.prisma`

Prismaはデータベースとの橋渡し役です。

```prisma
model Room {
  id            String       @id @default(uuid())
  code          String       @unique @db.VarChar(6)
  name          String       @db.VarChar(100)
  status        RoomStatus   @default(WAITING)

  // リレーション（関連）
  wordPack      WordPack     @relation(fields: [wordPackId], references: [id])
  players       Player[]     // 1:N（1つのルームに複数のプレイヤー）
  cards         Card[]       // 1:N
  hints         Hint[]       // 1:N

  @@map("rooms")  // テーブル名を"rooms"にマッピング
}
```

**リレーションの読み方**:
- `players Player[]`: このルームには複数の`Player`が紐づく
- `@relation(fields: [wordPackId], references: [id])`:
  - このテーブルの`wordPackId`カラムが
  - `WordPack`テーブルの`id`カラムを参照する（外部キー）

### Supabaseとの連携

```
┌────────────────────────────────────────┐
│  React App（フロントエンド）            │
│                                        │
│  supabase.from('rooms').select('*')   │
└────────────────────────────────────────┘
                   ↓
        Supabase Client Library
                   ↓
┌────────────────────────────────────────┐
│  Supabase（クラウド）                   │
│                                        │
│  PostgreSQL Database                   │
│  ┌──────────────────────────────────┐  │
│  │  rooms table                     │  │
│  │  ┌────┬──────┬──────┬─────────┐ │  │
│  │  │ id │ code │ name │ status  │ │  │
│  │  ├────┼──────┼──────┼─────────┤ │  │
│  │  │ 1  │ABC123│ ... │WAITING  │ │  │
│  │  └────┴──────┴──────┴─────────┘ │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
```

---

## 主要な処理フロー

### 1. ルーム作成からゲーム開始まで

```
┌─────────────────────────────────────────────────────────────┐
│ 1. ユーザーがルーム作成ページで情報を入力                    │
│    - ルーム名: 「友達とプレイ」                              │
│    - ニックネーム: 「太郎」                                  │
│    - 単語パック: 「デフォルト日本語」                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. CreateRoomPage.tsx                                       │
│    - フォーム送信時にroomService.createRoom()を呼び出し      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. roomService.createRoom()                                 │
│    - ルームコード生成: "ABC123"                             │
│    - session_id取得: "session_xxx"                          │
│    - supabase.from('rooms').insert() → ルーム作成            │
│    - supabase.from('players').insert() → ホスト登録          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Supabase Database                                        │
│    - roomsテーブルにレコード追加                             │
│    - playersテーブルにレコード追加                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. CreateRoomPage.tsx                                       │
│    - レスポンス受信                                          │
│    - navigate(`/room/${code}`) でロビーに遷移                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. LobbyPage.tsx                                            │
│    - URLパラメータからルームコード取得: "ABC123"             │
│    - roomService.getRoomByCode("ABC123")でルーム情報取得     │
│    - プレイヤー一覧表示                                      │
│    - チーム・役割選択UI表示                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. 他のプレイヤーが参加                                      │
│    - /room/ABC123 にアクセス                                │
│    - roomService.joinRoom() → playersテーブルに追加          │
│    - Realtime購読で全員に通知                                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. チーム・役割選択                                          │
│    - プレイヤーがチーム選択（赤/青）                         │
│    - 役割選択（スパイマスター/オペレーティブ）               │
│    - roomService.updatePlayer() → playersテーブル更新        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 9. ゲーム開始                                                │
│    - ホストが「ゲーム開始」ボタンをクリック                  │
│    - gameService.startGame()                                │
│      - 単語パックから25個の単語をランダム選択                │
│      - カード配置生成（赤9、青8、中立7、暗殺者1）            │
│      - cardsテーブルに25枚のカードを保存                     │
│      - roomsテーブルのstatusを"PLAYING"に更新                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 10. GamePage.tsx                                            │
│     - /room/ABC123/game に遷移                              │
│     - ゲームデータ取得                                       │
│     - 5x5のゲームボード表示                                  │
│     - ゲーム開始！                                           │
└─────────────────────────────────────────────────────────────┘
```

### 2. ゲームプレイの流れ

```
┌─────────────────────────────────────────────────────────────┐
│ 赤チームのターン開始                                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 1. スパイマスターがヒントを出す                              │
│    - ヒント単語入力: 「動物」                                │
│    - 推測可能数: 3                                           │
│    - gameService.giveHint() → hintsテーブルに保存            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. オペレーティブがカードを選択                              │
│    - カードをクリック                                        │
│    - gameService.revealCard()                               │
│      - cardsテーブルのis_revealed = true に更新              │
│      - カードタイプに応じて処理:                             │
│        * 自チームカード → 推測継続可能                       │
│        * 相手チームカード → ターン終了                       │
│        * 中立カード → ターン終了                             │
│        * 暗殺者 → 即敗北                                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. 勝敗判定                                                  │
│    - checkWinner()関数で判定                                │
│      - 自チームのカード全て公開 → 勝利                       │
│      - 暗殺者を引いた → 相手チームの勝利                     │
│    - 勝者が決まったらroomsテーブルのwinnerを更新             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. ターン交代 or ゲーム終了                                  │
│    - ターン交代: current_turn を更新                         │
│    - ゲーム終了: status = "FINISHED" に更新                  │
└─────────────────────────────────────────────────────────────┘
```

### 3. リアルタイム同期の仕組み

```
┌────────────────┐                    ┌────────────────┐
│  プレイヤー A   │                    │  プレイヤー B   │
│  (ブラウザ)     │                    │  (ブラウザ)     │
└────────────────┘                    └────────────────┘
        │                                      │
        │ 1. カードを選択                      │
        │    revealCard()                      │
        ↓                                      │
┌────────────────────────────────────────────────────────────┐
│  Supabase Realtime                                         │
│                                                            │
│  1. cardsテーブルが更新される                               │
│  2. 購読中の全クライアントに通知                            │
│     "cards テーブルの position=5 のレコードが更新されました" │
└────────────────────────────────────────────────────────────┘
        │                                      │
        │ 2. 更新通知を受信                     │ 2. 更新通知を受信
        ↓                                      ↓
┌────────────────┐                    ┌────────────────┐
│  useGameStore  │                    │  useGameStore  │
│  revealCard()  │                    │  revealCard()  │
│  呼び出し      │                    │  呼び出し      │
└────────────────┘                    └────────────────┘
        │                                      │
        │ 3. 画面が自動更新                     │ 3. 画面が自動更新
        ↓                                      ↓
    カード表示が                           カード表示が
    更新される                             更新される
```

**Realtimeの購読設定例**:

```typescript
// cardsテーブルの変更を購読
supabase
  .channel(`room:${roomId}`)
  .on('postgres_changes',
    {
      event: '*',  // INSERT, UPDATE, DELETE
      schema: 'public',
      table: 'cards',
      filter: `room_id=eq.${roomId}`  // このルームのカードのみ
    },
    (payload) => {
      console.log('カードが更新されました:', payload);
      // Storeを更新
      revealCard(payload.new.id, payload.new.revealed_by);
    }
  )
  .subscribe();
```

---

## 重要な概念とパターン

### 1. セッションIDとプレイヤー識別

```typescript
export function getSessionId(): string {
  let sessionId = localStorage.getItem('codenames_session_id');
  if (!sessionId) {
    // 新しいIDを生成
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('codenames_session_id', sessionId);
  }
  return sessionId;
}
```

**仕組み**:
1. 初回アクセス時に`session_id`を生成
2. `localStorage`に保存（ブラウザを閉じても消えない）
3. 以降、同じブラウザからは同じ`session_id`を使用
4. `players`テーブルの`session_id`と照合して「自分」を識別

**なぜ必要？**
- 認証機能がないため、ブラウザごとにユニークなIDが必要
- リロードしても「自分のプレイヤー」を維持できる
- 複数タブを開いても同じプレイヤーとして扱われる

### 2. 楽観的UI更新

```typescript
const handleCardClick = async (cardId: string) => {
  // 1. 先に画面を更新（楽観的更新）
  revealCard(cardId, myPlayerId);

  // 2. 非同期でサーバーに送信
  try {
    await gameService.revealCard({
      cardId,
      playerId: myPlayerId,
      roomId,
    });
  } catch (error) {
    // 3. エラー時はロールバック
    console.error('カード公開失敗:', error);
    // 元に戻す処理...
  }
};
```

**メリット**:
- レスポンスが速く感じる（ラグがない）
- ユーザー体験が向上

**リスク**:
- ネットワークエラー時に不整合が起きる可能性
- エラーハンドリングが重要

### 3. データの正規化

データベースでは「正規化」という手法でデータの重複を避けます。

**悪い例（非正規化）**:
```
rooms テーブル
┌────┬──────┬────────┬─────────────┐
│ id │ code │  name  │  word_pack  │
├────┼──────┼────────┼─────────────┤
│ 1  │ABC123│ Room1  │ デフォルト  │  ← 重複
│ 2  │XYZ789│ Room2  │ デフォルト  │  ← 重複
└────┴──────┴────────┴─────────────┘
```

**良い例（正規化）**:
```
rooms テーブル
┌────┬──────┬────────┬──────────────┐
│ id │ code │  name  │ word_pack_id │
├────┼──────┼────────┼──────────────┤
│ 1  │ABC123│ Room1  │ wp-001       │ ← ID参照
│ 2  │XYZ789│ Room2  │ wp-001       │ ← ID参照
└────┴──────┴────────┴──────────────┘

word_packs テーブル
┌────────┬─────────────┐
│   id   │    name     │
├────────┼─────────────┤
│ wp-001 │ デフォルト  │ ← 1箇所のみ
└────────┴─────────────┘
```

**メリット**:
- データの重複がない
- 更新が1箇所で済む
- データ整合性が保たれる

### 4. カスケード削除

```prisma
model Player {
  roomId  String  @map("room_id")
  room    Room    @relation(fields: [roomId], references: [id], onDelete: Cascade)
}
```

`onDelete: Cascade`の意味:
- ルームが削除されたら、そのルームのプレイヤーも**自動的に**削除される
- 孤立したデータ（親がないデータ）を防ぐ

```
Room (id=1) を削除
    ↓
Player (room_id=1) も自動削除
Card (room_id=1) も自動削除
Hint (room_id=1) も自動削除
```

---

## よくある質問

### Q1: なぜTypeScriptを使うの？

**A**: JavaScriptに型の概念を追加したものがTypeScriptです。

**メリット**:
- エディタの補完が効く → 開発が速い
- タイプミスを防げる → バグが減る
- リファクタリングが安全 → 保守しやすい

```typescript
// JavaScript（型なし）
function add(a, b) {
  return a + b;
}
add(1, "2");  // "12" ← バグ！

// TypeScript（型あり）
function add(a: number, b: number): number {
  return a + b;
}
add(1, "2");  // エラー！stringは渡せない
```

### Q2: Zustandって何？なぜReduxじゃないの？

**A**: ZustandもReduxも「状態管理ライブラリ」です。

**Zustandのメリット**:
- シンプルで学習コストが低い
- ボイラープレート（定型コード）が少ない
- 小〜中規模アプリに最適

```typescript
// Zustand（シンプル）
const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));

// Redux（複雑）
// action, reducer, storeの3つが必要
const INCREMENT = 'INCREMENT';
function increment() { return { type: INCREMENT }; }
function reducer(state, action) { ... }
const store = createStore(reducer);
```

### Q3: SupabaseとFirebaseの違いは？

| 項目 | Supabase | Firebase |
|------|----------|----------|
| **データベース** | PostgreSQL（SQL） | Firestore（NoSQL） |
| **クエリ** | SQLライク | 独自のクエリ |
| **オープンソース** | ✅ Yes | ❌ No |
| **自己ホスト可能** | ✅ Yes | ❌ No |
| **学習コスト** | SQLの知識が使える | 独自の学習が必要 |

**Supabaseを選んだ理由**:
- SQLの知識が活かせる
- Prismaと組み合わせやすい
- リレーショナルデータベースが扱いやすい

### Q4: なぜViteを使うの？

**A**: Viteは次世代のフロントエンドビルドツールです。

**従来のツール（Webpack）との違い**:

| 項目 | Webpack | Vite |
|------|---------|------|
| **起動速度** | 遅い（数十秒） | 速い（数秒） |
| **HMR** | 遅い | 爆速 |
| **設定** | 複雑 | シンプル |

**HMR (Hot Module Replacement)**:
- コードを変更したら**即座に**ブラウザに反映
- ページリロード不要
- 開発体験が劇的に向上

### Q5: なぜコンポーネントを細かく分けるの？

**A**: 再利用性と保守性のためです。

**悪い例**:
```tsx
// GamePage.tsx（1000行）
function GamePage() {
  return (
    <div>
      {/* カード表示のコード 200行 */}
      {/* ヒント表示のコード 150行 */}
      {/* チャットのコード 100行 */}
      {/* ... */}
    </div>
  );
}
```

**良い例**:
```tsx
// GamePage.tsx（50行）
function GamePage() {
  return (
    <div>
      <GameBoard />
      <HintHistory />
      <ChatPanel />
    </div>
  );
}

// components/game/GameBoard.tsx（150行）
// components/game/HintHistory.tsx（100行）
// components/game/ChatPanel.tsx（80行）
```

**メリット**:
- 各ファイルが短くて読みやすい
- コンポーネントを他のページでも使える
- テストが書きやすい
- チーム開発で役割分担しやすい

### Q6: async/awaitって何？

**A**: 非同期処理（時間がかかる処理）を扱うための構文です。

```typescript
// 従来の方法（コールバック）
function getData() {
  fetch('/api/rooms')
    .then(response => response.json())
    .then(data => {
      console.log(data);
    })
    .catch(error => {
      console.error(error);
    });
}

// async/await（読みやすい）
async function getData() {
  try {
    const response = await fetch('/api/rooms');
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}
```

**await**の意味:
- 「ここで結果が返ってくるまで待つ」
- 同期的なコードのように書ける
- エラーハンドリングが簡単（try-catch）

### Q7: Reactのフックって何？

**A**: 関数コンポーネントで状態やライフサイクルを扱うための機能です。

**主要なフック**:

```typescript
// useState - ローカル状態管理
const [count, setCount] = useState(0);

// useEffect - 副作用（API呼び出し等）
useEffect(() => {
  fetchData();
}, []);  // []は「初回のみ実行」の意味

// useParams - URLパラメータ取得
const { code } = useParams();

// useMemo - 計算結果のキャッシュ
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(a, b);
}, [a, b]);

// useCallback - 関数のキャッシュ
const handleClick = useCallback(() => {
  doSomething();
}, []);
```

---

## まとめ

このプロジェクトは以下の技術スタックで構成されています：

```
フロントエンド: React + TypeScript + Zustand + Tailwind CSS
バックエンド: Supabase (PostgreSQL + Realtime)
ビルドツール: Vite
テスト: Vitest + Playwright
```

**重要なポイント**:

1. **コンポーネント設計**: 小さく、再利用可能に
2. **状態管理**: Zustandでグローバル状態を管理
3. **型安全性**: TypeScriptで型エラーを防ぐ
4. **リアルタイム同期**: Supabase Realtimeで自動同期
5. **サービス層**: API通信をサービス関数に分離

**学習の進め方**:

1. まずは**トップページ**から読み始める
2. **ルート定義**（App.tsx）で全体の流れを把握
3. 1つのページ（例: CreateRoomPage）を詳しく読む
4. そのページが使っている**Service**を読む
5. **Store**の仕組みを理解する
6. 他のページにも応用

**困ったときは**:
- エラーメッセージをよく読む
- console.logでデバッグ
- React DevToolsで状態を確認
- このドキュメントを参照

Happy Coding! 🎯
