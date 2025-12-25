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
| Socket.io-client | 4.x | リアルタイム通信 |
| React Router | 6.x | ルーティング |
| Zustand | 4.x | 状態管理 |

### 2.2 バックエンド
| 技術 | バージョン | 用途 |
|------|-----------|------|
| Node.js | 20.x LTS | ランタイム |
| Express | 4.x | HTTPサーバー |
| TypeScript | 5.x | 型安全な開発 |
| Socket.io | 4.x | WebSocket通信 |
| Prisma | 5.x | ORM |
| PostgreSQL | 15.x | データベース |

### 2.3 インフラ（想定）
| 技術 | 用途 |
|------|------|
| Docker | コンテナ化 |
| Docker Compose | ローカル開発環境 |

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
│ creator_sid  │
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
│ word_pack_id │       │ session_id   │       │ team         │
│ current_turn │       │ is_host      │       │ created_at   │
│ winner       │       │ created_at   │       └──────────────┘
│ timer_sec    │       └──────────────┘
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

### 4.2 テーブル定義

#### rooms
| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PK | ルームID |
| code | VARCHAR(6) | UNIQUE, NOT NULL | 参加用コード |
| name | VARCHAR(100) | NOT NULL | ルーム名 |
| status | ENUM | NOT NULL, DEFAULT 'waiting' | waiting/playing/finished |
| is_public | BOOLEAN | NOT NULL, DEFAULT true | 公開フラグ |
| word_pack_id | UUID | FK | 使用する単語パック |
| current_turn | ENUM | NULL | red/blue |
| winner | ENUM | NULL | red/blue |
| timer_seconds | INTEGER | NULL | ターン制限時間（秒） |
| created_at | TIMESTAMP | NOT NULL | 作成日時 |
| updated_at | TIMESTAMP | NOT NULL | 最終更新日時 |

#### players
| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PK | プレイヤーID |
| room_id | UUID | FK, NOT NULL | 所属ルーム |
| nickname | VARCHAR(50) | NOT NULL | ニックネーム |
| team | ENUM | NOT NULL, DEFAULT 'spectator' | red/blue/spectator |
| role | ENUM | NULL | spymaster/operative |
| session_id | VARCHAR(255) | NOT NULL | Socket.io セッションID |
| is_host | BOOLEAN | NOT NULL, DEFAULT false | ホストフラグ |
| spectator_view | ENUM | DEFAULT 'operative' | spymaster/operative（観戦時） |
| created_at | TIMESTAMP | NOT NULL | 参加日時 |

#### cards
| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PK | カードID |
| room_id | UUID | FK, NOT NULL | 所属ルーム |
| word | VARCHAR(100) | NOT NULL | 単語 |
| position | INTEGER | NOT NULL | 位置（0-24） |
| type | ENUM | NOT NULL | red/blue/neutral/assassin |
| is_revealed | BOOLEAN | NOT NULL, DEFAULT false | 公開済みフラグ |
| revealed_by | UUID | FK, NULL | 公開したプレイヤー |

#### hints
| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PK | ヒントID |
| room_id | UUID | FK, NOT NULL | 所属ルーム |
| player_id | UUID | FK, NOT NULL | ヒントを出したプレイヤー |
| word | VARCHAR(100) | NOT NULL | ヒント単語 |
| count | INTEGER | NOT NULL | 推測可能数 |
| team | ENUM | NOT NULL | red/blue |
| created_at | TIMESTAMP | NOT NULL | 作成日時 |

#### word_packs
| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PK | パックID |
| name | VARCHAR(100) | NOT NULL | パック名 |
| description | TEXT | NULL | 説明 |
| is_public | BOOLEAN | NOT NULL, DEFAULT false | 公開フラグ |
| is_default | BOOLEAN | NOT NULL, DEFAULT false | システムデフォルト |
| language | VARCHAR(10) | NOT NULL, DEFAULT 'ja' | 言語コード |
| creator_session_id | VARCHAR(255) | NULL | 作成者セッションID |
| created_at | TIMESTAMP | NOT NULL | 作成日時 |

#### words
| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PK | 単語ID |
| word_pack_id | UUID | FK, NOT NULL | 所属パック |
| word | VARCHAR(100) | NOT NULL | 単語 |

---

## 5. API設計

### 5.1 REST API

#### ルーム

| メソッド | エンドポイント | 説明 |
|----------|----------------|------|
| POST | /api/rooms | ルーム作成 |
| GET | /api/rooms | 公開ルーム一覧取得 |
| GET | /api/rooms/:code | ルーム情報取得 |
| DELETE | /api/rooms/:id | ルーム削除（ホストのみ） |

#### 単語パック

| メソッド | エンドポイント | 説明 |
|----------|----------------|------|
| GET | /api/word-packs | 公開パック一覧取得 |
| GET | /api/word-packs/:id | パック詳細取得 |
| POST | /api/word-packs | パック作成 |
| PUT | /api/word-packs/:id | パック更新 |
| DELETE | /api/word-packs/:id | パック削除 |

### 5.2 API詳細

#### POST /api/rooms
ルームを作成する。

**リクエスト:**
```json
{
  "name": "友達とコードネーム",
  "isPublic": true,
  "wordPackId": "uuid-word-pack-id",
  "timerSeconds": null,
  "hostNickname": "太郎"
}
```

**レスポンス:**
```json
{
  "id": "uuid-room-id",
  "code": "ABC123",
  "name": "友達とコードネーム",
  "status": "waiting",
  "isPublic": true,
  "wordPackId": "uuid-word-pack-id",
  "timerSeconds": null,
  "createdAt": "2025-01-01T00:00:00Z",
  "host": {
    "id": "uuid-player-id",
    "nickname": "太郎",
    "sessionId": "socket-session-id"
  }
}
```

#### GET /api/rooms
公開ルーム一覧を取得する。

**レスポンス:**
```json
{
  "rooms": [
    {
      "id": "uuid-room-id",
      "code": "ABC123",
      "name": "友達とコードネーム",
      "status": "waiting",
      "playerCount": 4,
      "maxPlayers": 12,
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

#### GET /api/rooms/:code
ルームコードでルーム情報を取得する。

**レスポンス:**
```json
{
  "id": "uuid-room-id",
  "code": "ABC123",
  "name": "友達とコードネーム",
  "status": "playing",
  "isPublic": true,
  "wordPack": {
    "id": "uuid-word-pack-id",
    "name": "デフォルト日本語"
  },
  "currentTurn": "red",
  "players": [
    {
      "id": "uuid-player-id",
      "nickname": "太郎",
      "team": "red",
      "role": "spymaster",
      "isHost": true
    }
  ],
  "teamCounts": {
    "red": { "total": 9, "revealed": 3 },
    "blue": { "total": 8, "revealed": 2 }
  }
}
```

#### POST /api/word-packs
単語パックを作成する。

**リクエスト:**
```json
{
  "name": "アニメ用語パック",
  "description": "アニメに関する単語を集めました",
  "isPublic": true,
  "language": "ja",
  "words": ["主人公", "ヒロイン", "必殺技", "..."]
}
```

**レスポンス:**
```json
{
  "id": "uuid-word-pack-id",
  "name": "アニメ用語パック",
  "description": "アニメに関する単語を集めました",
  "isPublic": true,
  "language": "ja",
  "wordCount": 150,
  "createdAt": "2025-01-01T00:00:00Z"
}
```

---

## 6. WebSocket イベント設計

### 6.1 クライアント → サーバー

| イベント名 | ペイロード | 説明 |
|-----------|-----------|------|
| join_room | `{ roomCode, nickname }` | ルームに参加 |
| leave_room | `{}` | ルームから退出 |
| select_team | `{ team: 'red' \| 'blue' \| 'spectator' }` | チーム選択 |
| select_role | `{ role: 'spymaster' \| 'operative' }` | 役割選択 |
| set_spectator_view | `{ view: 'spymaster' \| 'operative' }` | 観戦ビュー設定 |
| start_game | `{}` | ゲーム開始（ホストのみ） |
| give_hint | `{ word, count }` | ヒントを出す |
| select_card | `{ position }` | カードを選択 |
| end_turn | `{}` | ターン終了（パス） |
| restart_game | `{}` | 再戦（ホストのみ） |
| send_chat | `{ message }` | チャットメッセージ送信 |

### 6.2 サーバー → クライアント

| イベント名 | ペイロード | 説明 |
|-----------|-----------|------|
| room_state | `{ room, players, cards, hints }` | ルーム全体の状態 |
| player_joined | `{ player }` | プレイヤー参加通知 |
| player_left | `{ playerId }` | プレイヤー退出通知 |
| player_updated | `{ player }` | プレイヤー情報更新 |
| game_started | `{ cards, currentTurn }` | ゲーム開始通知 |
| hint_given | `{ hint }` | ヒント通知 |
| card_revealed | `{ card, nextTurn, gameOver, winner }` | カード公開結果 |
| turn_changed | `{ currentTurn }` | ターン変更通知 |
| game_over | `{ winner, cards }` | ゲーム終了通知 |
| chat_message | `{ playerId, nickname, message, timestamp }` | チャット受信 |
| error | `{ code, message }` | エラー通知 |

### 6.3 イベントフロー

```
【ルーム参加フロー】
Client                          Server
   |-- join_room --------------->|
   |<-- room_state --------------|
   |<-- player_joined (broadcast)|

【ゲーム開始フロー】
Host                            Server                          Others
  |-- start_game -------------->|                                  |
  |<-- game_started ------------|-- game_started (broadcast) ----->|

【ターンフロー（スパイマスター）】
Spymaster                       Server                          Operatives
     |-- give_hint ------------>|                                  |
     |<-- hint_given -----------|-- hint_given (broadcast) ------->|

【ターンフロー（オペレーティブ）】
Operative                       Server                          All
     |-- select_card ---------->|                                  |
     |<-- card_revealed --------|-- card_revealed (broadcast) ---->|
     |                          |                                  |
     |-- end_turn ------------->| (or continue selecting)          |
     |<-- turn_changed ---------|-- turn_changed (broadcast) ----->|
```

---

## 7. 画面設計

### 7.1 画面一覧

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

### 7.2 画面詳細

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
│  │   太郎              │       │   (空き)            │          │
│  │ [選択]              │       │   [選択]            │          │
│  ├─────────────────────┤       ├─────────────────────┤          │
│  │ 🔍 オペレーティブ    │       │ 🔍 オペレーティブ    │          │
│  │   花子              │       │   次郎              │          │
│  │   [選択]            │       │   [選択]            │          │
│  └─────────────────────┘       └─────────────────────┘          │
│                                                                 │
│  ┌─────────────────────────────────────────────────────┐        │
│  │ 👁 観戦者: 山田                                      │        │
│  │ ビュー: [スパイマスター ▼]                           │        │
│  │ [観戦者になる]                                       │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                 │
│  単語パック: デフォルト日本語                                    │
│  タイマー: なし                                                  │
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
│  │         │(revealed)│        │         │(revealed)│          │
│  ├─────────┼─────────┼─────────┼─────────┼─────────┤           │
│  │         │         │  ⬛     │  🔴     │         │           │
│  │  山     │  本     │  月    │  花     │  空     │           │
│  │         │         │(assassin)│(revealed)│        │           │
│  ├─────────┼─────────┼─────────┼─────────┼─────────┤           │
│  │  🔵     │         │         │         │  ⬜     │           │
│  │  水     │  火     │  木     │  金     │  土     │           │
│  │(revealed)│        │         │         │(neutral)│           │
│  ├─────────┼─────────┼─────────┼─────────┼─────────┤           │
│  │         │  🔴     │         │         │         │           │
│  │  雨     │  雪     │  風     │  雲     │  虹     │           │
│  │         │(revealed)│        │         │         │           │
│  ├─────────┼─────────┼─────────┼─────────┼─────────┤           │
│  │         │         │  🔵     │         │         │           │
│  │  星     │  月     │  太陽   │  地球   │  宇宙   │           │
│  │         │         │(revealed)│        │         │           │
│  └─────────┴─────────┴─────────┴─────────┴─────────┘           │
│                                                                 │
│  ┌──────────────────────────────────────────────────────┐       │
│  │              ターン終了（パス）                       │       │
│  └──────────────────────────────────────────────────────┘       │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  チャット                                                       │
│  ┌──────────────────────────────────────────────────────┐       │
│  │ 太郎: いいヒントだ！                                  │       │
│  │ 花子: 猫じゃない？                                    │       │
│  └──────────────────────────────────────────────────────┘       │
│  [メッセージを入力...                            ] [送信]       │
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
│  │ neutral │ revealed│  red    │  blue   │ revealed│           │
│  ├─────────┼─────────┼─────────┼─────────┼─────────┤           │
│  │  🔵     │  🔴     │  ⬛     │  🔴     │  ⬜     │           │
│  │  山     │  本     │  月    │  花     │  空     │           │
│  │  blue   │  red    │assassin │ revealed│ neutral │           │
│  ├─────────┼─────────┼─────────┼─────────┼─────────┤           │
│  │  🔵     │  ⬜     │  🔴     │  🔵     │  ⬜     │           │
│  │  水     │  火     │  木     │  金     │  土     │           │
│  │ revealed│ neutral │  red    │  blue   │ revealed│           │
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

## 8. ディレクトリ構成

```
codenames-clone/
├── docker-compose.yml
├── README.md
│
├── client/                          # フロントエンド
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── index.html
│   │
│   ├── public/
│   │   └── favicon.ico
│   │
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── index.css
│       │
│       ├── components/              # 共通コンポーネント
│       │   ├── ui/
│       │   │   ├── Button.tsx
│       │   │   ├── Input.tsx
│       │   │   ├── Card.tsx
│       │   │   └── Modal.tsx
│       │   ├── Card.tsx             # ゲームカード
│       │   ├── Board.tsx            # 5x5ボード
│       │   ├── TeamPanel.tsx        # チーム表示
│       │   ├── HintInput.tsx        # ヒント入力
│       │   ├── PlayerList.tsx       # プレイヤー一覧
│       │   └── Chat.tsx             # チャット
│       │
│       ├── pages/                   # ページコンポーネント
│       │   ├── TopPage.tsx
│       │   ├── CreateRoomPage.tsx
│       │   ├── JoinRoomPage.tsx
│       │   ├── RoomListPage.tsx
│       │   ├── LobbyPage.tsx
│       │   ├── GamePage.tsx
│       │   ├── WordPackListPage.tsx
│       │   ├── WordPackCreatePage.tsx
│       │   └── WordPackEditPage.tsx
│       │
│       ├── hooks/                   # カスタムフック
│       │   ├── useSocket.ts
│       │   ├── useRoom.ts
│       │   └── useGame.ts
│       │
│       ├── stores/                  # 状態管理 (Zustand)
│       │   ├── playerStore.ts
│       │   ├── roomStore.ts
│       │   └── gameStore.ts
│       │
│       ├── services/                # API・Socket通信
│       │   ├── api.ts
│       │   └── socket.ts
│       │
│       ├── types/                   # 型定義
│       │   └── index.ts
│       │
│       └── utils/                   # ユーティリティ
│           └── helpers.ts
│
├── server/                          # バックエンド
│   ├── package.json
│   ├── tsconfig.json
│   │
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts                  # 初期単語データ投入
│   │
│   └── src/
│       ├── index.ts                 # エントリーポイント
│       ├── app.ts                   # Express設定
│       │
│       ├── config/
│       │   └── index.ts             # 環境変数等
│       │
│       ├── routes/                  # REST APIルート
│       │   ├── index.ts
│       │   ├── rooms.ts
│       │   └── wordPacks.ts
│       │
│       ├── controllers/             # コントローラー
│       │   ├── roomController.ts
│       │   └── wordPackController.ts
│       │
│       ├── services/                # ビジネスロジック
│       │   ├── roomService.ts
│       │   ├── gameService.ts
│       │   ├── wordPackService.ts
│       │   └── cleanupService.ts    # 期限切れルーム削除
│       │
│       ├── socket/                  # WebSocket処理
│       │   ├── index.ts
│       │   ├── handlers/
│       │   │   ├── roomHandler.ts
│       │   │   ├── gameHandler.ts
│       │   │   └── chatHandler.ts
│       │   └── middleware.ts
│       │
│       ├── types/                   # 型定義
│       │   └── index.ts
│       │
│       └── utils/                   # ユーティリティ
│           ├── codeGenerator.ts     # ルームコード生成
│           └── cardGenerator.ts     # カード配置生成
│
└── shared/                          # 共有型定義（オプション）
    └── types/
        └── index.ts
```

---

## 9. ゲームロジック詳細

### 9.1 ゲーム開始条件
- 両チームに最低1人ずつプレイヤーがいる
- 両チームにスパイマスターが1人ずついる
- ホストのみがゲーム開始可能

### 9.2 カード配置生成
```
合計25枚:
- 先攻チーム: 9枚
- 後攻チーム: 8枚
- 一般市民: 7枚
- 暗殺者: 1枚

先攻は赤チーム固定（またはランダム選択オプション）
```

### 9.3 ターン進行
1. スパイマスターがヒント（単語 + 数字）を入力
2. オペレーティブがカードを選択
3. カード結果に応じて:
   - 自チームカード → 推測継続可能（残り回数-1）
   - 相手チームカード → ターン終了
   - 一般市民 → ターン終了
   - 暗殺者 → 即敗北
4. 推測回数は「ヒントの数字 + 1」まで
5. パスでターン終了

### 9.4 勝利条件
- 自チームのカードを全て公開
- 相手チームが暗殺者を選択

### 9.5 ヒントのルール（UIで案内）
- ボード上の単語は使用不可
- 数字のみ、「0」「∞（無制限）」は選択可能に

---

## 10. エラーハンドリング

### 10.1 エラーコード

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

---

## 11. 今後の拡張案

- [ ] ユーザー登録・ログイン機能
- [ ] ゲーム履歴・統計
- [ ] AIスパイマスター（LLMでヒント自動生成）
- [ ] 英語版単語パック追加
- [ ] カスタムテーマ（デュエット、アンダーカバー等）
- [ ] モバイルアプリ（React Native）

---

## 12. 参考リンク

- [Codenames 公式ルール](https://czechgames.com/files/rules/codenames-rules-en.pdf)
- [Socket.io ドキュメント](https://socket.io/docs/v4/)
- [Prisma ドキュメント](https://www.prisma.io/docs)
