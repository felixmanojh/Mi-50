import React from 'react';
import { motion } from 'framer-motion';
import { Dice1, Dice4, Brain, ArrowRight, ArrowLeft, RotateCcw, Zap } from 'lucide-react';

interface SpecialSquareIndicatorProps {
  position: number;
  type: string;
  icon: React.ReactNode;
}

const SpecialSquareIndicator: React.FC<SpecialSquareIndicatorProps> = ({ position, type, icon }) => {
  // Calculate position based on the same logic as PlayerAvatar
  const boardPositions: { [key: number]: { top: string; left: string } } = {};
  const numRows = 5;
  const squaresPerRow = 10;
  const verticalSpacing = 100 / numRows;
  const horizontalSpacing = 100 / squaresPerRow;

  // Position for Square 0 (Start)
  boardPositions[0] = { top: '95%', left: '5%' };

  for (let i = 1; i <= 50; i++) {
    const row = Math.ceil(i / squaresPerRow);
    const colInRow = i % squaresPerRow === 0 ? squaresPerRow : i % squaresPerRow;

    const topPercentage = (row - 1) * verticalSpacing + (verticalSpacing / 2);

    let leftPercentage;
    if (row % 2 === 1) {
      leftPercentage = (colInRow - 1) * horizontalSpacing + (horizontalSpacing / 2);
    } else {
      leftPercentage = 100 - ((colInRow - 1) * horizontalSpacing + (horizontalSpacing / 2));
    }

    boardPositions[i] = {
      top: `${topPercentage}%`,
      left: `${leftPercentage}%`,
    };
  }

  const style = boardPositions[position] || { top: '50%', left: '50%' };

  // Color scheme based on type
  const getColorScheme = (type: string) => {
    switch (type) {
      case 'trivia': return 'bg-purple-500 border-purple-300';
      case 'roll_again': return 'bg-green-500 border-green-300';
      case 'skip_turn':
      case 'lose_turn': return 'bg-red-500 border-red-300';
      case 'move_front_4':
      case 'move_front_5': return 'bg-blue-500 border-blue-300';
      case 'move_back_4':
      case 'move_back_5': return 'bg-orange-500 border-orange-300';
      case 'move_double':
      case 'move_triple': return 'bg-yellow-500 border-yellow-300';
      case 'steal_move':
      case 'mirror_move': return 'bg-pink-500 border-pink-300';
      default: return 'bg-gray-500 border-gray-300';
    }
  };

  return (
    <motion.div
      className={`absolute w-6 h-6 rounded-full flex items-center justify-center text-white text-xs border-2 ${getColorScheme(type)}`}
      style={{
        ...style,
        transform: 'translate(-50%, -150%)', // Position above the square
        zIndex: 5,
      }}
      initial={{ scale: 0, rotate: 0 }}
      animate={{ 
        scale: [0.8, 1.2, 1],
        rotate: [0, 360, 0]
      }}
      transition={{ 
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse"
      }}
      whileHover={{ scale: 1.5 }}
    >
      {icon}
    </motion.div>
  );
};

export default SpecialSquareIndicator;