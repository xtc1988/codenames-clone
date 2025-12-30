import { test, expect } from '@playwright/test';

const PROD_URL = process.env.PROD_URL || 'http://localhost:5173';

test.describe('シンプルルーム作成テスト', () => {
  test('単一ブラウザコンテキストでルームを作成できる', async ({ page }) => {
    test.setTimeout(60000);
    console.log('\n=== シンプルルーム作成テスト開始 ===\n');

    // コンソールログをキャプチャ
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      const text = msg.text();
      if (text.includes('CreateRoomPage') || text.includes('ERROR')) {
        console.log(`[${msg.type()}]:`, text);
      }
      if (msg.type() === 'error') {
        consoleErrors.push(text);
      }
    });
    page.on('pageerror', (error) => {
      console.log(`[PAGE ERROR]:`, error.message);
      consoleErrors.push(error.message);
    });

    try {
      // トップページに移動
      console.log('--- ステップ1: トップページに移動 ---');
      await page.goto(PROD_URL);
      await page.waitForLoadState('networkidle');
      console.log('✅ トップページ読み込み完了');

      // ルーム作成ページに移動
      console.log('\n--- ステップ2: ルーム作成ページに移動 ---');
      const createButton = page.getByRole('link', { name: /ルームを作成/ });
      await createButton.waitFor({ timeout: 10000 });
      await createButton.click();
      await page.waitForTimeout(2000);
      console.log('✅ ルーム作成ページ遷移完了');

      // ニックネーム入力
      console.log('\n--- ステップ3: ニックネーム入力 ---');
      const nicknameInput = page.locator('#nickname');
      await nicknameInput.waitFor({ state: 'visible', timeout: 10000 });
      console.log('ニックネーム入力フィールド発見');

      await nicknameInput.fill('テストユーザー');
      console.log('✅ ニックネーム入力完了');

      // ルーム名入力
      console.log('\n--- ステップ4: ルーム名入力 ---');
      await page.fill('#roomName', 'シンプルテスト');
      console.log('✅ ルーム名入力完了');

      // ルーム作成ボタンクリック
      console.log('\n--- ステップ5: ルーム作成 ---');
      await page.getByRole('button', { name: /ルームを作成/i }).click();
      console.log('ルーム作成ボタンクリック');

      // URL遷移を待機
      console.log('URL遷移を待機中...');
      await page.waitForURL(/\/room\/[A-Z0-9]+$/, { timeout: 30000 });

      const roomUrl = page.url();
      const roomCode = roomUrl.split('/').pop() || '';
      console.log(`✅ ルーム作成成功: ${roomCode}`);

      // エラーチェック
      if (consoleErrors.length > 0) {
        console.log('\n⚠️ コンソールエラー検出:');
        consoleErrors.forEach((err, i) => console.log(`${i + 1}. ${err}`));
      }

      console.log('\n=== シンプルルーム作成テスト完了 ===\n');

      // アサーション
      expect(roomCode).toMatch(/^[A-Z0-9]+$/);
      expect(consoleErrors.length).toBe(0);

    } catch (error) {
      console.error('\n❌ テスト失敗:', error);
      throw error;
    }
  });
});
