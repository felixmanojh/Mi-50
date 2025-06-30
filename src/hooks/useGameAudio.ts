import { useState } from 'react';
import { useAudioPreloader } from '../AudioPreloader';
import { audioUrls } from '../constants';

export const useGameAudio = () => {
  const [isMuted, setIsMuted] = useState(false);
  const { playPreloadedSound, isLoading } = useAudioPreloader();

  const playSound = (soundKey: string, volume: number = 0.5) => {
    if (!isMuted) {
      // Map audioUrls to keys for preloaded audio
      const soundMap: { [key: string]: string } = {
        [audioUrls.diceRoll]: 'diceRoll',
        [audioUrls.playerMove]: 'playerMove',
        [audioUrls.specialSquare]: 'specialSquare',
        [audioUrls.victory]: 'victory',
        [audioUrls.buttonClick]: 'buttonClick',
        [audioUrls.correctAnswer]: 'correctAnswer',
        [audioUrls.wrongAnswer]: 'wrongAnswer'
      };
      
      const preloadedKey = soundMap[soundKey];
      if (preloadedKey) {
        playPreloadedSound(preloadedKey, volume);
      }
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return {
    isMuted,
    isLoading,
    playSound,
    toggleMute,
    setIsMuted
  };
};