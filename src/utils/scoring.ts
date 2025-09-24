export interface ScoreUpdate {
  points: number;
  linesCleared: number;
  totalLines: number;
  level: number;
}

export class ScoringSystem {
  private score: number = 0;
  private totalLinesCleared: number = 0;
  private level: number = 1;
  private pointsPerLine: number;
  private linesPerLevel: number = 10;
  
  constructor(pointsPerLine: number = 10) {
    this.pointsPerLine = pointsPerLine;
  }
  
  public calculateLineScore(linesCleared: number): number {
    if (linesCleared === 0) return 0;
    
    // Base points for lines
    let points = this.pointsPerLine * linesCleared;
    
    // Multi-line bonus (like Tetris)
    const multipliers = [0, 1, 1.5, 2, 3]; // 0, 1, 2, 3, 4+ lines
    const multiplier = multipliers[Math.min(linesCleared, 4)];
    points *= multiplier;
    
    // Level multiplier
    points *= this.level;
    
    return Math.floor(points);
  }
  
  public addPlacementScore(cellsPlaced: number): number {
    // Small bonus for placing pieces
    const points = cellsPlaced * this.level;
    this.score += points;
    return points;
  }
  
  public processLineClear(linesCleared: number): ScoreUpdate {
    const points = this.calculateLineScore(linesCleared);
    this.score += points;
    this.totalLinesCleared += linesCleared;
    
    // Check for level up
    const newLevel = Math.floor(this.totalLinesCleared / this.linesPerLevel) + 1;
    if (newLevel > this.level) {
      this.level = newLevel;
    }
    
    return {
      points: this.score,
      linesCleared,
      totalLines: this.totalLinesCleared,
      level: this.level,
    };
  }
  
  public getScore(): number {
    return this.score;
  }
  
  public getLevel(): number {
    return this.level;
  }
  
  public getTotalLinesCleared(): number {
    return this.totalLinesCleared;
  }
  
  public reset(): void {
    this.score = 0;
    this.totalLinesCleared = 0;
    this.level = 1;
  }
  
  public getState() {
    return {
      score: this.score,
      totalLinesCleared: this.totalLinesCleared,
      level: this.level,
    };
  }
  
  public setState(state: { score: number; totalLinesCleared: number; level: number }) {
    this.score = state.score;
    this.totalLinesCleared = state.totalLinesCleared;
    this.level = state.level;
  }
}