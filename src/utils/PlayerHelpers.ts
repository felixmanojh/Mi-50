import { Player, PowerUps } from '../types/GameTypes';

export class PlayerHelpers {
  static readonly playerColors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'];
  static readonly playerNames = ['Player 1', 'Player 2', 'Player 3', 'Player 4'];

  static createPlayer(id: number, characterIndex: number): Player {
    return {
      id,
      name: this.playerNames[id],
      color: this.playerColors[id],
      character: characterIndex,
      skipNextTurn: false
    };
  }

  static createInitialPowerUps(): PowerUps {
    return {
      stars: 0,
      speedBoost: false,
      shield: false
    };
  }

  static setupPlayers(numPlayers: number): { 
    positions: { [key: number]: number }, 
    powerUps: { [key: number]: PowerUps } 
  } {
    const positions: { [key: number]: number } = {};
    const powerUps: { [key: number]: PowerUps } = {};
    
    for (let i = 0; i < numPlayers; i++) {
      positions[i] = 0;
      powerUps[i] = this.createInitialPowerUps();
    }
    
    return { positions, powerUps };
  }

  static getPlayerById(players: Player[], id: number): Player | undefined {
    return players.find(player => player.id === id);
  }

  static getCurrentPlayer(players: Player[], currentPlayerIndex: number): Player {
    return players[currentPlayerIndex];
  }

  static getNextPlayerIndex(currentIndex: number, totalPlayers: number): number {
    return (currentIndex + 1) % totalPlayers;
  }

  static hasEnoughStarsForExtraRoll(playerPowerUps: PowerUps): boolean {
    return playerPowerUps.stars >= 3;
  }

  static canUseSpeedBoost(playerPowerUps: PowerUps): boolean {
    return playerPowerUps.speedBoost;
  }

  static canUseShield(playerPowerUps: PowerUps): boolean {
    return playerPowerUps.shield;
  }

  static formatPowerUpDisplay(powerUps: PowerUps): string[] {
    const display: string[] = [];
    
    if (powerUps.stars > 0) {
      display.push(`⭐ ${powerUps.stars}/3`);
    }
    
    if (powerUps.speedBoost) {
      display.push('💨 Speed +2');
    }
    
    if (powerUps.shield) {
      display.push('🛡️ Protected');
    }
    
    return display;
  }

  static getPlayerColor(index: number): string {
    return this.playerColors[index] || this.playerColors[0];
  }

  static getPlayerName(index: number): string {
    return this.playerNames[index] || `Player ${index + 1}`;
  }
}