import React, { useState, useEffect } from 'react';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Users, Trophy, Brain, ArrowRight, ArrowLeft, RotateCcw, Zap } from 'lucide-react';
import AudioPlayer from './AudioPlayer'; // Import the new AudioPlayer component
import { monsterSpriteUrls, boardBgUrl, audioUrls } from './constants'; // Import constants
import { AnimatePresence, motion } from 'framer-motion'; // Import AnimatePresence and motion
import PlayerAvatar from './PlayerAvatar'; // Import PlayerAvatar
import { useSound } from './SoundEffects'; // Import sound effects hook
import SpecialSquareIndicator from './SpecialSquareIndicator'; // Import special square indicators
import { useAudioPreloader, AudioLoadingScreen } from './AudioPreloader'; // Import audio preloader
import Tutorial from './Tutorial'; // Import tutorial component
import { VisualMathOperation } from './VisualMathAids'; // Import visual math aids
import { MathQuestionGenerator, MathQuestion } from './MathQuestionGenerator'; // Import question generator


const Mascot = ({ message }) => {
  return (
    <div className="fixed bottom-4 left-4 flex items-center">
      <img src={monsterSpriteUrls[0]} alt="Mascot" className="w-24 h-24" />
      <div className="bg-white p-4 rounded-lg shadow-lg ml-4">
        <p className="text-lg font-bold">{message}</p>
      </div>
    </div>
  );
};

const Mi50Game = () => {
  const [isMuted, setIsMuted] = useState(false); // Add isMuted state
  const [specialAnimation, setSpecialAnimation] = useState(null); // Add specialAnimation state
  const [isRolling, setIsRolling] = useState(false); // Add isRolling state
  const { playPreloadedSound, isLoading } = useAudioPreloader(); // Use preloaded audio
  
  // Create enhanced sound function that uses preloaded audio
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
  const [gameState, setGameState] = useState({
    players: [],
    currentPlayerIndex: 0,
    playerPositions: {},
    gamePhase: 'setup', // 'setup', 'characterSelection', 'playing', 'trivia', 'ended'
    lastRoll: 0,
    waitingForNextPlayer: null, // for steal/mirror moves
    triviaQuestion: null,
    triviaPlayer: null,
    winner: null,
    notification: null, // for showing rule feedback
    numPlayers: 0, // for character selection
    selectedCharacters: [] // track which characters are taken
  });

  const [showTutorial, setShowTutorial] = useState(false);
  const [mathGenerator] = useState(() => new MathQuestionGenerator()); // Initialize question generator
  const [playerDifficulty, setPlayerDifficulty] = useState<{ [playerId: number]: 'easy' | 'medium' | 'hard' }>({});

  // Special squares configuration
  const specialSquares = {
    2: { type: 'roll_again', text: 'Roll Again!', icon: <Dice1 className="w-4 h-4" /> },
    3: { type: 'skip_turn', text: 'Skip Turn', icon: <ArrowRight className="w-4 h-4" /> },
    4: { type: 'go_to_start', text: 'Go to Start', icon: <RotateCcw className="w-4 h-4" /> },
    5: { type: 'trivia', text: 'Trivia', icon: <Brain className="w-4 h-4" /> },
    7: { type: 'lose_turn', text: 'Lose Turn', icon: <ArrowRight className="w-4 h-4" /> },
    8: { type: 'move_front_4', text: 'Move +4', icon: <ArrowRight className="w-4 h-4" /> },
    9: { type: 'roll_again', text: 'Lucky!', icon: <Zap className="w-4 h-4" /> },
    10: { type: 'move_back_4', text: 'Move -4', icon: <ArrowLeft className="w-4 h-4" /> },
    14: { type: 'roll_again', text: 'Free Turn', icon: <Dice1 className="w-4 h-4" /> },
    16: { type: 'move_front_4', text: 'Move +4', icon: <ArrowRight className="w-4 h-4" /> },
    19: { type: 'steal_move', text: 'Steal Move', icon: <Zap className="w-4 h-4" /> },
    21: { type: 'move_double', text: 'Move x2', icon: <Zap className="w-4 h-4" /> },
    22: { type: 'move_triple', text: 'Move x3', icon: <Zap className="w-4 h-4" /> },
    23: { type: 'move_backward', text: 'Move Back', icon: <ArrowLeft className="w-4 h-4" /> },
    25: { type: 'trivia', text: 'Trivia', icon: <Brain className="w-4 h-4" /> },
    28: { type: 'mirror_move', text: 'Mirror Move', icon: <Zap className="w-4 h-4" /> },
    32: { type: 'roll_4_to_move', text: 'Roll 4 to Move', icon: <Dice4 className="w-4 h-4" /> },
    34: { type: 'move_back_5', text: 'Move -5', icon: <ArrowLeft className="w-4 h-4" /> },
    35: { type: 'move_front_5', text: 'Move +5', icon: <ArrowRight className="w-4 h-4" /> },
    38: { type: 'roll_again', text: 'Roll Again', icon: <Dice1 className="w-4 h-4" /> },
    40: { type: 'go_to_13', text: 'Go to 13', icon: <RotateCcw className="w-4 h-4" /> },
    42: { type: 'lose_turn', text: 'Lose Turn', icon: <ArrowRight className="w-4 h-4" /> },
    45: { type: 'trivia', text: 'Trivia', icon: <Brain className="w-4 h-4" /> },
    47: { type: 'go_to_27', text: 'Go to 27', icon: <RotateCcw className="w-4 h-4" /> }
  };

  const playerColors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'];
  const playerNames = ['Player 1', 'Player 2', 'Player 3', 'Player 4'];

  const setupGame = (numPlayers) => {
    setGameState({
      ...gameState,
      numPlayers,
      gamePhase: 'characterSelection',
      players: [],
      selectedCharacters: [],
      notification: { 
        message: `🎮 Time to choose your characters! Player 1, pick your monster! 👾`, 
        type: 'info' 
      }
    });
  };

  const handleCharacterSelect = (characterIndex) => {
    playSound(audioUrls.buttonClick);
    const currentPlayerIndex = gameState.players.length;
    const newPlayer = {
      id: currentPlayerIndex,
      name: playerNames[currentPlayerIndex],
      color: playerColors[currentPlayerIndex],
      character: characterIndex,
      skipNextTurn: false
    };

    const updatedPlayers = [...gameState.players, newPlayer];
    const updatedSelectedCharacters = [...gameState.selectedCharacters, characterIndex];

    if (updatedPlayers.length === gameState.numPlayers) {
      // All players selected, start game
      const positions = {};
      for (let i = 0; i < gameState.numPlayers; i++) {
        positions[i] = 0;
      }

      setGameState({
        ...gameState,
        players: updatedPlayers,
        selectedCharacters: updatedSelectedCharacters,
        playerPositions: positions,
        gamePhase: 'playing',
        notification: { 
          message: `🎮 ${updatedPlayers[0].name} goes first! Click the big dice to play! 🎲`, 
          type: 'info' 
        }
      });
    } else {
      // Next player selects
      setGameState({
        ...gameState,
        players: updatedPlayers,
        selectedCharacters: updatedSelectedCharacters,
        notification: { 
          message: `🎮 ${playerNames[updatedPlayers.length]}, choose your monster! 👾`, 
          type: 'info' 
        }
      });
    }
  };

  const rollDice = () => {
    return Math.floor(Math.random() * 6) + 1;
  };

  const getDiceIcon = (number) => {
    const icons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
    const DiceIcon = icons[number - 1];
    return <DiceIcon className="w-8 h-8" />;
  };

  const movePlayer = (playerId, newPosition) => {
    // Boundary checks
    if (newPosition < 0) newPosition = 0;
    if (newPosition > 50) return gameState.playerPositions[playerId]; // Illegal move
    
    return newPosition;
  };

  const showNotification = (message, type = 'info') => {
    setGameState(prev => ({
      ...prev,
      notification: { message, type }
    }));
  };

  const handleSpecialSquare = (playerId, position, roll) => {
    const special = specialSquares[position];
    if (!special) return;

    // Play special square sound
    playSound(audioUrls.specialSquare);

    const currentPos = gameState.playerPositions[playerId];
    const playerName = gameState.players[playerId].name;
    let newPos = currentPos;
    let nextPlayerSkips = false;
    let triggerRollAgain = false;
    let notificationMessage = '';

    switch (special.type) {
      case 'roll_again':
        triggerRollAgain = true;
        notificationMessage = `🎲 Yay! ${playerName} gets another turn! Roll again! 🎉`;
        break;
      case 'skip_turn':
      case 'lose_turn':
        gameState.players[playerId].skipNextTurn = true;
        notificationMessage = `😔 Oh no! ${playerName} has to wait for their next turn!`;
        break;
      case 'go_to_start':
        newPos = 0;
        notificationMessage = `↩️ Oops! ${playerName} goes all the way back to start! 🏁`;
        break;
      case 'trivia':
        // Get player's current difficulty level or default to easy
        const difficulty = playerDifficulty[playerId] || 'easy';
        
        // Generate themed question for more engagement
        const themes = ['animals', 'toys', 'food', 'nature'] as const;
        const randomTheme = themes[Math.floor(Math.random() * themes.length)];
        const randomQuestion = Math.random() < 0.7 
          ? mathGenerator.generateThemedQuestion(randomTheme, difficulty)
          : mathGenerator.generateQuestion(difficulty);
          
        setGameState(prev => ({
          ...prev,
          gamePhase: 'trivia',
          triviaQuestion: randomQuestion,
          triviaPlayer: playerId,
          notification: { message: `🧠 Math time! ${playerName}, can you solve this? 🤔`, type: 'trivia' }
        }));
        return;
      case 'move_front_4':
        newPos = movePlayer(playerId, currentPos + 4);
        notificationMessage = `🚀 Zoom! ${playerName} jumps forward 4 spaces! 🎯`;
        break;
      case 'move_back_4':
        newPos = movePlayer(playerId, currentPos - 4);
        notificationMessage = `⬅️ Uh oh! ${playerName} slides back 4 spaces! 🎯`;
        break;
      case 'move_front_5':
        newPos = movePlayer(playerId, currentPos + 5);
        notificationMessage = `🚀 Super jump! ${playerName} leaps forward 5 spaces! 🌟`;
        break;
      case 'move_back_5':
        newPos = movePlayer(playerId, currentPos - 5);
        notificationMessage = `⬅️ Whoops! ${playerName} slides back 5 spaces! 😮`;
        break;
      case 'move_double':
        const doubleMove = roll * 2;
        newPos = movePlayer(playerId, currentPos + doubleMove - roll);
        notificationMessage = `⚡ WOW! ${playerName} moves DOUBLE! That's ${doubleMove} spaces! 🎆`;
        break;
      case 'move_triple':
        const tripleMove = roll * 3;
        newPos = movePlayer(playerId, currentPos + tripleMove - roll);
        notificationMessage = `⚡⚡ AMAZING! ${playerName} moves TRIPLE! That's ${tripleMove} spaces! 🎆🎆`;
        break;
      case 'move_backward':
        newPos = movePlayer(playerId, currentPos - roll);
        notificationMessage = `🔄 Backwards we go! ${playerName} moves back ${roll} spaces! 🙈`;
        break;
      case 'go_to_13':
        newPos = 13;
        notificationMessage = `📍 Magic portal! ${playerName} teleports to square 13! ✨`;
        break;
      case 'go_to_27':
        newPos = 27;
        notificationMessage = `📍 Magic portal! ${playerName} teleports to square 27! ✨`;
        break;
      case 'roll_4_to_move':
        // This is handled in the dice roll function
        notificationMessage = `🎯 Special challenge! ${playerName} needs to roll a 4 to move! 🎲`;
        break;
      case 'steal_move':
        setGameState(prev => ({
          ...prev,
          waitingForNextPlayer: { type: 'steal', playerId },
          notification: { message: `🏴‍☠️ ${playerName} will steal the next player's roll!`, type: 'special' }
        }));
        return;
      case 'mirror_move':
        setGameState(prev => ({
          ...prev,
          waitingForNextPlayer: { type: 'mirror', playerId },
          notification: { message: `🪞 ${playerName} will copy the next player's roll!`, type: 'special' }
        }));
        return;
    }

    // Show notification
    showNotification(notificationMessage, 'special');

    setGameState(prev => ({
      ...prev,
      playerPositions: { ...prev.playerPositions, [playerId]: newPos },
      gamePhase: triggerRollAgain ? 'playing' : 'playing'
    }));

    // Check for win
    if (newPos === 50) {
      setGameState(prev => ({
        ...prev,
        gamePhase: 'ended',
        winner: playerId
      }));
    }
  };

  const handleDiceRoll = () => {
    if (isRolling) return; // Prevent multiple clicks during rolling
    
    setIsRolling(true);
    playSound(audioUrls.diceRoll); // Play dice roll sound
    
    // Animate dice for 1 second before showing result
    let animationCounter = 0;
    const animationInterval = setInterval(() => {
      const tempRoll = rollDice();
      setGameState(prev => ({
        ...prev,
        lastRoll: tempRoll
      }));
      
      animationCounter++;
      if (animationCounter >= 10) { // Stop after 1 second (10 * 100ms)
        clearInterval(animationInterval);
        const finalRoll = rollDice();
        setGameState(prev => ({
          ...prev,
          lastRoll: finalRoll
        }));
        
        // Process the actual dice roll after animation
        setTimeout(() => {
          processRoll(finalRoll);
          setIsRolling(false);
        }, 200);
      }
    }, 100);
  };

  const processRoll = (roll) => {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    
    // Handle waiting moves (steal/mirror)
    if (gameState.waitingForNextPlayer) {
      const waitingPlayerId = gameState.waitingForNextPlayer.playerId;
      const waitingPlayerName = gameState.players[waitingPlayerId].name;
      const currentPos = gameState.playerPositions[waitingPlayerId];
      let newPos;
      
      if (gameState.waitingForNextPlayer.type === 'steal') {
        newPos = movePlayer(waitingPlayerId, currentPos + roll);
        showNotification(`🏴‍☠️ ${waitingPlayerName} stole the roll of ${roll}! (${currentPos} → ${newPos})`, 'special');
      } else { // mirror
        newPos = movePlayer(waitingPlayerId, currentPos + roll);
        showNotification(`🪞 ${waitingPlayerName} copied the roll of ${roll}! (${currentPos} → ${newPos})`, 'special');
      }
      
      setGameState(prev => ({
        ...prev,
        playerPositions: { ...prev.playerPositions, [waitingPlayerId]: newPos },
        waitingForNextPlayer: null,
        lastRoll: roll
      }));
      
      if (newPos === 50) {
        setGameState(prev => ({
          ...prev,
          gamePhase: 'ended',
          winner: waitingPlayerId
        }));
        return;
      }
      
      setTimeout(nextTurn, 2000);
      return;
    }

    // Skip turn if needed
    if (currentPlayer.skipNextTurn) {
      currentPlayer.skipNextTurn = false;
      showNotification(`😔 ${currentPlayer.name} skipped their turn!`, 'info');
      setTimeout(nextTurn, 2000);
      return;
    }

    const currentPos = gameState.playerPositions[currentPlayer.id];
    
    // Check if player is on square 32 (roll 4 to move)
    if (currentPos === 32 && roll !== 4) {
      setGameState(prev => ({ ...prev, lastRoll: roll }));
      showNotification(`🎯 ${currentPlayer.name} rolled ${roll} but needs a 4! Try again next turn! 🎲`, 'warning');
      setTimeout(nextTurn, 2000);
      return;
    }
    
    const newPos = movePlayer(currentPlayer.id, currentPos + roll);
    
    // Check if move is legal
    if (newPos > 50) {
      setGameState(prev => ({ ...prev, lastRoll: roll }));
      showNotification(`🚫 Oops! ${currentPlayer.name} rolled ${roll} but that's too far! Stay at ${currentPos}! 🎯`, 'warning');
      setTimeout(nextTurn, 2000);
      return;
    }

    // Show basic move notification
    showNotification(`🎲 ${currentPlayer.name} rolled a ${roll}! Moving to square ${newPos}! 🎯`, 'info');
    
    // Play movement sound
    playSound(audioUrls.playerMove);

    setGameState(prev => ({
      ...prev,
      playerPositions: { ...prev.playerPositions, [currentPlayer.id]: newPos },
      lastRoll: roll
    }));

    // Check for win
    if (newPos === 50) {
      playSound(audioUrls.victory); // Play victory sound
      setGameState(prev => ({
        ...prev,
        gamePhase: 'ended',
        winner: currentPlayer.id
      }));
      return;
    }

    // Handle special square
    setTimeout(() => {
      // Check if it's a safe square first
      if ([41, 43, 44, 46, 48, 49].includes(newPos)) {
        showNotification(`🛡️ Safe spot! ${currentPlayer.name} is protected here! 🏆`, 'success');
      }
      
      handleSpecialSquare(currentPlayer.id, newPos, roll);
      if (!specialSquares[newPos] || specialSquares[newPos].type !== 'roll_again') {
        setTimeout(nextTurn, 2000);
      }
    }, 1500);
  };

  const nextTurn = () => {
    const nextPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    const nextPlayer = gameState.players[nextPlayerIndex];
    
    setGameState(prev => ({
      ...prev,
      currentPlayerIndex: nextPlayerIndex,
      notification: { 
        message: `🎮 ${nextPlayer.name}'s turn! Roll the dice to move.`, 
        type: 'info' 
      }
    }));
  };

  const handleTriviaAnswer = (answer) => {
    const isCorrect = parseInt(answer) === gameState.triviaQuestion!.answer;
    const playerName = gameState.players[gameState.triviaPlayer!].name;
    const playerId = gameState.triviaPlayer!;
    
    // Update difficulty based on performance
    const currentDifficulty = playerDifficulty[playerId] || 'easy';
    let newDifficulty = currentDifficulty;
    
    if (isCorrect) {
      playSound(audioUrls.correctAnswer);
      showNotification(`🎉 FANTASTIC! ${playerName} got it right! Great job! 🏆`, 'success');
      
      // Increase difficulty after correct answers (randomly)
      if (Math.random() < 0.3 && currentDifficulty === 'easy') {
        newDifficulty = 'medium';
      } else if (Math.random() < 0.2 && currentDifficulty === 'medium') {
        newDifficulty = 'hard';
      }
    } else {
      playSound(audioUrls.wrongAnswer);
      gameState.players[gameState.triviaPlayer!].skipNextTurn = true;
      showNotification(`😅 Nice try! The answer was ${gameState.triviaQuestion!.answer}. ${playerName} waits one turn!`, 'warning');
      
      // Decrease difficulty after wrong answer
      if (currentDifficulty === 'hard') {
        newDifficulty = 'medium';
      } else if (currentDifficulty === 'medium') {
        newDifficulty = 'easy';
      }
    }
    
    // Update player difficulty
    setPlayerDifficulty(prev => ({
      ...prev,
      [playerId]: newDifficulty
    }));
    
    setGameState(prev => ({
      ...prev,
      gamePhase: 'playing',
      triviaQuestion: null,
      triviaPlayer: null
    }));
    
    setTimeout(nextTurn, 2500);
  };

  

  // Show loading screen while audio is loading
  if (isLoading) {
    return <AudioLoadingScreen />;
  }

  if (gameState.gamePhase === 'setup') {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-purple-600 mb-2">Mi-50</h1>
          <p className="text-gray-600">Race to square 50 and win!</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <Users className="w-16 h-16 text-blue-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-6">How many players?</h2>
          
          {/* Tutorial Button */}
          <div className="mb-6">
            <motion.button
              onClick={() => {
                playSound(audioUrls.buttonClick);
                setShowTutorial(true);
              }}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-8 py-3 rounded-xl text-lg font-bold transition-all shadow-lg border-2 border-white"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🎓 How to Play (Tutorial)
            </motion.button>
          </div>

          <div className="flex gap-4 justify-center">
            {[2, 3, 4].map(num => (
              <motion.button
                key={num}
                onClick={() => {
                  playSound(audioUrls.buttonClick);
                  setupGame(num);
                }}
                className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-12 py-6 rounded-xl text-2xl font-bold transition-all shadow-lg border-4 border-white"
                whileHover={{ scale: 1.1, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                🎮 {num} Players
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  
  if (gameState.gamePhase === 'characterSelection') {
    const availableCharacters = monsterSpriteUrls.filter((_, index) => !gameState.selectedCharacters.includes(index));

    return (
      <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-purple-600 mb-2">Choose Your Monster! 👾</h1>
          <p className="text-2xl text-gray-600">{playerNames[gameState.players.length]}, pick your character!</p>
        </div>
        
        {/* Notification Banner */}
        {gameState.notification && (
          <div className="relative mb-6 p-6 rounded-xl text-center font-bold text-xl border-4 shadow-lg bg-white">
            <div className="relative z-10">
              📺 <span>{gameState.notification.message}</span>
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="flex gap-6 justify-center flex-wrap">
            {monsterSpriteUrls.map((url, index) => {
              const isSelected = gameState.selectedCharacters.includes(index);
              const isAvailable = !isSelected;
              
              return (
                <motion.div
                  key={index}
                  className={`relative p-4 rounded-xl border-4 ${
                    isSelected 
                      ? 'border-gray-400 bg-gray-100 opacity-50' 
                      : 'border-transparent hover:border-purple-500 bg-gradient-to-br from-purple-100 to-pink-100'
                  }`}
                >
                  <motion.img
                    src={url}
                    alt={`Monster ${index + 1}`}
                    className={`w-32 h-32 cursor-pointer rounded-full ${
                      isSelected ? 'grayscale' : ''
                    }`}
                    onClick={() => isAvailable && handleCharacterSelect(index)}
                    whileHover={isAvailable ? { scale: 1.1, y: -10 } : {}}
                    whileTap={isAvailable ? { scale: 0.9 } : {}}
                  />
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl">✅</span>
                    </div>
                  )}
                  <p className="mt-2 font-bold text-lg">Monster {index + 1}</p>
                </motion.div>
              );
            })}
          </div>
          
          <div className="mt-8">
            <p className="text-lg text-gray-600">
              Selected: {gameState.players.length} / {gameState.numPlayers} players
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (gameState.gamePhase === 'trivia') {
    const triviaQuestion = gameState.triviaQuestion!;
    const showVisualAids = triviaQuestion.num1 <= 10 && triviaQuestion.num2 <= 10; // Only show for smaller numbers
    
    return (
      <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-4xl w-full">
          <Brain className="w-16 h-16 text-purple-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Math Time! 🧠</h2>
          
          {/* Question Text */}
          <div className="mb-6">
            <p className="text-xl mb-4 text-gray-700">{triviaQuestion.question}</p>
            
            {/* Show difficulty indicator */}
            <div className="text-sm text-gray-500 mb-4">
              Difficulty: {playerDifficulty[gameState.triviaPlayer!] || 'easy'} 
              {(playerDifficulty[gameState.triviaPlayer!] || 'easy') === 'easy' && ' 🟢'}
              {(playerDifficulty[gameState.triviaPlayer!] || 'easy') === 'medium' && ' 🟡'}
              {(playerDifficulty[gameState.triviaPlayer!] || 'easy') === 'hard' && ' 🔴'}
            </div>
          </div>

          {/* Visual Math Aids - only for simple questions */}
          {showVisualAids && (
            <div className="mb-8">
              <VisualMathOperation
                num1={triviaQuestion.num1}
                num2={triviaQuestion.num2}
                operation={triviaQuestion.operation}
                showResult={false}
              />
            </div>
          )}

          {/* Answer Input */}
          <div className="mb-6">
            <input
              type="number"
              placeholder="Your answer"
              className="border-4 border-purple-300 rounded-xl px-6 py-4 text-2xl text-center mb-4 w-48 focus:border-purple-500 focus:outline-none"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleTriviaAnswer((e.target as HTMLInputElement).value);
                }
              }}
              autoFocus
            />
          </div>

          {/* Submit Button */}
          <motion.button
            onClick={(e) => {
              playSound(audioUrls.buttonClick);
              const input = (e.target as HTMLElement).parentElement!.parentElement!.querySelector('input') as HTMLInputElement;
              handleTriviaAnswer(input.value);
            }}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-12 py-6 rounded-xl font-bold text-2xl shadow-lg border-4 border-white"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🧠 Submit Answer
          </motion.button>

          {/* Encouragement */}
          <p className="text-gray-500 mt-4 text-lg">
            Take your time and think it through! 💭
          </p>
        </div>
      </div>
    );
  }

  if (gameState.gamePhase === 'ended') {
    const winner = gameState.players[gameState.winner];
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-4">🎉 Congratulations! 🎉</h1>
          <p className="text-2xl mb-6">
            <span className={`px-4 py-2 rounded-lg text-white ${winner.color}`}>
              {winner.name}
            </span> Wins!
          </p>
          <motion.button
            onClick={() => {
              playSound(audioUrls.buttonClick);
              setGameState({
                players: [],
                currentPlayerIndex: 0,
                playerPositions: {},
                gamePhase: 'setup',
                lastRoll: 0,
                waitingForNextPlayer: null,
                triviaQuestion: null,
                triviaPlayer: null,
                winner: null,
                notification: null
              });
            }}
            className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-12 py-6 rounded-xl text-2xl font-bold shadow-lg border-4 border-white"
            whileHover={{ scale: 1.1, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            🎮 Play Again
          </motion.button>
        </div>
      </div>
    );
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  return (
    <div className="max-w-6xl mx-auto p-4 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      <AudioPlayer src={audioUrls.background} loop={true} isMuted={isMuted} />
      <div className="text-center mb-6">
        
        <button onClick={() => setIsMuted(!isMuted)} className="absolute top-4 right-4 text-2xl">
          {isMuted ? '🔇' : '🔊'}
        </button>
        <h1 className="text-4xl font-bold text-purple-600 mb-2">Mi-50</h1>

      </div>

      {/* Notification Banner - TV Screen Style */}
      {gameState.notification && (
        <div className="relative mb-6 p-6 rounded-xl text-center font-bold text-xl border-4 shadow-lg bg-white">
            <div className="absolute -top-4 -left-4 w-12 h-12 bg-white transform rotate-45"></div>
            <div className="absolute -top-4 -right-4 w-12 h-12 bg-white transform -rotate-45"></div>
            <div className="relative z-10">
              📺
              <span>{gameState.notification.message}</span>
            </div>
          </div>
      )}

      {/* Game Board */}
      <div 
        className="relative bg-cover bg-center rounded-lg shadow-lg p-4 mb-6"
        style={{ backgroundImage: `url(${boardBgUrl})`, height: '600px' }}
      >
        {/* Board Grid - Show numbered squares */}
        <div className="absolute inset-4 grid grid-rows-5 gap-1">
          {/* Row 1: 1-10 (left to right) */}
          <div className="grid grid-cols-10 gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
              <div 
                key={num} 
                className={`border-2 border-gray-800 bg-white bg-opacity-80 rounded flex items-center justify-center text-lg font-bold ${specialSquares[num] ? 'bg-yellow-200 bg-opacity-90' : ''}`}
              >
                {num}
              </div>
            ))}
          </div>
          
          {/* Row 2: 20-11 (right to left) */}
          <div className="grid grid-cols-10 gap-1">
            {[20, 19, 18, 17, 16, 15, 14, 13, 12, 11].map(num => (
              <div 
                key={num} 
                className={`border-2 border-gray-800 bg-white bg-opacity-80 rounded flex items-center justify-center text-lg font-bold ${specialSquares[num] ? 'bg-yellow-200 bg-opacity-90' : ''}`}
              >
                {num}
              </div>
            ))}
          </div>
          
          {/* Row 3: 21-30 (left to right) */}
          <div className="grid grid-cols-10 gap-1">
            {[21, 22, 23, 24, 25, 26, 27, 28, 29, 30].map(num => (
              <div 
                key={num} 
                className={`border-2 border-gray-800 bg-white bg-opacity-80 rounded flex items-center justify-center text-lg font-bold ${specialSquares[num] ? 'bg-yellow-200 bg-opacity-90' : ''}`}
              >
                {num}
              </div>
            ))}
          </div>
          
          {/* Row 4: 40-31 (right to left) */}
          <div className="grid grid-cols-10 gap-1">
            {[40, 39, 38, 37, 36, 35, 34, 33, 32, 31].map(num => (
              <div 
                key={num} 
                className={`border-2 border-gray-800 bg-white bg-opacity-80 rounded flex items-center justify-center text-lg font-bold ${specialSquares[num] ? 'bg-yellow-200 bg-opacity-90' : ''}`}
              >
                {num}
              </div>
            ))}
          </div>
          
          {/* Row 5: 41-50 (left to right) */}
          <div className="grid grid-cols-10 gap-1">
            {[41, 42, 43, 44, 45, 46, 47, 48, 49, 50].map(num => (
              <div 
                key={num} 
                className={`border-2 border-gray-800 ${num === 50 ? 'bg-yellow-400 bg-opacity-90 text-white font-extrabold' : specialSquares[num] ? 'bg-yellow-200 bg-opacity-90' : 'bg-white bg-opacity-80'} rounded flex items-center justify-center text-lg font-bold`}
              >
                {num === 50 ? '🏆' : num}
              </div>
            ))}
          </div>
        </div>
        
        {/* Start square - positioned below the main grid */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 border-4 border-green-600 bg-green-200 bg-opacity-90 rounded-lg px-4 py-2 text-xl font-bold text-center">
          🏁 START
        </div>
        
        <AnimatePresence>
          {specialAnimation && (
            <motion.div
              key={specialAnimation.type}
              initial={{ opacity: 0, scale: 0.5, rotate: specialAnimation.direction === 'forward' ? -45 : 45 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: specialAnimation.direction === 'forward' ? 45 : -45 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="text-6xl">
                {specialAnimation.direction === 'forward' ? '🚀' : '⬅️'}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Special Square Indicators */}
        {Object.entries(specialSquares).map(([position, square]) => (
          <SpecialSquareIndicator
            key={position}
            position={parseInt(position)}
            type={square.type}
            icon={square.icon}
          />
        ))}
        
        {/* Player Avatars */}
        {gameState.players.map(player => (
          <PlayerAvatar
            key={player.id}
            player={player}
            position={gameState.playerPositions[player.id]}
          />
        ))}
      </div>

      {/* Game Controls */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${currentPlayer.color}`}>
              {currentPlayer.name[0]}
            </div>
            <div>
              <div className="font-bold text-lg">{currentPlayer.name}'s Turn</div>
              {gameState.lastRoll > 0 && (
                <div className="text-gray-600">Last roll: {gameState.lastRoll}</div>
              )}
            </div>
          </div>
          
          <motion.button
            onClick={handleDiceRoll}
            className={`bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-lg font-bold text-xl flex items-center gap-2 transition-all shadow-lg ${isRolling ? 'animate-pulse' : ''}`}
            disabled={gameState.gamePhase !== 'playing' || isRolling}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={isRolling ? { rotateX: 360, rotateY: 360 } : {}}
              transition={{ duration: 0.1, repeat: isRolling ? Infinity : 0 }}
            >
              {gameState.lastRoll > 0 ? getDiceIcon(gameState.lastRoll) : <Dice1 className="w-8 h-8" />}
            </motion.div>
            {isRolling ? 'Rolling...' : 'Roll Dice'}
          </motion.button>
        </div>

        {/* Player Status */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {gameState.players.map(player => (
            <div
              key={player.id}
              className={`p-3 rounded-lg border-2 ${
                player.id === gameState.currentPlayerIndex 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-6 h-6 rounded-full ${player.color}`}></div>
                <span className="font-bold">{player.name}</span>
              </div>
              <div className="text-sm text-gray-600">
                Position: {gameState.playerPositions[player.id]}
              </div>
              {player.skipNextTurn && (
                <div className="text-xs text-red-500 font-bold">Skip Next Turn</div>
              )}
            </div>
          ))}
        </div>

        {gameState.waitingForNextPlayer && (
          <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg text-center">
            <div className="font-bold text-yellow-800">
              {gameState.players[gameState.waitingForNextPlayer.playerId].name} is waiting to{' '}
              {gameState.waitingForNextPlayer.type === 'steal' ? 'steal' : 'copy'} the next roll!
            </div>
          </div>
        )}
      </div>
      
      {/* Tutorial Component */}
      <Tutorial
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        onComplete={() => {
          playSound(audioUrls.correctAnswer);
          setShowTutorial(false);
        }}
      />
    </div>
  );
};

export default Mi50Game;