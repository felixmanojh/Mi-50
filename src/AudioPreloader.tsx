import React, { useEffect, useState, useContext, createContext } from 'react';
import { audioUrls } from './constants';

interface AudioContextType {
  preloadedAudio: { [key: string]: HTMLAudioElement };
  isLoading: boolean;
  loadProgress: number;
  playPreloadedSound: (soundKey: string, volume?: number) => void;
}

const AudioContext = createContext<AudioContextType>({
  preloadedAudio: {},
  isLoading: true,
  loadProgress: 0,
  playPreloadedSound: () => {}
});

interface AudioPreloaderProps {
  children: React.ReactNode;
}

export const AudioPreloader: React.FC<AudioPreloaderProps> = ({ children }) => {
  const [preloadedAudio, setPreloadedAudio] = useState<{ [key: string]: HTMLAudioElement }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  useEffect(() => {
    const loadAudio = async () => {
      const audioKeys = Object.keys(audioUrls);
      const audioObjects: { [key: string]: HTMLAudioElement } = {};
      let loadedCount = 0;

      const updateProgress = () => {
        loadedCount++;
        setLoadProgress((loadedCount / audioKeys.length) * 100);
        
        if (loadedCount === audioKeys.length) {
          setIsLoading(false);
        }
      };

      // Preload all audio files
      audioKeys.forEach((key) => {
        const audio = new Audio(audioUrls[key as keyof typeof audioUrls]);
        
        // Set up event listeners
        audio.addEventListener('canplaythrough', updateProgress, { once: true });
        audio.addEventListener('error', () => {
          console.warn(`Failed to load audio: ${key}`);
          updateProgress(); // Still count as "loaded" to prevent hanging
        }, { once: true });

        // Configure audio settings
        audio.preload = 'auto';
        audio.volume = 0.5;
        
        audioObjects[key] = audio;
      });

      setPreloadedAudio(audioObjects);
    };

    loadAudio();
  }, []);

  const playPreloadedSound = (soundKey: string, volume: number = 0.5) => {
    const audio = preloadedAudio[soundKey];
    if (audio) {
      // Clone the audio to allow overlapping sounds
      const audioClone = audio.cloneNode() as HTMLAudioElement;
      audioClone.volume = volume;
      audioClone.currentTime = 0;
      
      audioClone.play().catch(error => {
        console.log(`Sound play prevented for ${soundKey}:`, error.message);
      });
    }
  };

  const contextValue: AudioContextType = {
    preloadedAudio,
    isLoading,
    loadProgress,
    playPreloadedSound
  };

  return (
    <AudioContext.Provider value={contextValue}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudioPreloader = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudioPreloader must be used within AudioPreloader');
  }
  return context;
};

// Loading screen component
export const AudioLoadingScreen: React.FC = () => {
  const { isLoading, loadProgress } = useAudioPreloader();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
        <div className="mb-6">
          <div className="text-6xl mb-4">🎵</div>
          <h2 className="text-2xl font-bold text-purple-600 mb-2">Loading Game Sounds...</h2>
          <p className="text-gray-600">Getting your audio ready for an amazing experience!</p>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
          <div 
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-4 rounded-full transition-all duration-300"
            style={{ width: `${loadProgress}%` }}
          ></div>
        </div>
        
        <div className="text-sm text-gray-500">
          {Math.round(loadProgress)}% Complete
        </div>
        
        {/* Animated music notes */}
        <div className="flex justify-center mt-4 space-x-2">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="text-2xl animate-bounce"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              🎵
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};