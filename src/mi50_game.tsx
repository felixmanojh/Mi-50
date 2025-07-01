import React from 'react';
import Confetti from 'react-confetti';
import { useAudioPreloader, AudioLoadingScreen } from './AudioPreloader';
import GameBoard from './GameBoard';
import Tutorial from './Tutorial';

// Import modularized components and hooks
import { useGameState } from './hooks/useGameState';
import { useGameAudio } from './hooks/useGameAudio';
import { useGameAnimations } from './hooks/useGameAnimations';
import { useTrivia } from './hooks/useTrivia';

// Import UI components
import { SetupScreen } from './components/game-phases/SetupScreen';
import { CharacterSelection } from './components/game-phases/CharacterSelection';
import { TriviaScreen } from './components/game-phases/TriviaScreen';
import { VictoryScreen } from './components/game-phases/VictoryScreen';
import { GameHeader } from './components/game-ui/GameHeader';
import { NotificationBanner } from './components/game-ui/NotificationBanner';
import { GameControls } from './components/game-ui/GameControls';
import { PlayerStatusCards } from './components/game-ui/PlayerStatusCards';
import { Mascot } from './components/shared/Mascot';

// Import types and data
import { GameState } from './types/GameTypes';
import { audioUrls } from './constants';
import { specialSquares } from './game-logic/SpecialSquares';

const Mi50Game = () => {
  const { playPreloadedSound, isLoading } = useAudioPreloader();
  
  // Use modularized hooks for game functionality
  const { gameState, setupGame, resetGame, showNotification, handleCharacterSelect, rollDice, useStars } = useGameState();
  const { isMuted, playSound, toggleMute } = useGameAudio(playPreloadedSound);
  const { showConfetti, isRolling, specialAnimation, animatingSquare, triggerConfetti, setIsRolling, setSpecialAnimation, setAnimatingSquare } = useGameAnimations();
  const { showTutorial, setShowTutorial, triviaHandlers } = useTrivia(gameState, playSound);
  
  // Get current player
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  // Show loading screen while audio loads
  if (isLoading) {
    return <AudioLoadingScreen />;
  }

  // Render different phases based on game state
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-4 overflow-x-hidden">
      {/* Game Header - always visible */}
      <GameHeader isMuted={isMuted} onToggleMute={toggleMute} />
      
      {/* Phase-based rendering */}
      {gameState.gamePhase === 'setup' && (
        <SetupScreen 
          onStartGame={setupGame}
          onShowTutorial={() => setShowTutorial(true)}
          playSound={playSound}
          audioUrls={audioUrls}
        />
      )}

      {gameState.gamePhase === 'characterSelection' && (
        <CharacterSelection
          gameState={gameState}
          onCharacterSelect={handleCharacterSelect}
          playSound={playSound}
          audioUrls={audioUrls}
          playerNames={['Player 1', 'Player 2', 'Player 3', 'Player 4']}
        />
      )}

      {gameState.gamePhase === 'playing' && (
        <div className="max-w-7xl mx-auto">
          <NotificationBanner notification={gameState.notification} />
          
          <GameControls
            currentPlayer={currentPlayer}
            gameState={gameState}
            isRolling={isRolling}
            onRoll={() => rollDice(setIsRolling, triggerConfetti, playSound)}
            onUseStars={() => useStars(playSound)}
          />
          
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            <div className="xl:col-span-3">
              <GameBoard
                players={gameState.players}
                playerPositions={gameState.playerPositions}
                specialSquares={specialSquares}
                animatingSquare={animatingSquare}
              />
            </div>
            
            <div className="xl:col-span-1">
              <PlayerStatusCards gameState={gameState} />
              
              {gameState.waitingForNextPlayer && (
                <div className="mt-6 p-6 bg-gradient-to-r from-yellow-300 to-orange-400 border-4 border-white rounded-2xl text-center shadow-xl">
                  <div className="font-black text-2xl text-white drop-shadow-lg">
                    ⚡ {gameState.players[gameState.waitingForNextPlayer.playerId].name} is waiting to{' '}
                    {gameState.waitingForNextPlayer.type === 'steal' ? '🏴‍☠️ steal' : '🪞 copy'} the next roll! ⚡
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {gameState.gamePhase === 'trivia' && (
        <TriviaScreen
          triviaQuestion={gameState.triviaQuestion}
          triviaPlayer={gameState.triviaPlayer}
          players={gameState.players}
          onAnswerTrivia={triviaHandlers.handleTriviaAnswer}
          playSound={playSound}
          audioUrls={audioUrls}
        />
      )}

      {gameState.gamePhase === 'ended' && gameState.winner !== null && (
        <VictoryScreen
          winner={gameState.players.find(p => p.id === gameState.winner)!}
          players={gameState.players}
          onPlayAgain={() => {
            resetGame();
            triggerConfetti();
          }}
          playSound={playSound}
          audioUrls={audioUrls}
        />
      )}

      {/* Confetti for celebrations */}
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          numberOfPieces={200}
          gravity={0.3}
          colors={['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8']}
        />
      )}
      
      {/* Tutorial Component */}
      <Tutorial
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        onComplete={() => {
          playSound(audioUrls.correctAnswer);
          setShowTutorial(false);
        }}
      />

      {/* Mascot for feedback */}
      {gameState.notification && (
        <Mascot message={gameState.notification.message} />
      )}
    </div>
  );
};

export default Mi50Game;