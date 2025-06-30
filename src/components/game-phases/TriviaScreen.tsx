import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, CheckCircle, XCircle } from 'lucide-react';
import { GameState, MathQuestion } from '../../types/GameTypes';
import { VisualMathOperation } from '../../VisualMathAids';

interface TriviaScreenProps {
  gameState: GameState;
  onAnswer: (answer: string) => void;
  playSound: (soundKey: string) => void;
  audioUrls: any;
}

export const TriviaScreen: React.FC<TriviaScreenProps> = ({ 
  gameState, 
  onAnswer, 
  playSound, 
  audioUrls 
}) => {
  const [answer, setAnswer] = useState('');
  const question = gameState.triviaQuestion!;
  const player = gameState.players[gameState.triviaPlayer!];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim() !== '') {
      onAnswer(answer);
      setAnswer('');
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-yellow-200 via-orange-200 to-red-200 flex items-center justify-center relative">
      {/* Floating brain icons */}
      <div className="absolute top-20 left-20 text-6xl animate-bounce">🧠</div>
      <div className="absolute top-32 right-24 text-5xl animate-bounce delay-500">💭</div>
      <div className="absolute bottom-28 left-32 text-4xl animate-bounce delay-1000">🤔</div>
      <div className="absolute bottom-20 right-20 text-6xl animate-bounce delay-1500">💡</div>
      
      <AnimatePresence>
        <motion.div 
          className="max-w-4xl mx-auto p-8"
          initial={{ scale: 0, rotate: 10 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: -10 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          {/* Main Trivia Card */}
          <motion.div 
            className="bg-white rounded-3xl p-12 shadow-2xl border-8 border-yellow-400 relative overflow-hidden"
            animate={{ 
              boxShadow: [
                "0 0 20px rgba(251, 191, 36, 0.3)",
                "0 0 40px rgba(251, 191, 36, 0.6)",
                "0 0 20px rgba(251, 191, 36, 0.3)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {/* Decorative header */}
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center text-3xl border-4 border-white shadow-lg">
              🧮
            </div>
            
            {/* Player Info */}
            <motion.div 
              className="text-center mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div 
                className="inline-flex items-center gap-4 bg-gradient-to-r from-purple-100 to-pink-100 px-8 py-4 rounded-2xl border-4 border-purple-300 shadow-lg"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Brain className="w-8 h-8 text-purple-600" />
                <span className="text-2xl font-black text-purple-800">
                  {player.name}'s Math Challenge!
                </span>
                <Brain className="w-8 h-8 text-purple-600" />
              </motion.div>
            </motion.div>
            
            {/* Question Display */}
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
            >
              <motion.h2 
                className="text-4xl font-black text-gray-800 mb-8 leading-relaxed"
                animate={{ 
                  color: ["#374151", "#dc2626", "#7c2d12", "#374151"]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {question.question}
              </motion.h2>
              
              {/* Visual Math Aid */}
              <motion.div 
                className="flex justify-center mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <VisualMathOperation 
                  num1={question.num1} 
                  num2={question.num2} 
                  operation={question.operation} 
                />
              </motion.div>
            </motion.div>
            
            {/* Answer Form */}
            <motion.form 
              onSubmit={handleSubmit}
              className="text-center space-y-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div className="flex justify-center items-center gap-6">
                <motion.label 
                  htmlFor="answer" 
                  className="text-3xl font-black text-gray-800"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Answer:
                </motion.label>
                
                <motion.input
                  id="answer"
                  type="number"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-32 h-16 text-center text-3xl font-black border-4 border-blue-400 rounded-2xl shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-600"
                  placeholder="?"
                  whileFocus={{ scale: 1.05 }}
                  autoComplete="off"
                />
              </div>
              
              <div className="flex justify-center gap-6">
                <motion.button
                  type="submit"
                  disabled={answer.trim() === ''}
                  className={`px-12 py-4 rounded-2xl text-2xl font-black border-4 border-white shadow-xl transition-all ${
                    answer.trim() === ''
                      ? 'bg-gray-400 cursor-not-allowed opacity-50'
                      : 'bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white'
                  }`}
                  whileHover={answer.trim() !== '' ? { scale: 1.05 } : {}}
                  whileTap={answer.trim() !== '' ? { scale: 0.95 } : {}}
                  animate={answer.trim() !== '' ? {
                    boxShadow: [
                      "0 0 20px rgba(34, 197, 94, 0.4)",
                      "0 0 40px rgba(34, 197, 94, 0.6)",
                      "0 0 20px rgba(34, 197, 94, 0.4)"
                    ]
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-8 h-8" />
                    <span>Submit Answer!</span>
                  </div>
                </motion.button>
              </div>
              
              {/* Hint */}
              <motion.div 
                className="text-lg text-gray-600 font-bold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                💡 Take your time and think carefully!
              </motion.div>
            </motion.form>
            
            {/* Difficulty Indicator */}
            <motion.div 
              className="absolute top-4 right-4"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2 }}
            >
              <div className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${
                question.difficulty === 'easy' 
                  ? 'bg-green-100 border-green-400 text-green-800'
                  : question.difficulty === 'medium'
                  ? 'bg-yellow-100 border-yellow-400 text-yellow-800'
                  : 'bg-red-100 border-red-400 text-red-800'
              }`}>
                {question.difficulty.toUpperCase()}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};