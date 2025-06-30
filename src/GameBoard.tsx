
import React from 'react';
import { motion } from 'framer-motion';
import { boardLayout } from './boardLayout';
import { boardBgUrl, monsterSpriteUrls } from './constants';

const GameBoard = ({ players, playerPositions, specialSquares, animatingSquare }) => {
  return (
    <div 
      className="relative w-full max-w-4xl mx-auto aspect-video bg-cover bg-center rounded-2xl shadow-2xl border-8 border-white overflow-hidden"
      style={{ backgroundImage: `url(${boardBgUrl})` }}
    >
      {/* Render the squares */}
      {boardLayout.slice(1).map((pos, index) => {
        const squareNum = index + 1;
        const special = specialSquares[squareNum];
        const isAnimating = animatingSquare === squareNum;
        
        return (
          <motion.div
            key={squareNum}
            className={`absolute w-[8%] h-[12%] flex items-center justify-center font-bold text-white rounded-full shadow-lg ${
              isAnimating ? 'z-50' : ''
            }`}
            style={{ 
              left: `${pos.x}%`, 
              top: `${pos.y}%`, 
              backgroundColor: special ? 'rgba(255, 215, 0, 0.8)' : 'rgba(139, 69, 19, 0.7)',
              border: special ? '4px solid gold' : '4px solid saddlebrown',
            }}
            initial={{ scale: 0 }}
            animate={{ 
              scale: isAnimating ? [1, 1.5, 1.2, 1.5, 1] : 1,
              boxShadow: isAnimating ? [
                '0 0 0px rgba(255, 215, 0, 0)',
                '0 0 30px rgba(255, 215, 0, 0.8)',
                '0 0 60px rgba(255, 215, 0, 1)',
                '0 0 30px rgba(255, 215, 0, 0.8)',
                '0 0 0px rgba(255, 215, 0, 0)'
              ] : undefined,
              rotate: isAnimating ? [0, 5, -5, 5, 0] : 0
            }}
            transition={{ 
              delay: index * 0.02, 
              type: 'spring', 
              stiffness: 300,
              ...(isAnimating && {
                scale: { duration: 2, ease: 'easeInOut' },
                boxShadow: { duration: 2, ease: 'easeInOut' },
                rotate: { duration: 2, ease: 'easeInOut' }
              })
            }}
          >
            {squareNum === 50 ? '🏆' : squareNum}
            {special && (
              <motion.div 
                className="absolute -top-2 -right-2 text-2xl"
                animate={isAnimating ? {
                  scale: [1, 1.5, 1],
                  rotate: [0, 360]
                } : {}}
                transition={isAnimating ? { duration: 2, ease: 'easeInOut' } : {}}
              >
                {special.icon}
              </motion.div>
            )}
            
            {/* Special animation sparkles */}
            {isAnimating && (
              <>
                <motion.div
                  className="absolute w-4 h-4 bg-yellow-400 rounded-full"
                  style={{ top: '-10px', left: '-10px' }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0]
                  }}
                  transition={{ duration: 2, repeat: 3, delay: 0.2 }}
                />
                <motion.div
                  className="absolute w-3 h-3 bg-pink-400 rounded-full"
                  style={{ top: '-8px', right: '-8px' }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0]
                  }}
                  transition={{ duration: 2, repeat: 3, delay: 0.5 }}
                />
                <motion.div
                  className="absolute w-5 h-5 bg-blue-400 rounded-full"
                  style={{ bottom: '-10px', left: '50%', transform: 'translateX(-50%)' }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0]
                  }}
                  transition={{ duration: 2, repeat: 3, delay: 0.8 }}
                />
              </>
            )}
          </motion.div>
        );
      })}

      {/* Render the players */}
      {players.map(player => {
        const position = playerPositions[player.id];
        const { x, y } = boardLayout[position];

        return (
          <motion.div
            key={player.id}
            className="absolute"
            style={{ 
              left: `${x}%`, 
              top: `${y}%`, 
              transform: 'translate(-50%, -50%)', // Center the container
              zIndex: 20 + player.id, // Ensure current player is on top
            }}
            initial={{ scale: 0 }}
            animate={{ 
              x: `${x}%`, 
              y: `${y}%`, 
              scale: 1, 
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            {/* Player name above avatar */}
            <motion.div 
              className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded-full text-xs font-bold text-gray-800 border-2 border-gray-300 shadow-lg whitespace-nowrap"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {player.name}
            </motion.div>
            
            {/* Player avatar */}
            <motion.div
              className="w-12 h-12 rounded-full border-4 border-white shadow-2xl"
              animate={{ 
                scale: 1.2, // Make the avatar pop
              }}
            >
              <img src={monsterSpriteUrls[player.character]} alt={player.name} className="w-full h-full rounded-full" />
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default GameBoard;
