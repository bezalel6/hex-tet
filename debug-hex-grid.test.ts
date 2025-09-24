import { test, expect } from '@playwright/test';

test('debug hex grid alignment', async ({ page }) => {
  // Collect console messages
  const consoleLogs: string[] = [];
  page.on('console', (msg) => {
    consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
  });

  // Navigate to the app
  await page.goto('http://localhost:5173');
  
  // Wait for the grid to load
  await page.waitForSelector('svg', { timeout: 5000 });
  
  // Take initial screenshot
  await page.screenshot({ path: 'debug-initial.png', fullPage: true });
  
  // Wait a bit to ensure all console logs are captured
  await page.waitForTimeout(1000);
  
  // Print console logs
  console.log('\n=== Console Output ===');
  consoleLogs.forEach(log => console.log(log));
  
  // Get grid information from the page
  const gridInfo = await page.evaluate(() => {
    const svg = document.querySelector('svg');
    const cells = document.querySelectorAll('g[transform]');
    
    // Get coordinates from text elements
    const cellCoords: any[] = [];
    cells.forEach((cell) => {
      const text = cell.querySelector('text');
      if (text && text.textContent) {
        const transform = cell.getAttribute('transform');
        const coords = text.textContent.split(',').map(n => parseInt(n));
        cellCoords.push({
          q: coords[0],
          r: coords[1],
          transform,
          text: text.textContent
        });
      }
    });
    
    return {
      svgViewBox: svg?.getAttribute('viewBox'),
      svgWidth: svg?.getAttribute('width'),
      svgHeight: svg?.getAttribute('height'),
      totalCells: cells.length,
      sampleCells: cellCoords.slice(0, 10),
      centerCell: cellCoords.find(c => c.q === 0 && c.r === 0),
      edgeCells: cellCoords.filter(c => Math.abs(c.q) === 4 || Math.abs(c.r) === 4)
    };
  });
  
  console.log('\n=== Grid Info ===');
  console.log(JSON.stringify(gridInfo, null, 2));
  
  // Take a screenshot with highlighted center
  await page.evaluate(() => {
    // Find and highlight the center cell (0,0)
    const cells = document.querySelectorAll('g[transform]');
    cells.forEach((cell) => {
      const text = cell.querySelector('text');
      if (text && text.textContent === '0,0') {
        const polygon = cell.querySelector('polygon');
        if (polygon) {
          polygon.setAttribute('fill', '#ff0000');
          polygon.setAttribute('stroke', '#ffff00');
          polygon.setAttribute('stroke-width', '3');
        }
      }
    });
  });
  
  await page.screenshot({ path: 'debug-center-highlighted.png', fullPage: true });
  
  // Check if pieces are loaded
  const piecesInfo = await page.evaluate(() => {
    const pieceContainers = document.querySelectorAll('.flex.flex-col > div');
    return {
      totalPieces: pieceContainers.length,
      piecesFound: Array.from(pieceContainers).map((_, i) => `Piece ${i + 1}`)
    };
  });
  
  console.log('\n=== Pieces Info ===');
  console.log(JSON.stringify(piecesInfo, null, 2));
  
  // Try to drag a piece
  const firstPiece = await page.locator('.cursor-move').first();
  if (await firstPiece.isVisible()) {
    // Get piece bounds
    const pieceBounds = await firstPiece.boundingBox();
    console.log('\n=== First Piece Bounds ===');
    console.log(JSON.stringify(pieceBounds, null, 2));
    
    // Start dragging
    await firstPiece.hover();
    await page.mouse.down();
    
    // Move to center of grid - find the main grid SVG
    const svgBounds = await page.locator('svg').first().boundingBox();
    if (svgBounds) {
      await page.mouse.move(svgBounds.x + svgBounds.width / 2, svgBounds.y + svgBounds.height / 2);
      await page.screenshot({ path: 'debug-dragging.png', fullPage: true });
      
      // Release the piece
      await page.mouse.up();
    }
  }
  
  // Final screenshot
  await page.screenshot({ path: 'debug-final.png', fullPage: true });
  
  // Close the test
  await page.close();
});
