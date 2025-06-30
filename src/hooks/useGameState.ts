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

  return {
    gameState,
    setGameState,
    updateGameState,
    resetGame,
    setupGame,
    addPlayer,
    startGameplay,
    nextTurn,
    showNotification
  };
};