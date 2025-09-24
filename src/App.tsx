import React, { useEffect } from 'react';
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  type DragCancelEvent,
} from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import { HexGrid } from './components/HexGrid';
import { HUD } from './components/HUD';
import { PieceDraggable } from './components/PieceDraggable';
import { useGameStore } from './hooks/useGameStore';
import { fromKey } from './engine/coords';

function App() {
  const { initGame, resetGame, currentPieces, placePiece, setDraggedPiece, draggedPiece, board } =
    useGameStore();

  // Initialize game on mount
  useEffect(() => {
    initGame();
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        resetGame();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resetGame]);

  const handleDragStart = (event: DragStartEvent) => {
    const piece = event.active.data.current?.piece;
    if (piece) {
      setDraggedPiece(piece);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const piece = event.active.data.current?.piece;
    const dropData = event.over?.data.current;

    if (piece && dropData?.coord) {
      placePiece(piece, dropData.coord);
    }

    setDraggedPiece(null);
  };

  const handleDragCancel = (event: DragCancelEvent) => {
    setDraggedPiece(null);
  };

  if (!board) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="min-h-screen bg-gray-900 text-white flex">
        {/* Main Game Area */}
        <div className="flex-1 flex items-center justify-center">
          <HexGrid />
        </div>

        {/* Right Panel */}
        <div className="w-80 bg-gray-800 p-6 flex flex-col">
          <HUD />

          {/* Current Pieces */}
          <div className="mt-8 flex-1">
            <motion.h2
              className="text-xl font-semibold mb-4 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Available Pieces
            </motion.h2>

            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {currentPieces.map((piece, index) => (
                  <PieceDraggable key={piece.id} piece={piece} index={index} />
                ))}
              </AnimatePresence>
            </div>

            {currentPieces.length === 0 && (
              <motion.div
                className="text-center text-gray-500 mt-8"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                Generating new pieces...
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </DndContext>
  );
}

export default App;
