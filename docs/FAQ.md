# Frequently Asked Questions (FAQ)

> よくある質問と回答

OKANAMEプロジェクトに関するよくある質問をまとめました。

---

## 📑 目次

- [一般](#一般)
- [開発](#開発)
- [テスト](#テスト)
- [データベース](#データベース)
- [デプロイ](#デプロイ)
- [トラブルシューティング](#トラブルシューティング)

---

## 一般

### Q: このプロジェクトは何ですか？

**A:** OKANAMEは、ボードゲーム「コードネーム（Codenames）」のWebクローンアプリケーションです。ブラウザ上でリアルタイムマルチプレイが可能で、友達とオンラインで遊べます。

---

### Q: ローカルで実行するにはどうすればいいですか？

**A:** 以下の手順で実行できます：

```bash
# 1. 依存関係をインストール
cd client
npm install

# 2. 環境変数を設定
cp .env.example .env.local
# .env.localを編集してSupabase認証情報を追加

# 3. 開発サーバーを起動
npm run dev  # http://localhost:5173
```

詳細は`README.md`のセットアップセクションを参照してください。

---

### Q: どの技術スタックを使っていますか？

**A:**
- **フロントエンド:** React 18, TypeScript, Vite, Tailwind CSS
- **バックエンド:** Supabase (PostgreSQL + Realtime)
- **状態管理:** Zustand
- **ルーティング:** React Router v6
- **テスト:** Vitest (ユニット), Playwright (E2E)
- **デプロイ:** Vercel

詳細は`docs/ARCHITECTURE.md`を参照してください。

---

### Q: 環境変数はどこに保存されていますか？

**A:**
- **開発環境:** `client/.env.local`（Gitにコミットされません）
- **本番環境（Vercel）:** Vercel Dashboard → Settings → Environment Variables

**重要:** `.env.local`は絶対にGitにコミットしないでください！

---

## 開発

### Q: 新しいページを追加するにはどうすればいいですか？

**A:** 以下の3ステップです：

1. ページコンポーネントを作成：`client/src/pages/NewPage.tsx`
2. ルートを追加：`client/src/App.tsx`
3. 必要に応じてナビゲーションリンクを追加

例：
```tsx
// App.tsx
import { NewPage } from './pages/NewPage';

function App() {
  return (
    <Routes>
      <Route path="/new-page" element={<NewPage />} />
      {/* 他のルート */}
    </Routes>
  );
}
```

---

### Q: 新しいコンポーネントを作成する際のベストプラクティスは？

**A:**
- **共通UI:** `client/src/components/ui/` に配置（Button, Input等）
- **ドメイン固有:** `client/src/components/` に配置（GameCard, Board等）
- **TypeScript strict mode**を有効にしているため、型定義は必須
- **Tailwind CSS**でスタイリング
- **props interface**を明示的に定義

例：
```tsx
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ children, onClick, variant = 'primary' }: ButtonProps) {
  // 実装
}
```

---

### Q: Zustandストアを使うにはどうすればいいですか？

**A:** `client/src/stores/`にストアが定義されています：

```typescript
import { useGameStore } from '@/stores/gameStore';

function MyComponent() {
  const { cards, revealCard } = useGameStore();

  return (
    <button onClick={() => revealCard(0)}>
      {cards[0].word}
    </button>
  );
}
```

詳細は`docs/ARCHITECTURE.md`の「状態管理」セクションを参照。

---

### Q: Supabase Realtimeの購読はどのように設定しますか？

**A:** `useSupabaseSubscription`フックを使用します：

```typescript
import { useSupabaseSubscription } from '@/hooks/useSupabaseSubscription';

function RoomComponent({ roomId }: { roomId: string }) {
  useSupabaseSubscription({
    channel: `room:${roomId}`,
    table: 'players',
    filter: `room_id=eq.${roomId}`,
    onUpdate: (payload) => {
      console.log('Player updated:', payload);
    }
  });
}
```

---

## テスト

### Q: テストを実行するにはどうすればいいですか？

**A:**

```bash
cd client

# ユニットテスト
npm run test

# E2Eテスト（ヘッドレス）
npm run test:e2e

# E2Eテスト（UIモード）
npm run test:e2e:ui

# カバレッジ付きユニットテスト
npm run test:coverage
```

---

### Q: 新しいテストを追加するにはどうすればいいですか？

**A:**

**ユニットテスト:**
```typescript
// src/components/MyComponent.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

**E2Eテスト:**
```typescript
// e2e/my-feature.spec.ts
import { test, expect } from '@playwright/test';

test('should display feature', async ({ page }) => {
  await page.goto('/feature');
  await expect(page.getByRole('heading')).toHaveText('Feature');
});
```

---

### Q: E2Eテストでタイムアウトエラーが出ます

**A:** タイムアウトを延長してください：

```typescript
// playwright.config.ts
export default defineConfig({
  timeout: 30000, // 30秒
});

// または個別のテストで
test('slow test', async ({ page }) => {
  test.setTimeout(60000); // 60秒
  // テスト内容
});
```

---

### Q: テストがローカルで失敗するがCIでは成功する（またはその逆）

**A:** よくある原因：

1. **Node.jsバージョンの違い** → `nvm`を使ってCIと同じバージョンを使用
2. **キャッシュの問題** → `npm run test -- --no-cache`で実行
3. **環境変数の違い** → `.env.test`が存在するか確認
4. **タイミングの問題** → `waitForSelector`等で要素の読み込みを待つ

---

## データベース

### Q: データベースをリセットするにはどうすればいいですか？

**A:**

```bash
# ⚠️ 注意: これは全データを削除します！
# ローカル開発環境でのみ実行してください

# Supabase Dashboardから:
# 1. SQL Editor → New query
# 2. 以下のSQLを実行:

DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

# その後、必要なテーブルを再作成
```

---

### Q: データベースの内容を確認するにはどうすればいいですか？

**A:**

**Supabase Dashboard:**
1. [https://app.supabase.com](https://app.supabase.com) にログイン
2. プロジェクトを選択
3. Table Editor → テーブルを選択

**SQL Editor:**
```sql
-- プレイヤー一覧
SELECT * FROM players;

-- アクティブなルーム
SELECT * FROM rooms WHERE status = 'playing';

-- カード配置
SELECT * FROM cards WHERE room_id = 'your-room-id';
```

---

### Q: マイグレーションを作成・適用するにはどうすればいいですか？

**A:** このプロジェクトはSupabaseを使用しているため、Supabase Dashboardで直接SQLを実行するか、Supabase CLIを使用します：

```bash
# Supabase CLIをインストール
npm install -g supabase

# ローカルでSupabaseを起動
supabase start

# マイグレーション作成
supabase migration new add_new_column

# マイグレーション適用
supabase db push
```

---

## デプロイ

### Q: Vercelにデプロイするにはどうすればいいですか？

**A:**

**初回デプロイ:**
1. GitHubリポジトリをVercelに接続
2. Root Directory: `client`
3. Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy

**以降の更新:**
```bash
git push origin main
# Vercelが自動デプロイ
```

詳細は`README.md`のデプロイセクションを参照。

---

### Q: デプロイは成功したのにサイトでエラーが出る

**A:** 確認すべきポイント：

1. **環境変数:** Vercel Dashboard → Settings → Environment Variables
   - `VITE_SUPABASE_URL`が設定されているか
   - `VITE_SUPABASE_ANON_KEY`が設定されているか
2. **ビルドログ:** Vercel Dashboard → Deployments → [最新] → Build Logs
3. **ランタイムログ:** Vercel Dashboard → Deployments → [最新] → Function Logs

---

### Q: Vercelプロジェクト名にハイフンが使えない

**A:** Vercelはプロジェクト名に**アンダースコア（_）**のみ許可しています。

以下のいずれかに変更してください：
- `codenames_clone`（アンダースコア）
- `codenamesclone`（ハイフンなし）

**参照:** `docs/KNOWN_ISSUES.md#Vercelプロジェクト名にハイフンが使えない`

---

## トラブルシューティング

### Q: エラーログはどこで確認できますか？

**A:**
- **ブラウザ:** DevTools Console（F12キー）
- **Vite開発サーバー:** `npm run dev`を実行しているターミナル
- **Vercel:** Dashboard → Deployments → Function Logs
- **Supabase:** Dashboard → Logs

---

### Q: "Module not found" エラーが出る

**A:**

```bash
# 依存関係を再インストール
cd client
rm -rf node_modules package-lock.json
npm install

# パスエイリアス（@/...）を使用している場合
# tsconfig.json を確認
cat tsconfig.json | grep -A 5 "paths"
```

`tsconfig.json`に以下が含まれているか確認：
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

### Q: Vite開発サーバーが起動しない（ポートエラー）

**A:**

```bash
# ポート5173が既に使用されている場合

# プロセスを特定して終了（Windows）
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# または別のポートを使用
npm run dev -- --port 3000
```

---

### Q: TypeScriptのコンパイルエラーが出る

**A:**

```bash
# 依存関係をクリーンインストール
cd client
rm -rf node_modules package-lock.json
npm install

# 型定義を再生成（必要に応じて）
npm run build
```

---

### Q: Supabase Realtimeの購読が動作しない

**A:** 確認ポイント：

1. **Supabase Dashboardでテーブルのレプリケーションが有効か:**
   - Database → Replication → テーブルを確認
2. **チャンネル名が正しいか:**
   ```typescript
   const channel = supabase.channel(`room:${roomId}`);
   ```
3. **購読設定が正しいか:**
   ```typescript
   channel
     .on('postgres_changes', {
       event: '*',
       schema: 'public',
       table: 'players',
       filter: `room_id=eq.${roomId}`,
     }, (payload) => {
       console.log('Update received:', payload);
     })
     .subscribe((status) => {
       console.log('Subscription status:', status);
     });
   ```
4. **ブラウザコンソールで購読ステータスを確認**

---

## 📞 さらにヘルプが必要な場合

- **アーキテクチャ:** `docs/ARCHITECTURE.md`を参照
- **既知の問題:** `docs/KNOWN_ISSUES.md`を参照
- **トラブルシューティング:** `docs/TROUBLESHOOTING.md`を参照
- **GitHub Issues:** [既存のIssue](https://github.com/xtc1988/codenames-clone/issues)を検索、または新規作成

---

## 🤝 コントリビューション

バグ報告や機能提案は[GitHub Issues](https://github.com/xtc1988/codenames-clone/issues)でお願いします。

プルリクエストも歓迎です！
