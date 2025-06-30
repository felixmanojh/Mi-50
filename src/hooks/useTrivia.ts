import { useState } from 'react';
import { MathQuestionGenerator } from '../MathQuestionGenerator';
import { GameState } from '../types/GameTypes';

export const useTrivia = () => {
  const [showTutorial, setShowTutorial] = useState(false);
  const [mathGenerator] = useState(() => new MathQuestionGenerator());
  const [playerDifficulty, setPlayerDifficulty] = useState<{ [playerId: number]: 'easy' | 'medium' | 'hard' }>({});

  const updatePlayerDifficulty = (playerId: number, difficulty: 'easy' | 'medium' | 'hard') => {
    setPlayerDifficulty(prev => ({
      ...prev,
      [playerId]: difficulty
    }));
  };

  const adjustDifficultyOnAnswer = (playerId: number, isCorrect: boolean) => {
    const currentDifficulty = playerDifficulty[playerId] || 'easy';
    let newDifficulty = currentDifficulty;
    
    if (isCorrect) {
      // Increase difficulty after correct answers (randomly)
      if (Math.random() < 0.3 && currentDifficulty === 'easy') {
        newDifficulty = 'medium';
      } else if (Math.random() < 0.2 && currentDifficulty === 'medium') {
        newDifficulty = 'hard';
      }
    } else {
      // Decrease difficulty after wrong answer
      if (currentDifficulty === 'hard') {
        newDifficulty = 'medium';
      } else if (currentDifficulty === 'medium') {
        newDifficulty = 'easy';
      }
    }
    
    updatePlayerDifficulty(playerId, newDifficulty);
    return newDifficulty;
  };

  const generateQuestion = (difficulty: 'easy' | 'medium' | 'hard' = 'easy') => {
    return mathGenerator.generateQuestion(difficulty);
  };

  const generateThemedQuestion = (theme: 'animals' | 'toys' | 'food' | 'nature', difficulty: 'easy' | 'medium' | 'hard' = 'easy') => {
    return mathGenerator.generateThemedQuestion(theme, difficulty);
  };

  const handleTriviaAnswer = (gameState: GameState, answer: string): { 
    isCorrect: boolean, 
    newDifficulty: string,
    shouldSkipTurn: boolean 
  } => {
    const isCorrect = parseInt(answer) === gameState.triviaQuestion!.answer;
    const playerId = gameState.triviaPlayer!;
    const newDifficulty = adjustDifficultyOnAnswer(playerId, isCorrect);
    
    return {
      isCorrect,
      newDifficulty,
      shouldSkipTurn: !isCorrect
    };
  };

  return {
    showTutorial,
    setShowTutorial,
    playerDifficulty,
    updatePlayerDifficulty,
    adjustDifficultyOnAnswer,
    generateQuestion,
    generateThemedQuestion,
    handleTriviaAnswer,
    mathGenerator
  };
};