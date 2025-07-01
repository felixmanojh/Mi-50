import React from 'react';
import { motion } from 'framer-motion';
import { monsterSpriteUrls } from './constants';

// Create snake pattern array: [1-10], [20-11], [21-30], [40-31], [41-50]
const createSnakePattern = () => {
  const pattern = [];
  
  // Row 1: 1-10 (left to right)
  for (let i = 1; i <= 10; i++) {
    pattern.push(i);
  }
  
  // Row 2: 11-20 (right to left, reversed)
  for (let i = 20; i >= 11; i--) {
    pattern.push(i);
  }
  
  // Row 3: 21-30 (left to right)
  for (let i = 21; i <= 30; i++) {
    pattern.push(i);
  }
  
  // Row 4: 31-40 (right to left, reversed)
  for (let i = 40; i >= 31; i--) {
    pattern.push(i);
  }
  
  // Row 5: 41-50 (left to right)
  for (let i = 41; i <= 50; i++) {
    pattern.push(i);
  }
  
  return pattern;
};

const snakePattern = createSnakePattern();

const GameBoardSimple = ({ players, playerPositions, specialSquares, animatingSquare }) => {
  // Function to get players on a specific square
  const getPlayersOnSquare = (squareNumber) => {
    return players.filter(player => playerPositions[player.id] === squareNumber);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div 
        className="grid gap-1 bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-2xl shadow-2xl border-4 border-white"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(10, 1fr)',
          gridTemplateRows: 'repeat(5, 1fr)',
          width: '100%',
          height: '400px' // Fixed height to ensure proper layout
        }}
      >
        {/* Render squares in snake pattern */}
        {snakePattern.map((squareNumber, gridIndex) => {
          const special = specialSquares[squareNumber];
          const isAnimating = animatingSquare === squareNumber;
          const playersOnSquare = getPlayersOnSquare(squareNumber);
          
          return (
            <motion.div
              key={squareNumber}
              className={`
                relative border-2 border-gray-400 rounded-lg flex items-center justify-center
                text-lg font-bold min-h-[60px] overflow-visible
                ${special ? 'bg-yellow-200 border-yellow-400' : 'bg-white'}
                ${isAnimating ? 'z-50' : ''}
                ${squareNumber === 50 ? 'bg-gradient-to-br from-yellow-300 to-orange-300 border-orange-400' : ''}
              `}
              animate={isAnimating ? {
                scale: [1, 1.2, 1],
                boxShadow: [
                  '0 0 0px rgba(255, 215, 0, 0)',
                  '0 0 20px rgba(255, 215, 0, 0.8)',
                  '0 0 0px rgba(255, 215, 0, 0)'
                ]
              } : {}}
              transition={{ duration: 1 }}
            >
              {/* Square number and special icon */}
              <div className="flex flex-col items-center text-center">
                <span className="text-sm font-bold text-gray-800">
                  {squareNumber === 50 ? '🏆' : squareNumber}
                </span>
                {special && (
                  <span className="text-xs">{special.icon}</span>
                )}
              </div>

              {/* Player monsters on this square */}
              {playersOnSquare.map((player, playerIndex) => {
                // Calculate position offset for multiple players
                const offsets = [
                  { x: -8, y: -8 }, // Player 1: top-left
                  { x: 8, y: -8 },  // Player 2: top-right  
                  { x: -8, y: 8 },  // Player 3: bottom-left
                  { x: 8, y: 8 }    // Player 4: bottom-right
                ];
                
                const offset = offsets[playerIndex] || { x: 0, y: 0 };
                
                return (
                  <motion.div
                    key={player.id}
                    className="absolute"
                    style={{
                      transform: `translate(${offset.x}px, ${offset.y}px)`,
                      zIndex: 20 + player.id
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    {/* Player avatar */}
                    <div className="relative">
                      <img
                        src={monsterSpriteUrls[player.character]}
                        alt={player.name}
                        className="w-8 h-8 rounded-full border-2 border-white shadow-lg"
                      />
                      
                      {/* Player name tooltip */}
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black text-white px-1 py-0.5 rounded text-xs font-bold opacity-0 hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                        {player.name}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Special animation sparkles */}
              {isAnimating && (
                <>
                  <motion.div
                    className="absolute w-2 h-2 bg-yellow-400 rounded-full -top-1 -left-1"
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0]
                    }}
                    transition={{ duration: 1, repeat: 2 }}
                  />
                  <motion.div
                    className="absolute w-2 h-2 bg-pink-400 rounded-full -top-1 -right-1"
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0]
                    }}
                    transition={{ duration: 1, repeat: 2, delay: 0.3 }}
                  />
                </>
              )}
            </motion.div>
          );
        })}
      </div>
      
      {/* Start position indicator */}
      <div className="mt-4 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-200 border-4 border-green-400 rounded-full">
          <span className="text-sm font-bold">START</span>
        </div>
        
        {/* Show players on start position */}
        {getPlayersOnSquare(0).map((player, index) => (
          <motion.div
            key={player.id}
            className="inline-block ml-2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <img
              src={monsterSpriteUrls[player.character]}
              alt={player.name}
              className="w-8 h-8 rounded-full border-2 border-white shadow-lg"
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default GameBoardSimple;