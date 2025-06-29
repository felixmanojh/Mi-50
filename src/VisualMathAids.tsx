import React from 'react';
import { motion } from 'framer-motion';

interface VisualMathAidsProps {
  number: number;
  type?: 'dots' | 'blocks' | 'fingers' | 'apples';
  color?: string;
  showLabel?: boolean;
}

const VisualMathAids: React.FC<VisualMathAidsProps> = ({ 
  number, 
  type = 'dots', 
  color = 'bg-blue-500',
  showLabel = true 
}) => {
  const renderDots = () => {
    const dots = [];
    const rows = Math.ceil(number / 5); // Max 5 dots per row
    
    for (let row = 0; row < rows; row++) {
      const dotsInRow = Math.min(5, number - row * 5);
      const rowDots = [];
      
      for (let i = 0; i < dotsInRow; i++) {
        rowDots.push(
          <motion.div
            key={`${row}-${i}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: (row * 5 + i) * 0.1, duration: 0.3 }}
            className={`w-6 h-6 rounded-full ${color} border-2 border-white shadow-md`}
          />
        );
      }
      
      dots.push(
        <div key={row} className="flex justify-center gap-2 mb-2">
          {rowDots}
        </div>
      );
    }
    
    return dots;
  };

  const renderBlocks = () => {
    const blocks = [];
    const rows = Math.ceil(number / 5);
    
    for (let row = 0; row < rows; row++) {
      const blocksInRow = Math.min(5, number - row * 5);
      const rowBlocks = [];
      
      for (let i = 0; i < blocksInRow; i++) {
        rowBlocks.push(
          <motion.div
            key={`${row}-${i}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: (row * 5 + i) * 0.1, duration: 0.4 }}
            className={`w-8 h-8 ${color} border-2 border-white shadow-lg rounded-sm`}
          />
        );
      }
      
      blocks.push(
        <div key={row} className="flex justify-center gap-1 mb-1">
          {rowBlocks}
        </div>
      );
    }
    
    return blocks;
  };

  const renderFingers = () => {
    const fingers = [];
    const hands = Math.ceil(number / 5);
    
    for (let hand = 0; hand < hands; hand++) {
      const fingersInHand = Math.min(5, number - hand * 5);
      const handFingers = [];
      
      for (let i = 0; i < fingersInHand; i++) {
        handFingers.push(
          <motion.div
            key={`${hand}-${i}`}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: (hand * 5 + i) * 0.1, duration: 0.3 }}
            className="text-2xl"
            style={{ transformOrigin: 'bottom' }}
          >
            ☝️
          </motion.div>
        );
      }
      
      // Add remaining fingers as closed fists
      for (let i = fingersInHand; i < 5; i++) {
        handFingers.push(
          <div key={`closed-${hand}-${i}`} className="text-2xl opacity-30">
            ✊
          </div>
        );
      }
      
      fingers.push(
        <div key={hand} className="flex justify-center gap-1 mb-2">
          {handFingers}
        </div>
      );
    }
    
    return fingers;
  };

  const renderApples = () => {
    const apples = [];
    const rows = Math.ceil(number / 5);
    
    for (let row = 0; row < rows; row++) {
      const applesInRow = Math.min(5, number - row * 5);
      const rowApples = [];
      
      for (let i = 0; i < applesInRow; i++) {
        rowApples.push(
          <motion.div
            key={`${row}-${i}`}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: (row * 5 + i) * 0.15, duration: 0.5 }}
            className="text-3xl"
          >
            🍎
          </motion.div>
        );
      }
      
      apples.push(
        <div key={row} className="flex justify-center gap-2 mb-2">
          {rowApples}
        </div>
      );
    }
    
    return apples;
  };

  const renderVisualAid = () => {
    switch (type) {
      case 'dots':
        return renderDots();
      case 'blocks':
        return renderBlocks();
      case 'fingers':
        return renderFingers();
      case 'apples':
        return renderApples();
      default:
        return renderDots();
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      {showLabel && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg font-bold text-gray-700 mb-3"
        >
          {number}
        </motion.div>
      )}
      
      <div className="bg-white bg-opacity-50 rounded-xl p-4 min-h-[100px] flex flex-col justify-center">
        {renderVisualAid()}
      </div>
    </div>
  );
};

// Component for showing math operations visually
interface VisualMathOperationProps {
  num1: number;
  num2: number;
  operation: '+' | '-';
  showResult?: boolean;
  result?: number;
}

export const VisualMathOperation: React.FC<VisualMathOperationProps> = ({
  num1,
  num2,
  operation,
  showResult = false,
  result
}) => {
  return (
    <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* First number */}
        <div className="text-center">
          <VisualMathAids number={num1} type="apples" color="bg-red-500" />
        </div>

        {/* Operation */}
        <div className="text-center">
          <div className="text-6xl font-bold text-purple-600 mb-4">
            {operation}
          </div>
          {operation === '+' && (
            <div className="text-lg text-gray-600">
              Add together!
            </div>
          )}
          {operation === '-' && (
            <div className="text-lg text-gray-600">
              Take away!
            </div>
          )}
        </div>

        {/* Second number */}
        <div className="text-center">
          <VisualMathAids 
            number={num2} 
            type="apples" 
            color={operation === '+' ? "bg-green-500" : "bg-red-300"}
          />
        </div>
      </div>

      {/* Result section */}
      {showResult && result !== undefined && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-6 pt-6 border-t-2 border-purple-300"
        >
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-4">=</div>
            <VisualMathAids number={result} type="apples" color="bg-yellow-500" />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-2xl font-bold text-green-600 mt-4"
            >
              Answer: {result}! 🎉
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default VisualMathAids;