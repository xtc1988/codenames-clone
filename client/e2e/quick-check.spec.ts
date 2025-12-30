import { test } from '@playwright/test';

const PROD_URL = process.env.PROD_URL || 'http://localhost:5173';

test('Vercel環境変数チェック', async ({ page }) => {
  const errors: string[] = [];

  page.on('console', (msg) => {
    console.log(`[CONSOLE ${msg.type()}]:`, msg.text());
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  page.on('pageerror', (error) => {
    console.log(`[PAGE ERROR]:`, error.message);
    errors.push(error.message);
  });

  console.log(`\n=== アクセス先: ${PROD_URL} ===\n`);

  await page.goto(PROD_URL);
  await page.waitForTimeout(3000);

  console.log(`\n=== エラー一覧 ===`);
  if (errors.length > 0) {
    errors.forEach((err, i) => console.log(`${i + 1}. ${err}`));
  } else {
    console.log('✅ エラーなし');
  }

  await page.screenshot({ path: 'vercel-check.png', fullPage: true });
  console.log('✅ スクリーンショット保存: vercel-check.png');
});
