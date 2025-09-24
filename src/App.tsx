import { useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  type DragCancelEvent,
  type DragMoveEvent,
} from '@dnd-kit/core';
import { HexGrid } from './components/HexGrid';
import { PiecePreview } from './components/PiecePreview';
import { useGameStore } from './hooks/useGameStore';

function App() {
  const { initGame, resetGame, currentPieces, placePiece, setDraggedPiece, setHoveredPosition, board, draggedPiece } =
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

  const handleDragMove = (event: DragMoveEvent) => {
    const dropData = event.over?.data.current;
    if (dropData?.coord) {
      setHoveredPosition(dropData.coord);
    } else {
      setHoveredPosition(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const piece = event.active.data.current?.piece;
    const dropData = event.over?.data.current;

    if (piece && dropData?.coord) {
      placePiece(piece, dropData.coord);
    }

    setDraggedPiece(null);
    setHoveredPosition(null);
  };

  const handleDragCancel = (event: DragCancelEvent) => {
    setDraggedPiece(null);
    setHoveredPosition(null);
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
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="min-h-screen bg-[#1a1a1a] text-white flex items-center justify-center relative">
        {/* Main Game Area - Centered */}
        <HexGrid />

        {/* Piece Previews - Positioned on the right */}
        <div className="absolute" style={{ right: '150px', top: '50%', transform: 'translateY(-50%)' }}>
          <div className="flex flex-col" style={{ gap: '60px' }}>
            {currentPieces.map((piece, index) => (
              <PiecePreview key={piece.id} piece={piece} index={index} />
            ))}
          </div>
        </div>
      </div>

      <DragOverlay>
        {draggedPiece && (
          <PiecePreview piece={draggedPiece} index={0} />
        )}
      </DragOverlay>
    </DndContext>
  );
}

export default App;
