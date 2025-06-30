import React from 'react';
import { monsterSpriteUrls } from '../../constants';

interface MascotProps {
  message: string;
}

export const Mascot: React.FC<MascotProps> = ({ message }) => {
  return (
    <div className="fixed bottom-4 left-4 flex items-center">
      <img src={monsterSpriteUrls[0]} alt="Mascot" className="w-24 h-24" />
      <div className="bg-white p-4 rounded-lg shadow-lg ml-4">
        <p className="text-lg font-bold">{message}</p>
      </div>
    </div>
  );
};