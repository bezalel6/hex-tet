import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../hooks/useGameStore';

export const HUD: React.FC = () => {
  const { score, level, totalLinesCleared, gameOver, resetGame } = useGameStore();
  
  return (
    <div className="space-y-4">
      <motion.div
        className="bg-gray-800 rounded-lg p-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
          HEX-TET
        </h1>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Score</span>
            <motion.span
              className="text-2xl font-bold"
              key={score}
              initial={{ scale: 1.5 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {score.toLocaleString()}
            </motion.span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Level</span>
            <span className="text-xl font-semibold text-blue-400">
              {level}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Lines</span>
            <span className="text-xl font-semibold text-green-400">
              {totalLinesCleared}
            </span>
          </div>
        </div>
      </motion.div>
      
      <motion.div
        className="bg-gray-800 rounded-lg p-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-lg font-semibold mb-3 text-center">Controls</h2>
        <div className="space-y-1 text-sm text-gray-400">
          <div className="flex justify-between">
            <span>Drag</span>
            <span>Place piece</span>
          </div>
          <div className="flex justify-between">
            <span>R</span>
            <span>Rotate</span>
          </div>
          <div className="flex justify-between">
            <span>Space</span>
            <span>New game</span>
          </div>
        </div>
      </motion.div>
      
      <AnimatePresence>
        {gameOver && (
          <motion.div
            className="bg-red-900 rounded-lg p-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <h2 className="text-2xl font-bold text-center mb-3">Game Over!</h2>
            <p className="text-center mb-4">Final Score: {score.toLocaleString()}</p>
            <motion.button
              onClick={() => resetGame()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              New Game
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {!gameOver && (
        <motion.button
          onClick={() => resetGame()}
          className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Reset Game
        </motion.button>
      )}
    </div>
  );
};