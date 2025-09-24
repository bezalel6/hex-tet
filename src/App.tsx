import { useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  type DragCancelEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import { HexGrid } from './components/HexGrid';
import { PiecePreview } from './components/PiecePreview';
import { useGameStore } from './hooks/useGameStore';

function App() {
  const { initGame, resetGame, currentPieces, placePiece, setDraggedPiece, setHoveredPosition, board, draggedPiece, hoveredPosition, rotation, setRotation } =
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

  const handleDragOver = (event: DragOverEvent) => {
    const dropData = event.over?.data.current;
    if (dropData?.coord) {
      setHoveredPosition(dropData.coord);
    } else {
      setHoveredPosition(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const piece = event.active.data.current?.piece;
    const hovered = hoveredPosition;

    if (piece && hovered) {
      placePiece(piece, hovered);
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
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="min-h-screen bg-[#1a1a1a] text-white flex flex-col items-center justify-center relative">
        {/* Main Game Area - Centered */}
        <div className="mb-6">
          <HexGrid />
        </div>

        {/* Piece Previews - Positioned on the right */}
        <div className="absolute" style={{ right: '150px', top: '50%', transform: 'translateY(-50%)' }}>
          <div className="flex flex-col" style={{ gap: '60px' }}>
            {currentPieces.map((piece, index) => (
              <PiecePreview key={piece.id} piece={piece} index={index} />
            ))}
          </div>
        </div>

        {/* Rotation slider below board */}
        <div className="mt-2 w-[600px] rounded-md ring-1 ring-zinc-600 bg-zinc-900/95 text-white shadow-lg px-4 py-3 z-10">
          <div className="text-base mb-2 font-semibold tracking-wide" style={{ color: '#ffffff' }}>Grid rotation: {rotation.toFixed(0)}°</div>
          <input
            className="w-full accent-pink-500"
            type="range"
            min={0}
            max={359}
            step={1}
            value={rotation}
            onChange={(e) => setRotation(Number(e.target.value))}
          />
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {draggedPiece ? (
          <div style={{ opacity: 0.8, cursor: 'grabbing' }}>
            <PiecePreview piece={draggedPiece} index={-1} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default App;
