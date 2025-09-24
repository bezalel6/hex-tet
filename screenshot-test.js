const { chromium } = require('playwright');

(async () => {
  // Launch browser
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  // Navigate to the app
  await page.goto('http://localhost:5173');

  // Wait for the hexagonal grid to be visible
  await page.waitForSelector('svg', { timeout: 5000 });

  // Wait a bit for animations to complete
  await page.waitForTimeout(2000);

  // Take screenshot
  const timestamp = Date.now();
  await page.screenshot({
    path: `screenshot-${timestamp}.png`,
    fullPage: true
  });

  console.log(`Screenshot saved as screenshot-${timestamp}.png`);

  await browser.close();
})();