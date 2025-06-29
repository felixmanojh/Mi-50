# Mi-50: The Digital Board Game

## Overview

Mi-50 is a digital board game designed for 2-4 players, targeting children aged 6-7. The objective is simple: be the first player to land exactly on square 50 to win!

This project is built as a web-based application, providing a fun and interactive experience with basic math learning outcomes.

## Features

-   **Dice Rolling:** Players take turns rolling a 6-sided dice to determine their movement.
-   **Player Movement:** Move clockwise around a 50-square board arranged in 5 rows of 10 squares.
-   **Special Squares:** Land on specific squares to trigger unique effects:
    -   Roll again / Free turn (squares 2, 9, 14, 38)
    -   Skip turn / Lose turn (squares 3, 7, 42)
    -   Go to start (square 4) / Jump to specific squares (13, 27)
    -   Move forward/backward a set number of spaces
    -   Move double/triple the rolled number (squares 21, 22)
    -   Move backward the rolled number (square 23)
    -   Special movement rules (square 32 requires rolling exactly 4 to move)
    -   **Trivia System:** Answer simple math questions (addition/subtraction) to continue or skip a turn.
    -   **Steal/Mirror Move:** Special squares that allow players to steal or copy the next player's dice roll.
-   **Win Condition:** Must land exactly on square 50.
-   **Safe Squares:** Squares 41, 43, 44, 46, 48, and 49 have no special effects.
-   **Visual Elements:** 
    -   Animated dice icons
    -   Monster character sprites for player avatars
    -   Board background image
    -   Player position indicators
-   **Audio:** Background music with mute toggle
-   **Responsive Design:** Works on desktop and tablet devices.

## Technologies Used

-   **Frontend:** React 19.1.0 (with TypeScript)
-   **Build Tool:** Vite 7.0.0
-   **Styling:** Tailwind CSS
-   **Animation:** Framer Motion 12.19.2
-   **Icons:** Lucide React 0.525.0
-   **Effects:** React Confetti 6.4.0 (for win celebration)
-   **Audio:** HTML5 `<audio>` element via a custom `AudioPlayer` component

## Setup & Installation (Local Development)

To get the Mi-50 game running on your local machine:

### Prerequisites

-   Node.js (LTS version recommended)
-   npm or Yarn (npm is included with Node.js)

### Steps

1.  **Clone the repository:**
    ```bash
    git clone <your-github-repo-url>
    cd mi50
    ```
    *(Replace `<your-github-repo-url>` with the actual URL of your GitHub repository.)*

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    The game should now be running at `http://localhost:5173` (or another port if 5173 is in use).

4.  **Build for production (optional):**
    ```bash
    npm run build
    # or
    yarn build
    ```
    This will create a `dist/` folder with the optimized production build.

5.  **Lint the code:**
    ```bash
    npm run lint
    ```

6.  **Format the code:**
    ```bash
    npm run format
    ```


## Project Structure

-   `src/`: Contains the main application source code.
    -   `src/main.tsx`: Entry point for the React application.
    -   `src/mi50_game.tsx`: The core game logic and main game component.
    -   `src/AudioPlayer.tsx`: Custom component for handling audio playback.
    -   `src/PlayerAvatar.tsx`: Component for positioning and displaying player avatars on the board.
    -   `src/constants.ts`: Defines various constants, including asset URLs.
-   `public/assets/`: Stores static assets like images and audio files.
    -   `public/assets/images/`: Game board background, monster sprites.
    -   `public/assets/audio/`: Background music, sound effects.
-   `vite.config.js`: Vite configuration file.
-   `package.json`: Project metadata and script definitions.
-   `mi50_game_design_doc.md`: Original game design document.
-   `ROADMAP.md`: Production readiness roadmap with planned enhancements.

## Deployment

This project is set up for continuous deployment using **DigitalOcean App Platform**. Once configured, any push to the `main` (or `master`) branch of the connected GitHub repository will automatically trigger a new build and deployment.

## Contributing

Contributions are welcome! Please feel free to open issues or submit pull requests.

## Game Rules & Special Squares

### Board Layout
The game board consists of 50 squares arranged in 5 rows:
- Row 1: Squares 1-10 (left to right)
- Row 2: Squares 11-20 (right to left - snake pattern)
- Row 3: Squares 21-30 (left to right)
- Row 4: Squares 31-40 (right to left)
- Row 5: Squares 41-50 (left to right)

### Special Square Effects
- **Trivia Squares (5, 25, 45):** Answer a math question correctly to continue, wrong answer skips next turn
- **Roll Again (2, 9, 14, 38):** Get another turn immediately
- **Skip/Lose Turn (3, 7, 42):** Skip your next turn
- **Movement Squares:**
  - Square 4: Go back to start (square 0)
  - Square 8, 16: Move forward 4 spaces
  - Square 10: Move back 4 spaces
  - Square 21: Move double your dice roll
  - Square 22: Move triple your dice roll
  - Square 23: Move backward by your dice roll amount
  - Square 32: Must roll exactly 4 to move from this square
  - Square 34: Move back 5 spaces
  - Square 35: Move forward 5 spaces
  - Square 40: Jump to square 13
  - Square 47: Jump to square 27
- **Special Actions:**
  - Square 19: Steal the next player's dice roll
  - Square 28: Mirror/copy the next player's dice roll

## Development Notes

- The game includes a mascot feature that displays helpful messages during gameplay
- Player avatars are positioned using a percentage-based coordinate system to work across different screen sizes
- The game handles edge cases like illegal moves (going past square 50) and boundary conditions
- Special animations are triggered for certain moves using Framer Motion

## License

This project is licensed under the ISC License. See the `LICENSE` file for details. (Note: A `LICENSE` file is not currently present in the repository and would need to be added.)
