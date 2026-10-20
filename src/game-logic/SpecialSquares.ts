import { SpecialSquare } from '../types/GameTypes';

export const specialSquares: { [key: number]: SpecialSquare } = {
  2: { type: 'roll_again', text: 'Roll Again!', icon: '🎲' },
  3: { type: 'skip_turn', text: 'Skip Turn', icon: '⏭️' },
  4: { type: 'go_to_start', text: 'Go to Start', icon: '↩️' },
  5: { type: 'trivia', text: 'Trivia', icon: '🧠' },
  6: { type: 'power_up_star', text: '⭐ Star!', icon: '⭐' },
  7: { type: 'lose_turn', text: 'Lose Turn', icon: '⏭️' },
  8: { type: 'move_front_4', text: 'Move +4', icon: '➡️' },
  9: { type: 'roll_again', text: 'Lucky!', icon: '⚡' },
  10: { type: 'move_back_4', text: 'Move -4', icon: '⬅️' },
  12: { type: 'power_up_speed', text: '💨 Speed!', icon: '💨' },
  14: { type: 'roll_again', text: 'Free Turn', icon: '🎲' },
  16: { type: 'move_front_4', text: 'Move +4', icon: '➡️' },
  18: { type: 'power_up_shield', text: '🛡️ Shield!', icon: '🛡️' },
  19: { type: 'steal_move', text: 'Steal Move', icon: '⚡' },
  21: { type: 'move_double', text: 'Move x2', icon: '⚡' },
  22: { type: 'move_triple', text: 'Move x3', icon: '⚡' },
  23: { type: 'move_backward', text: 'Move Back', icon: '⬅️' },
  25: { type: 'trivia', text: 'Trivia', icon: '🧠' },
  26: { type: 'power_up_star', text: '⭐ Star!', icon: '⭐' },
  28: { type: 'mirror_move', text: 'Mirror Move', icon: '⚡' },
  30: { type: 'power_up_speed', text: '💨 Speed!', icon: '💨' },
  32: { type: 'roll_4_to_move', text: 'Roll 4 to Move', icon: '🎯' },
  34: { type: 'move_back_5', text: 'Move -5', icon: '⬅️' },
  35: { type: 'move_front_5', text: 'Move +5', icon: '➡️' },
  37: { type: 'power_up_shield', text: '🛡️ Shield!', icon: '🛡️' },
  38: { type: 'roll_again', text: 'Roll Again', icon: '🎲' },
  39: { type: 'power_up_star', text: '⭐ Star!', icon: '⭐' },
  40: { type: 'go_to_13', text: 'Go to 13', icon: '↩️' },
  42: { type: 'lose_turn', text: 'Lose Turn', icon: '⏭️' },
  45: { type: 'trivia', text: 'Trivia', icon: '🧠' },
  47: { type: 'go_to_27', text: 'Go to 27', icon: '↩️' }
};

export const isNegativeEffect = (effectType: string): boolean => {
  const negativeEffects = ['skip_turn', 'lose_turn', 'go_to_start', 'go_to_13', 'go_to_27', 'move_back_4', 'move_back_5', 'move_backward'];
  return negativeEffects.includes(effectType);
};

export const isSafeSquare = (position: number): boolean => {
  return [41, 43, 44, 46, 48, 49].includes(position);
};