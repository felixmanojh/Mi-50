import React from 'react';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react';

export class GameHelpers {
  static getDiceIcon(number: number): React.ReactElement {
    const icons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
    const DiceIcon = icons[number - 1];
    return React.createElement(DiceIcon, { className: "w-8 h-8" });
  }

  static rollDice(): number {
    return Math.floor(Math.random() * 6) + 1;
  }

  static movePlayer(playerId: number, newPosition: number): number {
    // Boundary checks
    if (newPosition < 0) newPosition = 0;
    if (newPosition > 50) return -1; // Illegal move indicator
    
    return newPosition;
  }

  static isWinningPosition(position: number): boolean {
    return position === 50;
  }

  static formatMoveText(roll: number, speedBoostUsed: boolean): string {
    return speedBoostUsed ? `${roll}+2 💨` : `${roll}`;
  }

  static createNotification(message: string, type: string = 'info') {
    return { message, type };
  }

  static getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }
}