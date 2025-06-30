import React from 'react';
import { motion } from 'framer-motion';
import { GameState } from '../../types/GameTypes';
import { monsterSpriteUrls } from '../../constants';

interface PlayerStatusCardsProps {
  gameState: GameState;
}

export const PlayerStatusCards: React.FC<PlayerStatusCardsProps> = ({ gameState }) => {
  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      {gameState.players.map((player, index) => (
        <motion.div
          key={player.id}
          className={`p-4 rounded-2xl border-4 shadow-lg transition-all ${
            player.id === gameState.currentPlayerIndex 
              ? 'border-yellow-400 bg-gradient-to-br from-yellow-100 to-orange-100 scale-105' 
              : 'border-gray-300 bg-white hover:scale-105'
          }`}
          whileHover={{ y: -5 }}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 + (index * 0.1) }}
        >
          <div className="flex flex-col items-center">
            <motion.div 
              className={`w-16 h-16 rounded-full border-4 border-white shadow-lg mb-3 ${
                player.id === gameState.currentPlayerIndex ? 'animate-pulse' : ''
              }`}
              animate={player.id === gameState.currentPlayerIndex ? { 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {player.character !== undefined ? (
                <img
                  src={monsterSpriteUrls[player.character]}
                  alt={player.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className={`w-full h-full rounded-full flex items-center justify-center text-white font-bold text-2xl ${player.color}`}>
                  {player.name[0]}
                </div>
              )}
            </motion.div>
            <div className="text-center">
              <div className="font-bold text-purple-600 text-lg">
                📍 Square {gameState.playerPositions[player.id]}
              </div>
              {player.skipNextTurn && (
                <motion.div 
                  className="text-red-500 font-black text-sm bg-red-100 rounded-full px-3 py-1 mt-2"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  ⏸️ Skip Next Turn
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};