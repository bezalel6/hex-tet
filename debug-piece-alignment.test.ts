import { test, expect } from '@playwright/test';

test('debug piece alignment issues', async ({ page }) => {
  // Collect console messages
  const consoleLogs: string[] = [];
  page.on('console', (msg) => {
    consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
  });

  // Navigate to the app
  await page.goto('http://localhost:5173');
  
  // Wait for the grid to load
  await page.waitForSelector('svg', { timeout: 5000 });
  
  // Get piece preview information
  const pieceInfo = await page.evaluate(() => {
    const pieceSvgs = document.querySelectorAll('.cursor-move svg');
    const pieces: any[] = [];
    
    pieceSvgs.forEach((svg, index) => {
      const viewBox = svg.getAttribute('viewBox');
      const width = svg.getAttribute('width');
      const height = svg.getAttribute('height');
      const polygons = svg.querySelectorAll('polygon');
      
      const cells: any[] = [];
      polygons.forEach((poly) => {
        const transform = poly.getAttribute('transform');
        const points = poly.getAttribute('points');
        cells.push({ transform, points });
      });
      
      pieces.push({
        index,
        viewBox,
        width,
        height,
        cellCount: cells.length,
        cells: cells.slice(0, 2) // First 2 cells for debugging
      });
    });
    
    return pieces;
  });
  
  console.log('\n=== PIECE PREVIEW INFO ===');
  console.log(JSON.stringify(pieceInfo, null, 2));
  
  // Compare piece cell size with board cell size
  const comparison = await page.evaluate(() => {
    // Get board cell size
    const boardCell = document.querySelector('svg g[transform] polygon');
    const boardPoints = boardCell?.getAttribute('points');
    
    // Get piece cell size
    const pieceCell = document.querySelector('.cursor-move svg polygon');
    const piecePoints = pieceCell?.getAttribute('points');
    
    // Parse points to calculate sizes
    const parsePoints = (points: string | null) => {
      if (!points) return null;
      const coords = points.split(' ').map(p => {
        const [x, y] = p.split(',').map(Number);
        return { x, y };
      });
      
      // Calculate size from first two points (flat-top hex)
      if (coords.length >= 2) {
        const dx = coords[1].x - coords[0].x;
        const dy = coords[1].y - coords[0].y;
        const edgeLength = Math.sqrt(dx * dx + dy * dy);
        return { points: coords.slice(0, 3), edgeLength };
      }
      return null;
    };
    
    return {
      board: parsePoints(boardPoints),
      piece: parsePoints(piecePoints),
      boardCellTransform: document.querySelector('svg g[transform]')?.getAttribute('transform'),
      pieceCellTransform: document.querySelector('.cursor-move svg polygon')?.getAttribute('transform')
    };
  });
  
  console.log('\n=== SIZE COMPARISON ===');
  console.log(JSON.stringify(comparison, null, 2));
  
  // Test drag and drop alignment
  const firstPiece = await page.locator('.cursor-move').first();
  
  if (await firstPiece.isVisible()) {
    // Start dragging
    await firstPiece.hover();
    await page.screenshot({ path: 'debug-piece-hover.png' });
    
    await page.mouse.down();
    
    // Move to specific board position
    const targetCell = await page.locator('text="0,0"').first();
    const targetBounds = await targetCell.boundingBox();
    
    if (targetBounds) {
      console.log('\n=== TARGET CELL (0,0) BOUNDS ===');
      console.log(JSON.stringify(targetBounds, null, 2));
      
      // Move to center of target cell
      await page.mouse.move(
        targetBounds.x + targetBounds.width / 2,
        targetBounds.y + targetBounds.height / 2,
        { steps: 10 }
      );
      
      await page.screenshot({ path: 'debug-piece-over-center.png' });
      
      // Check what cells are highlighted
      const highlightedCells = await page.evaluate(() => {
        const cells = document.querySelectorAll('g[transform]');
        const highlighted: any[] = [];
        
        cells.forEach((cell) => {
          const polygon = cell.querySelector('polygon');
          const text = cell.querySelector('text');
          if (polygon && text) {
            const strokeWidth = polygon.getAttribute('stroke-width');
            if (strokeWidth && parseFloat(strokeWidth) > 1) {
              highlighted.push({
                coord: text.textContent,
                strokeWidth,
                stroke: polygon.getAttribute('stroke')
              });
            }
          }
        });
        
        return highlighted;
      });
      
      console.log('\n=== HIGHLIGHTED CELLS ===');
      console.log(JSON.stringify(highlightedCells, null, 2));
      
      // Get drag overlay info
      const dragOverlayInfo = await page.evaluate(() => {
        const overlay = document.querySelector('[role="presentation"]');
        if (overlay) {
          const svg = overlay.querySelector('svg');
          return {
            found: true,
            transform: overlay.getAttribute('style'),
            svgViewBox: svg?.getAttribute('viewBox'),
            svgSize: svg ? { width: svg.getAttribute('width'), height: svg.getAttribute('height') } : null
          };
        }
        return { found: false };
      });
      
      console.log('\n=== DRAG OVERLAY INFO ===');
      console.log(JSON.stringify(dragOverlayInfo, null, 2));
      
      await page.mouse.up();
    }
  }
  
  // Final screenshot
  await page.screenshot({ path: 'debug-alignment-final.png' });
  
  // Print all console logs
  console.log('\n=== CONSOLE LOGS ===');
  consoleLogs.slice(-10).forEach(log => console.log(log));
  
  await page.close();
});
