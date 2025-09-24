import { describe, it, expect } from 'vitest';
import {
  Hex,
  add,
  subtract,
  equals,
  distance,
  rotate,
  mirror,
  generateHexGrid,
  normalizeShape,
  shapeKey,
  shapesEqual,
  hexToPixel,
  key,
  fromKey,
  s,
} from '../src/engine/coords';

describe('Coordinate System', () => {
  describe('Basic operations', () => {
    it('should calculate s coordinate correctly', () => {
      expect(s({ q: 1, r: 2 })).toBe(-3);
      expect(s({ q: -1, r: -2 })).toBe(3);
      expect(s({ q: 0, r: 0 })).toBe(-0); // JavaScript -0 === 0 but Object.is(-0, 0) is false
    });
    
    it('should add hexes correctly', () => {
      const a: Hex = { q: 1, r: 2 };
      const b: Hex = { q: 3, r: -1 };
      const result = add(a, b);
      expect(result).toEqual({ q: 4, r: 1 });
    });
    
    it('should subtract hexes correctly', () => {
      const a: Hex = { q: 4, r: 1 };
      const b: Hex = { q: 1, r: 2 };
      const result = subtract(a, b);
      expect(result).toEqual({ q: 3, r: -1 });
    });
    
    it('should check equality correctly', () => {
      expect(equals({ q: 1, r: 2 }, { q: 1, r: 2 })).toBe(true);
      expect(equals({ q: 1, r: 2 }, { q: 2, r: 1 })).toBe(false);
    });
    
    it('should convert to/from key correctly', () => {
      const hex: Hex = { q: -3, r: 5 };
      const k = key(hex);
      expect(k).toBe('-3,5');
      expect(fromKey(k)).toEqual(hex);
    });
  });
  
  describe('Distance calculation', () => {
    it('should calculate distance correctly', () => {
      expect(distance({ q: 0, r: 0 }, { q: 0, r: 0 })).toBe(0);
      expect(distance({ q: 0, r: 0 }, { q: 1, r: 0 })).toBe(1);
      expect(distance({ q: 0, r: 0 }, { q: 2, r: -1 })).toBe(2);
      expect(distance({ q: -1, r: 2 }, { q: 2, r: -1 })).toBe(3);
    });
  });
  
  describe('Rotation', () => {
    it('should rotate 60 degrees clockwise', () => {
      const hex: Hex = { q: 1, r: 0 };
      const rotated = rotate(hex, 1);
      // Handle JavaScript -0
      expect(rotated.q === 0 || rotated.q === -0).toBe(true);
      expect(rotated.r).toBe(1);
    });
    
    it('should rotate 360 degrees to original', () => {
      const hex: Hex = { q: 2, r: -1 };
      const rotated = rotate(hex, 6);
      expect(rotated).toEqual(hex);
    });
    
    it('should handle negative rotations', () => {
      const hex: Hex = { q: 1, r: 0 };
      const rotated = rotate(hex, -1);
      expect(rotated).toEqual(rotate(hex, 5));
    });
  });
  
  describe('Mirror', () => {
    it('should mirror across q axis', () => {
      const hex: Hex = { q: 1, r: 2 };
      const mirrored = mirror(hex);
      expect(mirrored).toEqual({ q: 1, r: -3 });
    });
    
    it('should mirror twice to get original', () => {
      const hex: Hex = { q: 3, r: -2 };
      const doubleMirrored = mirror(mirror(hex));
      expect(doubleMirrored).toEqual(hex);
    });
  });
  
  describe('Grid generation', () => {
    it('should generate correct size grid for edge length 2', () => {
      const grid = generateHexGrid(2);
      expect(grid.length).toBe(7); // Hex with radius 1
    });
    
    it('should generate correct size grid for edge length 3', () => {
      const grid = generateHexGrid(3);
      expect(grid.length).toBe(19); // Hex with radius 2
    });
    
    it('should generate correct size grid for edge length 5', () => {
      const grid = generateHexGrid(5);
      expect(grid.length).toBe(61); // Hex with radius 4
    });
    
    it('should include origin in grid', () => {
      const grid = generateHexGrid(3);
      const hasOrigin = grid.some(h => h.q === 0 && h.r === 0);
      expect(hasOrigin).toBe(true);
    });
    
    it('should respect maximum distance from origin', () => {
      const edgeLen = 4;
      const grid = generateHexGrid(edgeLen);
      const maxDist = edgeLen - 1;
      
      for (const hex of grid) {
        expect(distance({ q: 0, r: 0 }, hex)).toBeLessThanOrEqual(maxDist);
      }
    });
  });
  
  describe('Shape normalization', () => {
    it('should normalize shape to origin', () => {
      const shape: Hex[] = [
        { q: 3, r: 2 },
        { q: 4, r: 2 },
        { q: 5, r: 2 },
      ];
      const normalized = normalizeShape(shape);
      expect(normalized).toEqual([
        { q: 0, r: 0 },
        { q: 1, r: 0 },
        { q: 2, r: 0 },
      ]);
    });
    
    it('should handle negative coordinates', () => {
      const shape: Hex[] = [
        { q: -2, r: -1 },
        { q: -1, r: -1 },
        { q: 0, r: -1 },
      ];
      const normalized = normalizeShape(shape);
      expect(normalized[0]).toEqual({ q: 0, r: 0 });
    });
  });
  
  describe('Shape comparison', () => {
    it('should create consistent shape keys', () => {
      const shape1: Hex[] = [
        { q: 0, r: 0 },
        { q: 1, r: 0 },
        { q: 2, r: 0 },
      ];
      const shape2: Hex[] = [
        { q: 2, r: 0 },
        { q: 0, r: 0 },
        { q: 1, r: 0 },
      ];
      expect(shapeKey(shape1)).toBe(shapeKey(shape2));
    });
    
    it('should detect equal shapes', () => {
      const shape1: Hex[] = [
        { q: 1, r: 1 },
        { q: 2, r: 1 },
        { q: 3, r: 1 },
      ];
      const shape2: Hex[] = [
        { q: 5, r: 3 },
        { q: 6, r: 3 },
        { q: 7, r: 3 },
      ];
      expect(shapesEqual(shape1, shape2)).toBe(true);
    });
    
    it('should detect different shapes', () => {
      const shape1: Hex[] = [
        { q: 0, r: 0 },
        { q: 1, r: 0 },
        { q: 1, r: 1 },
      ];
      const shape2: Hex[] = [
        { q: 0, r: 0 },
        { q: 1, r: 0 },
        { q: 2, r: 0 },
      ];
      expect(shapesEqual(shape1, shape2)).toBe(false);
    });
  });
  
  describe('Hex to pixel conversion', () => {
    it('should convert origin to center', () => {
      const pixel = hexToPixel({ q: 0, r: 0 }, 30);
      expect(pixel).toEqual({ x: 0, y: 0 });
    });
    
    it('should calculate correct pixel positions', () => {
      const pixel = hexToPixel({ q: 1, r: 0 }, 30);
      expect(pixel.x).toBeCloseTo(30 * Math.sqrt(3));
      expect(pixel.y).toBe(0);
    });
  });
});