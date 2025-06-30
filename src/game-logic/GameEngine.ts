import { GameState, Player } from '../types/GameTypes';
import { specialSquares, isSafeSquare } from './SpecialSquares';
import { PowerUpManager } from './PowerUps';
import { MathQuestionGenerator } from '../MathQuestionGenerator';

export class GameEngine {
  private static mathGenerator = new MathQuestionGenerator();

  static rollDice(): number {
    return Math.floor(Math.random() * 6) + 1;
  }

  static movePlayer(playerId: number, newPosition: number): number {
    // Boundary checks
    if (newPosition < 0) newPosition = 0;
    if (newPosition > 50) return -1; // Illegal move indicator
    
    return newPosition;
  }

  static setupGame(numPlayers: number): { positions: { [key: number]: number }, powerUps: { [key: number]: any } } {
    const positions: { [key: number]: number } = {};
    const powerUps: { [key: number]: any } = {};
    
    for (let i = 0; i < numPlayers; i++) {
      positions[i] = 0;
      powerUps[i] = { stars: 0, speedBoost: false, shield: false };
    }
    
    return { positions, powerUps };
  }

  static nextTurn(gameState: GameState): GameState {
    const nextPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    const nextPlayer = gameState.players[nextPlayerIndex];
    
    return {
      ...gameState,
      currentPlayerIndex: nextPlayerIndex,
      notification: { 
        message: `🎮 ${nextPlayer.name}'s turn! Roll the dice to move.`, 
        type: 'info' 
      }
    };
  }

  static handleWaitingPlayerMove(gameState: GameState, roll: number): GameState {
    const waitingPlayerId = gameState.waitingForNextPlayer!.playerId;
    const waitingPlayerName = gameState.players[waitingPlayerId].name;
    const currentPos = gameState.playerPositions[waitingPlayerId];
    const newPos = this.movePlayer(waitingPlayerId, currentPos + roll);
    
    let notificationMessage = '';
    if (gameState.waitingForNextPlayer!.type === 'steal') {
      notificationMessage = `🏴‍☠️ ${waitingPlayerName} stole the roll of ${roll}! (${currentPos} → ${newPos})`;
    } else { // mirror
      notificationMessage = `🪞 ${waitingPlayerName} copied the roll of ${roll}! (${currentPos} → ${newPos})`;
    }
    
    const updatedState = {
      ...gameState,
      playerPositions: { ...gameState.playerPositions, [waitingPlayerId]: newPos },
      waitingForNextPlayer: null,
      lastRoll: roll,
      notification: { message: notificationMessage, type: 'special' as const }
    };
    
    // Check for win
    if (newPos === 50) {
      return {
        ...updatedState,
        gamePhase: 'ended' as const,
        winner: waitingPlayerId
      };
    }
    
    return updatedState;
  }

  static processPlayerMove(gameState: GameState, roll: number): GameState {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const currentPos = gameState.playerPositions[currentPlayer.id];
    
    // Check if player is on square 32 (roll 4 to move)
    if (currentPos === 32 && roll !== 4) {
      return {
        ...gameState,
        lastRoll: roll,
        notification: { 
          message: `🎯 ${currentPlayer.name} rolled ${roll} but needs a 4! Try again next turn! 🎲`, 
          type: 'warning' 
        }
      };
    }
    
    // Apply speed boost if player has it
    const playerPowerUps = gameState.playerPowerUps[currentPlayer.id] || { stars: 0, speedBoost: false, shield: false };
    const { actualMovement, speedBoostUsed } = PowerUpManager.applySpeedBoost(currentPlayer, roll, playerPowerUps);
    
    const newPos = this.movePlayer(currentPlayer.id, currentPos + actualMovement);
    
    // Check if move is legal
    if (newPos === -1 || newPos > 50) {
      const moveText = speedBoostUsed ? `${roll}+2 (speed boost)` : `${roll}`;
      return {
        ...gameState,
        lastRoll: roll,
        notification: { 
          message: `🚫 Oops! ${currentPlayer.name} rolled ${moveText} but that's too far! Stay at ${currentPos}! 🎯`, 
          type: 'warning' 
        }
      };
    }

    // Show basic move notification with power-up info
    const moveText = speedBoostUsed ? `${roll}+2 💨` : `${roll}`;
    const boostText = speedBoostUsed ? ' (Speed Boost used!)' : '';
    
    let updatedState = {
      ...gameState,
      playerPositions: { ...gameState.playerPositions, [currentPlayer.id]: newPos },
      lastRoll: roll,
      notification: { 
        message: `🎲 ${currentPlayer.name} rolled a ${moveText}! Moving to square ${newPos}!${boostText} 🎯`, 
        type: 'info' as const 
      }
    };

    // Clear speed boost if used
    if (speedBoostUsed) {
      updatedState = PowerUpManager.clearSpeedBoost(updatedState, currentPlayer.id);
    }

    // Check for win
    if (newPos === 50) {
      return {
        ...updatedState,
        gamePhase: 'ended' as const,
        winner: currentPlayer.id
      };
    }

    return updatedState;
  }

  static handleSkipTurn(gameState: GameState): GameState {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    currentPlayer.skipNextTurn = false;
    
    return {
      ...gameState,
      notification: { 
        message: `😔 ${currentPlayer.name} skipped their turn!`, 
        type: 'info' 
      }
    };
  }

  static checkSafeSquare(gameState: GameState, position: number): GameState {
    if (isSafeSquare(position)) {
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];
      return {
        ...gameState,
        notification: { 
          message: `🛡️ Safe spot! ${currentPlayer.name} is protected here! 🏆`, 
          type: 'success' 
        }
      };
    }
    return gameState;
  }

  static createTriviaChallenge(gameState: GameState, playerId: number, playerDifficulty: { [playerId: number]: 'easy' | 'medium' | 'hard' }): GameState {
    const playerName = gameState.players[playerId].name;
    const difficulty = playerDifficulty[playerId] || 'easy';
    
    // Generate themed question for more engagement
    const themes = ['animals', 'toys', 'food', 'nature'] as const;
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    const randomQuestion = Math.random() < 0.7 
      ? this.mathGenerator.generateThemedQuestion(randomTheme, difficulty)
      : this.mathGenerator.generateQuestion(difficulty);
      
    return {
      ...gameState,
      gamePhase: 'trivia',
      triviaQuestion: randomQuestion,
      triviaPlayer: playerId,
      notification: { 
        message: `🧠 Math time! ${playerName}, can you solve this? 🤔`, 
        type: 'trivia' 
      }
    };
  }

  static resetGame(): GameState {
    return {
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
  }
}