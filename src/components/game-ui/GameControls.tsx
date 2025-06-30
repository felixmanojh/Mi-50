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
      className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Current Player Info */}
      <motion.div 
        className="flex items-center gap-6 bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-2xl border-4 border-white shadow-lg"
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <motion.div 
          className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-black text-3xl shadow-lg border-4 border-white ${currentPlayer.color}`}
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          {currentPlayer.character !== undefined ? (
            <img
              src={monsterSpriteUrls[currentPlayer.character]}
              alt={currentPlayer.name}
              className="w-16 h-16 rounded-full"
            />
          ) : (
            currentPlayer.name[0]
          )}
        </motion.div>
        <div>
          <motion.div 
            className="font-black text-3xl text-purple-700 drop-shadow-md"
            animate={{ color: ["#7c3aed", "#ec4899", "#7c3aed"] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            🎮 {currentPlayer.name}'s Turn! 🎯
          </motion.div>
          {gameState.lastRoll > 0 && (
            <motion.div 
              className="text-xl text-gray-600 font-bold"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              🎲 Last roll: {gameState.lastRoll}
            </motion.div>
          )}
          
          {/* Power-ups display */}
          {gameState.playerPowerUps[currentPlayer.id] && (
            <motion.div 
              className="flex gap-3 mt-2 flex-wrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Stars */}
              {gameState.playerPowerUps[currentPlayer.id].stars > 0 && (
                <motion.div 
                  className="bg-yellow-200 px-3 py-1 rounded-full text-lg font-bold border-2 border-yellow-400"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ⭐ {gameState.playerPowerUps[currentPlayer.id].stars}/3
                </motion.div>
              )}
              
              {/* Speed Boost */}
              {gameState.playerPowerUps[currentPlayer.id].speedBoost && (
                <motion.div 
                  className="bg-blue-200 px-3 py-1 rounded-full text-lg font-bold border-2 border-blue-400"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  💨 Speed +2
                </motion.div>
              )}
              
              {/* Shield */}
              {gameState.playerPowerUps[currentPlayer.id].shield && (
                <motion.div 
                  className="bg-purple-200 px-3 py-1 rounded-full text-lg font-bold border-2 border-purple-400"
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
      
      {/* Giant Dice Button */}
      <motion.button
        onClick={onRoll}
        className={`bg-gradient-to-r from-orange-400 via-red-500 to-pink-600 hover:from-orange-500 hover:via-red-600 hover:to-pink-700 text-white px-12 py-8 rounded-3xl font-black text-3xl flex items-center gap-4 transition-all shadow-2xl border-6 border-white ${isRolling ? 'animate-pulse' : ''}`}
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
          className="text-6xl"
        >
          {gameState.lastRoll > 0 ? GameHelpers.getDiceIcon(gameState.lastRoll) : <Dice1 className="w-16 h-16" />}
        </motion.div>
        <div className="flex flex-col">
          <span className="drop-shadow-lg">{isRolling ? '🎲 Rolling...' : '🎲 Roll Dice!'}</span>
          <span className="text-lg opacity-90">Click me!</span>
        </div>
      </motion.button>
      
      {/* 3-Star Extra Roll Button */}
      {gameState.playerPowerUps[currentPlayer.id]?.stars >= 3 && (
        <motion.button
          onClick={onUseStars}
          className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 text-white px-8 py-4 rounded-2xl font-black text-xl flex items-center gap-3 transition-all shadow-xl border-4 border-white mt-4"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <span className="text-3xl">⭐⭐⭐</span>
          <div className="flex flex-col">
            <span className="drop-shadow-lg">Extra Roll!</span>
            <span className="text-sm opacity-90">Use 3 stars</span>
          </div>
        </motion.button>
      )}
    </motion.div>
  );
};