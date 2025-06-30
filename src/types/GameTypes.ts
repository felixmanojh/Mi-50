export interface Player {
  id: number;
  name: string;
  color: string;
  character: number;
  skipNextTurn: boolean;
}

export interface PowerUps {
  stars: number;
  speedBoost: boolean;
  shield: boolean;
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  playerPositions: { [playerId: number]: number };
  gamePhase: 'setup' | 'characterSelection' | 'playing' | 'trivia' | 'ended';
  lastRoll: number;
  waitingForNextPlayer: {
    type: 'steal' | 'mirror';
    playerId: number;
  } | null;
  triviaQuestion: MathQuestion | null;
  triviaPlayer: number | null;
  winner: number | null;
  notification: {
    message: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'special' | 'trivia';
  } | null;
  numPlayers: number;
  selectedCharacters: number[];
  playerPowerUps: { [playerId: number]: PowerUps };
}

export interface MathQuestion {
  question: string;
  answer: number;
  num1: number;
  num2: number;
  operation: '+' | '-';
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface SpecialSquare {
  type: string;
  text: string;
  icon: string;
}

export interface GameProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  playSound: (soundKey: string, volume?: number) => void;
  triggerConfetti: () => void;
  triggerSquareAnimation: (squareNumber: number) => void;
  showNotification: (message: string, type?: string) => void;
}

export type GamePhase = GameState['gamePhase'];
export type NotificationType = GameState['notification']['type'];