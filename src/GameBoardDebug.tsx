import React from 'react';
import { boardLayout } from './boardLayout';

const GameBoardDebug = () => {
  return (
    <div className="p-8 bg-gray-100">
      <h2 className="text-2xl font-bold mb-4">Board Layout Debug View</h2>
      
      {/* Visual representation */}
      <div className="relative w-full max-w-4xl mx-auto aspect-video bg-white border-2 border-black">
        {boardLayout.map((pos, index) => (
          <div
            key={index}
            className="absolute w-8 h-8 border-2 border-red-500 bg-yellow-200 flex items-center justify-center text-xs font-bold"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            {index === 0 ? 'S' : index}
          </div>
        ))}
        
        {/* Row labels */}
        <div className="absolute -left-12 top-[5%] text-sm font-bold">Row 5</div>
        <div className="absolute -left-12 top-[25%] text-sm font-bold">Row 4</div>
        <div className="absolute -left-12 top-[45%] text-sm font-bold">Row 3</div>
        <div className="absolute -left-12 top-[65%] text-sm font-bold">Row 2</div>
        <div className="absolute -left-12 top-[85%] text-sm font-bold">Row 1</div>
      </div>
      
      {/* Data table */}
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-2">Position Data</h3>
        <div className="grid grid-cols-10 gap-2 text-xs">
          {Array.from({ length: 50 }, (_, i) => i + 1).map(num => {
            const pos = boardLayout[num];
            return (
              <div key={num} className="border p-2 bg-white">
                <div className="font-bold">#{num}</div>
                <div>x: {pos.x}%</div>
                <div>y: {pos.y}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GameBoardDebug;