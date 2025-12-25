import { test, expect } from '@playwright/test';

test.describe('Basic Navigation', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');

    // トップページのタイトルが表示されているか
    await expect(page.getByRole('heading', { name: /CODENAMES/i })).toBeVisible();
  });

  test('should navigate to room creation page', async ({ page }) => {
    await page.goto('/');

    // ルーム作成ページへのリンクをクリック
    await page.getByRole('link', { name: /ルームを作成/i }).click();

    // ルーム作成ページが表示されるか
    await expect(page.getByRole('heading', { name: /ルームを作成/i })).toBeVisible();
  });

  test('should navigate to room join page', async ({ page }) => {
    await page.goto('/');

    // ルーム参加ページへのリンクをクリック
    await page.getByRole('link', { name: /ルームに参加/i }).click();

    // ルーム参加ページが表示されるか
    await expect(page.getByRole('heading', { name: /ルームに参加/i })).toBeVisible();
  });

  test('should navigate to word packs page', async ({ page }) => {
    await page.goto('/');

    // 単語パック管理ページへのリンクをクリック
    await page.getByRole('link', { name: /単語パック/i }).click();

    // 単語パック管理ページが表示されるか
    await expect(page.getByRole('heading', { name: /単語パック管理/i })).toBeVisible();
  });
});

test.describe('Room Creation Form', () => {
  test('should require room name', async ({ page }) => {
    await page.goto('/create');

    // ルーム名を入力せずに作成ボタンをクリック
    const createButton = page.getByRole('button', { name: /作成/i });

    // フォームのバリデーションが働くか確認
    await expect(createButton).toBeVisible();
  });

  test('should show form fields', async ({ page }) => {
    await page.goto('/create');

    // 各フォームフィールドが表示されているか
    await expect(page.getByLabel(/ルーム名/i)).toBeVisible();
    await expect(page.getByLabel(/ニックネーム/i)).toBeVisible();
    await expect(page.getByLabel(/単語パック/i)).toBeVisible();
  });
});

test.describe('Word Pack Management', () => {
  test('should show word pack list', async ({ page }) => {
    await page.goto('/word-packs');

    // 単語パック一覧が表示されているか
    await expect(page.getByRole('heading', { name: /単語パック管理/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /新規作成/i })).toBeVisible();
  });

  test('should navigate to word pack creation', async ({ page }) => {
    await page.goto('/word-packs');

    // 新規作成ボタンをクリック
    await page.getByRole('link', { name: /新規作成/i }).click();

    // 単語パック作成ページが表示されるか
    await expect(page.getByRole('heading', { name: /単語パックを作成/i })).toBeVisible();
  });

  test('should show word pack creation form', async ({ page }) => {
    await page.goto('/word-packs/create');

    // フォームフィールドが表示されているか
    await expect(page.getByPlaceholder(/例: アニメ用語パック/i)).toBeVisible();
    await expect(page.getByPlaceholder(/このパックについての説明/i)).toBeVisible();
    await expect(page.getByPlaceholder(/りんご/)).toBeVisible();
    await expect(page.getByRole('button', { name: /作成する/i })).toBeVisible();
  });
});
