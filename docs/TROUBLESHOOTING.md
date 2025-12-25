# Troubleshooting Guide

> よくある問題と解決方法

このガイドは、OKANAMEプロジェクトでよく遭遇する問題とその解決方法をまとめたものです。

---

## 📑 目次

- [ビルド問題](#ビルド問題)
- [実行時エラー](#実行時エラー)
- [データベース問題](#データベース問題)
- [デプロイ問題](#デプロイ問題)
- [E2Eテスト問題](#e2eテスト問題)

---

## ビルド問題

### TypeScriptコンパイルエラー（git pull後）

**症状:**
```
error TS2304: Cannot find name 'X'
error TS2345: Argument of type 'Y' is not assignable
```

**原因:** 依存関係や型定義が変更された

**解決方法:**
```bash
# クリーンインストール
cd client
rm -rf node_modules package-lock.json
npm install

# 再ビルド
npm run build
```

**予防策:** `git pull`後は必ず`npm install`を実行

---

### Vite開発サーバーが起動しない

**症状:**
```
EADDRINUSE: address already in use :::5173
```

**原因:** ポート5173が既に使用されている

**解決方法:**
```bash
# プロセスを特定して終了（Mac/Linux）
lsof -ti:5173 | xargs kill -9

# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# または別のポートを使用
npm run dev -- --port 3000
```

---

### "Cannot find module" エラー

**症状:**
```
Error: Cannot find module '@/components/...'
```

**原因:** パスエイリアス（`@/...`）の設定が正しくない

**解決方法:**
```bash
# 1. 依存関係を再インストール
rm -rf node_modules package-lock.json
npm install

# 2. tsconfig.jsonを確認
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

### テストファイルがビルドに含まれる

**症状:**
```
error TS2304: Cannot find name 'beforeEach'
error TS2304: Cannot find name 'describe'
```

**原因:** テストファイルが本番ビルドに含まれている

**解決方法:**
`tsconfig.json`に以下を追加：
```json
{
  "exclude": [
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/*.spec.ts",
    "**/*.spec.tsx",
    "__tests__",
    "e2e",
    "src/test",
    "**/test/**"
  ]
}
```

**参照:** `docs/KNOWN_ISSUES.md#テストファイルが本番ビルドに含まれる`

---

## 実行時エラー

### "Supabase環境変数が設定されていません"

**症状:** アプリが起動せず、環境変数エラーが表示される

**原因:** `.env.local`ファイルが存在しないか、値が設定されていない

**解決方法:**
```bash
# .env.localを作成
cd client
cp .env.example .env.local

# Supabase認証情報を追加
# エディタで.env.localを開いて編集
```

`.env.local`の内容例：
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**参照:** `README.md`のセットアップセクション

---

### "Cannot read property 'length' of undefined"

**症状:** カードやプレイヤー一覧が表示されず、コンソールにエラー

**原因:** データ取得前にデータにアクセスしている、またはnullチェックが不足

**解決方法:**
コードにnullチェックを追加：
```typescript
// ❌ 悪い例
if (data.length > 0) { ... }

// ✅ 良い例
if (data && data.length > 0) { ... }
```

または、Optional Chainingを使用：
```typescript
const count = data?.length ?? 0;
```

**予防策:** TypeScriptの`strict`モードを有効化（既に有効）

---

### Realtimeの購読が動作しない

**症状:** 他のプレイヤーの操作が反映されない

**原因:**
1. Supabase Realtimeが有効化されていない
2. 購読チャンネル名が間違っている
3. テーブルのRLS（Row Level Security）設定

**解決方法:**
```typescript
// 1. チャンネル名を確認
const channel = supabase.channel(`room:${roomId}`); // ← roomIdが正しいか

// 2. 購読設定を確認
channel
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'players',  // ← テーブル名が正しいか
    filter: `room_id=eq.${roomId}`,  // ← フィルターが正しいか
  }, (payload) => {
    console.log('Update received:', payload);
  })
  .subscribe((status) => {
    console.log('Subscription status:', status);  // ← ステータス確認
  });
```

**デバッグ方法:**
- Supabase Dashboard → Database → Replication → テーブルが有効か確認
- ブラウザのコンソールで購読ステータスを確認

---

## データベース問題

### マイグレーション失敗: "relation already exists"

**症状:**
```
Error: relation "rooms" already exists
```

**原因:** マイグレーションを2回実行しようとしている

**解決方法:**
```bash
# マイグレーション状態を確認
cd server
npx prisma migrate status

# 必要に応じてリセット（注意: データが削除される）
npx prisma migrate reset

# または、失敗したマイグレーションをスキップ
npx prisma migrate resolve --applied "migration_name"
```

---

### "Invalid `prisma.X.findMany()` invocation"

**症状:** Prismaクエリでエラー

**原因:** Prisma Clientが古い、またはスキーマと同期していない

**解決方法:**
```bash
cd server

# Prisma Clientを再生成
npx prisma generate

# マイグレーションを適用
npx prisma migrate dev
```

---

### データベース接続エラー

**症状:**
```
Can't reach database server at `xxx`
```

**原因:**
1. DATABASE_URLが間違っている
2. Supabaseプロジェクトが停止している
3. ネットワーク問題

**解決方法:**
```bash
# 1. 環境変数を確認
cd server
cat .env | grep DATABASE_URL

# 2. Supabase Dashboardで接続情報を確認
# Settings → Database → Connection string

# 3. 接続テスト
npx prisma db push --force-reset
```

---

## デプロイ問題

### Vercel build fails: "Type error"

**症状:** Vercelでのビルドが失敗し、TypeScriptエラーが表示される

**原因:** ローカルでは成功するが、Vercelの本番ビルドで型エラーが検出される

**解決方法:**
```bash
# ローカルで本番ビルドをテスト
cd client
npm run build

# エラーを修正してからpush
git add .
git commit -m "fix: TypeScriptエラーを修正"
git push
```

**予防策:**
- コミット前に`npm run build`を実行
- CIでビルドテストを追加

---

### Vercel deployment succeeds but site shows errors

**症状:** デプロイは成功するが、サイトにアクセスするとエラー

**原因:** 環境変数が設定されていない

**確認方法:**
1. Vercel Dashboard → Project → Settings → Environment Variables
2. 以下が設定されているか確認：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

**解決方法:**
```bash
# Vercel CLIで環境変数を設定
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production

# または、Vercel Dashboardで手動設定後、再デプロイ
vercel --prod
```

---

### Vercelプロジェクト名エラー

**症状:**
```
The name contains invalid characters. Only letters, digits, and underscores are allowed.
```

**原因:** プロジェクト名にハイフン（-）を使用している

**解決方法:**
プロジェクト名を以下に変更：
- `codenames_clone`（アンダースコア）
- `codenamesclone`（ハイフンなし）

**参照:** `docs/KNOWN_ISSUES.md#Vercelプロジェクト名にハイフンが使えない`

---

## E2Eテスト問題

### Playwright tests fail: "Target closed"

**症状:**
```
Error: Target closed
```

**原因:** ブラウザが予期せず終了した

**解決方法:**
```bash
# 1. Playwrightブラウザを再インストール
cd client
npx playwright install

# 2. ヘッドレスモードで実行
npx playwright test --headed

# 3. デバッグモード
npx playwright test --debug
```

---

### Tests timeout waiting for elements

**症状:** テストが要素の表示を待ってタイムアウト

**原因:**
1. セレクターが間違っている
2. 要素の読み込みが遅い
3. ネットワークリクエストが失敗している

**解決方法:**
```typescript
// 1. セレクターを確認
await page.getByRole('button', { name: /スパイマスターになる/ });

// 2. タイムアウトを延長
await page.waitForSelector('button', { timeout: 10000 });

// 3. ネットワークエラーをキャプチャ
page.on('response', async (response) => {
  if (response.status() >= 400) {
    console.log('Error response:', response.url(), response.status());
  }
});
```

---

### E2Eテストで同時操作がうまくいかない

**症状:** 複数のプレイヤー（ページ）の操作がタイミングによって失敗する

**原因:** UIの再レンダリングとタイミングの問題

**解決方法:**
```typescript
// 操作の間に適切な待機を追加
await page.click('button');
await page.waitForTimeout(2000);  // UI安定化を待つ
await page2.click('button');
```

**参照:** `docs/KNOWN_ISSUES.md#プレイヤーのチーム選択が反映されないタイミング問題`

---

## 📞 さらにサポートが必要な場合

- **アーキテクチャ:** `docs/ARCHITECTURE.md`を参照
- **既知の問題:** `docs/KNOWN_ISSUES.md`を参照
- **FAQ:** `docs/FAQ.md`を参照
- **GitHub Issues:** [既存のIssue](https://github.com/xtc1988/codenames-clone/issues)を検索、または新規作成
