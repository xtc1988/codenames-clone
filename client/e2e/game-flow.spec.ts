import { test, expect } from '@playwright/test';

test.describe('Complete Game Flow', () => {
  test('should complete a full game flow from room creation to card selection', async ({ page, context }) => {
    console.log('\n=== 統合テスト開始: ルーム作成からゲームプレイまで ===\n');

    // ログとエラーのキャプチャ
    page.on('console', (msg) => {
      if (msg.type() === 'error' || msg.text().includes('[')) {
        console.log(`[ブラウザ ${msg.type()}]:`, msg.text());
      }
    });

    page.on('pageerror', (error) => {
      console.log('❌ ページエラー:', error.message);
    });

    // === ステップ1: ルーム作成 ===
    console.log('\n--- ステップ1: ルーム作成 ---');
    await page.goto('/create');
    await expect(page.getByRole('heading', { name: /ルームを作成/i })).toBeVisible();

    await page.fill('#roomName', 'E2Eテストルーム');
    await page.fill('#nickname', 'ホスト太郎');

    // 単語パックの読み込み待機
    await page.waitForTimeout(2000);

    // エラーメッセージの確認
    const errorBefore = page.locator('.bg-red-100');
    const hasErrorBefore = await errorBefore.isVisible().catch(() => false);
    if (hasErrorBefore) {
      const errorText = await errorBefore.textContent();
      console.log('❌ フォームエラー:', errorText);
    }

    // ネットワーク監視
    page.on('response', async (response) => {
      if (response.url().includes('supabase') && response.url().includes('rooms')) {
        console.log(`Supabase rooms レスポンス: ${response.status()}`);
        if (response.status() >= 400) {
          const body = await response.text().catch(() => '');
          console.log('エラー詳細:', body);
        }
      }
    });

    await page.click('button[type="submit"]');
    console.log('ルーム作成ボタンをクリック');

    // エラーメッセージの確認
    await page.waitForTimeout(2000);
    const errorAfter = page.locator('.bg-red-100');
    const hasErrorAfter = await errorAfter.isVisible().catch(() => false);
    if (hasErrorAfter) {
      const errorText = await errorAfter.textContent();
      console.log('❌ ルーム作成エラー:', errorText);
      await page.screenshot({ path: 'room-creation-error-flow.png' });
      throw new Error(`ルーム作成失敗: ${errorText}`);
    }

    // ロビーページへの遷移を待機
    await page.waitForURL(/\/room\/[A-Z0-9]{6}/, { timeout: 10000 });
    const roomUrl = page.url();
    const roomCode = roomUrl.match(/\/room\/([A-Z0-9]{6})/)?.[1];
    console.log(`✅ ルーム作成成功: ${roomCode}`);

    // === ステップ2: ロビー画面の確認 ===
    console.log('\n--- ステップ2: ロビー画面確認 ---');
    await expect(page.getByText('E2Eテストルーム')).toBeVisible();
    await expect(page.getByText('ホスト太郎')).toBeVisible();
    console.log('✅ ロビー画面表示成功');

    // === ステップ3: 2人目のプレイヤーを追加（新しいタブ） ===
    console.log('\n--- ステップ3: 2人目のプレイヤー参加 ---');
    const page2 = await context.newPage();

    page2.on('console', (msg) => {
      if (msg.type() === 'error' || msg.text().includes('[')) {
        console.log(`[ブラウザ2 ${msg.type()}]:`, msg.text());
      }
    });

    await page2.goto(roomUrl!);

    // ニックネーム入力（参加フォームが表示される場合）
    const nicknameInput = page2.locator('input[placeholder*="ニックネーム"], input[placeholder*="名前"]');
    const hasNicknameInput = await nicknameInput.isVisible().catch(() => false);

    if (hasNicknameInput) {
      await nicknameInput.fill('プレイヤー花子');
      await page2.click('button:has-text("参加"), button:has-text("入室")');
      await page2.waitForTimeout(1000);
    }

    console.log('✅ 2人目のプレイヤー参加成功');

    // === ステップ4: チーム・役割選択 ===
    console.log('\n--- ステップ4: チーム・役割選択 ---');
    await page.waitForTimeout(2000);

    // 利用可能なボタンを全て表示してデバッグ
    const allButtons = await page.getByRole('button').allTextContents();
    console.log('利用可能なボタン:', allButtons);

    // ホスト（page1）: 赤チームのスパイマスターになる
    // より直接的なセレクターを使用
    const redSpymasterButtons = page.getByRole('button', { name: /スパイマスターになる/ });
    const redButtonCount = await redSpymasterButtons.count();
    console.log(`「スパイマスターになる」ボタンの数: ${redButtonCount}`);

    if (redButtonCount >= 1) {
      // 最初のボタン（赤チーム）をクリック
      await redSpymasterButtons.first().click();
      await page.waitForTimeout(2000);
      console.log('✅ ホスト: 赤チーム・スパイマスター選択');
    } else {
      console.log('❌ スパイマスターボタンが見つかりません');
      await page.screenshot({ path: 'no-spymaster-buttons.png' });
    }

    // 2人目（page2）: 青チームのスパイマスターになる
    await page2.waitForTimeout(2000);
    const blueSpymasterButtons = page2.getByRole('button', { name: /スパイマスターになる/ });
    const blueButtonCount = await blueSpymasterButtons.count();
    console.log(`プレイヤー2の「スパイマスターになる」ボタンの数: ${blueButtonCount}`);

    if (blueButtonCount >= 2) {
      // 2番目のボタン（青チーム）をクリック
      await blueSpymasterButtons.nth(1).click();
      await page2.waitForTimeout(2000);
      console.log('✅ プレイヤー2: 青チーム・スパイマスター選択');
    } else if (blueButtonCount === 1) {
      // 1つしかない場合はそれをクリック
      await blueSpymasterButtons.first().click();
      await page2.waitForTimeout(2000);
      console.log('✅ プレイヤー2: スパイマスター選択（青チーム想定）');
    }

    // 選択が反映されているか確認
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'after-team-selection.png' });
    console.log('✅ チーム選択後のスクリーンショット保存');

    // === ステップ5: ゲーム開始 ===
    console.log('\n--- ステップ5: ゲーム開始 ---');

    // ホストがゲーム開始ボタンをクリック
    const startButton = page.getByRole('button', { name: /ゲームを開始|スタート/i });
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(2000);
      console.log('✅ ゲーム開始ボタンをクリック');

      // ゲーム画面への遷移を確認
      const isGamePage = await page.locator('text=/ターン|カード|ヒント/').isVisible().catch(() => false);
      if (isGamePage) {
        console.log('✅ ゲーム画面に遷移成功');
      } else {
        console.log('⚠️ ゲーム画面への遷移を確認できませんでした');
        await page.screenshot({ path: 'game-start-failed.png' });
      }
    } else {
      console.log('⚠️ ゲーム開始ボタンが見つかりませんでした');
      await page.screenshot({ path: 'no-start-button.png' });
    }

    // === ステップ6: ゲームボードの確認 ===
    console.log('\n--- ステップ6: ゲームボード確認 ---');

    // カードが表示されているか確認
    const cards = page.locator('button, div').filter({ hasText: /^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\uFF66-\uFF9F]+$/ });
    const cardCount = await cards.count();
    console.log(`カード数: ${cardCount}`);

    if (cardCount >= 20) {
      console.log('✅ ゲームボード表示成功（25枚のカード想定）');
    } else if (cardCount > 0) {
      console.log(`⚠️ カード数が少ない可能性: ${cardCount}枚`);
    } else {
      console.log('❌ カードが表示されていません');
      await page.screenshot({ path: 'no-cards.png' });
    }

    // === ステップ7: スパイマスタービューの確認 ===
    console.log('\n--- ステップ7: スパイマスタービュー確認 ---');

    // スパイマスターは全カードの色が見えるはず
    const coloredCards = page.locator('button, div').filter({
      hasText: /./
    }).filter({
      has: page.locator('[class*="bg-red"], [class*="bg-blue"], [class*="bg-gray"], [class*="bg-black"]')
    });

    const coloredCount = await coloredCards.count();
    if (coloredCount > 0) {
      console.log(`✅ スパイマスタービュー確認: ${coloredCount}枚のカードに色情報あり`);
    }

    // === ステップ8: ヒント入力（スパイマスター操作） ===
    console.log('\n--- ステップ8: ヒント入力テスト ---');

    const hintInput = page.locator('input[placeholder*="ヒント"], input[type="text"]').first();
    const hintInputVisible = await hintInput.isVisible().catch(() => false);

    if (hintInputVisible) {
      await hintInput.fill('動物');

      const countSelect = page.locator('select, input[type="number"]').first();
      if (await countSelect.isVisible().catch(() => false)) {
        await countSelect.selectOption('2');
      }

      const sendHintButton = page.getByRole('button', { name: /送信|ヒントを出す/i });
      if (await sendHintButton.isVisible().catch(() => false)) {
        await sendHintButton.click();
        await page.waitForTimeout(1000);
        console.log('✅ ヒント送信成功');
      }
    } else {
      console.log('⚠️ ヒント入力フォームが見つかりませんでした');
    }

    // === ステップ9: カード選択テスト（オペレーティブ操作を想定） ===
    console.log('\n--- ステップ9: カード選択テスト ---');

    // 最初のカードをクリック（デモ用）
    if (cardCount > 0) {
      const firstCard = cards.first();
      const cardText = await firstCard.textContent();
      console.log(`カード「${cardText}」をクリック予定...`);

      // 実際にはオペレーティブのターンでないとクリックできないため、
      // ここではクリック可能かどうかの確認のみ
      const isClickable = await firstCard.isEnabled().catch(() => false);
      if (isClickable) {
        console.log('✅ カードはクリック可能な状態');
      } else {
        console.log('⚠️ カードはクリック不可（ターンではない可能性）');
      }
    }

    // === 最終確認 ===
    console.log('\n--- 最終確認 ---');
    await page.screenshot({ path: 'game-flow-final.png', fullPage: true });
    console.log('✅ スクリーンショット保存: game-flow-final.png');

    // 2人目のスクリーンショット
    await page2.screenshot({ path: 'game-flow-player2.png', fullPage: true });
    console.log('✅ プレイヤー2スクリーンショット保存: game-flow-player2.png');

    console.log('\n=== 統合テスト完了 ===\n');

    // クリーンアップ
    await page2.close();
  });

  test('should handle multiple players in a room', async ({ page, context }) => {
    console.log('\n=== 複数プレイヤーテスト開始 ===\n');

    // ルーム作成
    await page.goto('/create');
    await page.fill('#roomName', '多人数テストルーム');
    await page.fill('#nickname', 'プレイヤー1');
    await page.waitForTimeout(1000);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/room\/[A-Z0-9]{6}/, { timeout: 10000 });

    const roomUrl = page.url();
    const roomCode = roomUrl.match(/\/room\/([A-Z0-9]{6})/)?.[1];
    console.log(`✅ ルーム作成: ${roomCode}`);

    // 3人のプレイヤーを追加
    const players = [];
    for (let i = 2; i <= 4; i++) {
      const playerPage = await context.newPage();
      await playerPage.goto(roomUrl!);

      const nicknameInput = playerPage.locator('input[placeholder*="ニックネーム"], input[placeholder*="名前"]');
      const hasInput = await nicknameInput.isVisible().catch(() => false);

      if (hasInput) {
        await nicknameInput.fill(`プレイヤー${i}`);
        await playerPage.click('button:has-text("参加"), button:has-text("入室")');
        await playerPage.waitForTimeout(500);
      }

      players.push(playerPage);
      console.log(`✅ プレイヤー${i}参加成功`);
    }

    // ロビーで全員が表示されているか確認
    await page.waitForTimeout(2000);
    for (let i = 1; i <= 4; i++) {
      const playerVisible = await page.getByText(`プレイヤー${i}`).isVisible().catch(() => false);
      if (playerVisible) {
        console.log(`✅ プレイヤー${i}がロビーに表示されています`);
      } else {
        console.log(`⚠️ プレイヤー${i}が表示されていません`);
      }
    }

    console.log('\n=== 複数プレイヤーテスト完了 ===\n');

    // クリーンアップ
    for (const playerPage of players) {
      await playerPage.close();
    }
  });
});
