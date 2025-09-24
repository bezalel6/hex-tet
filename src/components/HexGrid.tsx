import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HexCell } from './HexCell';
import { useGameStore } from '../hooks/useGameStore';
import { Hex, add, key, equals } from '../engine/coords';

export const HexGrid: React.FC = () => {
  const { board, draggedPiece, hoveredPosition, validPlacements } = useGameStore();
  
  if (!board) return null;
  
  const cells = board.getCells();
  const cellSize = 30;
  
  // Calculate SVG viewport dimensions
  const minX = -200;
  const minY = -200;
  const width = 400;
  const height = 400;
  
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
    <div className="flex items-center justify-center p-8">
      <motion.div
        className="bg-gray-800 rounded-2xl p-4 shadow-2xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <svg
          width={width}
          height={height}
          viewBox={`${minX} ${minY} ${width} ${height}`}
          className="overflow-visible"
        >
          <g transform="translate(0, 0)">
            <AnimatePresence>
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
                    isValidPlacement={isValid}
                    isHovered={isPreview}
                  />
                );
              })}
            </AnimatePresence>
          </g>
        </svg>
      </motion.div>
    </div>
  );
};