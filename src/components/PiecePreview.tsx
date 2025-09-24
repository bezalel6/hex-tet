import React from 'react';
import { motion } from 'framer-motion';
import { Piece } from '../engine/shapes';
import { hexToPixel } from '../engine/coords';

interface PiecePreviewProps {
  piece: Piece;
  size?: number;
  interactive?: boolean;
  onClick?: () => void;
}

export const PiecePreview: React.FC<PiecePreviewProps> = ({
  piece,
  size = 20,
  interactive = true,
  onClick,
}) => {
  // Calculate bounding box for the piece
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  
  const positions = piece.cells.map(cell => hexToPixel(cell, size));
  
  positions.forEach(pos => {
    minX = Math.min(minX, pos.x - size);
    maxX = Math.max(maxX, pos.x + size);
    minY = Math.min(minY, pos.y - size);
    maxY = Math.max(maxY, pos.y + size);
  });
  
  const width = maxX - minX;
  const height = maxY - minY;
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  
  return (
    <motion.div
      className={`bg-gray-800 rounded-lg p-2 ${interactive ? 'cursor-pointer hover:bg-gray-700' : ''}`}
      whileHover={interactive ? { scale: 1.05 } : {}}
      whileTap={interactive ? { scale: 0.95 } : {}}
      onClick={onClick}
    >
      <svg
        width={width + 20}
        height={height + 20}
        viewBox={`${minX - 10} ${minY - 10} ${width + 20} ${height + 20}`}
      >
        <g transform={`translate(${-centerX + width/2}, ${-centerY + height/2})`}>
          {piece.cells.map((cell, index) => {
            const pos = hexToPixel(cell, size);
            const points = [];
            for (let i = 0; i < 6; i++) {
              const angle = (Math.PI / 3) * i;
              const x = size * Math.cos(angle);
              const y = size * Math.sin(angle);
              points.push(`${x},${y}`);
            }
            const pointsString = points.join(' ');
            
            return (
              <motion.polygon
                key={index}
                points={pointsString}
                fill={piece.color}
                stroke="#1e293b"
                strokeWidth={2}
                transform={`translate(${pos.x}, ${pos.y})`}
                initial={{ scale: 0, rotate: 0 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 20,
                  delay: index * 0.05,
                }}
              />
            );
          })}
        </g>
      </svg>
    </motion.div>
  );
};