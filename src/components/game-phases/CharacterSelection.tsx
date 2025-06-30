import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { GameState, Player } from '../../types/GameTypes';
import { monsterSpriteUrls } from '../../constants';

interface CharacterSelectionProps {
  gameState: GameState;
  onCharacterSelect: (characterIndex: number) => void;
  playSound: (soundKey: string) => void;
  audioUrls: any;
  playerNames: string[];
}

export const CharacterSelection: React.FC<CharacterSelectionProps> = ({ 
  gameState, 
  onCharacterSelect, 
  playSound, 
  audioUrls,
  playerNames 
}) => {
  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-green-300 via-teal-300 via-blue-300 to-purple-300 flex items-center justify-center relative">
      {/* Floating decoration elements */}
      <div className="absolute top-16 left-16 w-16 h-16 bg-red-400 rounded-full opacity-70 animate-bounce"></div>
      <div className="absolute top-28 right-24 w-20 h-20 bg-yellow-400 rounded-full opacity-70 animate-bounce delay-700"></div>
      <div className="absolute bottom-24 left-28 w-18 h-18 bg-pink-400 rounded-full opacity-70 animate-bounce delay-1400"></div>
      <div className="absolute bottom-36 right-20 w-14 h-14 bg-green-400 rounded-full opacity-70 animate-bounce delay-300"></div>
      
      <div className="max-w-6xl mx-auto p-8">
        {/* Character Selection Card */}
        <motion.div 
          className="bg-white rounded-3xl p-12 shadow-2xl border-8 border-rainbow relative overflow-hidden"
          initial={{ scale: 0, rotate: -5 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          {/* Decorative elements */}
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-rainbow rounded-full flex items-center justify-center text-2xl border-4 border-white shadow-lg">
            👾
          </div>
          
          <motion.h1 
            className="text-5xl font-black text-center text-gray-800 mb-4 drop-shadow-md"
            animate={{ 
              scale: [1, 1.02, 1],
              color: ["#374151", "#7c2d12", "#374151"]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🎨 Choose Your Monster! 🎨
          </motion.h1>
          
          <motion.p 
            className="text-center text-2xl text-gray-600 mb-12 font-bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {playerNames[gameState.players.length]}, pick your character!
          </motion.p>
          
          {/* Progress Indicator */}
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex justify-center items-center gap-4 mb-4">
              <span className="text-lg font-bold text-gray-600">Progress:</span>
              <div className="flex gap-2">
                {Array.from({ length: gameState.numPlayers }, (_, i) => (
                  <motion.div
                    key={i}
                    className={`w-4 h-4 rounded-full border-2 ${
                      i < gameState.players.length 
                        ? 'bg-green-400 border-green-500' 
                        : i === gameState.players.length 
                        ? 'bg-yellow-400 border-yellow-500 animate-pulse' 
                        : 'bg-gray-200 border-gray-300'
                    }`}
                    animate={i === gameState.players.length ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                ))}
              </div>
              <span className="text-lg font-bold text-gray-600">
                ({gameState.players.length}/{gameState.numPlayers})
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden border-2 border-gray-300">
              <motion.div 
                className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(gameState.players.length / gameState.numPlayers) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </motion.div>
          
          {/* Character Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 justify-items-center">
            {monsterSpriteUrls.map((spriteUrl, index) => {
              const isSelected = gameState.selectedCharacters.includes(index);
              
              return (
                <motion.button
                  key={index}
                  onClick={() => {
                    if (!isSelected) {
                      playSound(audioUrls.buttonClick);
                      onCharacterSelect(index);
                    }
                  }}
                  disabled={isSelected}
                  className={`relative group ${
                    isSelected 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:scale-110 cursor-pointer'
                  }`}
                  whileHover={!isSelected ? { scale: 1.1, rotate: 5 } : {}}
                  whileTap={!isSelected ? { scale: 0.95 } : {}}
                  initial={{ opacity: 0, scale: 0, rotate: 180 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 300
                  }}
                >
                  {/* Character Avatar */}
                  <div className={`w-32 h-32 rounded-full border-6 transition-all shadow-xl ${
                    isSelected 
                      ? 'border-gray-400 bg-gray-100' 
                      : 'border-rainbow bg-white hover:shadow-2xl'
                  }`}>
                    <img 
                      src={spriteUrl} 
                      alt={`Monster ${index + 1}`} 
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  
                  {/* Selection Indicator */}
                  {isSelected && (
                    <motion.div 
                      className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center border-2 border-white"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <span className="text-white font-bold text-sm">✓</span>
                    </motion.div>
                  )}
                  
                  {/* Character Number */}
                  <motion.div 
                    className={`mt-3 text-center font-black text-lg ${
                      isSelected ? 'text-gray-500' : 'text-gray-800'
                    }`}
                    animate={!isSelected ? { 
                      color: ["#374151", "#7c2d12", "#374151"] 
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                  >
                    Monster {index + 1}
                  </motion.div>
                  
                  {/* Hover Effect */}
                  {!isSelected && (
                    <motion.div 
                      className="absolute inset-0 rounded-full bg-rainbow opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
          
          {/* Selected Characters Display */}
          {gameState.players.length > 0 && (
            <motion.div 
              className="mt-12 p-6 bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl border-4 border-green-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <h3 className="text-2xl font-black text-center text-gray-800 mb-4">
                🎉 Selected Players 🎉
              </h3>
              <div className="flex justify-center gap-6 flex-wrap">
                {gameState.players.map((player, index) => (
                  <motion.div
                    key={player.id}
                    className="flex flex-col items-center"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ 
                      delay: 0.8 + (index * 0.1),
                      type: "spring",
                      stiffness: 400
                    }}
                  >
                    <div className="w-16 h-16 rounded-full border-4 border-white shadow-lg overflow-hidden">
                      <img 
                        src={monsterSpriteUrls[player.character]} 
                        alt={player.name}
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <span className="mt-2 font-bold text-gray-800">{player.name}</span>
                  </motion.div>
                ))}
                
                {/* Next Player Indicator */}
                {gameState.players.length < gameState.numPlayers && (
                  <motion.div
                    className="flex flex-col items-center"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <div className="w-16 h-16 rounded-full border-4 border-dashed border-gray-400 shadow-lg flex items-center justify-center bg-gray-100">
                      <ArrowRight className="w-8 h-8 text-gray-500" />
                    </div>
                    <span className="mt-2 font-bold text-gray-600">
                      {playerNames[gameState.players.length]}
                    </span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};