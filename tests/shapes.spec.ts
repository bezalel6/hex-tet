import { describe, it, expect, vi } from 'vitest';
import {
  PIECE_TYPES,
  PIECE_ORIENTATIONS,
  generateOrientations,
  generatePiece,
  generatePieceSet,
  rotatePiece,
} from '../src/engine/shapes';
import { shapesEqual } from '../src/engine/coords';

describe('Shape Definitions', () => {
  describe('Piece types', () => {
    it('should have all tetromino pieces defined', () => {
      const tetrominoes = PIECE_TYPES.filter(p => p.id !== 'Single');
      expect(tetrominoes.length).toBeGreaterThanOrEqual(7); // At least 7 unique 4-hex shapes
    });
    
    it('should have single hex piece', () => {
      const single = PIECE_TYPES.find(p => p.id === 'Single');
      expect(single).toBeDefined();
      expect(single!.cells.length).toBe(1);
      expect(single!.rarity).toBeDefined();
    });
    
    it('should have 4 cells for each tetromino', () => {
      const tetrominoes = PIECE_TYPES.filter(p => p.id !== 'Single');
      for (const piece of tetrominoes) {
        expect(piece.cells.length).toBe(4);
      }
    });
    
    it('should have unique colors for each piece', () => {
      const colors = new Set(PIECE_TYPES.map(p => p.color));
      expect(colors.size).toBe(PIECE_TYPES.length);
    });
    
    it('should have normalized shapes', () => {
      for (const piece of PIECE_TYPES) {
        // Check that minimum q and r are 0
        const minQ = Math.min(...piece.cells.map(c => c.q));
        const minR = Math.min(...piece.cells.map(c => c.r));
        expect(minQ).toBe(0);
        expect(minR).toBe(0);
      }
    });
  });
  
  describe('Orientation generation', () => {
    it('should generate multiple orientations for asymmetric pieces', () => {
      const lPiece = PIECE_TYPES.find(p => p.id === 'L4')!;
      const orientations = generateOrientations(lPiece.cells);
      expect(orientations.length).toBeGreaterThan(1);
    });
    
    it('should not duplicate orientations', () => {
      const iPiece = PIECE_TYPES.find(p => p.id === 'I4')!;
      const orientations = generateOrientations(iPiece.cells);
      
      // Check for uniqueness
      const keys = new Set();
      for (const orientation of orientations) {
        const key = orientation.map(h => `${h.q},${h.r}`).sort().join('|');
        expect(keys.has(key)).toBe(false);
        keys.add(key);
      }
    });
    
    it('should have pre-generated orientations for all pieces', () => {
      for (const piece of PIECE_TYPES) {
        expect(PIECE_ORIENTATIONS.has(piece.id)).toBe(true);
        const orientations = PIECE_ORIENTATIONS.get(piece.id)!;
        expect(orientations.length).toBeGreaterThan(0);
      }
    });
  });
  
  describe('Piece generation', () => {
    it('should generate pieces with correct structure', () => {
      const piece = generatePiece();
      expect(piece).toHaveProperty('id');
      expect(piece).toHaveProperty('typeId');
      expect(piece).toHaveProperty('cells');
      expect(piece).toHaveProperty('color');
      expect(piece).toHaveProperty('orientation');
    });
    
    it('should respect single hex rarity', () => {
      const mockRng = vi.fn();
      
      // Test single hex generation
      mockRng.mockReturnValue(0.01); // Below 0.05 threshold
      const singlePiece = generatePiece(mockRng, 0.05);
      expect(singlePiece.typeId).toBe('Single');
      
      // Test tetromino generation
      mockRng.mockReturnValue(0.1); // Above 0.05 threshold
      const tetrominoPiece = generatePiece(mockRng, 0.05);
      expect(tetrominoPiece.typeId).not.toBe('Single');
    });
    
    it('should generate random orientations', () => {
      const mockRng = vi.fn();
      mockRng
        .mockReturnValueOnce(0.1) // Not single hex
        .mockReturnValueOnce(0.2) // Select piece type
        .mockReturnValueOnce(0.7); // Select orientation
      
      const piece = generatePiece(mockRng, 0.05);
      expect(piece.orientation).toBeGreaterThanOrEqual(0);
    });
  });
  
  describe('Piece set generation', () => {
    it('should generate requested number of pieces', () => {
      const pieces = generatePieceSet(3);
      expect(pieces.length).toBe(3);
    });
    
    it('should avoid duplicate type-orientation combinations', () => {
      const mockRng = vi.fn(() => 0.5); // Consistent random
      const pieces = generatePieceSet(3, mockRng, 0);
      
      const keys = new Set();
      for (const piece of pieces) {
        if (piece.typeId !== 'Single') {
          const key = `${piece.typeId}-${piece.orientation}`;
          expect(keys.has(key)).toBe(false);
          keys.add(key);
        }
      }
    });
    
    it('should allow multiple single hex pieces', () => {
      const mockRng = vi.fn(() => 0.01); // Always generate single hex
      const pieces = generatePieceSet(3, mockRng, 1.0);
      
      const singleCount = pieces.filter(p => p.typeId === 'Single').length;
      expect(singleCount).toBeGreaterThan(0);
    });
  });
  
  describe('Piece rotation', () => {
    it('should rotate piece to next orientation', () => {
      const piece = generatePiece(() => 0.5, 0);
      const rotated = rotatePiece(piece);
      
      expect(rotated.id).toBe(piece.id);
      expect(rotated.typeId).toBe(piece.typeId);
      expect(rotated.color).toBe(piece.color);
      
      const orientations = PIECE_ORIENTATIONS.get(piece.typeId)!;
      const expectedOrientation = (piece.orientation + 1) % orientations.length;
      expect(rotated.orientation).toBe(expectedOrientation);
    });
    
    it('should wrap around to first orientation', () => {
      const piece = generatePiece(() => 0.5, 0);
      const orientations = PIECE_ORIENTATIONS.get(piece.typeId)!;
      
      // Set to last orientation
      piece.orientation = orientations.length - 1;
      
      const rotated = rotatePiece(piece);
      expect(rotated.orientation).toBe(0);
      expect(shapesEqual(rotated.cells, orientations[0])).toBe(true);
    });
  });
});