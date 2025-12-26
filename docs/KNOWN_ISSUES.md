# Known Issues

> Last updated: 2025-12-26

このドキュメントは、OKANAMEプロジェクトで発見された問題とその解決策を記録します。

---

## 🔴 Critical Issues

現在、クリティカルな問題はありません。

---

## 🟡 Active Issues

現在、アクティブな問題はありません。

---

## ✅ Resolved Issues

### [FIXED] テストファイルが本番ビルドに含まれる

**Discovered:** 2025-12-26
**Resolved:** 2025-12-26
**Severity:** High

**Description:**
Vercelでのデプロイ時に、テストファイル（`*.test.tsx`）が本番ビルドに含まれてしまい、TypeScriptコンパイルエラーが発生していた。

**Error Message:**
```
src/components/game/GameCard.test.tsx(20,3): error TS2304: Cannot find name 'beforeEach'.
src/test/setup.ts(2,10): error TS6133: 'expect' is declared but its value is never read.
```

**Root Cause:**
`tsconfig.json`の`exclude`設定にテストファイルとテストディレクトリが含まれていなかった。

**Solution:**
`tsconfig.json`に以下を追加：
```json
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
```

**Prevention:**
- 新しいテスト関連のディレクトリを追加する際は、`tsconfig.json`の`exclude`にも追加する
- CI/CDパイプラインでローカルビルドのテストを追加

**Commits:**
- b3b75c5: fix: テストファイルを本番ビルドから除外
- 41f2a20: fix: testディレクトリも本番ビルドから除外

---

### [FIXED] Vercelプロジェクト名にハイフンが使えない

**Discovered:** 2025-12-26
**Resolved:** 2025-12-26
**Severity:** Medium

**Description:**
Vercelでプロジェクトをデプロイする際、プロジェクト名に`codenames-clone`（ハイフン入り）を使用するとエラーが発生した。

**Error Message:**
```
The name contains invalid characters. Only letters, digits, and underscores are allowed.
Furthermore, the name should not start with a digit.
```

**Root Cause:**
Vercelのプロジェクト名には、アンダースコア（_）のみが許可されており、ハイフン（-）は使用できない。

**Solution:**
プロジェクト名を以下のいずれかに変更：
- `codenames_clone`（アンダースコア）
- `codenamesclone`（ハイフンなし）

**Prevention:**
- Vercelデプロイ前に命名規則を確認
- README.mdにVercelの命名制限を記載

---

### [FIXED] プレイヤーのチーム選択が反映されないタイミング問題

**Discovered:** 2025-12-25（E2Eテスト中）
**Status:** Known Issue（一部未解決）
**Severity:** Medium

**Description:**
E2Eテストで、ホストがチームを選択した直後に2人目のプレイヤーがチームを選択しようとすると、UIが再レンダリングされてボタンが一時的に消失する。

**Symptoms:**
- ホストが赤チームのスパイマスターを選択
- UIが更新される
- 2人目のプレイヤーのブラウザで「スパイマスターになる」ボタンがカウント0になる
- ボタンが再表示されるまでタイムラグがある

**Root Cause:**
Supabase Realtimeによる状態同期とReactの再レンダリングのタイミングの問題。ホストの選択がデータベースに保存され、Realtimeで他のクライアントに通知されるが、その間にReactコンポーネントが一時的にアンマウント/再マウントされる可能性がある。

**Workaround:**
E2Eテストでは、`page.waitForTimeout(2000)`を追加してUI安定化を待つ。

**Potential Fix:**
- Reactの`key`プロパティを適切に設定してコンポーネントの再利用を促進
- 楽観的UI更新を実装して、即座にローカル状態を更新
- Supabase Realtimeの`debounce`設定を調整

**Prevention:**
- UI状態管理をZustandで一元化
- E2Eテストで同時操作のシナリオを追加

**Reference:**
- `client/e2e/game-flow.spec.ts:122-138`

---

## 📝 Notes

### 問題報告の方法

新しい問題を発見した場合：

1. **GitHub Issue**を作成（推奨）
   ```bash
   gh issue create --title "Bug: [問題の概要]" --label "bug"
   ```

2. または、このファイルに直接追加：
   - 🔴 Critical Issues（緊急対応が必要）
   - 🟡 Active Issues（対応中）
   - ✅ Resolved Issues（解決済み）

### テンプレート

```markdown
### [STATUS] 問題のタイトル

**Discovered:** YYYY-MM-DD
**Resolved:** YYYY-MM-DD（解決済みの場合）
**Severity:** Critical / High / Medium / Low

**Description:**
[何が起きたか]

**Error Message:**
```
[エラーメッセージ]
```

**Root Cause:**
[根本原因]

**Solution:**
[解決方法]

**Prevention:**
[今後の予防策]

**Commits:**
- [commit hash]: [commit message]
```
