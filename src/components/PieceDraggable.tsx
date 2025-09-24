import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { Piece } from '../engine/shapes';
import { PiecePreview } from './PiecePreview';
import { useGameStore } from '../hooks/useGameStore';

interface PieceDraggableProps {
  piece: Piece;
  index: number;
}

export const PieceDraggable: React.FC<PieceDraggableProps> = ({ piece, index }) => {
  const { rotatePiece, draggedPiece } = useGameStore();
  
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: piece.id,
    data: { piece },
  });
  
  const style = transform ? {
    transform: CSS.Translate.toString(transform),
  } : undefined;
  
  const handleRotate = (e: React.MouseEvent) => {
    e.stopPropagation();
    rotatePiece(piece.id);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'r' || e.key === 'R') {
      rotatePiece(piece.id);
    }
  };
  
  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={`relative ${isDragging ? 'opacity-50' : ''}`}
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: index * 0.1 }}
    >
      <div className="relative">
        <PiecePreview piece={piece} interactive={!isDragging} />
        
        {!isDragging && (
          <motion.button
            onClick={handleRotate}
            className="absolute top-1 right-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Rotate (R)"
          >
            ↻
          </motion.button>
        )}
      </div>
      
      {!isDragging && (
        <div className="mt-2 text-center text-xs text-gray-400">
          Drag to place • R to rotate
        </div>
      )}
    </motion.div>
  );
};