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

Mi-50 is a React-based digital board game with a **monolithic component architecture**. The entire game logic resides in a single component (`src/mi50_game.tsx`) for simplicity.

### Core Game State Structure

The game uses a centralized state object in `Mi50Game` component:
```typescript
{
  players: [],              // Player objects with id, name, color, skipNextTurn
  currentPlayerIndex: 0,    // Tracks whose turn it is
  playerPositions: {},      // Maps player id to board position (0-50)
  gamePhase: 'setup',       // 'setup' | 'playing' | 'trivia' | 'ended'
  lastRoll: 0,              // Last dice roll value
  waitingForNextPlayer: null, // For steal/mirror mechanics
  triviaQuestion: null,     // Current math question
  triviaPlayer: null,       // Player answering trivia
  winner: null,             // Winner player id
  notification: null        // UI feedback messages
}
```

### Game Flow Phases

1. **Setup**: Player count selection (2-4 players)
2. **Playing**: Main game loop - dice rolling, movement, special squares
3. **Trivia**: Math question overlay when landing on trivia squares
4. **Ended**: Winner celebration screen

### Special Squares System

Special squares are defined in a configuration object mapping positions to effects. Key types:
- Roll again (immediate extra turn)
- Skip/lose turn (sets `skipNextTurn` flag)
- Movement modifiers (double, triple, backward)
- Position jumps (go to start, jump to specific squares)
- Steal/mirror mechanics (deferred actions waiting for next player)
- Trivia challenges (math questions from predefined pool)

Square 32 has unique logic: requires rolling exactly 4 to move.

### Component Interactions

```
Mi50Game (main controller)
├── Mascot (internal - UI feedback)
├── PlayerAvatar (positions players on board)
└── AudioPlayer (background music)
```

`PlayerAvatar` calculates board positions using percentage-based positioning for a snake-pattern layout (alternating left-to-right and right-to-left rows).

### Asset Organization

All assets are in `public/assets/`:
- `audio/background_music.mp3`
- `images/board_background.png`
- `images/monster[1-4].png`

URLs are centralized in `src/constants.ts`.

### Key Implementation Details

1. **Turn Management**: Uses `setTimeout` for delayed state transitions and better UX
2. **Movement Validation**: Prevents moves past square 50 (must land exactly)
3. **Animation**: Framer Motion for special effects and player movement
4. **Board Layout**: 5 rows of 10 squares in snake pattern
5. **Safe Squares**: Squares 41, 43, 44, 46, 48, 49 have no special effects

### Missing Infrastructure

The project currently lacks:
- Testing framework
- Linting/formatting tools
- TypeScript config file (relies on Vite defaults)
- Error boundaries
- State persistence
- Multiplayer/networking capabilities

### Development Tips

- All game logic is in `mi50_game.tsx` - start there for any gameplay changes
- Special square effects are handled in `handleSpecialSquare()` function
- Dice roll logic includes validation for illegal moves
- Player positions use 0-based indexing (0 = start, 50 = win)
- The notification system provides all user feedback via `showNotification()`