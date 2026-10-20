import { useEffect, useRef, useState } from 'react';
import type { GameState, Player } from '../types/GameTypes';
import { GameEngine } from '../game-logic/GameEngine';
import { answerQuestion, applyRoll, createGame, emptyGame, spendStars } from '../game-logic/TurnRules';

// A synchronous state reference makes delayed dice animations safe: each roll
// resolves against the latest state, and reset/new-game invalidates old timers.
export const useGameState = () => {
  const [gameState, rawSetGameState] = useState<GameState>(emptyGame);
  const current = useRef(gameState);
  const rolling = useRef(false);
  const epoch = useRef(0);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => {
    epoch.current++;
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
  }, []);

  const replace = (next: GameState) => {
    current.current = next;
    rawSetGameState(next);
  };
  const change = (f: (state: GameState) => GameState) => replace(f(current.current));

  const resetGame = () => {
    epoch.current++;
    rolling.current = false;
    replace(emptyGame());
  };
  const setupGame = (numPlayers: number) => {
    if (![2, 3, 4].includes(numPlayers)) return;
    epoch.current++;
    rolling.current = false;
    replace({
      ...emptyGame(),
      numPlayers,
      gamePhase: 'characterSelection',
      notification: { message: 'Choose your monster!', type: 'info' },
    });
  };

  const handleCharacterSelect = (character: number) => {
    const state = current.current;
    if (state.gamePhase !== 'characterSelection' ||
        character < 0 || character > 3 ||
        state.selectedCharacters.includes(character) ||
        state.players.length >= state.numPlayers) return;
    const id = state.players.length;
    const names = ['Player 1', 'Player 2', 'Player 3', 'Player 4'];
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'];
    const player: Player = {
      id, name: names[id], color: colors[id], character, skipNextTurn: false,
    };
    const players = [...state.players, player];
    if (players.length === state.numPlayers) {
      replace(createGame(players));
    } else {
      replace({
        ...state,
        players,
        selectedCharacters: [...state.selectedCharacters, character],
        notification: { message: `${names[players.length]}, pick your monster!`, type: 'info' },
      });
    }
  };

  const rollDice = (
    setIsRolling: (rolling: boolean) => void,
    triggerConfetti: () => void,
    playSound: (file: string) => void,
  ) => {
    if (rolling.current || current.current.gamePhase !== 'playing') return;
    rolling.current = true;
    const started = epoch.current;
    const roll = GameEngine.rollDice();
    setIsRolling(true);
    playSound('/assets/audio/dice_roll.mp3');
    const id = setTimeout(() => {
      if (epoch.current !== started) return;
      const next = applyRoll(current.current, roll);
      replace(next);
      rolling.current = false;
      setIsRolling(false);
      if (next.gamePhase === 'ended') {
        playSound('/assets/audio/victory.mp3');
        triggerConfetti();
      } else {
        playSound('/assets/audio/player_move.mp3');
      }
    }, 650);
    timeouts.current.push(id);
  };

  const handleTriviaAnswer = (answer: string) => {
    if (rolling.current) return;
    change(state => answerQuestion(state, answer));
  };

  const useStars = (_playSound: (file: string) => void) => {
    if (!rolling.current) change(spendStars);
  };

  return {
    gameState, resetGame, setupGame, handleCharacterSelect,
    rollDice, handleTriviaAnswer, useStars,
  };
};
