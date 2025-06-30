import { GameState, PowerUps } from '../types/GameTypes';

export class PowerUpManager {
  static applySpeedBoost(player: any, roll: number, playerPowerUps: PowerUps): { actualMovement: number; speedBoostUsed: boolean } {
    let actualMovement = roll;
    let speedBoostUsed = false;
    
    if (playerPowerUps.speedBoost) {
      actualMovement = roll + 2;
      speedBoostUsed = true;
    }
    
    return { actualMovement, speedBoostUsed };
  }

  static canUseShield(playerPowerUps: PowerUps, effectType: string): boolean {
    const negativeEffects = ['skip_turn', 'lose_turn', 'go_to_start', 'move_back_4', 'move_back_5', 'move_backward'];
    return negativeEffects.includes(effectType) && playerPowerUps.shield;
  }

  static useShield(gameState: GameState, playerId: number): GameState {
    return {
      ...gameState,
      playerPowerUps: {
        ...gameState.playerPowerUps,
        [playerId]: {
          ...gameState.playerPowerUps[playerId],
          shield: false
        }
      }
    };
  }

  static collectStar(gameState: GameState, playerId: number): GameState {
    return {
      ...gameState,
      playerPowerUps: {
        ...gameState.playerPowerUps,
        [playerId]: {
          ...gameState.playerPowerUps[playerId],
          stars: gameState.playerPowerUps[playerId].stars + 1
        }
      }
    };
  }

  static grantSpeedBoost(gameState: GameState, playerId: number): GameState {
    return {
      ...gameState,
      playerPowerUps: {
        ...gameState.playerPowerUps,
        [playerId]: {
          ...gameState.playerPowerUps[playerId],
          speedBoost: true
        }
      }
    };
  }

  static grantShield(gameState: GameState, playerId: number): GameState {
    return {
      ...gameState,
      playerPowerUps: {
        ...gameState.playerPowerUps,
        [playerId]: {
          ...gameState.playerPowerUps[playerId],
          shield: true
        }
      }
    };
  }

  static useStarsForExtraRoll(gameState: GameState, playerId: number): GameState {
    return {
      ...gameState,
      playerPowerUps: {
        ...gameState.playerPowerUps,
        [playerId]: {
          ...gameState.playerPowerUps[playerId],
          stars: gameState.playerPowerUps[playerId].stars - 3
        }
      }
    };
  }

  static clearSpeedBoost(gameState: GameState, playerId: number): GameState {
    return {
      ...gameState,
      playerPowerUps: {
        ...gameState.playerPowerUps,
        [playerId]: {
          ...gameState.playerPowerUps[playerId],
          speedBoost: false
        }
      }
    };
  }
}