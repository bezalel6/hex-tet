import { chromium } from '@playwright/test';

async function testFinalState() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    // Collect console messages
    const consoleLogs = [];
    page.on('console', (msg) => {
        if (msg.type() === 'log' && msg.text().includes('Drag over:')) {
            consoleLogs.push(msg.text());
        }
    });

    await page.goto('http://localhost:5173');
    await page.waitForSelector('svg', { timeout: 5000 });

    // Take initial screenshot
    await page.screenshot({ path: 'final-initial.png', fullPage: true });

    // Test dragging
    const firstPiece = await page.locator('.cursor-move').first();
    if (await firstPiece.isVisible()) {
        await firstPiece.hover();
        await page.mouse.down();

        // Move to center of screen to see drag overlay
        await page.mouse.move(600, 400);
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'final-dragging.png', fullPage: true });

        // Move over center cell
        const centerCell = await page.locator('text="0,0"').first();
        const bounds = await centerCell.boundingBox();
        if (bounds) {
            await page.mouse.move(bounds.x, bounds.y, { steps: 5 });
            await page.waitForTimeout(500);
            await page.screenshot({ path: 'final-over-center.png', fullPage: true });
        }

        await page.mouse.up();
    }

    // Print console logs
    console.log('\n=== Drag Events ===');
    consoleLogs.slice(-10).forEach(log => console.log(log));

    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'final-placed.png', fullPage: true });

    console.log('\nScreenshots saved: final-initial.png, final-dragging.png, final-over-center.png, final-placed.png');
    console.log('Keep browser open to inspect...');

    // Keep browser open for manual inspection
    await page.waitForTimeout(30000);
    await browser.close();
}

testFinalState().catch(console.error);
