import { test, expect, Page, BrowserContext } from '@playwright/test';

const PROD_URL = process.env.PROD_URL || 'http://localhost:5173';

test.describe('完全ゲームプレイテスト', () => {
  test('4人プレイヤーで最後まで完全にゲームをプレイする', async ({ browser }) => {
    test.setTimeout(180000); // 3分に延長
    console.log('\n=== 完全ゲームプレイテスト開始 ===\n');

    // 4つの独立したブラウザコンテキストを作成
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    const context3 = await browser.newContext();
    const context4 = await browser.newContext();

    const hostPage = await context1.newPage();
    const player2Page = await context2.newPage();
    const player3Page = await context3.newPage();
    const player4Page = await context4.newPage();

    // コンソールログをキャプチャ
    const setupLogging = (page: Page, playerName: string) => {
      page.on('console', (msg) => {
        const text = msg.text();
        if (text.includes('[LobbyPage]') || text.includes('[GamePage]')) {
          console.log(`[${playerName}]`, text);
        }
      });
    };

    setupLogging(hostPage, 'ホスト');
    setupLogging(player2Page, 'P2');
    setupLogging(player3Page, 'P3');
    setupLogging(player4Page, 'P4');

    // コンソールログキャプチャ（全メッセージ）
    const consoleErrors: string[] = [];
    hostPage.on('console', (msg) => {
      const text = msg.text();
      // CreateRoomPage関連のログを表示
      if (text.includes('CreateRoomPage') || text.includes('[ホスト')) {
        console.log(`[ホスト ${msg.type()}]:`, text);
      }
      if (msg.type() === 'error') {
        console.log(`[ホスト ERROR]:`, text);
        consoleErrors.push(text);
      }
    });
    hostPage.on('pageerror', (error) => {
      console.log(`[ホスト PAGE ERROR]:`, error.message);
      consoleErrors.push(error.message);
    });

    try {
      // === ステップ1: ルーム作成 ===
      console.log('--- ステップ1: ルーム作成 ---');
      await hostPage.goto(PROD_URL);
      await hostPage.waitForLoadState('networkidle');
      await hostPage.screenshot({ path: 'step1-top-page.png' });

      const createButton = hostPage.getByRole('link', { name: /ルームを作成/ });
      await createButton.waitFor({ timeout: 10000 });
      await createButton.click();

      // ページ遷移完了を待機
      await hostPage.waitForTimeout(2000);

      // 入力フィールドが表示されるまで待機
      const nicknameInput = hostPage.locator('#nickname');
      await nicknameInput.waitFor({ state: 'visible', timeout: 10000 });

      await hostPage.fill('#nickname', '赤スパイマスター');
      await hostPage.fill('#roomName', '完全ゲームテスト');

      console.log('ルーム作成ボタンをクリック...');
      await hostPage.getByRole('button', { name: /ルームを作成/i }).click();

      console.log('URL遷移を待機中...');
      await hostPage.waitForURL(/\/room\/[A-Z0-9]+$/, { timeout: 60000 });

      if (consoleErrors.length > 0) {
        console.log('\n⚠️ コンソールエラー検出:');
        consoleErrors.forEach((err, i) => console.log(`${i + 1}. ${err}`));
      }

      const roomUrl = hostPage.url();
      const roomCode = roomUrl.split('/').pop() || '';
      console.log(`✅ ルーム作成成功: ${roomCode}`);

      // === ステップ2: 他のプレイヤー参加 ===
      console.log('\n--- ステップ2: 他のプレイヤー参加 ---');

      // P2参加
      await player2Page.goto(`${PROD_URL}/join`);
      await player2Page.fill('#roomCode', roomCode);
      await player2Page.fill('#nickname', '赤オペレーティブ');
      await player2Page.getByRole('button', { name: /参加/i }).click();
      await player2Page.getByRole('heading', { name: /赤チーム/i }).waitFor({ timeout: 10000 });
      console.log('✅ P2参加');

      // P3参加
      await player3Page.goto(`${PROD_URL}/join`);
      await player3Page.fill('#roomCode', roomCode);
      await player3Page.fill('#nickname', '青スパイマスター');
      await player3Page.getByRole('button', { name: /参加/i }).click();
      await player3Page.getByRole('heading', { name: /赤チーム/i }).waitFor({ timeout: 10000 });
      console.log('✅ P3参加');

      // P4参加
      await player4Page.goto(`${PROD_URL}/join`);
      await player4Page.fill('#roomCode', roomCode);
      await player4Page.fill('#nickname', '青オペレーティブ');
      await player4Page.getByRole('button', { name: /参加/i }).click();
      await player4Page.getByRole('heading', { name: /赤チーム/i }).waitFor({ timeout: 10000 });
      console.log('✅ P4参加');

      await hostPage.waitForTimeout(2000);

      // === ステップ3: チーム・役割選択 ===
      console.log('\n--- ステップ3: チーム・役割選択 ---');

      await hostPage.getByRole('button', { name: /スパイマスターになる/i }).first().click();
      await hostPage.waitForTimeout(1000);
      console.log('✅ ホスト: 赤スパイマスター');

      await player2Page.getByRole('button', { name: /オペレーティブになる/i }).first().click();
      await player2Page.waitForTimeout(1000);
      console.log('✅ P2: 赤オペレーティブ');

      await player3Page.getByRole('button', { name: /スパイマスターになる/i }).nth(1).click();
      await player3Page.waitForTimeout(1000);
      console.log('✅ P3: 青スパイマスター');

      await player4Page.getByRole('button', { name: /オペレーティブになる/i }).nth(1).click();
      await player4Page.waitForTimeout(1000);
      console.log('✅ P4: 青オペレーティブ');

      await hostPage.waitForTimeout(2000);

      // === ステップ4: ゲーム開始 ===
      console.log('\n--- ステップ4: ゲーム開始 ---');
      await hostPage.getByRole('button', { name: /ゲームを開始/i }).click();
      await hostPage.waitForURL(/\/room\/[A-Z0-9]+\/game$/);
      await hostPage.waitForTimeout(3000);
      console.log('✅ ゲーム開始');

      // === ステップ5: 完全ゲームプレイ ===
      console.log('\n--- ステップ5: 完全ゲームプレイ開始 ---');

      let turnCount = 0;
      const maxTurns = 50; // 無限ループ防止
      let gameOver = false;

      while (!gameOver && turnCount < maxTurns) {
        turnCount++;
        console.log(`\n=== ターン ${turnCount} ===`);

        await hostPage.waitForTimeout(2000);

        // 現在のターンを確認
        const turnIndicator = hostPage.locator('text=/ターン:.*[赤青]/');
        const turnText = await turnIndicator.textContent().catch(() => '');
        console.log(`現在のターン: ${turnText}`);

        const isRedTurn = turnText.includes('赤');
        const spymasterPage = isRedTurn ? hostPage : player3Page;
        const operativePage = isRedTurn ? player2Page : player4Page;
        const teamName = isRedTurn ? '赤' : '青';

        // スパイマスターがヒントを出す
        console.log(`\n--- ${teamName}スパイマスターがヒントを出す ---`);

        const hintInput = spymasterPage.locator('input[placeholder*="ヒント"]');
        const hintVisible = await hintInput.isVisible().catch(() => false);

        if (hintVisible) {
          await hintInput.fill('テスト');

          const countInput = spymasterPage.locator('input[type="number"]');
          await countInput.fill('2');

          const sendButton = spymasterPage.getByRole('button', { name: /送信|ヒント/i });
          await sendButton.click();
          await spymasterPage.waitForTimeout(2000);
          console.log(`✅ ${teamName}スパイマスター: ヒント送信`);
        } else {
          console.log(`⚠️ ${teamName}スパイマスター: ヒント入力不可`);
        }

        // オペレーティブがカードを選択
        console.log(`\n--- ${teamName}オペレーティブがカードを選択 ---`);
        await operativePage.waitForTimeout(2000);

        // カードボタンを取得（日本語を含み、更新ボタンでない、有効なボタン）
        const allCardButtons = operativePage.locator('button').filter({
          hasText: /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/
        });

        // 有効なカード（disabled でない、更新ボタンでない）を見つける
        const cardCount = await allCardButtons.count();
        let clickedCard = false;

        for (let i = 0; i < cardCount; i++) {
          const cardButton = allCardButtons.nth(i);
          const cardText = await cardButton.textContent();
          const isDisabled = await cardButton.isDisabled();

          if (cardText && !cardText.includes('更新') && !isDisabled) {
            console.log(`カード「${cardText}」をクリック試行...`);
            await cardButton.click();
            await operativePage.waitForTimeout(2000);
            console.log(`✅ ${teamName}オペレーティブ: カード「${cardText}」選択`);
            clickedCard = true;
            break;
          }
        }

        if (!clickedCard) {
          console.log(`⚠️ ${teamName}オペレーティブ: 選択可能なカードなし`);
        }

        // ゲーム終了判定
        await hostPage.waitForTimeout(2000);
        const winnerIndicator = hostPage.locator('text=/勝利/');
        gameOver = await winnerIndicator.isVisible().catch(() => false);

        if (gameOver) {
          const winnerText = await winnerIndicator.textContent();
          console.log(`\n🎉 ゲーム終了: ${winnerText}`);
          await hostPage.screenshot({ path: 'complete-game-winner.png', fullPage: true });
          break;
        }

        // スコア確認
        const redScore = hostPage.locator('text=/🔴 赤: [0-9]+\\/[0-9]+/');
        const blueScore = hostPage.locator('text=/🔵 青: [0-9]+\\/[0-9]+/');
        const redText = await redScore.textContent().catch(() => '');
        const blueText = await blueScore.textContent().catch(() => '');
        console.log(`スコア: ${redText} ${blueText}`);
      }

      if (turnCount >= maxTurns) {
        console.log(`⚠️ 最大ターン数(${maxTurns})に到達`);
      }

      // === 最終スクリーンショット ===
      console.log('\n--- 最終状態のスクリーンショット ---');
      await hostPage.screenshot({ path: 'complete-game-final-host.png', fullPage: true });
      await player2Page.screenshot({ path: 'complete-game-final-p2.png', fullPage: true });
      await player3Page.screenshot({ path: 'complete-game-final-p3.png', fullPage: true });
      await player4Page.screenshot({ path: 'complete-game-final-p4.png', fullPage: true });
      console.log('✅ スクリーンショット保存完了');

      console.log('\n=== 完全ゲームプレイテスト完了 ===\n');

      // テストの成功条件
      expect(gameOver).toBe(true);
      expect(turnCount).toBeGreaterThan(0);
      expect(turnCount).toBeLessThan(maxTurns);

    } finally {
      await context1.close();
      await context2.close();
      await context3.close();
      await context4.close();
    }
  });
});
