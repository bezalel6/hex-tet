import { create } from "zustand";
import { GameEngine, type GameState } from "../engine/engine";
import type { Piece } from "../engine/shapes";
import type { Hex } from "../engine/coords";

interface GameStore extends GameState {
  engine: GameEngine | null;
  draggedPiece: Piece | null;
  hoveredPosition: Hex | null;
  validPlacements: Hex[] | null;

  // Actions
  initGame: (seed?: string) => void;
  resetGame: (seed?: string) => void;
  placePiece: (piece: Piece, position: Hex) => boolean;
  rotatePiece: (pieceId: string) => void;
  setDraggedPiece: (piece: Piece | null) => void;
  setHoveredPosition: (position: Hex | null) => void;
  updateValidPlacements: () => void;
  getGameState: () => GameState | null;
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  board: null as any,
  currentPieces: [],
  score: 0,
  level: 1,
  totalLinesCleared: 0,
  gameOver: false,
  engine: null,
  draggedPiece: null,
  hoveredPosition: null,
  validPlacements: null,

  initGame: (seed?: string) => {
    const engine = new GameEngine({
      edgeLength: 5, // 5x5 radius grid
      singleHexRarity: 0.05,
      pointsPerLine: 10,
      piecesPerSet: 3,
      seed,
    });

    const state = engine.getState();
    set({
      engine,
      ...state,
      draggedPiece: null,
      hoveredPosition: null,
      validPlacements: null,
    });
  },

  resetGame: (seed?: string) => {
    const { engine } = get();
    if (engine) {
      engine.reset(seed);
      const state = engine.getState();
      set({
        ...state,
        draggedPiece: null,
        hoveredPosition: null,
        validPlacements: null,
      });
    } else {
      get().initGame(seed);
    }
  },

  placePiece: (piece: Piece, position: Hex) => {
    const { engine } = get();
    if (!engine) return false;

    const success = engine.placePiece(piece, position);
    if (success) {
      const state = engine.getState();
      set({
        ...state,
        draggedPiece: null,
        hoveredPosition: null,
        validPlacements: null,
      });
    }
    return success;
  },

  rotatePiece: (pieceId: string) => {
    const { engine, draggedPiece } = get();
    if (!engine) return;

    const rotatedPiece = engine.rotatePiece(pieceId);
    if (rotatedPiece) {
      const state = engine.getState();

      // Update dragged piece if it's the one being rotated
      if (draggedPiece?.id === pieceId) {
        set({
          ...state,
          draggedPiece: rotatedPiece,
          validPlacements: engine.getValidPlacements(rotatedPiece),
        });
      } else {
        set(state);
      }
    }
  },

  setDraggedPiece: (piece: Piece | null) => {
    const { engine } = get();
    if (!engine) return;

    if (piece) {
      const validPlacements = engine.getValidPlacements(piece);
      set({
        draggedPiece: piece,
        validPlacements,
      });
    } else {
      set({
        draggedPiece: null,
        validPlacements: null,
      });
    }
  },

  setHoveredPosition: (position: Hex | null) => {
    set({ hoveredPosition: position });
  },

  updateValidPlacements: () => {
    const { engine, draggedPiece } = get();
    if (engine && draggedPiece) {
      const validPlacements = engine.getValidPlacements(draggedPiece);
      set({ validPlacements });
    }
  },

  getGameState: () => {
    const { engine } = get();
    return engine?.getState() || null;
  },
}));
