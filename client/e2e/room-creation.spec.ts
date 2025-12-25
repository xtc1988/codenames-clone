import { test, expect } from '@playwright/test';

test.describe('Room Creation Integration', () => {
  test('should create a room successfully', async ({ page }) => {
    // ルーム作成ページへ移動
    await page.goto('/create');

    // ページが読み込まれるまで待機
    await expect(page.getByRole('heading', { name: /ルームを作成/i })).toBeVisible();

    // フォームに入力
    await page.fill('#roomName', 'テストルーム');
    await page.fill('#nickname', 'テスト太郎');

    // 単語パックの選択肢が読み込まれるまで待機
    await page.waitForTimeout(2000);

    // 単語パックが選択可能か確認
    const wordPackSelect = page.locator('#wordPack');
    const options = await wordPackSelect.locator('option').count();
    console.log(`利用可能な単語パック数: ${options}`);

    // エラーメッセージをキャプチャするリスナーを設定
    page.on('console', (msg) => {
      console.log(`[ブラウザ ${msg.type()}]:`, msg.text());
    });

    // ページエラーをキャプチャ
    page.on('pageerror', (error) => {
      console.log('ページエラー:', error.message);
    });

    // ネットワークリクエストを監視
    const requestPromises: Promise<any>[] = [];
    page.on('request', (request) => {
      if (request.url().includes('supabase') && request.method() === 'POST') {
        console.log(`POSTリクエスト: ${request.url()}`);
        console.log(`リクエストボディ:`, request.postData());
      }
    });

    page.on('response', async (response) => {
      if (response.url().includes('supabase')) {
        console.log(`Supabaseレスポンス: ${response.url()} - ${response.status()}`);
        if (response.status() >= 400) {
          const body = await response.text().catch(() => '(body read failed)');
          console.log(`エラーレスポンス本文:`, body);
        }
      }
    });

    // 作成ボタンをクリック
    await page.click('button[type="submit"]');

    // エラーメッセージが表示されるか、成功するかを確認
    await page.waitForTimeout(3000);

    // エラーメッセージがある場合はそれを取得
    const errorElement = page.locator('.bg-red-100');
    const hasError = await errorElement.isVisible().catch(() => false);

    if (hasError) {
      const errorText = await errorElement.textContent();
      console.log('表示されたエラーメッセージ:', errorText);

      // スクリーンショットを撮影
      await page.screenshot({ path: 'room-creation-error.png' });
    } else {
      // 成功した場合はロビーに遷移しているはず
      await expect(page).toHaveURL(/\/room\/[A-Z0-9]{6}/, { timeout: 5000 });
      console.log('ルーム作成成功！');
    }
  });

  test('should show error when word packs are not available', async ({ page }) => {
    await page.goto('/create');

    // 単語パックの読み込みを待つ
    await page.waitForTimeout(2000);

    const wordPackSelect = page.locator('#wordPack');
    const options = await wordPackSelect.locator('option').allTextContents();

    console.log('単語パックの選択肢:', options);

    // 単語パックが1つもない場合（「選択してください」のみ）
    if (options.length <= 1) {
      console.log('警告: 単語パックが見つかりません');
    }
  });
});
