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

  // Add padding around the grid
  const padding = cellSize;
  const viewBox = `${bounds.minX - padding} ${bounds.minY - padding} ${bounds.width + 2 * padding} ${bounds.height + 2 * padding}`;
  const svgSize = Math.max(bounds.width, bounds.height) + 2 * padding;

  // Check if a position is valid for the current dragged piece
  const isValidPlacement = (coord: Hex): boolean => {
    if (!validPlacements || !draggedPiece) return false;
    return validPlacements.some(pos => equals(pos, coord));
  };

  // Check if a cell would be occupied by the dragged piece at hovered position
  const isPreviewCell = (coord: Hex): boolean => {
    if (!draggedPiece || !hoveredPosition) return false;
    return draggedPiece.cells.some(cell => {
      const pos = add(cell, hoveredPosition);
      return equals(pos, coord);
    });
  };

  return (
    <div className="flex items-center justify-center">
      <svg
        width={svgSize}
        height={svgSize}
        viewBox={viewBox}
        className="overflow-visible"
      >
        <g transform="translate(0, 0)">
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
        </g>
      </svg>
    </div>
  );
};