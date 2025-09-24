import React from 'react';
import { type Piece } from '../engine/shapes';
import { hexToPixel } from '../engine/coords';
import { GRID_CONFIG } from '../config/grid.config';

interface DragOverlayContentProps {
  piece: Piece;
}

export const DragOverlayContent: React.FC<DragOverlayContentProps> = ({ piece }) => {
  // Use board cell size for drag overlay to ensure proper alignment
  const cellSize = GRID_CONFIG.cellSize;
  const gap = GRID_CONFIG.cellGap;
  
  // Calculate bounds of the piece
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;

  piece.cells.forEach(cell => {
    const pos = hexToPixel(cell, cellSize);
    const hexRadius = cellSize;
    minX = Math.min(minX, pos.x - hexRadius);
    maxX = Math.max(maxX, pos.x + hexRadius);
    minY = Math.min(minY, pos.y - hexRadius);
    maxY = Math.max(maxY, pos.y + hexRadius);
  });

  const width = maxX - minX + gap * 2;
  const height = maxY - minY + gap * 2;
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  return (
    <div style={{ pointerEvents: 'none', cursor: 'grabbing' }}>
      <svg
        width={width}
        height={height}
        viewBox={`${minX - gap} ${minY - gap} ${width} ${height}`}
        style={{ opacity: 0.8 }}
      >
        <g>
          {piece.cells.map((cell, i) => {
            const pos = hexToPixel(cell, cellSize);
            const points = Array.from({ length: 6 }, (_, j) => {
              const angle = (Math.PI / 3) * j - Math.PI / 6; // Flat-top orientation
              const x = cellSize * Math.cos(angle);
              const y = cellSize * Math.sin(angle);
              return `${x},${y}`;
            }).join(' ');

            return (
              <polygon
                key={i}
                points={points}
                fill={piece.color}
                stroke="#111"
                strokeWidth={2}
                transform={`translate(${pos.x}, ${pos.y})`}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
};
