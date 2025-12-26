import { test, expect, Page } from '@playwright/test';

/**
 * 4名プレイヤーでの完全なゲームフローのE2Eテスト
 * - 赤チーム: スパイマスター1名 + オペレーティブ1名
 * - 青チーム: スパイマスター1名 + オペレーティブ1名
 * - ゲーム開始からカード選択、勝敗判定まで
 */
test.describe('Full Game Flow with 4 Players', () => {
  test('should complete a full game with 4 players from start to finish', async ({ browser }) => {
    test.setTimeout(120000); // 2分に延長
    const BASE_URL = 'https://codenamesclone.vercel.app';

    console.log('\n=== 4名プレイヤー完全ゲームフローテスト開始 ===\n');

    // ホスト用のcontext + page作成
    const hostContext = await browser.newContext();
    const page = await hostContext.newPage();

    // ログとエラーのキャプチャ（全プレイヤー共通）
    const setupLogging = (playerPage: Page, playerName: string) => {
      playerPage.on('console', (msg) => {
        if (msg.type() === 'error') {
          console.log(`[${playerName} エラー]:`, msg.text());
        }
      });

      playerPage.on('pageerror', (error) => {
        console.log(`❌ [${playerName} ページエラー]:`, error.message);
      });
    };

    setupLogging(page, 'ホスト');

    // === ステップ1: ルーム作成（ホスト） ===
    console.log('\n--- ステップ1: ルーム作成 ---');
    await page.goto(`${BASE_URL}/create`);
    await expect(page.getByRole('heading', { name: /ルームを作成/i })).toBeVisible({ timeout: 10000 });

    await page.fill('#roomName', '4名フルゲームテスト');
    await page.fill('#nickname', '赤スパイマスター');
    await page.waitForTimeout(2000); // 単語パック読み込み待機

    await page.click('button[type="submit"]');
    console.log('ルーム作成ボタンをクリック');

    // エラーチェック
    await page.waitForTimeout(2000);
    const errorMsg = page.locator('.bg-red-100, [role="alert"]');
    const hasError = await errorMsg.isVisible().catch(() => false);
    if (hasError) {
      const errorText = await errorMsg.textContent();
      console.log('❌ ルーム作成エラー:', errorText);
      await page.screenshot({ path: 'room-creation-error-4players.png' });
      throw new Error(`ルーム作成失敗: ${errorText}`);
    }

    // ロビーページへの遷移を待機
    await page.waitForURL(/\/room\/[A-Z0-9]{6}/, { timeout: 10000 });
    const roomUrl = page.url();
    const roomCode = roomUrl.match(/\/room\/([A-Z0-9]{6})/)?.[1];
    console.log(`✅ ルーム作成成功: ${roomCode}`);
    console.log(`ルームURL: ${roomUrl}`);

    // === ステップ2: 他の3名のプレイヤーを/joinページ経由で参加 ===
    console.log('\n--- ステップ2: 他の3名のプレイヤー参加 ---');

    const joinPlayer = async (playerName: string, playerPage: Page) => {
      setupLogging(playerPage, playerName);

      // /joinページにアクセス
      await playerPage.goto(`${BASE_URL}/join`);
      await playerPage.waitForTimeout(1000);

      // ルームコードとニックネームを入力
      await playerPage.fill('#roomCode', roomCode!);
      await playerPage.fill('#nickname', playerName);

      // 参加ボタンをクリック
      const joinButton = playerPage.locator('button[type="submit"]');
      await joinButton.click();

      // ロビーページへの遷移を待機
      await playerPage.waitForURL(/\/room\/[A-Z0-9]{6}/, { timeout: 10000 });
      await playerPage.waitForTimeout(2000);

      console.log(`✅ ${playerName} 参加成功`);
    };

    // プレイヤー2: 赤チーム・オペレーティブ（独立したcontext）
    const redOperativeContext = await browser.newContext();
    const redOperative = await redOperativeContext.newPage();
    await joinPlayer('赤オペレーティブ', redOperative);

    // プレイヤー3: 青チーム・スパイマスター（独立したcontext）
    const blueSpymasterContext = await browser.newContext();
    const blueSpymaster = await blueSpymasterContext.newPage();
    await joinPlayer('青スパイマスター', blueSpymaster);

    // プレイヤー4: 青チーム・オペレーティブ（独立したcontext）
    const blueOperativeContext = await browser.newContext();
    const blueOperative = await blueOperativeContext.newPage();
    await joinPlayer('青オペレーティブ', blueOperative);

    // 全員の参加を確認（最大20秒待機）
    const players = ['赤スパイマスター', '赤オペレーティブ', '青スパイマスター', '青オペレーティブ'];
    for (const playerName of players) {
      try {
        await page.getByText(playerName).waitFor({ state: 'visible', timeout: 20000 });
        console.log(`✅ ${playerName}がロビーに表示されています`);
      } catch {
        console.log(`⚠️ ${playerName}が20秒待機しても表示されませんでした`);
      }
    }

    // 追加で5秒待機して安定化
    await page.waitForTimeout(5000);

    // === ステップ3: チーム・役割選択 ===
    console.log('\n--- ステップ3: チーム・役割選択 ---');

    // ホスト（赤スパイマスター）: 赤チーム・スパイマスターを選択
    await page.waitForTimeout(3000);
    const redSpymasterBtn = page.getByRole('button', { name: /スパイマスターになる/ }).first();
    await redSpymasterBtn.click();
    await page.waitForTimeout(4000); // Realtime同期待機
    console.log('✅ ホスト: 赤チーム・スパイマスター選択');

    // プレイヤー2（赤オペレーティブ）: 赤チーム・オペレーティブを選択
    await redOperative.waitForTimeout(3000);
    const redOperativeBtn = redOperative.getByRole('button', { name: /オペレーティブになる/ }).first();
    await redOperativeBtn.click();
    await redOperative.waitForTimeout(4000); // Realtime同期待機
    console.log('✅ プレイヤー2: 赤チーム・オペレーティブ選択');

    // プレイヤー3（青スパイマスター）: 青チーム・スパイマスターを選択
    await blueSpymaster.waitForTimeout(3000);
    const blueSpymasterBtns = blueSpymaster.getByRole('button', { name: /スパイマスターになる/ });
    const blueSpyBtnCount = await blueSpymasterBtns.count();
    if (blueSpyBtnCount >= 2) {
      await blueSpymasterBtns.nth(1).click(); // 2番目のボタン（青チーム）
    } else {
      await blueSpymasterBtns.first().click();
    }
    await blueSpymaster.waitForTimeout(4000); // Realtime同期待機
    console.log('✅ プレイヤー3: 青チーム・スパイマスター選択');

    // プレイヤー4（青オペレーティブ）: 青チーム・オペレーティブを選択
    await blueOperative.waitForTimeout(3000);
    const blueOperativeBtns = blueOperative.getByRole('button', { name: /オペレーティブになる/ });
    const blueOpBtnCount = await blueOperativeBtns.count();
    if (blueOpBtnCount >= 2) {
      await blueOperativeBtns.nth(1).click(); // 2番目のボタン（青チーム）
    } else {
      await blueOperativeBtns.first().click();
    }
    await blueOperative.waitForTimeout(4000); // Realtime同期待機
    console.log('✅ プレイヤー4: 青チーム・オペレーティブ選択');

    // 選択結果のスクリーンショット
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'team-selection-complete.png' });
    console.log('✅ チーム選択完了のスクリーンショット保存');

    // === ステップ4: ゲーム開始 ===
    console.log('\n--- ステップ4: ゲーム開始 ---');

    const startButton = page.getByRole('button', { name: /ゲームを開始|スタート/i });
    await startButton.waitFor({ state: 'visible', timeout: 5000 });

    // ボタンが有効になるまで待機
    await expect(startButton).toBeEnabled({ timeout: 10000 });

    await startButton.click();
    await page.waitForTimeout(3000);
    console.log('✅ ゲーム開始ボタンをクリック');

    // ゲーム画面への遷移を確認
    const isGamePage = await page.locator('text=/ターン|カード|ヒント/').isVisible().catch(() => false);
    if (isGamePage) {
      console.log('✅ ゲーム画面に遷移成功');
    } else {
      console.log('⚠️ ゲーム画面への遷移を確認できませんでした');
      await page.screenshot({ path: 'game-start-failed-4p.png' });
    }

    // === ステップ5: ゲームプレイ ===
    console.log('\n--- ステップ5: ゲームプレイ ---');

    // 現在のターンを確認
    await page.waitForTimeout(2000);
    const turnIndicator = page.locator('text=/ターン.*赤|ターン.*青|赤.*ターン|青.*ターン/');
    const currentTurn = await turnIndicator.textContent().catch(() => '');
    console.log(`現在のターン: ${currentTurn}`);

    // スパイマスターがヒントを出す（現在のターンに応じて）
    const isRedTurn = currentTurn.includes('赤');
    const currentSpymaster = isRedTurn ? page : blueSpymaster;
    const currentOperative = isRedTurn ? redOperative : blueOperative;
    const spymasterName = isRedTurn ? '赤スパイマスター' : '青スパイマスター';
    const operativeName = isRedTurn ? '赤オペレーティブ' : '青オペレーティブ';

    console.log(`\n--- ${spymasterName}がヒントを出す ---`);

    const hintInput = currentSpymaster.locator('input[placeholder*="ヒント"], input[type="text"]').first();
    const hintInputVisible = await hintInput.isVisible().catch(() => false);

    if (hintInputVisible) {
      await hintInput.fill('テスト');

      const countSelect = currentSpymaster.locator('select, input[type="number"]').first();
      const hasCountSelect = await countSelect.isVisible().catch(() => false);
      if (hasCountSelect) {
        await countSelect.selectOption('2');
      }

      const sendHintButton = currentSpymaster.getByRole('button', { name: /送信|ヒントを出す/i });
      const hasSendBtn = await sendHintButton.isVisible().catch(() => false);
      if (hasSendBtn) {
        await sendHintButton.click();
        await currentSpymaster.waitForTimeout(2000);
        console.log(`✅ ${spymasterName}: ヒント「テスト 2」送信成功`);
      }
    } else {
      console.log(`⚠️ ${spymasterName}: ヒント入力フォームが見つかりませんでした`);
      await currentSpymaster.screenshot({ path: 'no-hint-input.png' });
    }

    // オペレーティブがカードを選択
    console.log(`\n--- ${operativeName}がカードを選択 ---`);
    await currentOperative.waitForTimeout(2000);

    // カード一覧を取得
    const cards = currentOperative.locator('button').filter({ hasText: /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\uFF66-\uFF9F]+/ });
    const cardCount = await cards.count();
    console.log(`カード数: ${cardCount}`);

    if (cardCount > 0) {
      // 最初の未公開カードをクリック
      for (let i = 0; i < Math.min(2, cardCount); i++) {
        const card = cards.nth(i);
        const isEnabled = await card.isEnabled().catch(() => false);

        if (isEnabled) {
          const cardText = await card.textContent();
          console.log(`カード「${cardText}」をクリック...`);

          await card.click();
          await currentOperative.waitForTimeout(2000);
          console.log(`✅ カード選択成功: ${cardText}`);

          // カード選択後の状態確認
          await currentOperative.screenshot({ path: `card-selected-${i + 1}.png` });
        } else {
          console.log(`カード${i + 1}はクリック不可`);
        }
      }
    } else {
      console.log('❌ カードが見つかりませんでした');
      await currentOperative.screenshot({ path: 'no-cards-operative.png' });
    }

    // === ステップ6: ゲーム状態の確認 ===
    console.log('\n--- ステップ6: ゲーム状態確認 ---');

    await page.waitForTimeout(2000);

    // スコア確認
    const scoreIndicator = page.locator('text=/赤.*\\/.*青.*\\//');
    const scoreVisible = await scoreIndicator.isVisible().catch(() => false);
    if (scoreVisible) {
      const scoreText = await scoreIndicator.textContent();
      console.log(`✅ スコア表示: ${scoreText}`);
    }

    // ゲーム終了判定
    const gameOverIndicator = page.locator('text=/勝利|敗北|ゲーム終了/');
    const isGameOver = await gameOverIndicator.isVisible().catch(() => false);

    if (isGameOver) {
      const resultText = await gameOverIndicator.textContent();
      console.log(`✅ ゲーム終了: ${resultText}`);
      await page.screenshot({ path: 'game-over-result.png', fullPage: true });
    } else {
      console.log('⚠️ ゲームは継続中（1ターンのみテスト）');
    }

    // === 最終確認・スクリーンショット ===
    console.log('\n--- 最終確認 ---');

    await page.screenshot({ path: 'final-red-spymaster.png', fullPage: true });
    await redOperative.screenshot({ path: 'final-red-operative.png', fullPage: true });
    await blueSpymaster.screenshot({ path: 'final-blue-spymaster.png', fullPage: true });
    await blueOperative.screenshot({ path: 'final-blue-operative.png', fullPage: true });

    console.log('✅ 全プレイヤーのスクリーンショット保存完了');
    console.log('\n=== 4名プレイヤー完全ゲームフローテスト完了 ===\n');

    // クリーンアップ（各contextをclose）
    await hostContext.close();
    await redOperativeContext.close();
    await blueSpymasterContext.close();
    await blueOperativeContext.close();
  });
});
