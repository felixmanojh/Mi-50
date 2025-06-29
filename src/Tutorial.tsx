import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Play, X, RotateCcw, Brain, Dice1, Trophy } from 'lucide-react';

interface TutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  highlight?: string;
  icon: React.ReactNode;
  animation?: 'bounce' | 'pulse' | 'spin';
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Mi-50! 🎮',
    content: 'Hi there! I\'m here to help you learn how to play Mi-50. It\'s super fun and easy!',
    icon: <Play className="w-8 h-8" />,
    animation: 'bounce'
  },
  {
    id: 'objective',
    title: 'Your Mission! 🎯',
    content: 'Your goal is simple: be the FIRST player to land exactly on square 50! But there are fun surprises along the way!',
    icon: <Trophy className="w-8 h-8" />,
    animation: 'pulse'
  },
  {
    id: 'dice',
    title: 'Rolling the Dice 🎲',
    content: 'Click the big colorful dice button to roll! The number you get tells you how many spaces to move forward.',
    icon: <Dice1 className="w-8 h-8" />,
    animation: 'spin'
  },
  {
    id: 'movement',
    title: 'Moving Around the Board 🏃‍♂️',
    content: 'You move in a snake pattern - left to right on row 1, then right to left on row 2, and so on!',
    icon: <ArrowRight className="w-8 h-8" />,
    animation: 'bounce'
  },
  {
    id: 'special-squares',
    title: 'Special Squares! ✨',
    content: 'Look for colorful squares with icons! They have special powers like extra turns, jumps, and fun surprises!',
    icon: <RotateCcw className="w-8 h-8" />,
    animation: 'pulse'
  },
  {
    id: 'math-questions',
    title: 'Math Time! 🧠',
    content: 'Purple squares with brain icons ask you easy math questions. Get it right to keep playing!',
    icon: <Brain className="w-8 h-8" />,
    animation: 'bounce'
  },
  {
    id: 'winning',
    title: 'How to Win! 🏆',
    content: 'Land EXACTLY on square 50 to win! If you roll too high, you stay where you are and try again next turn.',
    icon: <Trophy className="w-8 h-8" />,
    animation: 'pulse'
  },
  {
    id: 'ready',
    title: 'You\'re Ready! 🎉',
    content: 'That\'s it! You\'re ready to play Mi-50! Remember: have fun, be kind to other players, and enjoy the adventure!',
    icon: <Play className="w-8 h-8" />,
    animation: 'bounce'
  }
];

const Tutorial: React.FC<TutorialProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showArrow, setShowArrow] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  useEffect(() => {
    // Animate arrow pointing
    const interval = setInterval(() => {
      setShowArrow(prev => !prev);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete();
    onClose();
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen) return null;

  const currentTutorialStep = tutorialSteps[currentStep];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 50 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-blue-600 text-white p-6 rounded-t-2xl relative">
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="text-center">
              <motion.div
                animate={
                  currentTutorialStep.animation === 'bounce' ? { y: [0, -10, 0] } :
                  currentTutorialStep.animation === 'pulse' ? { scale: [1, 1.1, 1] } :
                  currentTutorialStep.animation === 'spin' ? { rotate: 360 } : {}
                }
                transition={{ duration: 1, repeat: Infinity }}
                className="mb-4"
              >
                {currentTutorialStep.icon}
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">{currentTutorialStep.title}</h2>
              <div className="flex justify-center space-x-2">
                {tutorialSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentStep ? 'bg-white' : 'bg-white bg-opacity-40'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="text-center mb-8">
              <p className="text-lg leading-relaxed text-gray-700">
                {currentTutorialStep.content}
              </p>
            </div>

            {/* Interactive demonstration based on step */}
            <div className="mb-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
              {currentStep === 2 && (
                <div className="text-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-xl flex items-center gap-2 mx-auto"
                  >
                    <Dice1 className="w-8 h-8" />
                    Try clicking me!
                  </motion.button>
                  {showArrow && (
                    <motion.div
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="mt-4 text-4xl"
                    >
                      ⬆️
                    </motion.div>
                  )}
                </div>
              )}

              {currentStep === 3 && (
                <div className="grid grid-cols-5 gap-2 max-w-md mx-auto">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <motion.div
                      key={num}
                      animate={{ backgroundColor: ['#e5e7eb', '#8b5cf6', '#e5e7eb'] }}
                      transition={{ duration: 1, repeat: Infinity, delay: num * 0.2 }}
                      className="bg-gray-200 h-12 rounded flex items-center justify-center font-bold"
                    >
                      {num}
                    </motion.div>
                  ))}
                </div>
              )}

              {currentStep === 4 && (
                <div className="flex justify-center space-x-4">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="bg-green-500 text-white w-16 h-16 rounded-full flex items-center justify-center"
                  >
                    <Dice1 className="w-6 h-6" />
                  </motion.div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
                    className="bg-purple-500 text-white w-16 h-16 rounded-full flex items-center justify-center"
                  >
                    <Brain className="w-6 h-6" />
                  </motion.div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 1 }}
                    className="bg-red-500 text-white w-16 h-16 rounded-full flex items-center justify-center"
                  >
                    <ArrowRight className="w-6 h-6" />
                  </motion.div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="text-center">
                  <div className="text-4xl mb-4">🧠</div>
                  <div className="bg-white rounded-lg p-4 inline-block">
                    <p className="text-lg font-bold mb-2">What is 5 + 3?</p>
                    <div className="flex justify-center space-x-2">
                      {[6, 7, 8, 9].map((num) => (
                        <motion.button
                          key={num}
                          whileHover={{ scale: 1.1 }}
                          className={`w-12 h-12 rounded-full border-2 font-bold ${
                            num === 8 ? 'bg-green-500 text-white border-green-500' : 'border-gray-300'
                          }`}
                        >
                          {num}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 6 && (
                <div className="text-center">
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-6xl mb-4"
                  >
                    🏆
                  </motion.div>
                  <div className="bg-yellow-100 rounded-lg p-4 inline-block">
                    <p className="text-lg font-bold text-yellow-800">
                      Square 50 = Victory!
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-colors ${
                  currentStep === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
                Previous
              </button>

              <div className="text-sm text-gray-500">
                Step {currentStep + 1} of {tutorialSteps.length}
              </div>

              <motion.button
                onClick={nextStep}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white px-6 py-3 rounded-lg font-bold"
              >
                {currentStep === tutorialSteps.length - 1 ? 'Start Playing!' : 'Next'}
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Tutorial;