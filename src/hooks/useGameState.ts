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

  const rollDice = (setIsRolling: (value: boolean) => void, triggerConfetti: () => void, playSound: (sound: string) => void) => {
    // This will be implemented with GameEngine logic
    setIsRolling(true);
    const roll = GameEngine.rollDice();
    
    setGameState(prev => ({
      ...prev,
      lastRoll: roll
    }));
    
    setTimeout(() => {
      setIsRolling(false);
      // Additional game logic would go here
    }, 1000);
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
    useStars
  };
};