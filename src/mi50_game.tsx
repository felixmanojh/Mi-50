import React, { useState, useEffect } from 'react';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Users, Trophy, Brain, ArrowRight, ArrowLeft, RotateCcw, Zap } from 'lucide-react';
import AudioPlayer from './AudioPlayer'; // Import the new AudioPlayer component
import { monsterSpriteUrls, boardBgUrl, audioUrls } from './constants'; // Import constants
import { AnimatePresence, motion } from 'framer-motion'; // Import AnimatePresence and motion
import PlayerAvatar from './PlayerAvatar'; // Import PlayerAvatar


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
  const [gameState, setGameState] = useState({
    players: [],
    currentPlayerIndex: 0,
    playerPositions: {},
    gamePhase: 'setup', // 'setup', 'playing', 'trivia', 'ended'
    lastRoll: 0,
    waitingForNextPlayer: null, // for steal/mirror moves
    triviaQuestion: null,
    triviaPlayer: null,
    winner: null,
    notification: null // for showing rule feedback
  });

  // Math questions pool for trivia
  const mathQuestions = [
    { question: "What is 5 + 3?", answer: 8 },
    { question: "What is 10 + 6?", answer: 16 },
    { question: "What is 17 - 4?", answer: 13 },
    { question: "What is 12 - 5?", answer: 7 },
    { question: "What is 7 + 8?", answer: 15 },
    { question: "What is 15 - 6?", answer: 9 },
    { question: "What is 9 + 4?", answer: 13 },
    { question: "What is 14 - 7?", answer: 7 },
    { question: "What is 6 + 9?", answer: 15 },
    { question: "What is 18 - 9?", answer: 9 },
    { question: "What is 8 + 7?", answer: 15 },
    { question: "What is 13 - 8?", answer: 5 },
    { question: "What is 11 + 4?", answer: 15 },
    { question: "What is 16 - 7?", answer: 9 },
    { question: "What is 5 + 8?", answer: 13 },
    { question: "What is 12 - 3?", answer: 9 },
    { question: "What is 9 + 6?", answer: 15 },
    { question: "What is 15 - 8?", answer: 7 },
    { question: "What is 7 + 5?", answer: 12 },
    { question: "What is 14 - 6?", answer: 8 }
  ];

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
    const players = [];
    const positions = {};
    
    for (let i = 0; i < numPlayers; i++) {
      players.push({
        id: i,
        name: playerNames[i],
        color: playerColors[i],
        skipNextTurn: false
      });
      positions[i] = 0;
    }

    setGameState({
      ...gameState,
      players,
      playerPositions: positions,
      gamePhase: 'playing',
      notification: { 
        message: `🎮 ${playerNames[0]}'s turn! Roll the dice to start the game!`, 
        type: 'info' 
      }
    });
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

    const currentPos = gameState.playerPositions[playerId];
    const playerName = gameState.players[playerId].name;
    let newPos = currentPos;
    let nextPlayerSkips = false;
    let triggerRollAgain = false;
    let notificationMessage = '';

    switch (special.type) {
      case 'roll_again':
        triggerRollAgain = true;
        notificationMessage = `🎲 ${playerName} gets to roll again!`;
        break;
      case 'skip_turn':
      case 'lose_turn':
        gameState.players[playerId].skipNextTurn = true;
        notificationMessage = `😔 ${playerName} will skip their next turn!`;
        break;
      case 'go_to_start':
        newPos = 0;
        notificationMessage = `↩️ ${playerName} goes back to the start!`;
        break;
      case 'trivia':
        const randomQuestion = mathQuestions[Math.floor(Math.random() * mathQuestions.length)];
        setGameState(prev => ({
          ...prev,
          gamePhase: 'trivia',
          triviaQuestion: randomQuestion,
          triviaPlayer: playerId,
          notification: { message: `🧠 ${playerName} must answer a math question!`, type: 'trivia' }
        }));
        return;
      case 'move_front_4':
        newPos = movePlayer(playerId, currentPos + 4);
        notificationMessage = `🚀 ${playerName} moves forward 4 spaces! (${currentPos} → ${newPos})`;
        break;
      case 'move_back_4':
        newPos = movePlayer(playerId, currentPos - 4);
        notificationMessage = `⬅️ ${playerName} moves back 4 spaces! (${currentPos} → ${newPos})`;
        break;
      case 'move_front_5':
        newPos = movePlayer(playerId, currentPos + 5);
        notificationMessage = `🚀 ${playerName} moves forward 5 spaces! (${currentPos} → ${newPos})`;
        break;
      case 'move_back_5':
        newPos = movePlayer(playerId, currentPos - 5);
        notificationMessage = `⬅️ ${playerName} moves back 5 spaces! (${currentPos} → ${newPos})`;
        break;
      case 'move_double':
        const doubleMove = roll * 2;
        newPos = movePlayer(playerId, currentPos + doubleMove - roll);
        notificationMessage = `⚡ ${playerName} moves double! ${roll} × 2 = ${doubleMove} spaces! (${currentPos} → ${newPos})`;
        break;
      case 'move_triple':
        const tripleMove = roll * 3;
        newPos = movePlayer(playerId, currentPos + tripleMove - roll);
        notificationMessage = `⚡⚡ ${playerName} moves triple! ${roll} × 3 = ${tripleMove} spaces! (${currentPos} → ${newPos})`;
        break;
      case 'move_backward':
        newPos = movePlayer(playerId, currentPos - roll);
        notificationMessage = `🔄 ${playerName} moves backward ${roll} spaces! (${currentPos} → ${newPos})`;
        break;
      case 'go_to_13':
        newPos = 13;
        notificationMessage = `📍 ${playerName} jumps to square 13!`;
        break;
      case 'go_to_27':
        newPos = 27;
        notificationMessage = `📍 ${playerName} jumps to square 27!`;
        break;
      case 'roll_4_to_move':
        // This is handled in the dice roll function
        notificationMessage = `🎯 ${playerName} must roll exactly 4 to move from this square!`;
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
    const roll = rollDice();
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
      showNotification(`🎯 ${currentPlayer.name} rolled ${roll} but needs exactly 4 to move from square 32!`, 'warning');
      setTimeout(nextTurn, 2000);
      return;
    }
    
    const newPos = movePlayer(currentPlayer.id, currentPos + roll);
    
    // Check if move is legal
    if (newPos > 50) {
      setGameState(prev => ({ ...prev, lastRoll: roll }));
      showNotification(`❌ ${currentPlayer.name} rolled ${roll} but can't move past square 50! Stay at ${currentPos}.`, 'warning');
      setTimeout(nextTurn, 2000);
      return;
    }

    // Show basic move notification
    showNotification(`🎲 ${currentPlayer.name} rolled ${roll} and moves to square ${newPos}!`, 'info');

    setGameState(prev => ({
      ...prev,
      playerPositions: { ...prev.playerPositions, [currentPlayer.id]: newPos },
      lastRoll: roll
    }));

    // Check for win
    if (newPos === 50) {
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
        showNotification(`🛡️ ${currentPlayer.name} landed on a safe square! No special effects.`, 'success');
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
    const isCorrect = parseInt(answer) === gameState.triviaQuestion.answer;
    const playerName = gameState.players[gameState.triviaPlayer].name;
    
    if (isCorrect) {
      showNotification(`🎉 Correct! ${playerName} answered right and continues playing!`, 'success');
    } else {
      gameState.players[gameState.triviaPlayer].skipNextTurn = true;
      showNotification(`❌ Wrong answer! ${playerName} will skip their next turn. The answer was ${gameState.triviaQuestion.answer}.`, 'warning');
    }
    
    setGameState(prev => ({
      ...prev,
      gamePhase: 'playing',
      triviaQuestion: null,
      triviaPlayer: null
    }));
    
          setTimeout(nextTurn, 2500);
  };

  

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
          <div className="flex gap-4 justify-center">
            {[2, 3, 4].map(num => (
              <button
                key={num}
                onClick={() => setupGame(num)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg text-xl font-bold transition-colors"
              >
                {num} Players
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  
  if (gameState.gamePhase === 'characterSelection') {
    const availableCharacters = monsterSpriteUrls.filter((_, index) => !gameState.players.some(p => p.character === index));

    return (
      <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-purple-600 mb-2">Choose Your Character</h1>
          <p className="text-gray-600">Player {gameState.players.length + 1}, pick your monster!</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="flex gap-4 justify-center">
            {availableCharacters.map((url, index) => (
              <motion.img
                key={index}
                src={url}
                alt={`Monster ${index}`}
                className="w-32 h-32 cursor-pointer rounded-full border-4 border-transparent hover:border-blue-500"
                onClick={() => handleCharacterSelect(monsterSpriteUrls.indexOf(url))}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (gameState.gamePhase === 'trivia') {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md">
          <Brain className="w-16 h-16 text-purple-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4">Math Time!</h2>
          <p className="text-lg mb-6">{gameState.triviaQuestion.question}</p>
          <input
            type="number"
            placeholder="Your answer"
            className="border-2 border-gray-300 rounded-lg px-4 py-2 text-xl text-center mb-4 w-full"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleTriviaAnswer(e.target.value);
              }
            }}
            autoFocus
          />
          <button
            onClick={(e) => {
              const input = e.target.parentElement.querySelector('input');
              handleTriviaAnswer(input.value);
            }}
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg font-bold"
          >
            Submit Answer
          </button>
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
          <button
            onClick={() => setGameState({
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
            })}
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg text-xl font-bold"
          >
            Play Again
          </button>
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
          
          <button
            onClick={handleDiceRoll}
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg font-bold text-xl flex items-center gap-2 transition-colors"
            disabled={gameState.gamePhase !== 'playing' || isRolling}
          >
            {gameState.lastRoll > 0 ? getDiceIcon(gameState.lastRoll) : <Dice1 className="w-8 h-8" />}
            Roll Dice
          </button>
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
    </div>
  );
};

export default Mi50Game;