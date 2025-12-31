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
      className="relative mb-4 sm:mb-6 lg:mb-8 p-3 sm:p-6 rounded-2xl sm:rounded-3xl text-center font-black text-base sm:text-xl lg:text-2xl border-2 sm:border-4 lg:border-6 border-white shadow-2xl bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400 w-full max-w-4xl mx-auto"
      initial={{ scale: 0, rotate: 5 }}
      animate={{ scale: 1, rotate: 0 }}
      exit={{ scale: 0, rotate: -5 }}
      transition={{ type: "spring", stiffness: 200 }}
    >
      <div className="absolute -top-2 sm:-top-4 -left-2 sm:-left-4 w-8 h-8 sm:w-12 sm:h-12 bg-purple-400 rounded-full flex items-center justify-center text-base sm:text-2xl border-2 sm:border-4 border-white animate-bounce">
        📺
      </div>
      <div className="absolute -top-2 sm:-top-4 -right-2 sm:-right-4 w-8 h-8 sm:w-12 sm:h-12 bg-green-400 rounded-full flex items-center justify-center text-base sm:text-2xl border-2 sm:border-4 border-white animate-bounce delay-500">
        ✨
      </div>
      <div className="relative z-10 text-white drop-shadow-lg leading-tight sm:leading-normal px-8 sm:px-4">
        {notification.message}
      </div>
    </motion.div>
  );
};