# Mi-50 Game Design Document

## Game Overview
**Game Name:** Mi-50  
**Target Age:** 6-7 years old  
**Players:** 2-4 players  
**Genre:** Digital board game  
**Objective:** First player to land exactly on square 50 wins  

## Core Mechanics

### Basic Gameplay
- Players take turns rolling a dice (1-6)
- Move clockwise around the board based on dice roll
- Land on numbered squares (0-50) arranged in rows
- Special squares trigger various effects
- Must land exactly on square 50 to win

### Movement Rules
- **Starting Position:** Square 0
- **Winning Condition:** Land exactly on square 50
- **Illegal Moves:** If a move would take player above 50, they stay in current position
- **Below Zero:** If a move would take player below 0, they move to square 0
- **Turn Order:** Clearly indicated with player highlighting/caps

## Board Layout
**5 Rows of 10 squares each:**
- Row 1: Squares 1-10
- Row 2: Squares 11-20  
- Row 3: Squares 21-30
- Row 4: Squares 31-40
- Row 5: Squares 41-50

## Special Squares

### Row 1 (1-10)
- **Square 2:** Roll again
- **Square 3:** Skip turn
- **Square 4:** Go to start (square 0)
- **Square 5:** Trivia question
- **Square 7:** Lose turn
- **Square 8:** Move front 4
- **Square 9:** Lucky (roll again)
- **Square 10:** Move back 4

### Row 2 (11-20)
- **Square 12:** Empty (no special effect)
- **Square 14:** Free turn (roll again)
- **Square 16:** Move front 4
- **Square 19:** Steal next player's roll and move that amount

### Row 3 (21-30)
- **Square 21:** Move twice the rolled number
- **Square 22:** Move thrice the rolled number
- **Square 23:** Move backward the rolled number
- **Square 25:** Trivia question
- **Square 28:** Mirror move (copy next player's dice roll)

### Row 4 (31-40)
- **Square 34:** Move back 5
- **Square 35:** Move front 5
- **Square 38:** Roll again
- **Square 40:** Go to 13

### Row 5 (41-50)
- **Square 42:** Lose turn
- **Square 45:** Trivia question
- **Square 47:** Go to 27
- **Safe Squares (41, 43, 44, 46, 48, 49):** Regular squares with no special effects

## Special Mechanics

### Trivia System
- **Trigger:** Landing on squares 5, 25, or 45
- **Question Types:** Simple math problems suitable for 6-7 year olds
  - Addition: "What is 10 + 6?"
  - Subtraction: "What is 17 - 4?"
  - Similar difficulty level
- **Question Pool:** Large bank of questions to avoid repetition
- **Answering:** The game presents a question to the player
- **Correct Answer:** Player continues normally on next turn
- **Wrong Answer:** Player skips next turn

### Wait-and-Copy Mechanics
- **Square 19 (Steal):** Player waits for next player's turn, then steals their dice roll
- **Square 28 (Mirror):** Player waits for next player's turn, then copies their dice roll

## User Interface Requirements

### Visual Design
- **Theme:** Kid-friendly, colorful, engaging
- **Board:** Clear numbered squares in 5 rows
- **Players:** Distinct colored pieces/avatars
- **Turn Indicator:** Clear highlighting of current player (cap/border/glow)
- **Dice:** Large, animated dice roll
- **Numbers:** Big, easy-to-read fonts

### Interactive Elements
- **Roll Dice Button:** Large, prominent button
- **Player Movement:** Smooth animations
- **Special Square Effects:** Visual feedback when triggered
- **Trivia Pop-up:** Clear question display with answer input
- **Game Status:** Current turn, player positions visible

### Accessibility
- **Simple Controls:** One-click dice rolling
- **Clear Feedback:** Visual confirmation of moves and effects
- **Error Prevention:** Illegal moves automatically handled
- **Progress Indication:** Clear path to winning square

## Technical Specifications

### Platform
- **Type:** Web-based game (HTML/React)
- **Responsive:** Works on desktop and tablet
- **No Storage:** All game state in memory (no localStorage)

### Game State Management
- **Player Tracking:** Names, positions, turn order
- **Board State:** Current positions of all players
- **Special Effects:** Pending steal/mirror moves
- **Trivia System:** Question bank and scoring

### Performance Requirements
- **Smooth Animations:** 60fps movement
- **Quick Response:** Immediate feedback to user actions
- **Resource Efficient:** Optimized for kid devices

## Player Experience Goals

### Fun Factors
- **Surprise Elements:** Special squares create unexpected moments
- **Social Interaction:** Trivia questions involve other players
- **Fair Competition:** Balanced special effects
- **Achievement:** Clear progress toward winning

### Learning Outcomes
- **Math Skills:** Basic addition and subtraction practice
- **Strategy:** Planning moves and risk assessment
- **Social Skills:** Taking turns and fair play
- **Patience:** Waiting for turns and dealing with setbacks

## Development Priorities

### Must Have (MVP)
1. Basic board and player movement
2. Dice rolling mechanism
3. All special square effects
4. Trivia question system
5. Win condition detection

### Nice to Have
1. Sound effects
2. Player customization
3. Game statistics
4. Multiple themes

### Polish Features
1. Smooth animations
2. Particle effects on special squares
3. Victory celebrations
4. Background music

## Testing Considerations

### Kid-Friendly Testing
- **Intuitive Controls:** Can 6-year-old operate without help?
- **Clear Instructions:** Visual cues for game state
- **Error Recovery:** Graceful handling of mistakes
- **Engagement:** Maintains interest throughout game

### Edge Cases
- **Multiple Players on Same Square:** Visual handling
- **Illegal Moves:** Clear feedback and prevention
- **Game End States:** Proper win detection
- **Special Effect Chains:** Multiple effects in sequence