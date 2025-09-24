import { Board } from "./board";
import { generatePieceSet, type Piece, rotatePiece } from "./shapes";
import type { Hex } from "./coords";
import { type ScoreUpdate, ScoringSystem } from "../utils/scoring";
import seedrandom from "seedrandom";

export interface GameConfig {
  edgeLength?: number;
  singleHexRarity?: number;
  pointsPerLine?: number;
  piecesPerSet?: number;
  seed?: string;
}

export interface GameState {
  board: Board;
  currentPieces: Piece[];
  score: number;
  level: number;
  totalLinesCleared: number;
  gameOver: boolean;
  lastScoreUpdate?: ScoreUpdate;
}

export class GameEngine {
  private board: Board;
  private scoring: ScoringSystem;
  private currentPieces: Piece[] = [];
  private config: Required<GameConfig>;
  private rng: () => number;
  private gameOver: boolean = false;

  constructor(config: GameConfig = {}) {
    this.config = {
      edgeLength: config.edgeLength ?? 5,
      singleHexRarity: config.singleHexRarity ?? 0.05,
      pointsPerLine: config.pointsPerLine ?? 10,
      piecesPerSet: config.piecesPerSet ?? 3,
      seed: config.seed ?? "",
    };

    // Initialize RNG
    this.rng = this.config.seed ? seedrandom(this.config.seed) : Math.random;

    this.board = new Board(this.config.edgeLength);
    this.scoring = new ScoringSystem(this.config.pointsPerLine);
    this.generateNewPieces();
  }

  private generateNewPieces(): void {
    this.currentPieces = generatePieceSet(
      this.config.piecesPerSet,
      this.rng,
      this.config.singleHexRarity,
    );

    // Check if any piece can be placed
    if (!this.board.anyPieceFits(this.currentPieces)) {
      this.gameOver = true;
    }
  }

  public placePiece(piece: Piece, position: Hex): boolean {
    if (this.gameOver) {
      return false;
    }

    // Check if this piece is in the current set
    const pieceIndex = this.currentPieces.findIndex((p) => p.id === piece.id);
    if (pieceIndex === -1) {
      return false;
    }

    // Try to place the piece
    if (!this.board.place(piece, position)) {
      return false;
    }

    // Remove the piece from current pieces
    this.currentPieces.splice(pieceIndex, 1);

    // Add placement score
    this.scoring.addPlacementScore(piece.cells.length);

    // Check for completed lines
    const completedLines = this.board.detectCompletedLines();
    if (completedLines.length > 0) {
      this.board.clearLines(completedLines);
      const scoreUpdate = this.scoring.processLineClear(completedLines.length);
      // Store last score update for animations
      (this as any).lastScoreUpdate = scoreUpdate;
    }

    // Immediately replenish a new piece to keep tray at target count
    if (this.currentPieces.length < this.config.piecesPerSet) {
      const replenish = generatePieceSet(
        this.config.piecesPerSet - this.currentPieces.length,
        this.rng,
        this.config.singleHexRarity,
      );
      this.currentPieces.push(...replenish);
    }

    // Check if any remaining piece can be placed
    if (!this.board.anyPieceFits(this.currentPieces)) {
      this.gameOver = true;
    }

    return true;
  }

  public rotatePiece(pieceId: string): Piece | null {
    const piece = this.currentPieces.find((p) => p.id === pieceId);
    if (!piece) return null;

    const rotated = rotatePiece(piece);
    const pieceIndex = this.currentPieces.findIndex((p) => p.id === pieceId);
    this.currentPieces[pieceIndex] = rotated;

    return rotated;
  }

  public canPlacePiece(piece: Piece, position: Hex): boolean {
    return this.board.canPlace(piece, position);
  }

  public getValidPlacements(piece: Piece): Hex[] {
    return this.board.getValidPlacements(piece);
  }

  public getState(): GameState {
    return {
      board: this.board,
      currentPieces: [...this.currentPieces],
      score: this.scoring.getScore(),
      level: this.scoring.getLevel(),
      totalLinesCleared: this.scoring.getTotalLinesCleared(),
      gameOver: this.gameOver,
      lastScoreUpdate: (this as any).lastScoreUpdate,
    };
  }

  public isGameOver(): boolean {
    return this.gameOver;
  }

  public reset(seed?: string): void {
    if (seed !== undefined) {
      this.config.seed = seed;
      this.rng = seed ? seedrandom(seed) : Math.random;
    }

    this.board.clear();
    this.scoring.reset();
    this.gameOver = false;
    this.generateNewPieces();
  }

  public getBoard(): Board {
    return this.board;
  }

  public getCurrentPieces(): Piece[] {
    return [...this.currentPieces];
  }

  public getConfig(): Required<GameConfig> {
    return { ...this.config };
  }

  // For testing: set specific board state
  public setBoardState(cells: Map<string, any>): void {
    const boardCells = this.board.getCells();
    cells.forEach((value, key) => {
      if (boardCells.has(key)) {
        const cell = boardCells.get(key)!;
        Object.assign(cell, value);
      }
    });
  }

  // For testing: set specific pieces
  public setCurrentPieces(pieces: Piece[]): void {
    this.currentPieces = pieces;
    if (!this.board.anyPieceFits(this.currentPieces)) {
      this.gameOver = true;
    }
  }
}
