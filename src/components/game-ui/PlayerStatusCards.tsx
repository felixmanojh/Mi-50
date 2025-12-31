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
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      {gameState.players.map((player, index) => {
        const powerUps = gameState.playerPowerUps[player.id] || { stars: 0, speedBoost: false, shield: false };
        const isCurrentPlayer = player.id === gameState.players[gameState.currentPlayerIndex].id;

        return (
          <motion.div
            key={player.id}
            className={`p-4 rounded-2xl border-4 shadow-lg transition-all ${
              isCurrentPlayer
                ? 'border-yellow-400 bg-gradient-to-br from-yellow-100 to-orange-100 scale-105'
                : 'border-gray-300 bg-white'
            }`}
            whileHover={{ y: -3, scale: isCurrentPlayer ? 1.05 : 1.02 }}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + (index * 0.1) }}
          >
            <div className="flex items-center gap-3">
              {/* Player Avatar */}
              <motion.div
                className={`w-14 h-14 rounded-full border-4 border-white shadow-lg flex-shrink-0 ${
                  isCurrentPlayer ? 'ring-2 ring-yellow-400' : ''
                }`}
                animate={isCurrentPlayer ? {
                  scale: [1, 1.08, 1],
                  rotate: [0, 3, -3, 0]
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
                  <div className={`w-full h-full rounded-full flex items-center justify-center text-white font-bold text-xl ${player.color}`}>
                    {player.name[0]}
                  </div>
                )}
              </motion.div>

              {/* Player Info */}
              <div className="flex-1 min-w-0">
                <div className="font-black text-gray-800 text-base truncate">
                  {player.name}
                  {isCurrentPlayer && <span className="ml-1 text-yellow-600">👈</span>}
                </div>
                <div className="font-bold text-purple-600 text-sm">
                  📍 Square {gameState.playerPositions[player.id]}
                </div>

                {/* Power-ups Row */}
                <div className="flex gap-1 mt-2 flex-wrap">
                  {/* Stars */}
                  {powerUps.stars > 0 && (
                    <motion.div
                      className="bg-yellow-200 px-2 py-0.5 rounded-full text-xs font-bold border-2 border-yellow-400 flex items-center gap-1"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      ⭐ {powerUps.stars}/3
                    </motion.div>
                  )}

                  {/* Speed Boost */}
                  {powerUps.speedBoost && (
                    <motion.div
                      className="bg-blue-200 px-2 py-0.5 rounded-full text-xs font-bold border-2 border-blue-400 flex items-center gap-1"
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      💨 +2
                    </motion.div>
                  )}

                  {/* Shield */}
                  {powerUps.shield && (
                    <motion.div
                      className="bg-purple-200 px-2 py-0.5 rounded-full text-xs font-bold border-2 border-purple-400 flex items-center gap-1"
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    >
                      🛡️
                    </motion.div>
                  )}
                </div>

                {/* Skip Turn Warning */}
                {player.skipNextTurn && (
                  <motion.div
                    className="text-red-600 font-black text-xs bg-red-100 rounded-full px-2 py-1 mt-2 flex items-center gap-1"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >
                    ⏸️ Skip Next
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};