import React from 'react';
import { HexCell } from './HexCell';
import { useGameStore } from '../hooks/useGameStore';
import { Hex, add, key, equals, getGridBounds } from '../engine/coords';
import { GRID_CONFIG } from '../config/grid.config';

export const HexGrid: React.FC = () => {
  const { board, draggedPiece, hoveredPosition, validPlacements } = useGameStore();

  if (!board) return null;

  const cells = board.getCells();
  const cellSize = GRID_CONFIG.cellSize;
  const gap = GRID_CONFIG.cellGap;

  // Calculate actual bounds of the grid
  const hexCoords = Array.from(cells.values()).map(cell => cell.coord);
  const bounds = getGridBounds(hexCoords, cellSize, gap);

  // Debug: Log grid info
  console.log('Grid Debug Info:', {
    totalCells: cells.size,
    cellSize,
    gap,
    bounds,
    sampleCoords: hexCoords.slice(0, 5).map(c => `(${c.q},${c.r})`),
  });

  // Add padding around the grid
  const padding = cellSize;
  const viewBox = `${bounds.minX - padding} ${bounds.minY - padding} ${bounds.width + 2 * padding} ${bounds.height + 2 * padding}`;
  const svgSize = Math.max(bounds.width, bounds.height) + 2 * padding;

  // Check if a position is valid for the current dragged piece
  const isValidPlacement = (coord: Hex): boolean => {
    if (!validPlacements || !draggedPiece || !hoveredPosition) return false;
    // Only show as valid if this is the hovered position
    return equals(coord, hoveredPosition) && validPlacements.some(pos => equals(pos, coord));
  };

  // Check if a cell would be occupied by the dragged piece at hovered position
  const isPreviewCell = (coord: Hex): boolean => {
    if (!draggedPiece || !hoveredPosition) return false;
    return draggedPiece.cells.some(cell => {
      const pos = add(cell, hoveredPosition);
      return equals(pos, coord);
    });
  };

  // Simple fixed viewBox for debugging
  const debugViewBox = "-300 -300 600 600";

  return (
    <div className="flex items-center justify-center">
      <svg
        width={600}
        height={600}
        viewBox={debugViewBox}
        className="overflow-visible"
        style={{ border: '2px solid red', background: '#222' }} // Debug: Show SVG bounds
      >
        {/* Debug: Show origin */}
        <g transform="translate(0, 0)">
          <circle cx="0" cy="0" r="5" fill="yellow" />
          <line x1="-50" y1="0" x2="50" y2="0" stroke="yellow" strokeWidth="1" />
          <line x1="0" y1="-50" x2="0" y2="50" stroke="yellow" strokeWidth="1" />
        </g>
        
        {Array.from(cells.values()).map(cell => {
          const isPreview = isPreviewCell(cell.coord);
          const isValid = isValidPlacement(cell.coord);

          return (
            <HexCell
              key={key(cell.coord)}
              coord={cell.coord}
              filled={cell.filled || isPreview}
              color={isPreview ? draggedPiece?.color : cell.color}
              size={cellSize}
              gap={gap}
              isValidPlacement={isValid}
              isHovered={isPreview}
            />
          );
        })}
      </svg>
    </div>
  );
};