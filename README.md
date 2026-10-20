# Mi-50 Digital Board Game

A kid-friendly React-based digital board game where players race to reach square 50 through dice rolling, math challenges, and special square effects.

## 🎮 Game Features

- **2-4 Player Support**: Multiplayer game for families and friends
- **Interactive Board**: Dynamic winding path with 50 squares plus special effects
- **Math Learning**: Age-appropriate trivia questions with adaptive difficulty
- **Power-Up System**: Collect stars, speed boosts, and protective shields
- **Special Squares**: 20+ unique square effects including teleports, extra turns, and challenges
- **Character Selection**: Choose from 4 different monster avatars
- **Audio & Animations**: Engaging sound effects and smooth animations
- **Kid-Friendly UI**: Bright colors, large buttons, and clear feedback

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Visit `http://localhost:5173` to play the game.

## 🏗️ Architecture

Mi-50 uses a **modular architecture** with the orchestrator pattern:

### Project Structure
```
src/
├── mi50_game.tsx           # Main orchestrator (157 lines)
├── types/                  # TypeScript interfaces
├── hooks/                  # Custom React hooks
├── game-logic/             # Business logic classes
├── components/             # Reusable UI components
├── utils/                  # Helper functions
└── GameBoard.tsx           # Board visualization
```

### Key Design Principles
- **Separation of Concerns**: Business logic separate from UI
- **Type Safety**: Comprehensive TypeScript coverage
- **Reusability**: Modular components and hooks
- **Maintainability**: 90% code reduction from original monolithic design

## 🎯 Game Rules

### Objective
Be the first player to reach square 50!

### Board Layout
The game board consists of **5 rows of 10 squares each** (total 50 squares + start):
- **Row 1**: Squares 1-10 (left to right)
- **Row 2**: Squares 11-20 (right to left - snake pattern)
- **Row 3**: Squares 21-30 (left to right)
- **Row 4**: Squares 31-40 (right to left)
- **Row 5**: Squares 41-50 (left to right)

### Basic Gameplay
1. **Setup**: Choose 2-4 players and select monster characters
2. **Turns**: Roll dice to move around the board following the snake pattern
3. **Special Squares**: Land on colored squares for special effects
4. **Math Challenges**: Answer trivia questions to avoid penalties
5. **Power-ups**: Collect stars, speed boosts, and shields
6. **Victory**: First player to land exactly on square 50 wins

### Special Squares
- **🎲 Roll Again** (2, 9, 14, 38): Get an extra turn
- **⏭️ Skip Turn** (3, 7, 42): Miss your next turn
- **🧠 Trivia** (5, 25, 45): Answer math questions
- **⭐ Stars** (6, 26, 39): Collect for extra rolls (3 stars = 1 extra roll)
- **💨 Speed Boost** (12, 30): +2 movement on next roll
- **🛡️ Shield** (18, 37): Protection from negative effects
- **🏴‍☠️ Steal/🪞 Mirror** (19, 28): Steal or copy next player's roll
- **📍 Teleport Squares**: Jump to specific locations

### Power-Up System
- **Stars**: Collect 3 stars to unlock an extra dice roll
- **Speed Boost**: Add +2 to your next movement
- **Shield**: Protect against one negative square effect

## 🛠️ Development

### Adding New Features

#### New Special Square Effect
1. Add effect to `src/game-logic/SpecialSquares.ts`
2. Implement the rule in `src/game-logic/TurnRules.ts` and add a deterministic replay test
3. Update type definitions if needed

#### New UI Component
1. Create component in appropriate `src/components/` subdirectory
2. Import and use in relevant phase component
3. Add props interface for type safety

#### New Game Mechanic
1. Extend `GameState` interface in `src/types/GameTypes.ts`
2. Add logic to `src/game-logic/TurnRules.ts`
3. Update relevant hooks in `src/hooks/`

### Code Organization

- **Game Logic**: Core mechanics in `src/game-logic/`
- **State Management**: Custom hooks in `src/hooks/`
- **UI Components**: Organized by purpose in `src/components/`
- **Type Definitions**: All interfaces in `src/types/`
- **Utilities**: Helper functions in `src/utils/`

### File Modification Guide

| Change Type | Primary Files |
|-------------|---------------|
| Game Rules | `src/game-logic/TurnRules.ts` |
| Special Squares | `src/game-logic/SpecialSquares.ts` |
| UI Updates | `src/components/**/*.tsx` |
| State Changes | `src/hooks/useGameState.ts` |
| Types | `src/types/GameTypes.ts` |

## 🎨 Assets

All game assets are located in `public/assets/`:

- **Audio**: `audio/background_music.mp3`
- **Images**: 
  - `images/board_background.png` - Custom game board
  - `images/monster[1-4].png` - Player character avatars

Asset URLs are centralized in `src/constants.ts`.

## 🧪 Testing

Run `npm test` for 23 rule checks and 100 deterministic seeded full-match replays. The rule tests use Node assertions and compile the TypeScript rules via the esbuild dependency already supplied by Vite.

M0 CI also runs `npm run build`. See `docs/M0-ORIGINAL-RULES.md` for the original rules, photographed physical-game details and explicit provisional interpretations.

The project uses minimal tooling with:
- Vite for bundling and dev server
- TypeScript for type checking
- React 19 with modern hooks

## 📱 Browser Compatibility

- Modern browsers with ES2020+ support
- Responsive design for desktop and tablet
- Touch-friendly interface for mobile devices

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the modular architecture principles
4. Maintain TypeScript type safety
5. Test your changes thoroughly
6. Submit a pull request

## 📄 License

This project is open source and available under the ISC License.

## 🎯 Future Roadmap

- [ ] Unit testing framework
- [ ] ESLint and Prettier configuration
- [ ] Performance optimizations (React.memo, useMemo)
- [ ] Error boundaries for better error handling
- [ ] Game state persistence (localStorage)
- [ ] Multiplayer networking capabilities
- [ ] Additional character avatars
- [ ] Custom board themes
- [ ] Achievement system
- [ ] Sound effect customization

---

**Built with React 19, TypeScript, Framer Motion; legacy Tailwind styling still requires restoration before mobile release.**