import React from 'react';

interface PlayerAvatarProps {
  player: {
    id: number;
    name: string;
    color: string;
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

  // Position for Square 0 (Start) - typically off the main grid or a dedicated start point
  boardPositions[0] = { top: '95%', left: '5%' }; // Example: bottom-left corner

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
      className={`absolute w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${player.color}`}
      style={{
        ...style,
        transform: 'translate(-50%, -50%)',
        zIndex: 10 + player.id, // Stack players if on same square
      }}
    >
      {player.name[0]}
    </div>
  );
};

export default PlayerAvatar;
