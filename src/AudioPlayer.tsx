import React, { useRef, useEffect } from 'react';

interface AudioPlayerProps {
  src: string;
  loop?: boolean;
  autoPlay?: boolean;
  isMuted?: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, loop = false, autoPlay = true, isMuted = false }) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
      if (autoPlay) {
        audioRef.current.play().catch(error => {
          // Autoplay policy: browsers often block autoplay without user interaction.
          // This catch prevents an unhandled promise rejection.
          console.log('Autoplay prevented:', error.message);
        });
      }
    }
  }, [src, loop, autoPlay, isMuted]);

  return (
    <audio ref={audioRef} src={src} loop={loop} autoPlay={autoPlay} />
  );
};

export default AudioPlayer;
