# Mi-50: The Digital Board Game

## Overview

Mi-50 is a digital board game designed for 2-4 players, targeting children aged 6-7. The objective is simple: be the first player to land exactly on square 50 to win!

This project is built as a web-based application, providing a fun and interactive experience with basic math learning outcomes.

## Features

-   **Dice Rolling:** Players take turns rolling a 6-sided dice to determine their movement.
-   **Player Movement:** Move clockwise around a 50-square board.
-   **Special Squares:** Land on specific squares to trigger unique effects:
    -   Roll again / Free turn
    -   Skip turn / Lose turn
    -   Go to start / Jump to specific squares
    -   Move forward/backward a set number of spaces
    -   Move double/triple the rolled number
    -   **Trivia System:** Answer simple math questions (addition/subtraction) to continue or skip a turn.
    -   **Steal/Mirror Move:** Special squares that allow players to steal or copy the next player's dice roll.
-   **Win Condition:** Must land exactly on square 50.
-   **Responsive Design:** Works on desktop and tablet devices.
-   **Basic Audio:** Background music and sound effects (requires assets).

## Technologies Used

-   **Frontend:** React (with TypeScript)
-   **Build Tool:** Vite
-   **Styling:** Likely Tailwind CSS (inferred from class names in components)
-   **Icons:** Lucide React
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

## Project Structure

-   `src/`: Contains the main application source code.
    -   `src/main.tsx`: Entry point for the React application.
    -   `src/mi50_game.tsx`: The core game logic and main game component.
    -   `src/AudioPlayer.tsx`: Custom component for handling audio playback.
    -   `src/constants.ts`: Defines various constants, including asset URLs.
-   `assets/`: Stores static assets like images and audio files.
    -   `assets/images/`: Game board, monster sprites.
    -   `assets/audio/`: Background music, sound effects.
-   `public/`: (If present) Static assets served directly without processing by Vite.
-   `vite.config.js`: Vite configuration file.
-   `package.json`: Project metadata and script definitions.
-   `mi50_game_design_doc.md`: Original game design document.

## Deployment

This project is set up for continuous deployment using **DigitalOcean App Platform**. Once configured, any push to the `main` (or `master`) branch of the connected GitHub repository will automatically trigger a new build and deployment.

## Contributing

Contributions are welcome! Please feel free to open issues or submit pull requests.

## License

This project is licensed under the ISC License. See the `LICENSE` file for details. (Note: A `LICENSE` file is not currently present in the repository and would need to be added.)
