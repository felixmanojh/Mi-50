import React from 'react';
import { motion } from 'framer-motion';
import { Dice1 } from 'lucide-react';
import { GameState, Player } from '../../types/GameTypes';
import { GameHelpers } from '../../utils/GameHelpers';
import { monsterSpriteUrls } from '../../constants';

interface GameControlsProps {
  currentPlayer: Player;
  gameState: GameState;
  isRolling: boolean;
  onRoll: () => void;
  onUseStars: () => void;
}

export const GameControls: React.FC<GameControlsProps> = ({ 
  currentPlayer, 
  gameState, 
  isRolling, 
  onRoll, 
  onUseStars 
}) => {
  return (
    <motion.div
      className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 lg:gap-8 mb-4 sm:mb-6 lg:mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Current Player Info */}
      <motion.div
        className="flex items-center gap-3 sm:gap-6 bg-gradient-to-r from-purple-100 to-pink-100 p-3 sm:p-6 rounded-xl sm:rounded-2xl border-2 sm:border-4 border-white shadow-lg w-full sm:w-auto"
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <motion.div
          className={`w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center text-white font-black text-xl sm:text-2xl lg:text-3xl shadow-lg border-2 sm:border-4 border-white flex-shrink-0 ${currentPlayer.color}`}
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          {currentPlayer.character !== undefined ? (
            <img
              src={monsterSpriteUrls[currentPlayer.character]}
              alt={currentPlayer.name}
              className="w-10 h-10 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full"
            />
          ) : (
            currentPlayer.name[0]
          )}
        </motion.div>
        <div className="flex-1 min-w-0">
          <motion.div
            className="font-black text-lg sm:text-2xl lg:text-3xl text-purple-700 drop-shadow-md truncate"
            animate={{ color: ["#7c3aed", "#ec4899", "#7c3aed"] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            🎮 {currentPlayer.name}'s Turn! 🎯
          </motion.div>
          {gameState.lastRoll > 0 && (
            <motion.div
              className="text-sm sm:text-lg lg:text-xl text-gray-600 font-bold"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              🎲 Last roll: {gameState.lastRoll}
            </motion.div>
          )}

          {/* Power-ups display */}
          {gameState.playerPowerUps[currentPlayer.id] && (
            <motion.div
              className="flex gap-2 sm:gap-3 mt-1 sm:mt-2 flex-wrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Stars */}
              {gameState.playerPowerUps[currentPlayer.id].stars > 0 && (
                <motion.div
                  className="bg-yellow-200 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm lg:text-lg font-bold border-2 border-yellow-400"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ⭐ {gameState.playerPowerUps[currentPlayer.id].stars}/3
                </motion.div>
              )}

              {/* Speed Boost */}
              {gameState.playerPowerUps[currentPlayer.id].speedBoost && (
                <motion.div
                  className="bg-blue-200 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm lg:text-lg font-bold border-2 border-blue-400"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  💨 Speed +2
                </motion.div>
              )}

              {/* Shield */}
              {gameState.playerPowerUps[currentPlayer.id].shield && (
                <motion.div
                  className="bg-purple-200 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm lg:text-lg font-bold border-2 border-purple-400"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                >
                  🛡️ Protected
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Giant Dice Button - responsive sizing */}
      <motion.button
        onClick={onRoll}
        className={`bg-gradient-to-r from-orange-400 via-red-500 to-pink-600 hover:from-orange-500 hover:via-red-600 hover:to-pink-700 active:from-orange-600 active:via-red-700 active:to-pink-800 text-white px-6 sm:px-10 lg:px-12 py-4 sm:py-6 lg:py-8 rounded-2xl sm:rounded-3xl font-black text-xl sm:text-2xl lg:text-3xl flex items-center gap-2 sm:gap-4 transition-all shadow-2xl border-4 sm:border-6 border-white w-full sm:w-auto ${isRolling ? 'animate-pulse' : ''}`}
        disabled={gameState.gamePhase !== 'playing' || isRolling}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={isRolling ? {
          rotate: [0, 10, -10, 0],
          scale: [1, 1.1, 1]
        } : {}}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          animate={isRolling ? {
            rotateX: [0, 360],
            rotateY: [0, 360],
            scale: [1, 1.2, 1]
          } : {}}
          transition={{ duration: 0.3, repeat: isRolling ? Infinity : 0 }}
          className="text-4xl sm:text-5xl lg:text-6xl"
        >
          {gameState.lastRoll > 0 ? GameHelpers.getDiceIcon(gameState.lastRoll) : <Dice1 className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16" />}
        </motion.div>
        <div className="flex flex-col">
          <span className="drop-shadow-lg">{isRolling ? '🎲 Rolling...' : '🎲 Roll Dice!'}</span>
          <span className="text-sm sm:text-base lg:text-lg opacity-90 hidden sm:block">Tap me!</span>
        </div>
      </motion.button>

      {/* 3-Star Extra Roll Button - responsive */}
      {gameState.playerPowerUps[currentPlayer.id]?.stars >= 3 && (
        <motion.button
          onClick={onUseStars}
          className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-base sm:text-xl flex items-center gap-2 sm:gap-3 transition-all shadow-xl border-2 sm:border-4 border-white w-full sm:w-auto"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <span className="text-2xl sm:text-3xl">⭐⭐⭐</span>
          <div className="flex flex-col">
            <span className="drop-shadow-lg">Extra Roll!</span>
            <span className="text-xs sm:text-sm opacity-90">Use 3 stars</span>
          </div>
        </motion.button>
      )}
    </motion.div>
  );
};