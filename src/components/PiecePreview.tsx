import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { type Piece } from '../engine/shapes';
import { hexToPixel } from '../engine/coords';
import { GRID_CONFIG } from '../config/grid.config';
import { useGameStore } from '../hooks/useGameStore';

interface PiecePreviewProps {
  piece: Piece;
  index: number;
}

export const PiecePreview: React.FC<PiecePreviewProps> = ({ piece, index }) => {
  const rotation = useGameStore(s => s.rotation);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: piece.id,
    data: { piece },
    disabled: index < 0, // Disable dragging for overlay preview
  });

  const translate = transform ? CSS.Translate.toString(transform) : undefined;
  const style = translate ? { transform: translate } : undefined;

  // For drag overlay (index < 0), use board cell size
  const isOverlay = index < 0;
  const cellSize = isOverlay ? GRID_CONFIG.cellSize : GRID_CONFIG.previewCellSize;
  const svgSize = isOverlay ? 150 : 120;

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

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  // Use the piece's actual color
  const pieceColor = piece.color;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`cursor-move ${isDragging ? 'opacity-50' : ''}`}
    >
      <svg
        width={svgSize}
        height={svgSize}
        viewBox={`${centerX - svgSize / 2} ${centerY - svgSize / 2} ${svgSize} ${svgSize}`}
        className="overflow-visible"
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
                fill={pieceColor}
                stroke="#111"
                strokeWidth={1}
                style={{ transform: `translate(${pos.x}px, ${pos.y}px) rotate(${rotation}deg)`, transformOrigin: 'center' }}
                opacity={0.9}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
};