import { test, expect } from '@playwright/test';

const PROD_URL = process.env.PROD_URL || 'http://localhost:5173';

test.describe('ゲーム画面スクリーンショット', () => {
  test('ゲーム画面のデザインをキャプチャ', async ({ browser }) => {
    test.setTimeout(120000);

    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    const context3 = await browser.newContext();
    const context4 = await browser.newContext();

    const hostPage = await context1.newPage();
    const player2Page = await context2.newPage();
    const player3Page = await context3.newPage();
    const player4Page = await context4.newPage();

    try {
      // ルーム作成
      await hostPage.goto(PROD_URL);
      await hostPage.waitForLoadState('networkidle');

      await hostPage.getByRole('link', { name: /ルームを作成/ }).click();
      await hostPage.waitForTimeout(2000);

      await hostPage.fill('#nickname', '赤スパイマスター');
      await hostPage.fill('#roomName', 'デザインテスト');
      await hostPage.getByRole('button', { name: /ルームを作成/i }).click();
      await hostPage.waitForURL(/\/room\/[A-Z0-9]+$/, { timeout: 30000 });

      const roomUrl = hostPage.url();
      const roomCode = roomUrl.split('/').pop() || '';

      // プレイヤー参加
      await player2Page.goto(`${PROD_URL}/join`);
      await player2Page.fill('#roomCode', roomCode);
      await player2Page.fill('#nickname', '赤オペレーティブ');
      await player2Page.getByRole('button', { name: /参加/i }).click();
      await player2Page.waitForTimeout(2000);

      await player3Page.goto(`${PROD_URL}/join`);
      await player3Page.fill('#roomCode', roomCode);
      await player3Page.fill('#nickname', '青スパイマスター');
      await player3Page.getByRole('button', { name: /参加/i }).click();
      await player3Page.waitForTimeout(2000);

      await player4Page.goto(`${PROD_URL}/join`);
      await player4Page.fill('#roomCode', roomCode);
      await player4Page.fill('#nickname', '青オペレーティブ');
      await player4Page.getByRole('button', { name: /参加/i }).click();
      await player4Page.waitForTimeout(2000);

      // チーム選択
      await hostPage.getByRole('button', { name: /スパイマスターになる/i }).first().click();
      await hostPage.waitForTimeout(1000);

      await player2Page.getByRole('button', { name: /オペレーティブになる/i }).first().click();
      await player2Page.waitForTimeout(1000);

      await player3Page.getByRole('button', { name: /スパイマスターになる/i }).nth(1).click();
      await player3Page.waitForTimeout(1000);

      await player4Page.getByRole('button', { name: /オペレーティブになる/i }).nth(1).click();
      await player4Page.waitForTimeout(2000);

      // ロビー画面スクリーンショット
      await hostPage.screenshot({ path: 'screenshots/lobby-new-design.png', fullPage: true });

      // ゲーム開始
      await hostPage.getByRole('button', { name: /ゲームを開始/i }).click();
      await hostPage.waitForURL(/\/room\/[A-Z0-9]+\/game$/);
      await hostPage.waitForTimeout(3000);

      // 他のプレイヤーもゲーム画面に遷移
      await player2Page.goto(`${PROD_URL}/room/${roomCode}/game`);
      await player3Page.goto(`${PROD_URL}/room/${roomCode}/game`);
      await player4Page.goto(`${PROD_URL}/room/${roomCode}/game`);
      await hostPage.waitForTimeout(3000);

      // スパイマスタービュースクリーンショット
      await hostPage.screenshot({ path: 'screenshots/game-spymaster-view.png', fullPage: true });

      // オペレーティブビュースクリーンショット
      await player2Page.screenshot({ path: 'screenshots/game-operative-view.png', fullPage: true });

      // ヒント入力
      const hintInput = hostPage.locator('input[placeholder*="hint" i], input[placeholder*="ヒント"]');
      if (await hintInput.isVisible()) {
        await hintInput.fill('動物');
        const countInput = hostPage.locator('input[type="number"]');
        await countInput.fill('2');
        await hostPage.getByRole('button', { name: /送信/i }).click();
        await hostPage.waitForTimeout(2000);
      }

      // ヒント表示後スクリーンショット
      await player2Page.reload();
      await player2Page.waitForTimeout(2000);
      await player2Page.screenshot({ path: 'screenshots/game-with-hint.png', fullPage: true });

      // カード選択（1枚）
      const cardButtons = player2Page.locator('button').filter({
        hasText: /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/
      });
      const cardCount = await cardButtons.count();
      for (let i = 0; i < cardCount; i++) {
        const btn = cardButtons.nth(i);
        const text = await btn.textContent();
        const isDisabled = await btn.isDisabled();
        if (text && !text.includes('更新') && !text.includes('Refresh') && !text.includes('ロビー') && !isDisabled) {
          await btn.click();
          await player2Page.waitForTimeout(2000);
          break;
        }
      }

      // カード公開後スクリーンショット
      await hostPage.reload();
      await hostPage.waitForTimeout(2000);
      await hostPage.screenshot({ path: 'screenshots/game-card-revealed.png', fullPage: true });

      console.log('✅ スクリーンショット保存完了: screenshots/');

    } finally {
      await context1.close();
      await context2.close();
      await context3.close();
      await context4.close();
    }
  });
});
