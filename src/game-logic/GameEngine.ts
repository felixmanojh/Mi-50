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

  static processSpecialSquare(
    gameState: GameState,
    position: number,
    playerId: number,
    playerDifficulty: { [playerId: number]: 'easy' | 'medium' | 'hard' }
  ): GameState {
    const special = specialSquares[position];
    if (!special) return gameState;

    const player = gameState.players[playerId];
    const playerPowerUps = gameState.playerPowerUps[playerId];

    // Check if player has shield and can block negative effects
    if (PowerUpManager.canUseShield(playerPowerUps, special.type)) {
      const updatedState = PowerUpManager.useShield(gameState, playerId);
      return {
        ...updatedState,
        notification: {
          message: `🛡️ ${player.name}'s shield blocked ${special.text}! Shield consumed!`,
          type: 'success'
        }
      };
    }

    let updatedState = { ...gameState };

    switch (special.type) {
      // Power-ups
      case 'power_up_star':
        updatedState = PowerUpManager.collectStar(updatedState, playerId);
        updatedState.notification = {
          message: `⭐ ${player.name} collected a star! (${updatedState.playerPowerUps[playerId].stars}/3)`,
          type: 'success'
        };
        break;

      case 'power_up_speed':
        updatedState = PowerUpManager.grantSpeedBoost(updatedState, playerId);
        updatedState.notification = {
          message: `💨 ${player.name} got a speed boost! Next roll +2 movement!`,
          type: 'special'
        };
        break;

      case 'power_up_shield':
        updatedState = PowerUpManager.grantShield(updatedState, playerId);
        updatedState.notification = {
          message: `🛡️ ${player.name} got a shield! Blocks next negative effect!`,
          type: 'special'
        };
        break;

      // Roll again squares
      case 'roll_again':
        updatedState.notification = {
          message: `🎲 Lucky! ${player.name} gets to roll again!`,
          type: 'success'
        };
        // Don't advance turn - player rolls again
        break;

      // Skip/lose turn
      case 'skip_turn':
      case 'lose_turn':
        player.skipNextTurn = true;
        updatedState.notification = {
          message: `⏭️ Oh no! ${player.name} will skip their next turn!`,
          type: 'warning'
        };
        break;

      // Teleport squares
      case 'go_to_start':
        updatedState.playerPositions = {
          ...updatedState.playerPositions,
          [playerId]: 0
        };
        updatedState.notification = {
          message: `↩️ ${player.name} goes back to START! 😱`,
          type: 'error'
        };
        break;

      case 'go_to_13':
        updatedState.playerPositions = {
          ...updatedState.playerPositions,
          [playerId]: 13
        };
        updatedState.notification = {
          message: `🌀 ${player.name} teleported to square 13!`,
          type: 'special'
        };
        break;

      case 'go_to_27':
        updatedState.playerPositions = {
          ...updatedState.playerPositions,
          [playerId]: 27
        };
        updatedState.notification = {
          message: `🌀 ${player.name} teleported to square 27!`,
          type: 'special'
        };
        break;

      // Movement modifiers
      case 'move_front_4':
        const newPosFront4 = Math.min(updatedState.playerPositions[playerId] + 4, 50);
        updatedState.playerPositions = {
          ...updatedState.playerPositions,
          [playerId]: newPosFront4
        };
        updatedState.notification = {
          message: `➡️ Bonus move! ${player.name} jumps forward 4 squares!`,
          type: 'success'
        };
        break;

      case 'move_back_4':
        const newPosBack4 = Math.max(updatedState.playerPositions[playerId] - 4, 0);
        updatedState.playerPositions = {
          ...updatedState.playerPositions,
          [playerId]: newPosBack4
        };
        updatedState.notification = {
          message: `⬅️ ${player.name} moves back 4 squares!`,
          type: 'warning'
        };
        break;

      case 'move_front_5':
        const newPosFront5 = Math.min(updatedState.playerPositions[playerId] + 5, 50);
        updatedState.playerPositions = {
          ...updatedState.playerPositions,
          [playerId]: newPosFront5
        };
        updatedState.notification = {
          message: `➡️ Super boost! ${player.name} jumps forward 5 squares!`,
          type: 'success'
        };
        break;

      case 'move_back_5':
        const newPosBack5 = Math.max(updatedState.playerPositions[playerId] - 5, 0);
        updatedState.playerPositions = {
          ...updatedState.playerPositions,
          [playerId]: newPosBack5
        };
        updatedState.notification = {
          message: `⬅️ ${player.name} moves back 5 squares!`,
          type: 'warning'
        };
        break;

      case 'move_double':
        const lastRoll = updatedState.lastRoll;
        const doubleMove = Math.min(updatedState.playerPositions[playerId] + lastRoll, 50);
        updatedState.playerPositions = {
          ...updatedState.playerPositions,
          [playerId]: doubleMove
        };
        updatedState.notification = {
          message: `⚡ ${player.name} moves DOUBLE the last roll (+${lastRoll})!`,
          type: 'special'
        };
        break;

      case 'move_triple':
        const tripleRoll = updatedState.lastRoll;
        const tripleMove = Math.min(updatedState.playerPositions[playerId] + (tripleRoll * 2), 50);
        updatedState.playerPositions = {
          ...updatedState.playerPositions,
          [playerId]: tripleMove
        };
        updatedState.notification = {
          message: `⚡⚡ ${player.name} moves TRIPLE the last roll (+${tripleRoll * 2})!`,
          type: 'special'
        };
        break;

      case 'move_backward':
        const backRoll = updatedState.lastRoll;
        const moveBack = Math.max(updatedState.playerPositions[playerId] - backRoll, 0);
        updatedState.playerPositions = {
          ...updatedState.playerPositions,
          [playerId]: moveBack
        };
        updatedState.notification = {
          message: `⬅️ ${player.name} moves backward by last roll (-${backRoll})!`,
          type: 'warning'
        };
        break;

      // Interactive squares
      case 'steal_move':
        updatedState.waitingForNextPlayer = {
          type: 'steal',
          playerId: playerId
        };
        updatedState.notification = {
          message: `🏴‍☠️ ${player.name} will steal the next player's roll!`,
          type: 'special'
        };
        break;

      case 'mirror_move':
        updatedState.waitingForNextPlayer = {
          type: 'mirror',
          playerId: playerId
        };
        updatedState.notification = {
          message: `🪞 ${player.name} will copy the next player's roll!`,
          type: 'special'
        };
        break;

      // Special rule square
      case 'roll_4_to_move':
        // This is handled in processPlayerMove, just notify
        updatedState.notification = {
          message: `🎯 ${player.name} is on the special square! Need to roll 4 to move!`,
          type: 'info'
        };
        break;

      // Trivia squares
      case 'trivia':
        return this.createTriviaChallenge(updatedState, playerId, playerDifficulty);

      default:
        break;
    }

    return updatedState;
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