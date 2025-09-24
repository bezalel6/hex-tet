import React from 'react';
import { motion } from 'framer-motion';
import { type Hex, hexToPixel, equals } from '../engine/coords';
import { useDroppable } from '@dnd-kit/core';
import { useGameStore } from '../hooks/useGameStore';

interface HexCellProps {
  coord: Hex;
  filled: boolean;
  color?: string;
  size?: number;
  isValidPlacement?: boolean;
  isHovered?: boolean;
}

export const HexCell: React.FC<HexCellProps> = ({
  coord,
  filled,
  color,
  size = 30,
  isValidPlacement = false,
  isHovered = false,
}) => {
  const { draggedPiece, hoveredPosition, setHoveredPosition } = useGameStore();
  const position = hexToPixel(coord, size);

  const { setNodeRef, isOver } = useDroppable({
    id: `cell-${coord.q}-${coord.r}`,
    data: { coord },
  });

  // Calculate hex points for SVG polygon
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const x = size * Math.cos(angle);
    const y = size * Math.sin(angle);
    points.push(`${x},${y}`);
  }
  const pointsString = points.join(' ');

  // Determine cell appearance
  let fillColor = '#1f2937'; // Default dark gray
  let strokeColor = '#374151'; // Slightly lighter gray for border
  let strokeWidth = 1;
  let opacity = 1;

  if (filled) {
    fillColor = color || '#60a5fa';
    strokeColor = '#1e293b';
    strokeWidth = 2;
  } else if (isValidPlacement && draggedPiece) {
    fillColor = '#10b981';
    opacity = 0.3;
    strokeWidth = 2;
  } else if (isHovered && draggedPiece) {
    fillColor = '#ef4444';
    opacity = 0.3;
    strokeWidth = 2;
  } else if (isOver && draggedPiece) {
    fillColor = '#3b82f6';
    opacity = 0.4;
    strokeWidth = 2;
  }

  React.useEffect(() => {
    if (isOver && hoveredPosition && !equals(hoveredPosition, coord)) {
      setHoveredPosition(coord);
    } else if (!isOver && hoveredPosition && equals(hoveredPosition, coord)) {
      setHoveredPosition(null);
    }
  }, [isOver, coord, hoveredPosition, setHoveredPosition]);

  return (
    <motion.g
      ref={setNodeRef as any}
      transform={`translate(${position.x}, ${position.y})`}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.3, delay: Math.random() * 0.1 }}
    >
      <motion.polygon
        points={pointsString}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        opacity={opacity}
        whileHover={!filled ? { scale: 1.1 } : {}}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      />
    </motion.g>
  );
};
