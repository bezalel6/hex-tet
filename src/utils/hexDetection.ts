import { Hex, hexToPixel } from '../engine/coords';

// Convert pixel coordinates to the nearest hex coordinate
export function pixelToHex(x: number, y: number, size: number): Hex {
  // For flat-top hexagons
  const q = (2/3 * x) / size;
  const r = (-1/3 * x + Math.sqrt(3)/3 * y) / size;
  
  return hexRound(q, r);
}

// Round fractional hex coordinates to the nearest hex
function hexRound(q: number, r: number): Hex {
  const s = -q - r;
  
  let rq = Math.round(q);
  let rr = Math.round(r);
  let rs = Math.round(s);
  
  const q_diff = Math.abs(rq - q);
  const r_diff = Math.abs(rr - r);
  const s_diff = Math.abs(rs - s);
  
  if (q_diff > r_diff && q_diff > s_diff) {
    rq = -rr - rs;
  } else if (r_diff > s_diff) {
    rr = -rq - rs;
  }
  
  return { q: rq, r: rr };
}

// Get the hex coordinate at a specific point relative to the SVG center
export function getHexAtPoint(
  mouseX: number, 
  mouseY: number, 
  svgRect: DOMRect,
  cellSize: number
): Hex | null {
  // Convert mouse coordinates to SVG coordinates
  const svgCenterX = svgRect.left + svgRect.width / 2;
  const svgCenterY = svgRect.top + svgRect.height / 2;
  
  const x = mouseX - svgCenterX;
  const y = mouseY - svgCenterY;
  
  return pixelToHex(x, y, cellSize);
}
