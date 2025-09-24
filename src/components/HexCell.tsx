import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { type Hex, hexToPixelWithGap } from '../engine/coords';

interface HexCellProps {
  coord: Hex;
  filled: boolean;
  color?: string;
  size: number;
  gap?: number;
  isValidPlacement?: boolean;
  isHovered?: boolean;
}

export const HexCell: React.FC<HexCellProps> = ({
  coord,
  filled,
  color,
  size,
  gap = 2,
  isValidPlacement = false,
  isHovered = false,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `hex-${coord.q}-${coord.r}`,
    data: { coord },
  });

  const pos = hexToPixelWithGap(coord, size, gap);
  const effectiveSize = size; // Don't reduce size for gap

  // Calculate hexagon points (flat-top orientation)
  const points = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 6; // Rotate by 30 degrees for flat-top
    const x = effectiveSize * Math.cos(angle);
    const y = effectiveSize * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');

  // Determine the fill color
  let fillColor = '#3a3a3a'; // Dark gray for empty cells
  if (filled && color) {
    fillColor = color;
  }

  // Determine stroke and effects
  let strokeColor = '#2a2a2a'; // Darker stroke for depth
  let strokeWidth = 1;
  let opacity = 1;

  if (isValidPlacement && !filled) {
    strokeColor = '#666'; // Lighter stroke for valid placements
    strokeWidth = 1.5;
  }

  if (isOver && isValidPlacement && !filled) {
    opacity = 0.8;
    strokeColor = '#888';
    strokeWidth = 2;
  }

  return (
    <g
      ref={setNodeRef as any}
      transform={`translate(${pos.x},${pos.y})`}
      style={{ cursor: isValidPlacement && !filled ? 'pointer' : 'default' }}
    >
      <polygon
        points={points}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        opacity={opacity}
        style={{
          transition: 'all 0.15s ease',
        }}
      />
    </g>
  );
};