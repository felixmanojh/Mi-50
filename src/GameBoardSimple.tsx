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

const GameBoardSimple = ({ players, playerPositions, specialSquares, animatingSquare, currentPlayerIndex = 0 }) => {
  // Function to get players on a specific square
  const getPlayersOnSquare = (squareNumber) => {
    return players.filter(player => playerPositions[player.id] === squareNumber);
  };

  // Get current player's position for highlighting
  const currentPlayer = players[currentPlayerIndex];
  const currentPlayerPosition = currentPlayer ? playerPositions[currentPlayer.id] : -1;

  // Helper to get special square color
  const getSquareColor = (squareNumber, special) => {
    if (squareNumber === 50) return 'bg-gradient-to-br from-yellow-300 to-orange-300 border-orange-400';
    if (!special) return 'bg-white';

    // Color code by special type
    if (special.type.includes('power_up')) return 'bg-gradient-to-br from-green-100 to-emerald-200 border-green-400';
    if (special.type === 'roll_again') return 'bg-gradient-to-br from-blue-100 to-cyan-200 border-blue-400';
    if (special.type.includes('skip') || special.type.includes('lose')) return 'bg-gradient-to-br from-red-100 to-pink-200 border-red-400';
    if (special.type.includes('go_to') || special.type.includes('teleport')) return 'bg-gradient-to-br from-purple-100 to-violet-200 border-purple-400';
    if (special.type === 'trivia') return 'bg-gradient-to-br from-orange-100 to-amber-200 border-orange-400';
    if (special.type.includes('steal') || special.type.includes('mirror')) return 'bg-gradient-to-br from-yellow-100 to-amber-200 border-yellow-400';

    return 'bg-yellow-100 border-yellow-400';
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <div
        className="grid gap-2 bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-3xl shadow-2xl border-4 border-white"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(10, 1fr)',
          gridTemplateRows: 'repeat(5, 1fr)',
          width: '100%',
          height: '600px' // Increased from 400px for better visibility
        }}
      >
        {/* Render squares in snake pattern */}
        {snakePattern.map((squareNumber, gridIndex) => {
          const special = specialSquares[squareNumber];
          const isAnimating = animatingSquare === squareNumber;
          const playersOnSquare = getPlayersOnSquare(squareNumber);
          const isCurrentPlayerHere = squareNumber === currentPlayerPosition;
          const squareColor = getSquareColor(squareNumber, special);

          return (
            <motion.div
              key={squareNumber}
              className={`
                relative border-3 rounded-xl flex items-center justify-center
                text-lg font-bold min-h-[70px] overflow-visible group cursor-help
                ${squareColor}
                ${isAnimating ? 'z-50' : ''}
                ${isCurrentPlayerHere ? 'border-4 border-indigo-500 ring-4 ring-indigo-300' : 'border-gray-400'}
              `}
              animate={isAnimating ? {
                scale: [1, 1.15, 1],
                boxShadow: [
                  '0 0 0px rgba(255, 215, 0, 0)',
                  '0 0 30px rgba(255, 215, 0, 1)',
                  '0 0 0px rgba(255, 215, 0, 0)'
                ]
              } : isCurrentPlayerHere ? {
                boxShadow: [
                  '0 0 10px rgba(99, 102, 241, 0.5)',
                  '0 0 20px rgba(99, 102, 241, 0.8)',
                  '0 0 10px rgba(99, 102, 241, 0.5)'
                ]
              } : {}}
              transition={{ duration: isAnimating ? 1 : 2, repeat: isCurrentPlayerHere ? Infinity : 0 }}
            >
              {/* Square number and special icon */}
              <div className="flex flex-col items-center text-center">
                <span className="text-base font-black text-gray-800">
                  {squareNumber === 50 ? '🏆' : squareNumber}
                </span>
                {special && (
                  <span className="text-lg mt-1">{special.icon}</span>
                )}
              </div>

              {/* Tooltip on hover */}
              {special && (
                <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
                  <div className="text-center">
                    <div className="text-sm mb-1">{special.icon} {special.text}</div>
                    <div className="text-xs text-gray-300">Square {squareNumber}</div>
                  </div>
                  {/* Tooltip arrow */}
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              )}

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
      <div className="mt-6 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-200 to-emerald-300 border-4 border-green-400 rounded-full shadow-lg">
          <span className="text-base font-black text-green-800">START</span>
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
              className="w-10 h-10 rounded-full border-2 border-white shadow-lg"
            />
          </motion.div>
        ))}
      </div>

      {/* Board Legend */}
      <motion.div
        className="mt-6 bg-white rounded-2xl p-4 shadow-lg border-2 border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="text-center font-black text-gray-700 mb-3">🎮 Square Types</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-green-100 to-emerald-200 border-2 border-green-400"></div>
            <span className="font-bold text-gray-700">⭐💨🛡️ Power-ups</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-100 to-cyan-200 border-2 border-blue-400"></div>
            <span className="font-bold text-gray-700">🎲 Roll Again</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-red-100 to-pink-200 border-2 border-red-400"></div>
            <span className="font-bold text-gray-700">⏭️ Skip Turn</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-100 to-violet-200 border-2 border-purple-400"></div>
            <span className="font-bold text-gray-700">🌀 Teleport</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-orange-100 to-amber-200 border-2 border-orange-400"></div>
            <span className="font-bold text-gray-700">🧠 Trivia</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-yellow-100 to-amber-200 border-2 border-yellow-400"></div>
            <span className="font-bold text-gray-700">🏴‍☠️ Special</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-white border-2 border-gray-400"></div>
            <span className="font-bold text-gray-700">Normal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded border-4 border-indigo-500 ring-2 ring-indigo-300"></div>
            <span className="font-bold text-indigo-700">Current Player</span>
          </div>
        </div>
        <div className="mt-3 text-center text-xs text-gray-600 italic">
          💡 Hover over colored squares to see what they do!
        </div>
      </motion.div>
    </div>
  );
};

export default GameBoardSimple;