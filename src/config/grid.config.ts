// Shared configuration for the hex grid system
export const GRID_CONFIG = {
  // Standard cell size for the game board
  cellSize: 28,
  
  // Gap between cells (visual spacing)
  cellGap: 2,
  
  // Scale factor for piece previews relative to board cells
  previewScale: 0.714, // 20/28 to match current preview size
  
  // Board edge length (number of cells per edge)
  edgeLength: 5,
  
  // Get preview cell size
  get previewCellSize() {
    return Math.round(this.cellSize * this.previewScale);
  }
} as const;

// Helper to ensure consistent sizing
export function getEffectiveCellSize(size: number, gap: number): number {
  return size - gap;
}
