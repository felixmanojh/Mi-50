# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm install         # Install dependencies
npm run dev         # Start Vite dev server (http://localhost:5173)
npm run build       # Build production bundle to dist/
```

Note: No test or lint commands are configured. The project uses minimal tooling.

## Architecture Overview

Mi-50 is a React-based digital board game with a **modular component architecture**. The game follows the orchestrator pattern with clean separation of concerns.

### Project Structure

```
src/
├── mi50_game.tsx           # Main orchestrator component (157 lines)
├── constants.ts            # Asset URLs and configuration
├── types/                  # Type definitions
│   ├── GameTypes.ts        # Core game interfaces
│   └── UITypes.ts          # UI-related types
├── hooks/                  # Custom React hooks
│   ├── useGameState.ts     # Game state management
│   ├── useGameAudio.ts     # Audio handling
│   ├── useGameAnimations.ts # Animation state
│   └── useTrivia.ts        # Trivia system
├── game-logic/             # Business logic classes
│   ├── GameEngine.ts       # Core game mechanics
│   ├── SpecialSquares.ts   # Special square configuration
│   └── PowerUps.ts         # Power-up system
├── components/             # Reusable UI components
│   ├── game-phases/        # Phase-specific screens
│   │   ├── SetupScreen.tsx
│   │   ├── CharacterSelection.tsx
│   │   ├── TriviaScreen.tsx
│   │   └── VictoryScreen.tsx
│   ├── game-ui/            # Game interface components
│   │   ├── GameHeader.tsx
│   │   ├── GameControls.tsx
│   │   ├── PlayerStatusCards.tsx
│   │   └── NotificationBanner.tsx
│   └── shared/             # Shared components
│       └── Mascot.tsx
├── utils/                  # Helper functions
│   ├── GameHelpers.ts      # Game utility functions
│   ├── PlayerHelpers.ts    # Player-related utilities
│   └── AnimationHelpers.ts # Animation utilities
└── GameBoard.tsx           # Board visualization component
```

### Core Game State Structure

The game state is managed centrally via the `useGameState` hook:
```typescript
interface GameState {
  players: Player[];                    // Player objects with id, name, color, character
  currentPlayerIndex: number;           // Tracks whose turn it is
  playerPositions: { [id: number]: number }; // Maps player id to board position (0-50)
  gamePhase: 'setup' | 'characterSelection' | 'playing' | 'trivia' | 'ended';
  lastRoll: number;                     // Last dice roll value
  waitingForNextPlayer: {               // For steal/mirror mechanics
    type: 'steal' | 'mirror';
    playerId: number;
  } | null;
  triviaQuestion: MathQuestion | null;  // Current math question
  triviaPlayer: number | null;          // Player answering trivia
  winner: number | null;                // Winner player id
  notification: {                       // UI feedback messages
    message: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'special' | 'trivia';
  } | null;
  numPlayers: number;                   // Number of players in game
  selectedCharacters: number[];         // Track taken character slots
  playerPowerUps: { [id: number]: PowerUps }; // Power-up tracking
}
```

### Game Flow Phases

1. **Setup**: Player count selection (2-4 players)
2. **Character Selection**: Monster avatar selection
3. **Playing**: Main game loop - dice rolling, movement, special squares
4. **Trivia**: Math question overlay when landing on trivia squares
5. **Ended**: Winner celebration screen

### Modular Components

#### Custom Hooks
- **`useGameState`**: Centralized game state management and core game functions
- **`useGameAudio`**: Audio playback, muting, and sound effect management
- **`useGameAnimations`**: Animation state (confetti, rolling dice, special effects)
- **`useTrivia`**: Math question generation and trivia handling logic

#### Game Logic Classes
- **`GameEngine`**: Core game mechanics, move validation, turn management
- **`SpecialSquares`**: Configuration and effects of special board squares
- **`PowerUps`**: Star collection, speed boost, shield management

#### UI Components
- **Phase Components**: Screen-specific UI for each game phase
- **Game UI**: Reusable interface elements (controls, status, notifications)
- **Shared**: Common components used across multiple phases

### Special Squares System

Special squares are defined in `src/game-logic/SpecialSquares.ts` mapping positions to effects:
- **Roll again** (squares 2, 9, 14, 38): Immediate extra turn
- **Skip/lose turn** (squares 3, 7, 42): Sets `skipNextTurn` flag
- **Movement modifiers**: Double (21), triple (22), backward (23)
- **Position jumps**: Go to start (4), teleport to specific squares (40→13, 47→27)
- **Power-ups**: Stars (6, 26, 39), speed boost (12, 30), shield (18, 37)
- **Interactive**: Steal move (19), mirror move (28)
- **Trivia challenges** (squares 5, 25, 45): Math questions

**Special Rules:**
- Square 32: Requires rolling exactly 4 to move
- Safe squares (41, 43, 44, 46, 48, 49): No special effects
- Power-ups: 3 stars = extra roll, speed boost = +2 movement, shield = protection from negative effects

### Component Architecture

```
Mi50Game (orchestrator - 157 lines)
├── GameHeader (mute toggle)
├── SetupScreen (player count selection)
├── CharacterSelection (monster avatar selection)
├── GameControls (dice, power-up buttons)
├── GameBoard (board visualization with players)
├── PlayerStatusCards (player status grid)
├── TriviaScreen (math question overlay)
├── VictoryScreen (celebration screen)
├── NotificationBanner (user feedback)
└── Mascot (contextual messages)
```

### Board Layout System

The game uses a dynamic winding path layout:
- **File**: `src/boardLayout.ts` - Defines percentage-based positioning
- **Structure**: 5 rows of 10 squares each (total 50 squares + start position)
  - Row 1: Squares 1-10 (left to right)
  - Row 2: Squares 11-20 (right to left - snake pattern)
  - Row 3: Squares 21-30 (left to right)
  - Row 4: Squares 31-40 (right to left)
  - Row 5: Squares 41-50 (left to right)
- **Pattern**: Snake/winding path alternating direction each row
- **Visualization**: `src/GameBoard.tsx` handles rendering and player positioning
- **Background**: Custom board image with 50 numbered squares plus start position

### Asset Organization

All assets are in `public/assets/`:
- `audio/background_music.mp3`
- `images/board_background.png`
- `images/monster[1-4].png`

URLs are centralized in `src/constants.ts`.

### Key Implementation Details

1. **Orchestrator Pattern**: Main component delegates functionality to specialized hooks and components
2. **Type Safety**: Comprehensive TypeScript interfaces for all game entities
3. **State Management**: Centralized state with custom hooks for different concerns
4. **Turn Management**: Uses `setTimeout` for delayed state transitions and better UX
5. **Movement Validation**: Prevents moves past square 50 (must land exactly)
6. **Animation**: Framer Motion for special effects, player movement, and celebrations
7. **Audio System**: Preloaded audio with sound mapping and mute functionality
8. **Power-up System**: Stars, speed boosts, and shields with visual feedback
9. **Safe Squares**: Protected positions with no negative effects

### Development Guidelines

#### Adding New Features
1. **Game Logic**: Add to appropriate class in `src/game-logic/`
2. **UI Components**: Create in relevant `src/components/` subdirectory
3. **State Changes**: Extend interfaces in `src/types/GameTypes.ts`
4. **Hooks**: Add custom hooks in `src/hooks/` for complex state logic

#### File Modification Priorities
- **Core Logic**: `src/game-logic/GameEngine.ts`
- **Special Squares**: `src/game-logic/SpecialSquares.ts`
- **Main Component**: `src/mi50_game.tsx` (orchestrator only)
- **State Management**: `src/hooks/useGameState.ts`

#### Code Organization Principles
- **Separation of Concerns**: Business logic separate from UI components
- **Single Responsibility**: Each hook/component has one clear purpose
- **Type Safety**: All interfaces defined before implementation
- **Reusability**: Components designed for potential reuse

### Missing Infrastructure

The project currently lacks:
- Testing framework
- Linting/formatting tools
- TypeScript config file (relies on Vite defaults)
- Error boundaries
- State persistence
- Multiplayer/networking capabilities
- Performance optimization (React.memo, useMemo)

### Development Tips

- **Game Logic Changes**: Start with `src/game-logic/GameEngine.ts`
- **New Special Squares**: Update `src/game-logic/SpecialSquares.ts`
- **UI Modifications**: Modify components in `src/components/`
- **State Updates**: Use hooks in `src/hooks/` for state management
- **Player positions**: 0-based indexing (0 = start, 50 = win)
- **Audio**: All sounds centralized in `useGameAudio` hook
- **Animations**: Managed via `useGameAnimations` hook
- **Notifications**: User feedback via centralized notification system

### Architecture Benefits

1. **Maintainability**: 90% code reduction in main component (1,546 → 157 lines)
2. **Scalability**: Easy to add new features without affecting existing code
3. **Testability**: Isolated business logic can be unit tested
4. **Reusability**: Components and hooks can be reused across features
5. **Type Safety**: Comprehensive TypeScript coverage prevents runtime errors
6. **Performance**: Modular structure enables optimization opportunities