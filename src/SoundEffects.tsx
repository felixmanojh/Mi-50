import { useEffect, useRef } from 'react';

interface SoundEffectsProps {
  soundUrl: string | null;
  play: boolean;
  volume?: number;
  onEnd?: () => void;
}

const SoundEffects: React.FC<SoundEffectsProps> = ({ soundUrl, play, volume = 0.5, onEnd }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (play && soundUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      
      audioRef.current = new Audio(soundUrl);
      audioRef.current.volume = volume;
      
      audioRef.current.play().catch(error => {
        console.log('Sound play prevented:', error.message);
      });

      if (onEnd) {
        audioRef.current.onended = onEnd;
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [play, soundUrl, volume, onEnd]);

  return null;
};

// Hook for playing sound effects
export const useSound = (isMuted: boolean = false) => {
  const playSound = (soundUrl: string, volume: number = 0.5) => {
    if (!isMuted) {
      const audio = new Audio(soundUrl);
      audio.volume = volume;
      audio.play().catch(error => {
        console.log('Sound play prevented:', error.message);
      });
    }
  };

  return playSound;
};

export default SoundEffects;