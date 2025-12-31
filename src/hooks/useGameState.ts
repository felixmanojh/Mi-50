import { useState } from 'react';
import { GameState, Player } from '../types/GameTypes';
import { GameEngine } from '../game-logic/GameEngine';

const initialGameState: GameState = {
  players: [],
  currentPlayerIndex: 0,
  playerPositions: {},
  gamePhase: 'setup',
  lastRoll: 0,
  waitingForNextPlayer: null,
  triviaQuestion: null,
  triviaPlayer: null,
  winner: null,
  notification: null,
  numPlayers: 0,
  selectedCharacters: [],
  playerPowerUps: {}
};

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);

  const updateGameState = (updates: Partial<GameState>) => {
    setGameState(prev => ({ ...prev, ...updates }));
  };

  const resetGame = () => {
    setGameState(GameEngine.resetGame());
  };

  const setupGame = (numPlayers: number) => {
    setGameState(prev => ({
      ...prev,
      numPlayers,
      gamePhase: 'characterSelection',
      players: [],
      selectedCharacters: [],
      notification: { 
        message: `🎮 Time to choose your characters! Player 1, pick your monster! 👾`, 
        type: 'info' 
      }
    }));
  };

  const addPlayer = (player: Player) => {
    setGameState(prev => ({
      ...prev,
      players: [...prev.players, player],
      selectedCharacters: [...prev.selectedCharacters, player.character]
    }));
  };

  const startGameplay = (players: Player[]) => {
    const { positions, powerUps } = GameEngine.setupGame(players.length);
    
    setGameState(prev => ({
      ...prev,
      players,
      playerPositions: positions,
      playerPowerUps: powerUps,
      gamePhase: 'playing',
      notification: { 
        message: `🎮 ${players[0].name} goes first! Click the big dice to play! 🎲`, 
        type: 'info' 
      }
    }));
  };

  const nextTurn = () => {
    setGameState(prev => GameEngine.nextTurn(prev));
  };

  const showNotification = (message: string, type: string = 'info') => {
    setGameState(prev => ({
      ...prev,
      notification: { message, type: type as any }
    }));
  };

  const handleCharacterSelect = (characterIndex: number) => {
    const currentPlayerIndex = gameState.players.length;
    const playerColors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'];
    const playerNames = ['Player 1', 'Player 2', 'Player 3', 'Player 4'];
    
    const newPlayer: Player = {
      id: currentPlayerIndex,
      name: playerNames[currentPlayerIndex],
      color: playerColors[currentPlayerIndex],
      character: characterIndex,
      skipNextTurn: false
    };

    const updatedPlayers = [...gameState.players, newPlayer];
    const updatedSelectedCharacters = [...gameState.selectedCharacters, characterIndex];

    if (updatedPlayers.length === gameState.numPlayers) {
      // All players selected, start game
      startGameplay(updatedPlayers);
    } else {
      // Next player selects
      setGameState({
        ...gameState,
        players: updatedPlayers,
        selectedCharacters: updatedSelectedCharacters,
        notification: { 
          message: `🎮 ${playerNames[updatedPlayers.length]}, choose your monster! 👾`, 
          type: 'info' 
        }
      });
    }
  };

  const rollDice = (
    setIsRolling: (value: boolean) => void,
    triggerConfetti: () => void,
    playSound: (sound: string) => void,
    playerDifficulty: { [playerId: number]: 'easy' | 'medium' | 'hard' } = {}
  ) => {
    setGameState(prev => {
      if (prev.gamePhase !== 'playing') return prev;

      setIsRolling(true);
      playSound('/assets/audio/dice_roll.mp3');

      // Animate dice for 1 second before showing result
      const roll = GameEngine.rollDice();

      setTimeout(() => {
        setGameState(current => {
          const currentPlayer = current.players[current.currentPlayerIndex];
          const currentPos = current.playerPositions[currentPlayer.id];

          // Check skip turn
          if (currentPlayer.skipNextTurn) {
            currentPlayer.skipNextTurn = false;
            const nextPlayerIndex = (current.currentPlayerIndex + 1) % current.players.length;
            setIsRolling(false);
            return {
              ...current,
              currentPlayerIndex: nextPlayerIndex,
              notification: {
                message: `⏸️ ${currentPlayer.name} skipped their turn!`,
                type: 'warning'
              }
            };
          }

          // Process move with speed boost
          let stateAfterMove = GameEngine.processPlayerMove(current, roll);
          setIsRolling(false);

          // Check if move was illegal
          if (stateAfterMove.playerPositions[currentPlayer.id] === currentPos &&
              stateAfterMove.notification?.type === 'warning') {
            return stateAfterMove;
          }

          const newPos = stateAfterMove.playerPositions[currentPlayer.id];
          playSound('/assets/audio/player_move.mp3');

          // Check for win
          if (newPos === 50) {
            playSound('/assets/audio/victory.mp3');
            triggerConfetti();
            return {
              ...stateAfterMove,
              gamePhase: 'ended',
              winner: currentPlayer.id,
              notification: {
                message: `🏆 ${currentPlayer.name} WINS!`,
                type: 'success'
              }
            };
          }

          // Process special square effects
          let stateAfterSpecial = GameEngine.processSpecialSquare(
            stateAfterMove,
            newPos,
            currentPlayer.id,
            playerDifficulty
          );

          // Play special square sound if landed on one
          const special = require('../game-logic/SpecialSquares').specialSquares[newPos];
          if (special) {
            playSound('/assets/audio/special_square.mp3');
          }

          // Check if player gets to roll again
          const rollAgain = special?.type === 'roll_again';

          // If not rolling again, advance to next player
          if (!rollAgain && stateAfterSpecial.gamePhase !== 'trivia') {
            const nextPlayerIndex = (current.currentPlayerIndex + 1) % current.players.length;
            stateAfterSpecial = {
              ...stateAfterSpecial,
              currentPlayerIndex: nextPlayerIndex
            };
          }

          return stateAfterSpecial;
        });
      }, 1000);

      return prev; // Return unchanged state initially
    });
  };

  const handleTriviaAnswer = (answer: string, playSound: (sound: string) => void) => {
    setGameState(prev => {
      const isCorrect = parseInt(answer) === prev.triviaQuestion!.answer;
      const triviaPlayer = prev.players[prev.triviaPlayer!];

      if (isCorrect) {
        playSound('/assets/audio/correct_answer.mp3');

        // Return to playing phase with success message
        const nextPlayerIndex = (prev.currentPlayerIndex + 1) % prev.players.length;
        return {
          ...prev,
          gamePhase: 'playing',
          triviaQuestion: null,
          triviaPlayer: null,
          currentPlayerIndex: nextPlayerIndex,
          notification: {
            message: `🎉 Correct! ${triviaPlayer.name} answered correctly!`,
            type: 'success'
          }
        };
      } else {
        playSound('/assets/audio/wrong_answer.mp3');

        // Set skip turn for wrong answer
        triviaPlayer.skipNextTurn = true;
        const nextPlayerIndex = (prev.currentPlayerIndex + 1) % prev.players.length;

        return {
          ...prev,
          gamePhase: 'playing',
          triviaQuestion: null,
          triviaPlayer: null,
          currentPlayerIndex: nextPlayerIndex,
          notification: {
            message: `❌ Wrong answer! ${triviaPlayer.name} will skip their next turn!`,
            type: 'error'
          }
        };
      }
    });
  };

  const useStars = (playSound: (sound: string) => void) => {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const powerUps = gameState.playerPowerUps[currentPlayer.id];

    if (powerUps && powerUps.stars >= 3) {
      setGameState(prev => ({
        ...prev,
        playerPowerUps: {
          ...prev.playerPowerUps,
          [currentPlayer.id]: {
            ...prev.playerPowerUps[currentPlayer.id],
            stars: prev.playerPowerUps[currentPlayer.id].stars - 3
          }
        }
      }));

      showNotification(`⭐ ${currentPlayer.name} used 3 stars for an extra roll!`, 'success');
    }
  };

  return {
    gameState,
    setGameState,
    updateGameState,
    resetGame,
    setupGame,
    addPlayer,
    startGameplay,
    nextTurn,
    showNotification,
    handleCharacterSelect,
    rollDice,
    useStars,
    handleTriviaAnswer
  };
};