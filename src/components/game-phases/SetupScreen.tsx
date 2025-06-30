import React from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

interface SetupScreenProps {
  onStartGame: (numPlayers: number) => void;
  onShowTutorial: () => void;
  playSound: (soundKey: string) => void;
  audioUrls: any;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({ 
  onStartGame, 
  onShowTutorial, 
  playSound, 
  audioUrls 
}) => {
  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-pink-300 via-purple-300 via-blue-300 to-cyan-300 flex items-center justify-center relative">
      {/* Floating decoration elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-400 rounded-full opacity-60 animate-bounce"></div>
      <div className="absolute top-32 right-20 w-16 h-16 bg-pink-400 rounded-full opacity-60 animate-bounce delay-1000"></div>
      <div className="absolute bottom-20 left-32 w-24 h-24 bg-green-400 rounded-full opacity-60 animate-bounce delay-2000"></div>
      <div className="absolute bottom-40 right-16 w-12 h-12 bg-purple-400 rounded-full opacity-60 animate-bounce delay-500"></div>
      
      <div className="max-w-4xl mx-auto p-8">
        {/* Title Section */}
        <motion.div 
          className="text-center mb-12"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1 
            className="text-8xl font-black text-white mb-4 drop-shadow-2xl"
            animate={{ 
              scale: [1, 1.05, 1],
              textShadow: [
                "0 0 20px rgba(255,255,255,0.5)",
                "0 0 30px rgba(255,255,255,0.8)",
                "0 0 20px rgba(255,255,255,0.5)"
              ]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            Mi-50
          </motion.h1>
          <motion.div 
            className="text-3xl font-bold text-white mb-2 drop-shadow-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            🎯 Race to square 50 and win! 🏆
          </motion.div>
          <motion.div 
            className="text-xl text-white opacity-90 drop-shadow-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            📚 Learn math while having fun! 🧮
          </motion.div>
        </motion.div>

        {/* Player Count Selection Card */}
        <motion.div 
          className="bg-white rounded-3xl p-12 shadow-2xl border-8 border-rainbow relative overflow-hidden max-w-2xl mx-auto"
          initial={{ scale: 0, rotate: 5 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
        >
          {/* Decorative elements on card */}
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-rainbow rounded-full flex items-center justify-center text-2xl border-4 border-white shadow-lg">
            🎪
          </div>
          
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Users className="w-24 h-24 text-purple-500 mx-auto mb-8" />
          </motion.div>
          
          <h2 className="text-4xl font-black text-gray-800 mb-8 drop-shadow-md">
            🎮 How many players want to play? 🎮
          </h2>
          
          {/* Tutorial Button */}
          <motion.div className="mb-10">
            <motion.button
              onClick={() => {
                playSound(audioUrls.buttonClick);
                onShowTutorial();
              }}
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white px-10 py-4 rounded-2xl text-2xl font-black transition-all shadow-2xl border-4 border-white transform hover:scale-105"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
              }}
              whileTap={{ scale: 0.95 }}
              animate={{ 
                boxShadow: [
                  "0 0 20px rgba(168, 85, 247, 0.4)",
                  "0 0 40px rgba(168, 85, 247, 0.6)",
                  "0 0 20px rgba(168, 85, 247, 0.4)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🎓 How to Play (Tutorial) 📚
            </motion.button>
          </motion.div>

          {/* Player Selection Buttons */}
          <div className="flex gap-8 justify-center flex-wrap">
            {[2, 3, 4].map((num, index) => (
              <motion.button
                key={num}
                onClick={() => {
                  playSound(audioUrls.buttonClick);
                  onStartGame(num);
                }}
                className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 hover:from-green-500 hover:via-blue-600 hover:to-purple-700 text-white px-10 py-6 rounded-2xl text-3xl font-black transition-all shadow-2xl border-4 border-white"
                whileHover={{ 
                  scale: 1.1, 
                  rotate: 5,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
                }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: 0.8 + (index * 0.1),
                  type: "spring",
                  stiffness: 300
                }}
              >
                <div className="flex flex-col items-center">
                  <span className="text-4xl mb-2">
                    {num === 2 ? '👥' : num === 3 ? '👨‍👩‍👧' : '👨‍👩‍👧‍👦'}
                  </span>
                  <span className="drop-shadow-lg">{num} Players</span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};