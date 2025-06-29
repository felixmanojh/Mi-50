/**
 * Node.js script to generate audio files using the AudioGenerator
 * This creates real sound effects to replace the empty placeholder files
 */

const fs = require('fs');
const path = require('path');

// Mock Web Audio API for Node.js environment
class MockAudioContext {
  constructor() {
    this.sampleRate = 44100;
  }

  createBuffer(channels, length, sampleRate) {
    return new MockAudioBuffer(channels, length, sampleRate);
  }
}

class MockAudioBuffer {
  constructor(channels, length, sampleRate) {
    this.numberOfChannels = channels;
    this.length = length;
    this.sampleRate = sampleRate;
    this.channels = [];
    
    for (let i = 0; i < channels; i++) {
      this.channels.push(new Float32Array(length));
    }
  }

  getChannelData(channel) {
    return this.channels[channel];
  }
}

// Mock global objects for Node.js
global.window = {
  AudioContext: MockAudioContext,
  webkitAudioContext: MockAudioContext
};

// Simple sound generators (simplified versions for Node.js)
function generateDiceRollSound() {
  const duration = 0.8;
  const sampleRate = 44100;
  const length = Math.floor(sampleRate * duration);
  const data = new Float32Array(length);

  for (let i = 0; i < length; i++) {
    const time = i / sampleRate;
    let sample = 0;
    
    // Multiple frequency components for dice sound
    sample += Math.sin(2 * Math.PI * (200 + time * 100) * time) * 0.3;
    sample += Math.sin(2 * Math.PI * (400 + time * 150) * time) * 0.2;
    sample += (Math.random() - 0.5) * 0.4; // White noise
    
    // Apply envelope
    const envelope = Math.exp(-time * 3) * (1 - Math.exp(-time * 20));
    data[i] = sample * envelope * 0.5;
  }

  return bufferToWav(data, sampleRate);
}

function generatePlayerMoveSound() {
  const duration = 0.4;
  const sampleRate = 44100;
  const length = Math.floor(sampleRate * duration);
  const data = new Float32Array(length);

  for (let i = 0; i < length; i++) {
    const time = i / sampleRate;
    
    // Bouncy sound with frequency sweep
    const frequency = 300 + 200 * Math.sin(time * 15);
    let sample = Math.sin(2 * Math.PI * frequency * time);
    
    // Apply bouncy envelope
    const envelope = Math.exp(-time * 8) * Math.sin(time * 20);
    data[i] = sample * envelope * 0.3;
  }

  return bufferToWav(data, sampleRate);
}

function generateSpecialSquareSound() {
  const duration = 0.6;
  const sampleRate = 44100;
  const length = Math.floor(sampleRate * duration);
  const data = new Float32Array(length);

  for (let i = 0; i < length; i++) {
    const time = i / sampleRate;
    
    // Magical sparkle sound
    let sample = 0;
    sample += Math.sin(2 * Math.PI * 523 * time) * 0.3; // C5
    sample += Math.sin(2 * Math.PI * 659 * time) * 0.3; // E5
    sample += Math.sin(2 * Math.PI * 784 * time) * 0.3; // G5
    
    // Apply sparkle envelope
    const envelope = Math.exp(-time * 2) * (Math.sin(time * 40) * 0.5 + 0.5);
    data[i] = sample * envelope * 0.4;
  }

  return bufferToWav(data, sampleRate);
}

function generateVictorySound() {
  const duration = 2.0;
  const sampleRate = 44100;
  const length = Math.floor(sampleRate * duration);
  const data = new Float32Array(length);

  // Victory melody notes
  const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
  
  for (let i = 0; i < length; i++) {
    const time = i / sampleRate;
    let sample = 0;
    
    // Play notes in sequence
    const noteIndex = Math.floor(time * 4) % notes.length;
    const noteTime = (time * 4) % 1;
    
    sample += Math.sin(2 * Math.PI * notes[noteIndex] * time) * 0.4;
    
    // Add harmony
    if (noteIndex >= 1) {
      sample += Math.sin(2 * Math.PI * notes[noteIndex - 1] * time) * 0.2;
    }
    
    // Apply envelope
    const envelope = Math.exp(-noteTime * 1) * (1 - Math.exp(-noteTime * 10));
    data[i] = sample * envelope * 0.6;
  }

  return bufferToWav(data, sampleRate);
}

function generateButtonClickSound() {
  const duration = 0.1;
  const sampleRate = 44100;
  const length = Math.floor(sampleRate * duration);
  const data = new Float32Array(length);

  for (let i = 0; i < length; i++) {
    const time = i / sampleRate;
    
    // Sharp click sound
    const frequency = 800;
    let sample = Math.sin(2 * Math.PI * frequency * time);
    
    // Apply sharp envelope
    const envelope = Math.exp(-time * 50);
    data[i] = sample * envelope * 0.3;
  }

  return bufferToWav(data, sampleRate);
}

function generateCorrectAnswerSound() {
  const duration = 0.8;
  const sampleRate = 44100;
  const length = Math.floor(sampleRate * duration);
  const data = new Float32Array(length);

  for (let i = 0; i < length; i++) {
    const time = i / sampleRate;
    
    // Happy ascending chime
    let sample = 0;
    sample += Math.sin(2 * Math.PI * 523 * time) * 0.3; // C5
    sample += Math.sin(2 * Math.PI * 659 * time) * 0.3; // E5
    if (time > 0.2) sample += Math.sin(2 * Math.PI * 784 * time) * 0.3; // G5
    
    // Apply cheerful envelope
    const envelope = Math.exp(-time * 2) * (1 - Math.exp(-time * 15));
    data[i] = sample * envelope * 0.5;
  }

  return bufferToWav(data, sampleRate);
}

function generateWrongAnswerSound() {
  const duration = 0.5;
  const sampleRate = 44100;
  const length = Math.floor(sampleRate * duration);
  const data = new Float32Array(length);

  for (let i = 0; i < length; i++) {
    const time = i / sampleRate;
    
    // Gentle descending tone
    const frequency = 300 - time * 100;
    let sample = Math.sin(2 * Math.PI * frequency * time);
    
    // Apply gentle envelope
    const envelope = Math.exp(-time * 3) * (1 - Math.exp(-time * 10));
    data[i] = sample * envelope * 0.3;
  }

  return bufferToWav(data, sampleRate);
}

// Convert Float32Array to WAV buffer
function bufferToWav(data, sampleRate) {
  const length = data.length;
  const arrayBuffer = new ArrayBuffer(44 + length * 2);
  const view = new DataView(arrayBuffer);

  // WAV header
  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, length * 2, true);

  // Convert audio data
  let offset = 44;
  for (let i = 0; i < length; i++) {
    const sample = Math.max(-1, Math.min(1, data[i]));
    view.setInt16(offset, sample * 0x7FFF, true);
    offset += 2;
  }

  return Buffer.from(arrayBuffer);
}

// Generate all audio files
async function generateAllAudioFiles() {
  const audioDir = path.join(__dirname, '..', 'public', 'assets', 'audio');
  
  console.log('Generating audio files...');
  
  const files = {
    'dice_roll.mp3': generateDiceRollSound(),
    'player_move.mp3': generatePlayerMoveSound(),
    'special_square.mp3': generateSpecialSquareSound(),
    'victory.mp3': generateVictorySound(),
    'button_click.mp3': generateButtonClickSound(),
    'correct_answer.mp3': generateCorrectAnswerSound(),
    'wrong_answer.mp3': generateWrongAnswerSound()
  };

  for (const [filename, buffer] of Object.entries(files)) {
    const filePath = path.join(audioDir, filename);
    fs.writeFileSync(filePath, buffer);
    console.log(`Generated: ${filename}`);
  }

  console.log('All audio files generated successfully!');
}

// Run the generator
generateAllAudioFiles().catch(console.error);