import {
  add,
  directions,
  distance,
  equals,
  generateHexGrid,
  type Hex,
  key,
} from "./coords";
import type { Piece } from "./shapes";

export interface Cell {
  coord: Hex;
  filled: boolean;
  color?: string;
  pieceId?: string;
}

export class Board {
  private cells: Map<string, Cell>;
  private edgeLength: number;

  constructor(edgeLength: number = 5) {
    this.edgeLength = edgeLength;
    this.cells = new Map();
    this.initializeBoard();
  }

  private initializeBoard(): void {
    const hexGrid = generateHexGrid(this.edgeLength);
    for (const coord of hexGrid) {
      this.cells.set(key(coord), {
        coord,
        filled: false,
      });
    }
  }

  public getCells(): Map<string, Cell> {
    return new Map(this.cells);
  }

  public getCell(coord: Hex): Cell | undefined {
    return this.cells.get(key(coord));
  }

  public isValidCoord(coord: Hex): boolean {
    return this.cells.has(key(coord));
  }

  public isCellEmpty(coord: Hex): boolean {
    const cell = this.getCell(coord);
    return cell ? !cell.filled : false;
  }

  public canPlace(piece: Piece, origin: Hex): boolean {
    return piece.cells.every((cell) => {
      const pos = add(cell, origin);
      return this.isValidCoord(pos) && this.isCellEmpty(pos);
    });
  }

  public place(piece: Piece, origin: Hex): boolean {
    if (!this.canPlace(piece, origin)) {
      return false;
    }

    piece.cells.forEach((cell) => {
      const pos = add(cell, origin);
      const boardCell = this.cells.get(key(pos))!;
      boardCell.filled = true;
      boardCell.color = piece.color;
      boardCell.pieceId = piece.id;
    });

    return true;
  }

  public detectCompletedLines(): Hex[][] {
    const completedLines: Hex[][] = [];
    const checkedLines = new Set<string>();

    // Get all filled cells
    const filledCells = Array.from(this.cells.values())
      .filter((cell) => cell.filled)
      .map((cell) => cell.coord);

    // For each filled cell, check lines in all three axial directions
    for (const startCell of filledCells) {
      // Check three axial directions: q-constant, r-constant, s-constant
      const axialDirections = [
        { q: 1, r: 0 }, // q-direction (r constant)
        { q: 0, r: 1 }, // r-direction (q constant)
        { q: -1, r: 1 }, // s-direction (q+r constant)
      ];

      for (const dir of axialDirections) {
        const line = this.findCompleteLine(startCell, dir);
        if (line.length > 0) {
          // Create a unique key for this line to avoid duplicates
          const lineKey = line.map((h) => key(h)).sort().join("|");
          if (!checkedLines.has(lineKey)) {
            checkedLines.add(lineKey);
            completedLines.push(line);
          }
        }
      }
    }

    return completedLines;
  }

  private findCompleteLine(start: Hex, direction: Hex): Hex[] {
    const line: Hex[] = [];

    // First, find the start of the line by going backwards
    let current = start;
    const reverseDir = { q: -direction.q, r: -direction.r };

    while (this.isValidCoord(current) && !this.isCellEmpty(current)) {
      const prev = add(current, reverseDir);
      if (this.isValidCoord(prev) && !this.isCellEmpty(prev)) {
        current = prev;
      } else {
        break;
      }
    }

    // Now go forward from the start to build the complete line
    const lineStart = current;
    while (this.isValidCoord(current) && !this.isCellEmpty(current)) {
      line.push(current);
      current = add(current, direction);
    }

    // Check if this line spans the full width of the board in this direction
    // For a valid clear, the line should be continuous and span edge to edge
    if (this.isFullLine(line, direction)) {
      return line;
    }

    return [];
  }

  private isFullLine(line: Hex[], direction: Hex): boolean {
    // A line is "full" if it's continuous and spans from edge to edge
    // For hexagonal boards, we need to check if the line touches opposite edges
    if (line.length < 3) return false; // Minimum line length

    // Check if line is at maximum extent in its direction
    const first = line[0];
    const last = line[line.length - 1];

    // Check if we can't extend further in either direction
    const beforeFirst = add(first, { q: -direction.q, r: -direction.r });
    const afterLast = add(last, direction);

    const cantExtendBackward = !this.isValidCoord(beforeFirst) ||
      this.isCellEmpty(beforeFirst);
    const cantExtendForward = !this.isValidCoord(afterLast) ||
      this.isCellEmpty(afterLast);

    // For a hexagonal board, a complete line should not be extendable
    return cantExtendBackward && cantExtendForward &&
      line.length >= this.getMinLineLength();
  }

  private getMinLineLength(): number {
    // Minimum line length for clearing (can be made configurable)
    // For edge length 5, the diameter varies from 5 to 9 depending on direction
    return this.edgeLength;
  }

  public clearLines(lines: Hex[][]): number {
    let clearedCount = 0;

    for (const line of lines) {
      for (const coord of line) {
        const cell = this.cells.get(key(coord));
        if (cell && cell.filled) {
          cell.filled = false;
          cell.color = undefined;
          cell.pieceId = undefined;
          clearedCount++;
        }
      }
    }

    return clearedCount;
  }

  public getFilledCellCount(): number {
    return Array.from(this.cells.values()).filter((cell) => cell.filled).length;
  }

  public getTotalCellCount(): number {
    return this.cells.size;
  }

  public clone(): Board {
    const newBoard = new Board(this.edgeLength);
    newBoard.cells = new Map(
      Array.from(this.cells.entries()).map(([k, cell]) => [
        k,
        { ...cell, coord: { ...cell.coord } },
      ]),
    );
    return newBoard;
  }

  public clear(): void {
    this.cells.forEach((cell) => {
      cell.filled = false;
      cell.color = undefined;
      cell.pieceId = undefined;
    });
  }

  // Check if any piece from the given set can be placed on the board
  public anyPieceFits(pieces: Piece[]): boolean {
    for (const piece of pieces) {
      // Check every empty cell as a potential origin
      for (const [, cell] of this.cells) {
        if (!cell.filled && this.canPlace(piece, cell.coord)) {
          return true;
        }
      }
    }
    return false;
  }

  // Get all valid placement positions for a piece
  public getValidPlacements(piece: Piece): Hex[] {
    const validPositions: Hex[] = [];

    for (const [, cell] of this.cells) {
      if (this.canPlace(piece, cell.coord)) {
        validPositions.push(cell.coord);
      }
    }

    return validPositions;
  }
}
