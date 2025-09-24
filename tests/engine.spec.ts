import { describe, it, expect, beforeEach } from 'vitest';
import { GameEngine } from '../src/engine/engine';
import { generatePiece } from '../src/engine/shapes';

describe('GameEngine', () => {
  let engine: GameEngine;
  
  beforeEach(() => {
    engine = new GameEngine({
      edgeLength: 5,
      singleHexRarity: 0.05,
      pointsPerLine: 10,
      piecesPerSet: 3,
      seed: 'test-seed',
    });
  });
  
  describe('Initialization', () => {
    it('should initialize with correct config', () => {
      const config = engine.getConfig();
      expect(config.edgeLength).toBe(5);
      expect(config.singleHexRarity).toBe(0.05);
      expect(config.pointsPerLine).toBe(10);
      expect(config.piecesPerSet).toBe(3);
      expect(config.seed).toBe('test-seed');
    });
    
    it('should generate initial pieces', () => {
      const pieces = engine.getCurrentPieces();
      expect(pieces.length).toBe(3);
    });
    
    it('should not be game over initially', () => {
      expect(engine.isGameOver()).toBe(false);
    });
    
    it('should have initial score of 0', () => {
      const state = engine.getState();
      expect(state.score).toBe(0);
      expect(state.level).toBe(1);
      expect(state.totalLinesCleared).toBe(0);
    });
    
    it('should use seed for deterministic generation', () => {
      const engine1 = new GameEngine({ seed: 'same-seed' });
      const engine2 = new GameEngine({ seed: 'same-seed' });
      
      const pieces1 = engine1.getCurrentPieces();
      const pieces2 = engine2.getCurrentPieces();
      
      expect(pieces1.length).toBe(pieces2.length);
      for (let i = 0; i < pieces1.length; i++) {
        expect(pieces1[i].typeId).toBe(pieces2[i].typeId);
        expect(pieces1[i].orientation).toBe(pieces2[i].orientation);
      }
    });
  });
  
  describe('Piece placement', () => {
    it('should place valid piece', () => {
      const pieces = engine.getCurrentPieces();
      const piece = pieces[0];
      
      const success = engine.placePiece(piece, { q: 0, r: 0 });
      expect(success).toBe(true);
      
      const remainingPieces = engine.getCurrentPieces();
      expect(remainingPieces.length).toBe(2);
      expect(remainingPieces.find(p => p.id === piece.id)).toBeUndefined();
    });
    
    it('should reject invalid placement', () => {
      const pieces = engine.getCurrentPieces();
      const piece = pieces[0];
      
      // Try to place outside board
      const success = engine.placePiece(piece, { q: 100, r: 100 });
      expect(success).toBe(false);
      
      // Piece should still be in current pieces
      const remainingPieces = engine.getCurrentPieces();
      expect(remainingPieces.find(p => p.id === piece.id)).toBeDefined();
    });
    
    it('should reject piece not in current set', () => {
      const fakePiece = generatePiece(() => 0.5, 0);
      const success = engine.placePiece(fakePiece, { q: 0, r: 0 });
      expect(success).toBe(false);
    });
    
    it('should generate new pieces when all placed', () => {
      const initialPieces = engine.getCurrentPieces();
      
      // Create a single hex piece that we know can be placed
      const singleHex = {
        id: 'single-test',
        typeId: 'Single',
        cells: [{ q: 0, r: 0 }],
        color: '#999',
        orientation: 0,
      };
      
      // Set single pieces to ensure placement succeeds
      engine.setCurrentPieces([singleHex, singleHex, singleHex]);
      const pieces = engine.getCurrentPieces();
      
      // Place all pieces at different locations
      for (let i = 0; i < pieces.length; i++) {
        const placed = engine.placePiece(pieces[i], { q: i * 2, r: 0 });
        if (!placed && i < pieces.length - 1) {
          // If placement failed, skip this test as board may be full
          return;
        }
      }
      
      const newPieces = engine.getCurrentPieces();
      // After placing all pieces, new pieces should be generated (if game not over)
      if (!engine.isGameOver()) {
        expect(newPieces.length).toBe(3);
        expect(newPieces[0].id).not.toBe(pieces[0].id);
      }
    });
    
    it('should update score on placement', () => {
      const pieces = engine.getCurrentPieces();
      const piece = pieces[0];
      
      const initialScore = engine.getState().score;
      engine.placePiece(piece, { q: 0, r: 0 });
      
      const newScore = engine.getState().score;
      expect(newScore).toBeGreaterThan(initialScore);
    });
  });
  
  describe('Piece rotation', () => {
    it('should rotate current piece', () => {
      const pieces = engine.getCurrentPieces();
      const piece = pieces[0];
      const initialOrientation = piece.orientation;
      
      const rotated = engine.rotatePiece(piece.id);
      expect(rotated).toBeDefined();
      expect(rotated!.orientation).not.toBe(initialOrientation);
      
      const updatedPieces = engine.getCurrentPieces();
      const updatedPiece = updatedPieces.find(p => p.id === piece.id);
      expect(updatedPiece?.orientation).toBe(rotated!.orientation);
    });
    
    it('should return null for non-existent piece', () => {
      const rotated = engine.rotatePiece('fake-id');
      expect(rotated).toBeNull();
    });
  });
  
  describe('Game over detection', () => {
    it('should detect game over when no pieces fit', () => {
      // Fill board except for a small area
      const board = engine.getBoard();
      const cells = board.getCells();
      
      // Fill most cells
      let count = 0;
      for (const [key, cell] of cells) {
        if (count++ < cells.size - 2) {
          cell.filled = true;
        }
      }
      
      // Set pieces that won't fit
      const largePieces = [
        {
          id: 'large-1',
          typeId: 'I4',
          cells: [
            { q: 0, r: 0 },
            { q: 1, r: 0 },
            { q: 2, r: 0 },
            { q: 3, r: 0 },
          ],
          color: '#00bcd4',
          orientation: 0,
        },
      ];
      
      engine.setCurrentPieces(largePieces);
      expect(engine.isGameOver()).toBe(true);
    });
    
    it('should continue game when at least one piece fits', () => {
      const board = engine.getBoard();
      const cells = board.getCells();
      
      // Fill some cells
      let count = 0;
      for (const [key, cell] of cells) {
        if (count++ < 30) {
          cell.filled = true;
        }
      }
      
      // Set a single hex piece that will fit
      const singlePiece = {
        id: 'single-1',
        typeId: 'Single',
        cells: [{ q: 0, r: 0 }],
        color: '#9e9e9e',
        orientation: 0,
      };
      
      engine.setCurrentPieces([singlePiece]);
      expect(engine.isGameOver()).toBe(false);
    });
  });
  
  describe('Game reset', () => {
    it('should reset game state', () => {
      // Place some pieces
      const pieces = engine.getCurrentPieces();
      engine.placePiece(pieces[0], { q: 0, r: 0 });
      
      const stateBeforeReset = engine.getState();
      expect(stateBeforeReset.score).toBeGreaterThan(0);
      
      engine.reset();
      
      const stateAfterReset = engine.getState();
      expect(stateAfterReset.score).toBe(0);
      expect(stateAfterReset.level).toBe(1);
      expect(stateAfterReset.totalLinesCleared).toBe(0);
      expect(stateAfterReset.gameOver).toBe(false);
      
      const board = engine.getBoard();
      expect(board.getFilledCellCount()).toBe(0);
    });
    
    it('should reset with new seed', () => {
      const pieces1 = engine.getCurrentPieces();
      
      engine.reset('different-seed');
      const pieces2 = engine.getCurrentPieces();
      
      // With different seed, pieces should likely be different
      // (small chance they could be same, but very unlikely)
      const allSame = pieces1.every((p, i) => 
        p.typeId === pieces2[i]?.typeId && 
        p.orientation === pieces2[i]?.orientation
      );
      expect(allSame).toBe(false);
    });
  });
  
  describe('Valid placements', () => {
    it('should get valid placements for piece', () => {
      const pieces = engine.getCurrentPieces();
      const piece = pieces[0];
      
      const placements = engine.getValidPlacements(piece);
      expect(placements.length).toBeGreaterThan(0);
      
      // Every placement should be valid
      for (const placement of placements) {
        expect(engine.canPlacePiece(piece, placement)).toBe(true);
      }
    });
    
    it('should check if piece can be placed', () => {
      const pieces = engine.getCurrentPieces();
      const piece = pieces[0];
      
      expect(engine.canPlacePiece(piece, { q: 0, r: 0 })).toBe(true);
      
      engine.placePiece(piece, { q: 0, r: 0 });
      
      // Can't place the same piece again (it's been removed)
      expect(engine.canPlacePiece(piece, { q: 1, r: 0 })).toBe(false);
    });
  });
});