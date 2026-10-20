import type { GameState, MathQuestion, Player, PowerUps } from '../types/GameTypes';
import { specialSquares, isNegativeEffect } from './SpecialSquares';
import { MathQuestionGenerator } from '../MathQuestionGenerator';

export type QuestionFactory = (playerId: number) => MathQuestion;

// All game transitions happen here. Dice and questions are injected so a whole
// paper-game match can be replayed deterministically in tests.
const defaultQuestionFactory: QuestionFactory = () =>
  new MathQuestionGenerator().generateQuestion('easy');

const clone = (state: GameState): GameState => ({
  ...state,
  players: state.players.map(player => ({ ...player })),
  playerPositions: { ...state.playerPositions },
  playerPowerUps: Object.fromEntries(
    Object.entries(state.playerPowerUps).map(([id, power]) => [id, { ...power }]),
  ),
  bonusRolls: { ...state.bonusRolls },
  waitingForNextPlayer: state.waitingForNextPlayer && { ...state.waitingForNextPlayer },
});

const message = (state: GameState, content: string, type: NonNullable<GameState['notification']>['type'] = 'info') => {
  state.notification = { message: content, type };
};

export const createGame = (players: Player[]): GameState => {
  if (players.length < 2 || players.length > 4 ||
      new Set(players.map(p => p.id)).size !== players.length) {
    throw new Error('MI-50 requires 2 to 4 distinct players');
  }
  const state: GameState = {
    players: players.map(p => ({ ...p, skipNextTurn: false })),
    currentPlayerIndex: 0,
    playerPositions: {},
    gamePhase: 'playing',
    lastRoll: 0,
    waitingForNextPlayer: null,
    triviaQuestion: null,
    triviaPlayer: null,
    winner: null,
    notification: null,
    numPlayers: players.length,
    selectedCharacters: players.map(p => p.character),
    playerPowerUps: {},
    bonusRolls: {},
  };
  players.forEach(p => {
    state.playerPositions[p.id] = 0;
    state.playerPowerUps[p.id] = { stars: 0, speedBoost: false, shield: false };
    state.bonusRolls[p.id] = 0;
  });
  message(state, `${players[0].name} goes first. Roll!`);
  return state;
};

export const emptyGame = (): GameState => ({
  players: [], currentPlayerIndex: 0, playerPositions: {}, gamePhase: 'setup',
  lastRoll: 0, waitingForNextPlayer: null, triviaQuestion: null, triviaPlayer: null,
  winner: null, notification: null, numPlayers: 0, selectedCharacters: [],
  playerPowerUps: {}, bonusRolls: {},
});

const finishAt = (state: GameState, playerId: number, position: number): boolean => {
  state.playerPositions[playerId] = position;
  if (position === 50) {
    state.winner = playerId;
    state.gamePhase = 'ended';
    message(state, `${state.players.find(p => p.id === playerId)?.name ?? 'Player'} wins MI-50!`, 'success');
    return true;
  }
  return false;
};

// One turn passes all pending skip penalties. Someone is always left active.
const advanceTurn = (state: GameState): void => {
  const currentId = state.players[state.currentPlayerIndex].id;
  if ((state.bonusRolls[currentId] ?? 0) > 0) {
    state.bonusRolls[currentId]--;
    message(state, `${state.players[state.currentPlayerIndex].name} gets a bonus roll!`, 'success');
    return;
  }
  const skipped: string[] = [];
  for (let n = 1; n <= state.players.length; n++) {
    const candidate = (state.currentPlayerIndex + n) % state.players.length;
    const player = state.players[candidate];
    if (player.skipNextTurn) {
      player.skipNextTurn = false;
      skipped.push(player.name);
      continue;
    }
    state.currentPlayerIndex = candidate;
    const skippedText = skipped.length ? `${skipped.join(', ')} missed a turn. ` : '';
    message(state, `${skippedText}${player.name}, roll!`);
    return;
  }
  // This cannot occur if penalties are single-use, but keep a safe fallback.
  state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
};

const move = (position: number, distance: number): number =>
  position + distance > 50 ? position : Math.max(0, position + distance);

const effectLanding = (
  state: GameState,
  playerId: number,
  roll: number,
  makeQuestion: QuestionFactory,
): void => {
  const visited = new Set<number>();
  // Board effects are resolved in order, including the landing square after a
  // jump, with a cycle guard. No new die is rolled during chained effects.
  for (let n = 0; n < 50 && state.gamePhase === 'playing'; n++) {
    const position = state.playerPositions[playerId];
    if (visited.has(position)) return;
    visited.add(position);
    const square = specialSquares[position];
    if (!square) return;
    const power = state.playerPowerUps[playerId];
    const effect = square.type;
    if (power.shield && isNegativeEffect(effect)) {
      power.shield = false;
      message(state, `Shield protected you on square ${position}!`, 'success');
      return;
    }
    let distance: number | null = null;
    let target: number | null = null;
    switch (effect) {
      case 'roll_again':
        state.bonusRolls[playerId] = (state.bonusRolls[playerId] ?? 0) + 1;
        message(state, `Square ${position}: another roll!`, 'success');
        return;
      case 'skip_turn':
      case 'lose_turn':
        state.players.find(p => p.id === playerId)!.skipNextTurn = true;
        message(state, `Square ${position}: miss your next turn.`, 'warning');
        return;
      case 'go_to_start': target = 0; break;
      case 'go_to_13': target = 13; break;
      case 'go_to_27': target = 27; break;
      case 'move_front_4': distance = 4; break;
      case 'move_back_4': distance = -4; break;
      case 'move_front_5': distance = 5; break;
      case 'move_back_5': distance = -5; break;
      case 'move_double': distance = roll * 2; break;
      case 'move_triple': distance = roll * 3; break;
      case 'move_backward': distance = -roll; break;
      case 'power_up_star':
        power.stars++;
        message(state, `Square ${position}: collected a star!`, 'success');
        return;
      case 'power_up_speed':
        power.speedBoost = true;
        message(state, `Square ${position}: speed +2 on your next roll!`, 'success');
        return;
      case 'power_up_shield':
        power.shield = true;
        message(state, `Square ${position}: gained a shield!`, 'success');
        return;
      case 'steal_move':
        state.waitingForNextPlayer = { type: 'steal', playerId };
        message(state, 'Steal: take the next opponent dice move!', 'special');
        return;
      case 'mirror_move':
        state.waitingForNextPlayer = { type: 'mirror', playerId };
        message(state, 'Mirror: copy the next opponent dice move!', 'special');
        return;
      case 'trivia':
        state.triviaPlayer = playerId;
        state.triviaQuestion = makeQuestion(playerId);
        state.gamePhase = 'trivia';
        message(state, 'Time for a maths question!', 'trivia');
        return;
      case 'roll_4_to_move': // Restriction applies to the next turn FROM square 32.
        message(state, 'Square 32: roll exactly 4 to escape!', 'warning');
        return;
      default: return;
    }
    const destination = target ?? move(position, distance!);
    // Exact 50 is required for ALL movement, not only the initial dice roll.
    if (destination === position) {
      message(state, 'You need an exact roll to reach 50.', 'warning');
      return;
    }
    if (finishAt(state, playerId, destination)) return;
    message(state, `Square ${position} sends you to ${destination}!`, 'special');
  }
};

// A copied or stolen die moves the beneficiary but does not retrigger another
// square. This avoids simultaneous maths prompts and recursive copy effects.
const echoMove = (state: GameState, beneficiaryId: number, roll: number): void => {
  const pos = state.playerPositions[beneficiaryId];
  const distance = roll + (state.playerPowerUps[beneficiaryId].speedBoost ? 2 : 0);
  const destination = move(pos, distance);
  if (destination !== pos) {
    state.playerPowerUps[beneficiaryId].speedBoost = false;
    finishAt(state, beneficiaryId, destination);
  }
};

export const applyRoll = (
  previous: GameState,
  roll: number,
  makeQuestion: QuestionFactory = defaultQuestionFactory,
): GameState => {
  if (!Number.isInteger(roll) || roll < 1 || roll > 6) throw new Error('Invalid six-sided roll');
  if (previous.gamePhase !== 'playing') return previous;
  const state = clone(previous);
  const current = state.players[state.currentPlayerIndex];
  const currentPos = state.playerPositions[current.id];
  state.lastRoll = roll;

  // Waiting transfer resolves only when a DIFFERENT player rolls.
  const pending = state.waitingForNextPlayer;
  if (pending && pending.playerId !== current.id) {
    state.waitingForNextPlayer = null;
    echoMove(state, pending.playerId, roll);
    if (state.gamePhase === 'ended') return state;
    if (pending.type === 'steal') {
      message(state, `${current.name} rolled ${roll}, but it was stolen!`, 'special');
      advanceTurn(state);
      return state;
    }
  }

  if (currentPos === 32 && roll !== 4) {
    message(state, `${current.name} needs a 4 to leave square 32.`, 'warning');
    advanceTurn(state);
    return state;
  }
  const power = state.playerPowerUps[current.id];
  const distance = roll + (power.speedBoost ? 2 : 0);
  const destination = move(currentPos, distance);
  if (destination === currentPos) {
    message(state, `Roll ${roll}: too far to reach 50. Stay on ${currentPos}.`, 'warning');
    advanceTurn(state);
    return state;
  }
  power.speedBoost = false;
  if (finishAt(state, current.id, destination)) return state;
  message(state, `${current.name} rolled ${roll} and reached ${destination}.`);
  effectLanding(state, current.id, roll, makeQuestion);
  if (state.gamePhase === 'playing') advanceTurn(state);
  return state;
};

export const answerQuestion = (previous: GameState, answer: string): GameState => {
  if (previous.gamePhase !== 'trivia' || previous.triviaQuestion == null ||
      previous.triviaPlayer == null) return previous;
  if (!/^[-+]?\d+$/.test(answer.trim())) return previous;
  const state = clone(previous);
  const correct = Number(answer) === state.triviaQuestion!.answer;
  const playerId = state.triviaPlayer!;
  state.gamePhase = 'playing';
  state.triviaQuestion = null;
  state.triviaPlayer = null;
  if (!correct) {
    state.players.find(p => p.id === playerId)!.skipNextTurn = true;
    message(state, 'Not quite! Miss your next turn.', 'warning');
  } else {
    message(state, 'Correct answer!', 'success');
  }
  advanceTurn(state);
  return state;
};

export const spendStars = (previous: GameState): GameState => {
  if (previous.gamePhase !== 'playing') return previous;
  const id = previous.players[previous.currentPlayerIndex].id;
  if ((previous.playerPowerUps[id]?.stars ?? 0) < 3) return previous;
  const state = clone(previous);
  state.playerPowerUps[id].stars -= 3;
  state.bonusRolls[id] = (state.bonusRolls[id] ?? 0) + 1;
  message(state, 'Three stars spent: bonus roll queued!', 'success');
  return state;
};
