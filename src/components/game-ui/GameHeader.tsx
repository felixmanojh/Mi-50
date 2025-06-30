import React from 'react';
import { motion } from 'framer-motion';

interface GameHeaderProps {
  isMuted: boolean;
  onToggleMute: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({ isMuted, onToggleMute }) => {
  return (
    <div className="w-full flex justify-between items-center mb-6">
      <motion.h1 
        className="text-6xl font-black text-white drop-shadow-2xl"
        animate={{
          scale: [1, 1.02, 1],
          textShadow: [
            "0 0 20px rgba(255,255,255,0.5)",
            "0 0 30px rgba(255,255,255,0.8)",  
            "0 0 20px rgba(255,255,255,0.5)"
          ]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      >
        🎯 Mi-50 🎯
      </motion.h1>
      
      <motion.button 
        onClick={onToggleMute} 
        className="text-5xl bg-white rounded-full p-4 border-4 border-purple-500 shadow-2xl hover:scale-110 transition-all"
        whileHover={{ scale: 1.1, rotate: 10 }}
        whileTap={{ scale: 0.9 }}
      >
        {isMuted ? '🔇' : '🔊'}
      </motion.button>
    </div>
  );
};