
export const boardLayout = [
  // Special "Start" position at index 0, for initial player placement
  { x: 5, y: 95 },

  // Row 1: Squares 1-10 (bottom-left to bottom-right)
  { x: 5, y: 85 }, { x: 15, y: 85 }, { x: 25, y: 85 }, { x: 35, y: 85 }, { x: 45, y: 85 }, 
  { x: 55, y: 85 }, { x: 65, y: 85 }, { x: 75, y: 85 }, { x: 85, y: 85 }, { x: 95, y: 85 },

  // Row 2: Squares 11-20 (right to left)
  { x: 95, y: 65 }, { x: 85, y: 65 }, { x: 75, y: 65 }, { x: 65, y: 65 }, { x: 55, y: 65 }, 
  { x: 45, y: 65 }, { x: 35, y: 65 }, { x: 25, y: 65 }, { x: 15, y: 65 }, { x: 5, y: 65 },

  // Row 3: Squares 21-30 (left to right)
  { x: 5, y: 45 }, { x: 15, y: 45 }, { x: 25, y: 45 }, { x: 35, y: 45 }, { x: 45, y: 45 }, 
  { x: 55, y: 45 }, { x: 65, y: 45 }, { x: 75, y: 45 }, { x: 85, y: 45 }, { x: 95, y: 45 },

  // Row 4: Squares 31-40 (right to left)
  { x: 95, y: 25 }, { x: 85, y: 25 }, { x: 75, y: 25 }, { x: 65, y: 25 }, { x: 55, y: 25 }, 
  { x: 45, y: 25 }, { x: 35, y: 25 }, { x: 25, y: 25 }, { x: 15, y: 25 }, { x: 5, y: 25 },

  // Row 5: Squares 41-50 (top-left to top-right)
  { x: 5, y: 5 }, { x: 15, y: 5 }, { x: 25, y: 5 }, { x: 35, y: 5 }, { x: 45, y: 5 }, 
  { x: 55, y: 5 }, { x: 65, y: 5 }, { x: 75, y: 5 }, { x: 85, y: 5 }, { x: 95, y: 5 },
];
