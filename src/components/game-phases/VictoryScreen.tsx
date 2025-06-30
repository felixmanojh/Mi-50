import React from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { Player } from '../../types/GameTypes';
import { monsterSpriteUrls } from '../../constants';

interface VictoryScreenProps {
  winner: Player;
  players: Player[];
  onPlayAgain: () => void;
  playSound: (soundKey: string) => void;
  audioUrls: any;
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({ 
  winner, 
  players, 
  onPlayAgain, 
  playSound, 
  audioUrls 
}) => {
  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-yellow-200 via-pink-200 via-purple-200 to-blue-200 relative flex items-center justify-center">
      {/* Floating celebration elements */}
      <div className="absolute top-10 left-10 w-24 h-24 bg-yellow-400 rounded-full opacity-80 animate-bounce"></div>
      <div className="absolute top-20 right-20 w-16 h-16 bg-pink-400 rounded-full opacity-80 animate-bounce delay-1000"></div>
      <div className="absolute bottom-20 left-20 w-20 h-20 bg-green-400 rounded-full opacity-80 animate-bounce delay-2000"></div>
      <div className="absolute bottom-32 right-32 w-12 h-12 bg-purple-400 rounded-full opacity-80 animate-bounce delay-500"></div>
      
      <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-4xl border-8 border-rainbow relative overflow-hidden">
        {/* Sparkle effects */}
        <div className="absolute top-4 left-4 text-4xl animate-bounce">✨</div>
        <div className="absolute top-4 right-4 text-4xl animate-bounce delay-500">🎉</div>
        <div className="absolute bottom-4 left-4 text-4xl animate-bounce delay-1000">🏆</div>
        <div className="absolute bottom-4 right-4 text-4xl animate-bounce delay-1500">⭐</div>
        
        {/* Giant Trophy */}
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mb-8"
        >
          <Trophy className="w-32 h-32 text-yellow-500 mx-auto" />
        </motion.div>
        
        {/* Victory Title */}
        <motion.h1 
          className="text-6xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 drop-shadow-lg"
          animate={{ 
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          🎉 VICTORY! 🎉
        </motion.h1>
        
        {/* Winner announcement */}
        <motion.div
          className="mb-8"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <p className="text-3xl font-bold mb-4 text-gray-800">
            <motion.span 
              className={`px-6 py-3 rounded-2xl text-white text-4xl ${winner.color} border-4 border-white shadow-xl`}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              {winner.name} WINS!
            </motion.span>
          </p>
        </motion.div>
        
        {/* Dancing monsters party! */}
        <motion.div 
          className="flex justify-center gap-8 mb-12"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {players.map((player, index) => (
            <motion.div
              key={player.id}
              className="flex flex-col items-center"
              animate={{
                y: [0, -20, 0],
                rotate: [0, 10, -10, 0],
                scale: player.id === winner.id ? [1, 1.2, 1] : [1, 1.1, 1]
              }}
              transition={{
                duration: player.id === winner.id ? 1 : 1.5,
                repeat: Infinity,
                delay: index * 0.2
              }}
            >
              {/* Dancing monster */}
              <div className={`w-20 h-20 rounded-full border-4 border-white shadow-xl ${player.id === winner.id ? 'border-yellow-400' : ''}`}>
                <img 
                  src={monsterSpriteUrls[player.character]} 
                  alt={player.name} 
                  className="w-full h-full rounded-full" 
                />
              </div>
              
              {/* Player name */}
              <motion.div 
                className={`mt-2 px-3 py-1 rounded-full text-sm font-bold border-2 ${
                  player.id === winner.id
                    ? 'bg-yellow-200 border-yellow-400 text-yellow-800' 
                    : 'bg-gray-200 border-gray-400 text-gray-800'
                }`}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
              >
                {player.name}
                {player.id === winner.id && <span className="ml-1">👑</span>}
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Play again button */}
        <motion.button
          onClick={() => {
            playSound(audioUrls.buttonClick);
            onPlayAgain();
          }}
          className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 hover:from-green-600 hover:via-blue-600 hover:to-purple-700 text-white px-16 py-6 rounded-3xl text-3xl font-black shadow-2xl border-6 border-white transform"
          whileHover={{ scale: 1.1, y: -5 }}
          whileTap={{ scale: 0.95 }}
          animate={{ 
            boxShadow: [
              "0 0 20px rgba(59, 130, 246, 0.4)",
              "0 0 40px rgba(59, 130, 246, 0.6)",
              "0 0 20px rgba(59, 130, 246, 0.4)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🎮 Play Again! 🎮
        </motion.button>
      </div>
    </div>
  );
};