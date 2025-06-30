import { useState } from 'react';

export const useGameAnimations = () => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [animatingSquare, setAnimatingSquare] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [specialAnimation, setSpecialAnimation] = useState<any>(null);

  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000); // Hide confetti after 3 seconds
  };

  const triggerSquareAnimation = (squareNumber: number) => {
    setAnimatingSquare(squareNumber);
    setTimeout(() => setAnimatingSquare(null), 2000); // Stop animation after 2 seconds
  };

  const startDiceRoll = () => {
    setIsRolling(true);
  };

  const stopDiceRoll = () => {
    setIsRolling(false);
  };

  const setSpecialAnimationState = (animation: any) => {
    setSpecialAnimation(animation);
  };

  const clearAnimations = () => {
    setShowConfetti(false);
    setAnimatingSquare(null);
    setIsRolling(false);
    setSpecialAnimation(null);
  };

  return {
    showConfetti,
    animatingSquare,
    isRolling,
    specialAnimation,
    triggerConfetti,
    triggerSquareAnimation,
    startDiceRoll,
    stopDiceRoll,
    setSpecialAnimationState,
    clearAnimations
  };
};