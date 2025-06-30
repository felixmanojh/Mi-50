import React from 'react';
import { motion } from 'framer-motion';
import { GameState } from '../../types/GameTypes';

interface NotificationBannerProps {
  notification: GameState['notification'];
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({ notification }) => {
  if (!notification) return null;

  return (
    <motion.div 
      className="relative mb-8 p-6 rounded-3xl text-center font-black text-2xl border-6 border-white shadow-2xl bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400 w-full max-w-4xl"
      initial={{ scale: 0, rotate: 5 }}
      animate={{ scale: 1, rotate: 0 }}
      exit={{ scale: 0, rotate: -5 }}
      transition={{ type: "spring", stiffness: 200 }}
    >
      <div className="absolute -top-4 -left-4 w-12 h-12 bg-purple-400 rounded-full flex items-center justify-center text-2xl border-4 border-white animate-bounce">
        📺
      </div>
      <div className="absolute -top-4 -right-4 w-12 h-12 bg-green-400 rounded-full flex items-center justify-center text-2xl border-4 border-white animate-bounce delay-500">
        ✨
      </div>
      <div className="relative z-10 text-white drop-shadow-lg">
        {notification.message}
      </div>
    </motion.div>
  );
};