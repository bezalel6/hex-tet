export type Hex = { q: number; r: number };

export const s = (h: Hex) => -h.q - h.r;

export function add(a: Hex, b: Hex): Hex {
  return { q: a.q + b.q, r: a.r + b.r };
}

export function subtract(a: Hex, b: Hex): Hex {
  return { q: a.q - b.q, r: a.r - b.r };
}

export function scale(h: Hex, k: number): Hex {
  return { q: h.q * k, r: h.r * k };
}

export function equals(a: Hex, b: Hex): boolean {
  return a.q === b.q && a.r === b.r;
}

export function key(h: Hex): string {
  return `${h.q},${h.r}`;
}

export function fromKey(key: string): Hex {
  const [q, r] = key.split(',').map(Number);
  return { q, r };
}

export function distance(a: Hex, b: Hex): number {
  return (Math.abs(a.q - b.q) + Math.abs(a.r - b.r) + Math.abs(s(a) - s(b))) / 2;
}

export const directions: Hex[] = [
  { q: 1, r: 0 },
  { q: 1, r: -1 },
  { q: 0, r: -1 },
  { q: -1, r: 0 },
  { q: -1, r: 1 },
  { q: 0, r: 1 },
];

export function neighbor(hex: Hex, direction: number): Hex {
  return add(hex, directions[direction]);
}

export function neighbors(hex: Hex): Hex[] {
  return directions.map(dir => add(hex, dir));
}

// Rotation by 60 degrees clockwise around origin
export function rotate60CW(hex: Hex): Hex {
  return { q: -hex.r, r: -s(hex) };
}

// Rotation by 60 degrees counter-clockwise around origin
export function rotate60CCW(hex: Hex): Hex {
  return { q: -s(hex), r: -hex.q };
}

// Rotate n times 60 degrees clockwise
export function rotate(hex: Hex, times: number): Hex {
  let result = { ...hex };
  const rotations = ((times % 6) + 6) % 6; // Normalize to 0-5
  for (let i = 0; i < rotations; i++) {
    result = rotate60CW(result);
  }
  return result;
}

// Mirror across the q axis
export function mirror(hex: Hex): Hex {
  return { q: hex.q, r: -hex.q - hex.r };
}

// Generate a hexagonal grid with specified edge length
export function generateHexGrid(edgeLen: number): Hex[] {
  // For a proper hexagonal grid where each edge has exactly 'edgeLen' cells:
  // - The center is at (0,0)
  // - Each edge should have exactly edgeLen cells
  // - Total cells = 3 * edgeLen^2 - 3 * edgeLen + 1
  
  const coords: Hex[] = [];
  const N = edgeLen - 1; // This gives us edgeLen cells per edge
  
  // Generate all hexes within the hexagonal boundary
  for (let q = -N; q <= N; q++) {
    const r1 = Math.max(-N, -q - N);
    const r2 = Math.min(N, -q + N);
    for (let r = r1; r <= r2; r++) {
      coords.push({ q, r });
    }
  }
  
  // Verify the grid
  const expectedCells = 3 * edgeLen * edgeLen - 3 * edgeLen + 1;
  console.log(`Generated hex grid with edgeLen=${edgeLen}:`);
  console.log(`- Coordinate range: -${N} to ${N}`);
  console.log(`- Total cells: ${coords.length} (expected: ${expectedCells})`);
  console.log(`- Edge cells count: ${edgeLen} per edge`);
  
  // Count cells on one edge to verify
  const edgeCells = coords.filter(c => c.q === -N && c.r >= 0 && c.r <= N).length;
  console.log(`- Verified edge length: ${edgeCells} cells`);
  
  return coords;
}

// Convert hex to pixel coordinates for rendering (flat-top orientation)
export function hexToPixel(hex: Hex, size: number = 30): { x: number; y: number } {
  const x = size * (3/2 * hex.q);
  const y = size * (Math.sqrt(3)/2 * hex.q + Math.sqrt(3) * hex.r);
  return { x, y };
}

// Convert hex to pixel with proper spacing (accounts for gaps between cells)
export function hexToPixelWithGap(hex: Hex, size: number, gap: number): { x: number; y: number } {
  // Apply gap as spacing between cells, not by reducing cell size
  const spacing = size + gap;
  const x = spacing * (3/2 * hex.q);
  const y = spacing * (Math.sqrt(3)/2 * hex.q + Math.sqrt(3) * hex.r);
  return { x, y };
}

// Get the bounding box for a hex grid
export function getGridBounds(hexes: Hex[], size: number, gap: number = 0): { minX: number, maxX: number, minY: number, maxY: number, width: number, height: number } {
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  
  for (const hex of hexes) {
    const pos = hexToPixelWithGap(hex, size, gap);
    minX = Math.min(minX, pos.x - size);
    maxX = Math.max(maxX, pos.x + size);
    minY = Math.min(minY, pos.y - size);
    maxY = Math.max(maxY, pos.y + size);
  }
  
  return {
    minX,
    maxX,
    minY,
    maxY,
    width: maxX - minX,
    height: maxY - minY
  };
}

// Normalize a shape (array of hexes) to have its "center of mass" at origin
export function normalizeShape(shape: Hex[]): Hex[] {
  if (shape.length === 0) return [];
  
  // Find the minimum q and r values
  let minQ = Infinity, minR = Infinity;
  for (const hex of shape) {
    minQ = Math.min(minQ, hex.q);
    minR = Math.min(minR, hex.r);
  }
  
  // Translate so the minimum values are at 0
  return shape.map(hex => ({ 
    q: hex.q - minQ, 
    r: hex.r - minR 
  }));
}

// Create a unique string representation of a shape for comparison
export function shapeKey(shape: Hex[]): string {
  const normalized = normalizeShape(shape);
  // Sort by q first, then r
  normalized.sort((a, b) => a.q !== b.q ? a.q - b.q : a.r - b.r);
  return normalized.map(h => key(h)).join('|');
}

// Check if two shapes are identical (same cells in same positions)
export function shapesEqual(shape1: Hex[], shape2: Hex[]): boolean {
  return shapeKey(shape1) === shapeKey(shape2);
}

// Get all cells on a line from a starting point in a given direction
export function getLine(start: Hex, direction: Hex, length: number): Hex[] {
  const line: Hex[] = [];
  for (let i = 0; i < length; i++) {
    line.push(add(start, scale(direction, i)));
  }
  return line;
}