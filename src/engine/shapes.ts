import { type Hex, mirror, normalizeShape, rotate, shapeKey } from "./coords";

export interface PieceType {
  id: string;
  name: string;
  cells: Hex[];
  color: string;
  rarity?: number; // For single hex piece
}

// All 4-hex connected shapes (hex tetrominoes)
// These are the canonical orientations, we'll generate rotations later

// I4 - Straight line of 4
const I4: Hex[] = [
  { q: 0, r: 0 },
  { q: 1, r: 0 },
  { q: 2, r: 0 },
  { q: 3, r: 0 },
];

// Z4 - Zigzag shape
const Z4: Hex[] = [
  { q: 0, r: 0 },
  { q: 1, r: 0 },
  { q: 1, r: 1 },
  { q: 2, r: 1 },
];

// L4 - L-shape
const L4: Hex[] = [
  { q: 0, r: 0 },
  { q: 1, r: 0 },
  { q: 2, r: 0 },
  { q: 2, r: 1 },
];

// T4 - T-shape (3 in a row with 1 attached to middle)
const T4: Hex[] = [
  { q: 0, r: 0 },
  { q: 1, r: 0 },
  { q: 2, r: 0 },
  { q: 1, r: 1 },
];

// Y4 - Y-shape (center with 3 branches)
const Y4: Hex[] = [
  { q: 1, r: 0 },
  { q: 0, r: 1 },
  { q: 1, r: 1 },
  { q: 2, r: 0 },
];

// O4 - Compact diamond/cluster
const O4: Hex[] = [
  { q: 0, r: 0 },
  { q: 1, r: 0 },
  { q: 0, r: 1 },
  { q: 1, r: -1 },
];

// W4 - Wide shape
const W4: Hex[] = [
  { q: 0, r: 0 },
  { q: 1, r: -1 },
  { q: 1, r: 0 },
  { q: 2, r: -1 },
];

// Single hex piece (rare)
const Single: Hex[] = [
  { q: 0, r: 0 },
];

// Define all piece types with colors
export const PIECE_TYPES: PieceType[] = [
  { id: "I4", name: "Line", cells: normalizeShape(I4), color: "#00bcd4" }, // Cyan
  { id: "Z4", name: "Zigzag", cells: normalizeShape(Z4), color: "#f44336" }, // Red
  { id: "L4", name: "L-Shape", cells: normalizeShape(L4), color: "#ff9800" }, // Orange
  { id: "T4", name: "T-Shape", cells: normalizeShape(T4), color: "#9c27b0" }, // Purple
  { id: "Y4", name: "Y-Shape", cells: normalizeShape(Y4), color: "#4caf50" }, // Green
  { id: "O4", name: "Diamond", cells: normalizeShape(O4), color: "#ffeb3b" }, // Yellow
  { id: "W4", name: "Wide", cells: normalizeShape(W4), color: "#2196f3" }, // Blue
  {
    id: "Single",
    name: "Single",
    cells: normalizeShape(Single),
    color: "#9e9e9e",
    rarity: 0.05,
  }, // Gray
];

// Generate all unique orientations for a shape
export function generateOrientations(shape: Hex[]): Hex[][] {
  const orientations: Hex[][] = [];
  const seen = new Set<string>();

  // Try all 6 rotations
  for (let rot = 0; rot < 6; rot++) {
    let rotated = shape.map((h) => rotate(h, rot));
    rotated = normalizeShape(rotated);
    const rotKey = shapeKey(rotated);

    if (!seen.has(rotKey)) {
      seen.add(rotKey);
      orientations.push(rotated);
    }

    // Also try mirrored version
    const mirrored = normalizeShape(rotated.map((h) => mirror(h)));
    const mirKey = shapeKey(mirrored);

    if (!seen.has(mirKey)) {
      seen.add(mirKey);
      orientations.push(mirrored);
    }
  }

  return orientations;
}

// Pre-generate all orientations for each piece type
export const PIECE_ORIENTATIONS: Map<string, Hex[][]> = new Map();

for (const piece of PIECE_TYPES) {
  PIECE_ORIENTATIONS.set(piece.id, generateOrientations(piece.cells));
}

export interface Piece {
  id: string;
  typeId: string;
  cells: Hex[];
  color: string;
  orientation: number; // Index into the orientations array
}

// Generate a random piece
export function generatePiece(
  rng: () => number = Math.random,
  singleHexRarity: number = 0.05,
): Piece {
  // Determine if we should generate a single hex piece
  if (rng() < singleHexRarity) {
    const singlePiece = PIECE_TYPES.find((p) => p.id === "Single")!;
    return {
      id: `piece-${Date.now()}-${Math.random()}`,
      typeId: singlePiece.id,
      cells: singlePiece.cells,
      color: singlePiece.color,
      orientation: 0,
    };
  }

  // Otherwise, pick a random tetromino
  const tetrominoes = PIECE_TYPES.filter((p) => p.id !== "Single");
  const pieceType = tetrominoes[Math.floor(rng() * tetrominoes.length)];
  const orientations = PIECE_ORIENTATIONS.get(pieceType.id)!;
  const orientationIndex = Math.floor(rng() * orientations.length);

  return {
    id: `piece-${Date.now()}-${Math.random()}`,
    typeId: pieceType.id,
    cells: orientations[orientationIndex],
    color: pieceType.color,
    orientation: orientationIndex,
  };
}

// Generate a set of pieces (ensuring no duplicates in the same set)
export function generatePieceSet(
  count: number = 3,
  rng: () => number = Math.random,
  singleHexRarity: number = 0.05,
): Piece[] {
  const pieces: Piece[] = [];
  const usedTypeOrientations = new Set<string>();

  while (pieces.length < count) {
    const piece = generatePiece(rng, singleHexRarity);
    const key = `${piece.typeId}-${piece.orientation}`;

    // Allow duplicates only for single hex pieces
    if (piece.typeId === "Single" || !usedTypeOrientations.has(key)) {
      usedTypeOrientations.add(key);
      pieces.push(piece);
    }
  }

  return pieces;
}

// Rotate a piece to the next orientation
export function rotatePiece(piece: Piece): Piece {
  const orientations = PIECE_ORIENTATIONS.get(piece.typeId)!;
  const nextOrientation = (piece.orientation + 1) % orientations.length;

  return {
    ...piece,
    cells: orientations[nextOrientation],
    orientation: nextOrientation,
  };
}
