
import React from 'react';
import { motion } from 'framer-motion';
import { boardLayout } from './boardLayout';
import { boardBgUrl, monsterSpriteUrls } from './constants';

const GameBoard = ({ players, playerPositions, specialSquares }) => {
  return (
    <div 
      className="relative w-full max-w-4xl mx-auto aspect-video bg-cover bg-center rounded-2xl shadow-2xl border-8 border-white overflow-hidden"
      style={{ backgroundImage: `url(${boardBgUrl})` }}
    >
      {/* Render the squares */}
      {boardLayout.slice(1).map((pos, index) => {
        const squareNum = index + 1;
        const special = specialSquares[squareNum];
        
        return (
          <motion.div
            key={squareNum}
            className={`absolute w-[8%] h-[12%] flex items-center justify-center font-bold text-white rounded-full shadow-lg`}
            style={{ 
              left: `${pos.x}%`, 
              top: `${pos.y}%`, 
              backgroundColor: special ? 'rgba(255, 215, 0, 0.8)' : 'rgba(139, 69, 19, 0.7)',
              border: special ? '4px solid gold' : '4px solid saddlebrown',
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.02, type: 'spring', stiffness: 300 }}
          >
            {squareNum === 50 ? '🏆' : squareNum}
            {special && <div className="absolute -top-2 -right-2 text-2xl">{special.icon}</div>}
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
            className="absolute w-12 h-12 rounded-full border-4 border-white shadow-2xl"
            style={{ 
              left: `${x}%`, 
              top: `${y}%`, 
              transform: 'translate(-50%, -50%)', // Center the avatar
              zIndex: 20 + player.id, // Ensure current player is on top
            }}
            initial={{ scale: 0 }}
            animate={{ 
              x: `${x}%`, 
              y: `${y}%`, 
              scale: 1.2, // Make the avatar pop
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            <img src={monsterSpriteUrls[player.character]} alt={player.name} className="w-full h-full rounded-full" />
          </motion.div>
        );
      })}
    </div>
  );
};

export default GameBoard;
