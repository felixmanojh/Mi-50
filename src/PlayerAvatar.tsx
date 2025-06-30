import React from 'react';
import { monsterSpriteUrls } from './constants';

interface PlayerAvatarProps {
  player: {
    id: number;
    name: string;
    color: string;
    character?: number;
  };
  position: number;
}

const PlayerAvatar: React.FC<PlayerAvatarProps> = ({ player, position }) => {
  // You'll need to implement the logic to position the avatar correctly on your board.
  // This is a placeholder for now.
  const boardPositions: { [key: number]: { top: string; left: string } } = {};
  const numRows = 5;
  const squaresPerRow = 10;
  const verticalSpacing = 100 / numRows; // Percentage of height per row
  const horizontalSpacing = 100 / squaresPerRow; // Percentage of width per column

  // Position for Square 0 (Start) - positioned at the start square
  boardPositions[0] = { top: '95%', left: '50%' }; // Bottom center where START square is

  for (let i = 1; i <= 50; i++) {
    const row = Math.ceil(i / squaresPerRow); // Current row (1-indexed)
    const colInRow = i % squaresPerRow === 0 ? squaresPerRow : i % squaresPerRow; // Current column within the row (1-indexed)

    // Calculate vertical position (top) - center of the row
    const topPercentage = (row - 1) * verticalSpacing + (verticalSpacing / 2);

    let leftPercentage;
    if (row % 2 === 1) { // Odd rows (1, 3, 5): Left to Right
      leftPercentage = (colInRow - 1) * horizontalSpacing + (horizontalSpacing / 2);
    } else { // Even rows (2, 4): Right to Left (reversed column order)
      leftPercentage = 100 - ((colInRow - 1) * horizontalSpacing + (horizontalSpacing / 2));
    }

    boardPositions[i] = {
      top: `${topPercentage}%`,
      left: `${leftPercentage}%`,
    };
  }

  // Fallback for positions not explicitly defined (shouldn't happen for 0-50)
  const defaultPosition = { top: '50%', left: '50%' };

  const style = boardPositions[position] || { top: '50%', left: '50%' }; // Fallback

  return (
    <div
      className="absolute"
      style={{
        ...style,
        transform: 'translate(-50%, -50%)',
        zIndex: 10 + player.id, // Stack players if on same square
      }}
    >
      {player.character !== undefined ? (
        <img
          src={monsterSpriteUrls[player.character]}
          alt={`${player.name}'s character`}
          className="w-16 h-16 rounded-full shadow-lg border-4 border-white"
        />
      ) : (
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg border-2 border-white ${player.color}`}>
          {player.name[0]}
        </div>
      )}
    </div>
  );
};

export default PlayerAvatar;
