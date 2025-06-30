import React, { useState, useEffect } from 'react';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Users, Trophy, Brain, ArrowRight, ArrowLeft, RotateCcw, Zap } from 'lucide-react';
import AudioPlayer from './AudioPlayer'; // Import the new AudioPlayer component
import { monsterSpriteUrls, boardBgUrl, audioUrls } from './constants'; // Import constants
import { AnimatePresence, motion } from 'framer-motion'; // Import AnimatePresence and motion
import PlayerAvatar from './PlayerAvatar'; // Import PlayerAvatar
import { useSound } from './SoundEffects'; // Import sound effects hook
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
      <div className="h-screen overflow-hidden bg-gradient-to-br from-pink-300 via-purple-300 via-blue-300 to-cyan-300 flex items-center justify-center relative">
        {/* Floating decoration elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-400 rounded-full opacity-60 animate-bounce"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-pink-400 rounded-full opacity-60 animate-bounce delay-1000"></div>
        <div className="absolute bottom-20 left-32 w-24 h-24 bg-green-400 rounded-full opacity-60 animate-bounce delay-2000"></div>
        <div className="absolute bottom-40 right-16 w-12 h-12 bg-purple-400 rounded-full opacity-60 animate-bounce delay-500"></div>
        
        <div className="max-w-4xl mx-auto p-8">
          {/* Title Section */}
          <motion.div 
            className="text-center mb-12"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1 
              className="text-8xl font-black text-white mb-4 drop-shadow-2xl"
              animate={{ 
                scale: [1, 1.05, 1],
                textShadow: [
                  "0 0 20px rgba(255,255,255,0.5)",
                  "0 0 30px rgba(255,255,255,0.8)",
                  "0 0 20px rgba(255,255,255,0.5)"
                ]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              Mi-50
            </motion.h1>
            <motion.div 
              className="text-3xl font-bold text-white mb-2 drop-shadow-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              🎯 Race to square 50 and win! 🏆
            </motion.div>
            <motion.div 
              className="text-xl text-white opacity-90"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              🎲 Roll dice, solve math, have fun! 🌟
            </motion.div>
          </motion.div>
          
          {/* Main Game Setup Card */}
          <motion.div 
            className="bg-white rounded-3xl shadow-2xl p-10 text-center border-8 border-gradient-to-r from-yellow-400 to-pink-400 relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {/* Decorative elements on card */}
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-rainbow rounded-full flex items-center justify-center text-2xl border-4 border-white shadow-lg">
              🎪
            </div>
            
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Users className="w-24 h-24 text-purple-500 mx-auto mb-8" />
            </motion.div>
            
            <h2 className="text-4xl font-black text-gray-800 mb-8 drop-shadow-md">
              🎮 How many players want to play? 🎮
            </h2>
            
            {/* Tutorial Button */}
            <motion.div className="mb-10">
              <motion.button
                onClick={() => {
                  playSound(audioUrls.buttonClick);
                  setShowTutorial(true);
                }}
                className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white px-10 py-4 rounded-2xl text-2xl font-black transition-all shadow-2xl border-4 border-white transform hover:scale-105"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
                }}
                whileTap={{ scale: 0.95 }}
                animate={{ 
                  boxShadow: [
                    "0 0 20px rgba(168, 85, 247, 0.4)",
                    "0 0 40px rgba(168, 85, 247, 0.6)",
                    "0 0 20px rgba(168, 85, 247, 0.4)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🎓 How to Play (Tutorial) 📚
              </motion.button>
            </motion.div>

            {/* Player Selection Buttons */}
            <div className="flex gap-8 justify-center flex-wrap">
              {[2, 3, 4].map((num, index) => (
                <motion.button
                  key={num}
                  onClick={() => {
                    playSound(audioUrls.buttonClick);
                    setupGame(num);
                  }}
                  className={`
                    ${index === 0 ? 'bg-gradient-to-r from-green-400 to-blue-500' : ''}
                    ${index === 1 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : ''}
                    ${index === 2 ? 'bg-gradient-to-r from-pink-400 to-purple-500' : ''}
                    hover:shadow-2xl text-white px-8 py-6 rounded-2xl text-3xl font-black transition-all shadow-xl border-6 border-white transform hover:scale-110 min-w-[200px]
                  `}
                  whileHover={{ 
                    scale: 1.1,
                    boxShadow: "0 25px 50px rgba(0,0,0,0.3)"
                  }}
                  whileTap={{ scale: 0.9 }}
                  animate={{ 
                    scale: [1, 1.02, 1],
                  }}
                  transition={{ 
                    scale: { duration: 2, repeat: Infinity, delay: index * 0.3, repeatType: "reverse" },
                  }}
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-4xl">👥</span>
                    <span className="drop-shadow-lg">{num} Players</span>
                    <span className="text-2xl">🎯</span>
                  </div>
                </motion.button>
              ))}
            </div>
            
            {/* Fun encouragement text */}
            <motion.div 
              className="mt-8 text-lg text-gray-600 font-bold"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              ✨ Choose your adventure! More players = More fun! ✨
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  
  if (gameState.gamePhase === 'characterSelection') {
    const availableCharacters = monsterSpriteUrls.filter((_, index) => !gameState.selectedCharacters.includes(index));
    const currentPlayerName = playerNames[gameState.players.length];
    const currentPlayerColor = playerColors[gameState.players.length];

    return (
      <div className="h-screen overflow-hidden bg-gradient-to-br from-emerald-300 via-teal-300 via-cyan-300 to-blue-300 flex items-center justify-center relative">
        {/* Floating fun elements */}
        <div className="absolute top-16 left-16 w-16 h-16 bg-yellow-400 rounded-full opacity-70 animate-ping"></div>
        <div className="absolute top-40 right-32 w-20 h-20 bg-pink-400 rounded-full opacity-70 animate-pulse"></div>
        <div className="absolute bottom-32 left-20 w-14 h-14 bg-purple-400 rounded-full opacity-70 animate-bounce"></div>
        <div className="absolute bottom-16 right-40 w-18 h-18 bg-green-400 rounded-full opacity-70 animate-spin"></div>
        
        <div className="max-w-6xl mx-auto p-8 w-full">
          {/* Title Section */}
          <motion.div 
            className="text-center mb-10"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1 
              className="text-7xl font-black text-white mb-4 drop-shadow-2xl"
              animate={{ 
                rotate: [0, 2, -2, 0],
                scale: [1, 1.02, 1]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              👾 Choose Your Monster! 👾
            </motion.h1>
            
            <motion.div 
              className={`inline-block text-4xl font-black text-white mb-4 px-8 py-3 rounded-2xl border-4 border-white shadow-2xl ${currentPlayerColor}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              🎮 {currentPlayerName}, pick your buddy! 🎯
            </motion.div>
          </motion.div>
          
          {/* Notification Banner */}
          {gameState.notification && (
            <motion.div 
              className="relative mb-8 p-6 rounded-3xl text-center font-black text-2xl border-6 border-white shadow-2xl bg-gradient-to-r from-yellow-300 to-orange-400"
              initial={{ scale: 0, rotate: 10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <div className="absolute -top-3 -left-3 w-12 h-12 bg-red-400 rounded-full flex items-center justify-center text-2xl border-4 border-white">
                📺
              </div>
              <div className="relative z-10 text-white drop-shadow-lg">
                {gameState.notification.message}
              </div>
            </motion.div>
          )}
          
          {/* Character Selection Grid */}
          <motion.div 
            className="bg-white rounded-3xl shadow-2xl p-8 border-8 border-gradient-to-r from-purple-400 to-pink-400 relative"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {/* Decorative stars */}
            <div className="absolute -top-4 left-8 text-4xl animate-spin">⭐</div>
            <div className="absolute -top-4 right-8 text-4xl animate-spin delay-1000">⭐</div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 justify-center">
              {monsterSpriteUrls.map((url, index) => {
                const isSelected = gameState.selectedCharacters.includes(index);
                const isAvailable = !isSelected;
                
                return (
                  <motion.div
                    key={index}
                    className={`relative p-6 rounded-3xl border-6 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-gray-400 bg-gray-200 opacity-60' 
                        : 'border-transparent hover:border-purple-500 bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 hover:shadow-2xl'
                    }`}
                    initial={{ scale: 0, rotate: 180 }}
                    animate={{ 
                      scale: isAvailable ? [1, 1.03, 1] : 1, 
                      rotate: 0,
                    }}
                    transition={{ 
                      scale: { 
                        delay: index * 0.1, 
                        type: "spring", 
                        stiffness: 200,
                        ...(isAvailable && {
                          duration: 2,
                          repeat: Infinity,
                          repeatType: "reverse"
                        })
                      },
                      rotate: { delay: index * 0.1, duration: 0.5 }
                    }}
                    whileHover={isAvailable ? { 
                      scale: 1.05,
                      boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
                    } : {}}
                    whileTap={isAvailable ? { scale: 0.95 } : {}}
                    onClick={() => isAvailable && handleCharacterSelect(index)}
                  >
                    {/* Monster image with glowing effect */}
                    <div className={`relative ${isAvailable ? 'animate-pulse' : ''}`}>
                      <motion.img
                        src={url}
                        alt={`Monster ${index + 1}`}
                        className={`w-40 h-40 rounded-full border-6 border-white shadow-xl ${
                          isSelected ? 'grayscale' : ''
                        }`}
                        animate={isAvailable ? {
                          boxShadow: [
                            "0 0 20px rgba(168, 85, 247, 0.3)",
                            "0 0 40px rgba(168, 85, 247, 0.6)",
                            "0 0 20px rgba(168, 85, 247, 0.3)"
                          ]
                        } : {}}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      
                      {/* Selection overlay */}
                      {isSelected && (
                        <motion.div 
                          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200 }}
                        >
                          <span className="text-6xl animate-bounce">✅</span>
                        </motion.div>
                      )}
                      
                      {/* Available indicator */}
                      {isAvailable && (
                        <motion.div 
                          className="absolute -top-2 -right-2 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center border-4 border-white"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <span className="text-lg">✨</span>
                        </motion.div>
                      )}
                    </div>
                    
                    {/* Monster name */}
                    <motion.p 
                      className={`mt-4 font-black text-xl ${isSelected ? 'text-gray-500' : 'text-purple-600'}`}
                      animate={isAvailable ? { color: ["#7c3aed", "#ec4899", "#7c3aed"] } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      🦸 Monster {index + 1} 🦸
                    </motion.p>
                  </motion.div>
                );
              })}
            </div>
            
            {/* Progress indicator */}
            <motion.div 
              className="mt-10 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-2xl text-2xl font-black inline-block border-4 border-white shadow-xl">
                🎯 Selected: {gameState.players.length} / {gameState.numPlayers} players 🎯
              </div>
              
              {/* Progress bar */}
              <div className="mt-4 w-full max-w-md mx-auto bg-gray-200 rounded-full h-6 border-4 border-white shadow-lg">
                <motion.div 
                  className="bg-gradient-to-r from-green-400 to-blue-500 h-full rounded-full flex items-center justify-center text-white font-bold"
                  initial={{ width: 0 }}
                  animate={{ width: `${(gameState.players.length / gameState.numPlayers) * 100}%` }}
                  transition={{ duration: 0.5 }}
                >
                  {gameState.players.length > 0 && (
                    <span className="text-sm">🚀</span>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (gameState.gamePhase === 'trivia') {
    const triviaQuestion = gameState.triviaQuestion!;
    const showVisualAids = triviaQuestion.num1 <= 10 && triviaQuestion.num2 <= 10; // Only show for smaller numbers
    
    return (
      <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-purple-50 h-screen overflow-hidden flex items-center justify-center">
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
      <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-purple-50 h-screen overflow-hidden flex items-center justify-center">
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
    <div className="h-screen overflow-hidden bg-gradient-to-br from-indigo-300 via-purple-300 via-pink-300 to-rose-300 p-4">
      <AudioPlayer src={audioUrls.background} loop={true} isMuted={isMuted} />
      
      {/* Header with title and controls */}
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <motion.h1 
            className="text-6xl font-black text-white drop-shadow-2xl"
            animate={{ 
              scale: [1, 1.02, 1],
              textShadow: [
                "0 0 20px rgba(255,255,255,0.5)",
                "0 0 30px rgba(255,255,255,0.8)",  
                "0 0 20px rgba(255,255,255,0.5)"
              ]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            🎯 Mi-50 🎯
          </motion.h1>
          
          <motion.button 
            onClick={() => setIsMuted(!isMuted)} 
            className="text-5xl bg-white rounded-full p-4 border-4 border-purple-500 shadow-2xl hover:scale-110 transition-all"
            whileHover={{ scale: 1.1, rotate: 10 }}
            whileTap={{ scale: 0.9 }}
          >
            {isMuted ? '🔇' : '🔊'}
          </motion.button>
        </div>

        {/* Notification Banner - Fun TV Screen Style */}
        {gameState.notification && (
          <motion.div 
            className="relative mb-8 p-6 rounded-3xl text-center font-black text-2xl border-6 border-white shadow-2xl bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400"
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
              {gameState.notification.message}
            </div>
          </motion.div>
        )}

      {/* Game Board */}
      <div className="relative bg-white rounded-lg shadow-lg p-6 mb-6 border-4 border-gray-300">
        
        {/* Board Table - Reliable 5x10 grid layout */}
        <div className="w-full max-w-4xl mx-auto">
          <table className="game-board w-full border-collapse">
            <tbody>
              {/* Row 1: 1-10 (left to right) */}
              <tr>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <td 
                    key={num} 
                    className={`game-square border-2 border-gray-800 text-center font-bold ${
                      specialSquares[num] 
                        ? 'bg-yellow-200 text-orange-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {num}
                  </td>
                ))}
              </tr>
              
              {/* Row 2: 20-11 (right to left) */}
              <tr>
                {[20, 19, 18, 17, 16, 15, 14, 13, 12, 11].map(num => (
                  <td 
                    key={num} 
                    className={`game-square border-2 border-gray-800 text-center font-bold ${
                      specialSquares[num] 
                        ? 'bg-yellow-200 text-orange-800' 
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {num}
                  </td>
                ))}
              </tr>
              
              {/* Row 3: 21-30 (left to right) */}
              <tr>
                {[21, 22, 23, 24, 25, 26, 27, 28, 29, 30].map(num => (
                  <td 
                    key={num} 
                    className={`game-square border-2 border-gray-800 text-center font-bold ${
                      specialSquares[num] 
                        ? 'bg-yellow-200 text-orange-800' 
                        : 'bg-pink-100 text-pink-800'
                    }`}
                  >
                    {num}
                  </td>
                ))}
              </tr>
              
              {/* Row 4: 40-31 (right to left) */}
              <tr>
                {[40, 39, 38, 37, 36, 35, 34, 33, 32, 31].map(num => (
                  <td 
                    key={num} 
                    className={`game-square border-2 border-gray-800 text-center font-bold ${
                      specialSquares[num] 
                        ? 'bg-yellow-200 text-orange-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {num}
                  </td>
                ))}
              </tr>
              
              {/* Row 5: 41-50 (left to right) */}
              <tr>
                {[41, 42, 43, 44, 45, 46, 47, 48, 49, 50].map(num => (
                  <td 
                    key={num} 
                    className={`game-square border-2 border-gray-800 text-center font-bold ${
                      num === 50 
                        ? 'bg-yellow-400 text-white' 
                        : specialSquares[num] 
                          ? 'bg-yellow-200 text-orange-800' 
                          : 'bg-cyan-100 text-cyan-800'
                    }`}
                  >
                    {num === 50 ? '🏆' : num}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Start square - positioned below the main grid */}
        <div className="mt-4 mx-auto w-fit border-4 border-green-600 bg-green-200 rounded-lg px-6 py-3 text-xl font-bold text-center">
          🏁 START 🏁
        </div>
        
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
        <div className="bg-white rounded-3xl shadow-2xl p-8 border-8 border-gradient-to-r from-purple-400 to-pink-400 relative">
          {/* Decorative elements */}
          <div className="absolute -top-4 left-8 w-8 h-8 bg-yellow-400 rounded-full border-4 border-white"></div>
          <div className="absolute -top-4 right-8 w-8 h-8 bg-green-400 rounded-full border-4 border-white"></div>
          
          {/* Current Player and Dice Section */}
          <motion.div 
            className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Current Player Info */}
            <motion.div 
              className="flex items-center gap-6 bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-2xl border-4 border-white shadow-lg"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div 
                className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-black text-3xl shadow-lg border-4 border-white ${currentPlayer.color}`}
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {currentPlayer.character !== undefined ? (
                  <img
                    src={monsterSpriteUrls[currentPlayer.character]}
                    alt={currentPlayer.name}
                    className="w-16 h-16 rounded-full"
                  />
                ) : (
                  currentPlayer.name[0]
                )}
              </motion.div>
              <div>
                <motion.div 
                  className="font-black text-3xl text-purple-700 drop-shadow-md"
                  animate={{ color: ["#7c3aed", "#ec4899", "#7c3aed"] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  🎮 {currentPlayer.name}'s Turn! 🎯
                </motion.div>
                {gameState.lastRoll > 0 && (
                  <motion.div 
                    className="text-xl text-gray-600 font-bold"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    🎲 Last roll: {gameState.lastRoll}
                  </motion.div>
                )}
              </div>
            </motion.div>
            
            {/* Giant Dice Button */}
            <motion.button
              onClick={handleDiceRoll}
              className={`bg-gradient-to-r from-orange-400 via-red-500 to-pink-600 hover:from-orange-500 hover:via-red-600 hover:to-pink-700 text-white px-12 py-8 rounded-3xl font-black text-3xl flex items-center gap-4 transition-all shadow-2xl border-6 border-white ${isRolling ? 'animate-pulse' : ''}`}
              disabled={gameState.gamePhase !== 'playing' || isRolling}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={isRolling ? { 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              } : {}}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                animate={isRolling ? { 
                  rotateX: [0, 360], 
                  rotateY: [0, 360],
                  scale: [1, 1.2, 1]
                } : {}}
                transition={{ duration: 0.3, repeat: isRolling ? Infinity : 0 }}
                className="text-6xl"
              >
                {gameState.lastRoll > 0 ? getDiceIcon(gameState.lastRoll) : <Dice1 className="w-16 h-16" />}
              </motion.div>
              <div className="flex flex-col">
                <span className="drop-shadow-lg">{isRolling ? '🎲 Rolling...' : '🎲 Roll Dice!'}</span>
                <span className="text-lg opacity-90">Click me!</span>
              </div>
            </motion.button>
          </motion.div>

          {/* Player Status Cards */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {gameState.players.map((player, index) => (
              <motion.div
                key={player.id}
                className={`p-4 rounded-2xl border-4 shadow-lg transition-all ${
                  player.id === gameState.currentPlayerIndex 
                    ? 'border-yellow-400 bg-gradient-to-br from-yellow-100 to-orange-100 scale-105' 
                    : 'border-white bg-gradient-to-br from-purple-50 to-pink-50'
                }`}
                initial={{ scale: 0, rotate: 10 }}
                animate={{ 
                  scale: player.id === gameState.currentPlayerIndex ? [1, 1.05, 1] : 1, 
                  rotate: 0,
                }}
                transition={{ 
                  scale: { 
                    delay: index * 0.1, 
                    type: "spring", 
                    stiffness: 200,
                    ...(player.id === gameState.currentPlayerIndex && {
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    })
                  }
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-full border-4 border-white shadow-lg ${player.color} flex items-center justify-center`}>
                    {player.character !== undefined ? (
                      <img
                        src={monsterSpriteUrls[player.character]}
                        alt={player.name}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <span className="text-white font-bold">{player.name[0]}</span>
                    )}
                  </div>
                  <span className="font-black text-lg text-purple-700">{player.name}</span>
                  {player.id === gameState.currentPlayerIndex && (
                    <span className="text-2xl animate-bounce">👑</span>
                  )}
                </div>
                <div className="text-center">
                  <div className="font-bold text-purple-600 text-lg">
                    📍 Square {gameState.playerPositions[player.id]}
                  </div>
                  {player.skipNextTurn && (
                    <motion.div 
                      className="text-red-500 font-black text-sm bg-red-100 rounded-full px-3 py-1 mt-2"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      ⏸️ Skip Next Turn
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Special Waiting Status */}
          {gameState.waitingForNextPlayer && (
            <motion.div 
              className="mt-6 p-6 bg-gradient-to-r from-yellow-300 to-orange-400 border-4 border-white rounded-2xl text-center shadow-xl"
              initial={{ scale: 0, rotate: 5 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <div className="font-black text-2xl text-white drop-shadow-lg">
                ⚡ {gameState.players[gameState.waitingForNextPlayer.playerId].name} is waiting to{' '}
                {gameState.waitingForNextPlayer.type === 'steal' ? '🏴‍☠️ steal' : '🪞 copy'} the next roll! ⚡
              </div>
            </motion.div>
          )}
        </div>
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