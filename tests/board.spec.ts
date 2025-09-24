import { describe, it, expect, beforeEach } from 'vitest';
import { Board } from '../src/engine/board';
import { Piece } from '../src/engine/shapes';
import { Hex, key } from '../src/engine/coords';

describe('Board', () => {
  let board: Board;
  
  beforeEach(() => {
    board = new Board(5);
  });
  
  describe('Initialization', () => {
    it('should create board with correct number of cells', () => {
      const cells = board.getCells();
      expect(cells.size).toBe(61); // For edge length 5
    });
    
    it('should initialize all cells as empty', () => {
      const cells = board.getCells();
      for (const cell of cells.values()) {
        expect(cell.filled).toBe(false);
        expect(cell.color).toBeUndefined();
        expect(cell.pieceId).toBeUndefined();
      }
    });
    
    it('should include origin cell', () => {
      const origin = board.getCell({ q: 0, r: 0 });
      expect(origin).toBeDefined();
    });
  });
  
  describe('Coordinate validation', () => {
    it('should validate coordinates within board', () => {
      expect(board.isValidCoord({ q: 0, r: 0 })).toBe(true);
      expect(board.isValidCoord({ q: 4, r: 0 })).toBe(true);
      expect(board.isValidCoord({ q: -4, r: 4 })).toBe(true);
    });
    
    it('should reject coordinates outside board', () => {
      expect(board.isValidCoord({ q: 5, r: 0 })).toBe(false);
      expect(board.isValidCoord({ q: -5, r: 5 })).toBe(false);
      expect(board.isValidCoord({ q: 10, r: 10 })).toBe(false);
    });
  });
  
  describe('Piece placement', () => {
    const testPiece: Piece = {
      id: 'test-1',
      typeId: 'I4',
      cells: [
        { q: 0, r: 0 },
        { q: 1, r: 0 },
        { q: 2, r: 0 },
      ],
      color: '#00bcd4',
      orientation: 0,
    };
    
    it('should place piece on empty board', () => {
      const success = board.place(testPiece, { q: 0, r: 0 });
      expect(success).toBe(true);
      
      expect(board.isCellEmpty({ q: 0, r: 0 })).toBe(false);
      expect(board.isCellEmpty({ q: 1, r: 0 })).toBe(false);
      expect(board.isCellEmpty({ q: 2, r: 0 })).toBe(false);
    });
    
    it('should store piece color and id', () => {
      board.place(testPiece, { q: 0, r: 0 });
      
      const cell = board.getCell({ q: 0, r: 0 });
      expect(cell?.color).toBe('#00bcd4');
      expect(cell?.pieceId).toBe('test-1');
    });
    
    it('should reject placement on occupied cells', () => {
      board.place(testPiece, { q: 0, r: 0 });
      
      const overlappingPiece: Piece = {
        ...testPiece,
        id: 'test-2',
      };
      
      const success = board.place(overlappingPiece, { q: 1, r: 0 });
      expect(success).toBe(false);
    });
    
    it('should reject placement outside board', () => {
      const success = board.place(testPiece, { q: 10, r: 10 });
      expect(success).toBe(false);
    });
    
    it('should check if piece can be placed', () => {
      expect(board.canPlace(testPiece, { q: 0, r: 0 })).toBe(true);
      
      board.place(testPiece, { q: 0, r: 0 });
      expect(board.canPlace(testPiece, { q: 0, r: 0 })).toBe(false);
      expect(board.canPlace(testPiece, { q: 0, r: 1 })).toBe(true);
    });
  });
  
  describe('Line detection and clearing', () => {
    it('should detect horizontal line', () => {
      // Fill a horizontal line
      for (let q = -2; q <= 2; q++) {
        const cells = board.getCells();
        const key = `${q},0`;
        if (cells.has(key)) {
          cells.get(key)!.filled = true;
        }
      }
      
      const lines = board.detectCompletedLines();
      expect(lines.length).toBeGreaterThanOrEqual(1);
    });
    
    it('should clear completed lines', () => {
      // Fill a line
      const filledCells: Hex[] = [];
      for (let q = -2; q <= 2; q++) {
        const coord = { q, r: 0 };
        if (board.isValidCoord(coord)) {
          const cell = board.getCell(coord)!;
          cell.filled = true;
          cell.color = '#ff0000';
          filledCells.push(coord);
        }
      }
      
      const lines = board.detectCompletedLines();
      const clearedCount = board.clearLines(lines);
      
      expect(clearedCount).toBeGreaterThan(0);
      
      // Check that cells are cleared
      for (const coord of filledCells) {
        if (lines.some(line => line.some(h => h.q === coord.q && h.r === coord.r))) {
          expect(board.isCellEmpty(coord)).toBe(true);
        }
      }
    });
    
    it('should not detect partial lines', () => {
      // Fill partial line
      for (let q = -1; q <= 1; q++) {
        const cell = board.getCell({ q, r: 0 });
        if (cell) cell.filled = true;
      }
      
      const lines = board.detectCompletedLines();
      // Partial lines should not be detected as complete
      expect(lines.every(line => line.length >= 5)).toBe(true);
    });
  });
  
  describe('Board state', () => {
    it('should count filled cells', () => {
      expect(board.getFilledCellCount()).toBe(0);
      
      const piece: Piece = {
        id: 'test-1',
        typeId: 'I4',
        cells: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
        ],
        color: '#00bcd4',
        orientation: 0,
      };
      
      board.place(piece, { q: 0, r: 0 });
      expect(board.getFilledCellCount()).toBe(2);
    });
    
    it('should clone board state', () => {
      const piece: Piece = {
        id: 'test-1',
        typeId: 'I4',
        cells: [{ q: 0, r: 0 }],
        color: '#00bcd4',
        orientation: 0,
      };
      
      board.place(piece, { q: 0, r: 0 });
      
      const cloned = board.clone();
      expect(cloned.getFilledCellCount()).toBe(1);
      expect(cloned.isCellEmpty({ q: 0, r: 0 })).toBe(false);
      
      // Modifying clone shouldn't affect original
      cloned.clear();
      expect(board.getFilledCellCount()).toBe(1);
      expect(cloned.getFilledCellCount()).toBe(0);
    });
    
    it('should clear all cells', () => {
      const piece: Piece = {
        id: 'test-1',
        typeId: 'I4',
        cells: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
          { q: 2, r: 0 },
        ],
        color: '#00bcd4',
        orientation: 0,
      };
      
      board.place(piece, { q: 0, r: 0 });
      expect(board.getFilledCellCount()).toBe(3);
      
      board.clear();
      expect(board.getFilledCellCount()).toBe(0);
    });
  });
  
  describe('Piece fitting', () => {
    it('should check if any piece fits', () => {
      const pieces: Piece[] = [
        {
          id: 'test-1',
          typeId: 'Single',
          cells: [{ q: 0, r: 0 }],
          color: '#00bcd4',
          orientation: 0,
        },
      ];
      
      expect(board.anyPieceFits(pieces)).toBe(true);
      
      // Fill entire board
      const cells = board.getCells();
      for (const cell of cells.values()) {
        cell.filled = true;
      }
      
      expect(board.anyPieceFits(pieces)).toBe(false);
    });
    
    it('should get valid placements for piece', () => {
      const piece: Piece = {
        id: 'test-1',
        typeId: 'Single',
        cells: [{ q: 0, r: 0 }],
        color: '#00bcd4',
        orientation: 0,
      };
      
      const placements = board.getValidPlacements(piece);
      expect(placements.length).toBe(61); // All cells are valid for single hex
      
      // Fill some cells
      board.place(piece, { q: 0, r: 0 });
      const newPlacements = board.getValidPlacements(piece);
      expect(newPlacements.length).toBe(60); // One less valid placement
    });
  });
});