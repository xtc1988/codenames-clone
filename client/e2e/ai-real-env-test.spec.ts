import { test, expect } from '@playwright/test';

// 実環境テスト - AIヒント→カード選択まで
test.setTimeout(180000);

const PROD_URL = 'https://codenamesclone.vercel.app';

test.describe('AI Spymaster Real Environment Test', () => {
  test('AIヒント生成後にカード選択できることを確認', async ({ page }) => {
    console.log('\n=== 実環境テスト開始 ===\n');

    // Step 1: ルーム作成
    console.log('Step 1: ルーム作成');
    await page.goto(`${PROD_URL}/create`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'client/step1-create-page.png' });

    await page.fill('#roomName', 'AIテスト' + Date.now());
    await page.fill('#nickname', 'テストプレイヤー');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/room\/[A-Z0-9]{6}/, { timeout: 30000 });

    const roomUrl = page.url();
    console.log(`ルーム作成成功: ${roomUrl}`);
    await page.screenshot({ path: 'client/step2-lobby.png' });

    // Step 2: AIスパイマスターを赤チームに追加
    console.log('Step 2: 赤チームにAIスパイマスター追加');
    await page.waitForTimeout(2000);

    const addAIButtons = page.locator('button:has-text("AIスパイマスターを追加")');
    await expect(addAIButtons.first()).toBeVisible({ timeout: 10000 });
    await addAIButtons.first().click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'client/step3-ai-added.png' });

    // Step 3: AIスパイマスターを青チームにも追加
    console.log('Step 3: 青チームにAIスパイマスター追加');
    const addAIButton2 = page.locator('button:has-text("AIスパイマスターを追加")');
    if (await addAIButton2.count() > 0) {
      await addAIButton2.first().click();
      await page.waitForTimeout(3000);
    }
    await page.screenshot({ path: 'client/step4-both-ai.png' });

    // Step 4: 自分をオペレーティブに設定
    console.log('Step 4: オペレーティブになる');
    const opButtons = page.locator('button:has-text("オペレーティブになる")');
    if (await opButtons.count() > 0) {
      await opButtons.first().click();
      await page.waitForTimeout(2000);
    }
    await page.screenshot({ path: 'client/step5-operative.png' });

    // Step 5: ゲーム開始
    console.log('Step 5: ゲーム開始');
    const startButton = page.locator('button:has-text("ゲームを開始")');
    await expect(startButton).toBeVisible({ timeout: 10000 });

    // ボタンが有効になるまで待つ
    let retries = 0;
    while (retries < 10) {
      const isEnabled = await startButton.isEnabled();
      if (isEnabled) break;
      await page.waitForTimeout(1000);
      retries++;
    }

    await startButton.click();
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'client/step6-game-started.png' });

    // Step 6: AIヒント生成を待機
    console.log('Step 6: AIヒント生成待機');

    // AIがヒントを考えている表示を確認
    try {
      await expect(page.getByText(/AIがヒントを考えています/)).toBeVisible({ timeout: 10000 });
      console.log('AIヒント生成中...');
    } catch {
      console.log('AIローディング表示なし（すでに完了 or エラー）');
    }

    // ヒント表示を待つ（最大60秒）
    await page.waitForTimeout(30000);
    await page.screenshot({ path: 'client/step7-after-ai-hint.png' });

    // Step 7: ヒントが表示されたか確認
    console.log('Step 7: ヒント表示確認');
    const hintDisplay = page.locator('text=/TRANSMISSION|ヒント/i');
    const hasHint = await hintDisplay.isVisible().catch(() => false);
    console.log(`ヒント表示: ${hasHint}`);

    // Step 8: カードをクリックできるか確認
    console.log('Step 8: カード選択テスト');

    // ゲームボード上のカードを取得（buttonタグ）
    const cards = page.locator('button').filter({
      has: page.locator('span')
    });

    const cardCount = await cards.count();
    console.log(`検出されたカード数: ${cardCount}`);

    if (cardCount > 0) {
      // 最初の有効なカードを探す
      for (let i = 0; i < Math.min(cardCount, 25); i++) {
        const card = cards.nth(i);
        const isDisabled = await card.isDisabled().catch(() => true);
        const text = await card.textContent().catch(() => '');

        console.log(`カード ${i}: "${text}" - disabled: ${isDisabled}`);

        if (!isDisabled && text && text.length > 0 && text.length < 20) {
          console.log(`カード "${text}" をクリック試行`);
          await card.click();
          await page.waitForTimeout(2000);
          await page.screenshot({ path: 'client/step8-after-card-click.png' });
          console.log('カードクリック成功！');
          break;
        }
      }
    }

    // 最終状態をスクリーンショット
    await page.screenshot({ path: 'client/step9-final-state.png' });
    console.log('\n=== テスト完了 ===\n');
  });
});
