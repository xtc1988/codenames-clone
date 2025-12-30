const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function takeScreenshots() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 }
  });

  const mockups = [
    '01-brutalist',
    '02-editorial-luxury',
    '03-retro-arcade',
    '04-zen-minimal',
    '05-synthwave',
    '06-bauhaus',
    '07-forest-nature',
    '08-cyberpunk',
    '09-art-deco',
    '10-playful-candy'
  ];

  const screenshotsDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }

  for (const mockup of mockups) {
    const page = await context.newPage();
    const filePath = path.join(__dirname, `${mockup}.html`);

    console.log(`Taking screenshot of ${mockup}...`);

    await page.goto(`file://${filePath}`);
    await page.waitForTimeout(500); // Wait for fonts and animations

    await page.screenshot({
      path: path.join(screenshotsDir, `${mockup}.png`),
      fullPage: false
    });

    await page.close();
    console.log(`  Saved: ${mockup}.png`);
  }

  await browser.close();
  console.log('\nAll screenshots taken!');
}

takeScreenshots().catch(console.error);
