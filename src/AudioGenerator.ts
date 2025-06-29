/**
 * Web Audio API sound generator for creating game sound effects
 * This creates realistic sound effects without requiring external audio files
 */

export class AudioGenerator {
  private audioContext: AudioContext;

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  /**
   * Creates a dice roll sound effect
   */
  createDiceRollSound(): Promise<Blob> {
    return new Promise((resolve) => {
      const duration = 0.8;
      const sampleRate = this.audioContext.sampleRate;
      const length = sampleRate * duration;
      const buffer = this.audioContext.createBuffer(1, length, sampleRate);
      const data = buffer.getChannelData(0);

      // Create dice rolling sound with multiple frequency sweeps
      for (let i = 0; i < length; i++) {
        const time = i / sampleRate;
        let sample = 0;
        
        // Add multiple frequency components for realistic dice sound
        sample += Math.sin(2 * Math.PI * (200 + time * 100) * time) * 0.3;
        sample += Math.sin(2 * Math.PI * (400 + time * 150) * time) * 0.2;
        sample += (Math.random() - 0.5) * 0.4; // White noise
        
        // Apply envelope
        const envelope = Math.exp(-time * 3) * (1 - Math.exp(-time * 20));
        data[i] = sample * envelope * 0.5;
      }

      this.bufferToBlob(buffer, resolve);
    });
  }

  /**
   * Creates a player movement sound (bouncy hop)
   */
  createPlayerMoveSound(): Promise<Blob> {
    return new Promise((resolve) => {
      const duration = 0.4;
      const sampleRate = this.audioContext.sampleRate;
      const length = sampleRate * duration;
      const buffer = this.audioContext.createBuffer(1, length, sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < length; i++) {
        const time = i / sampleRate;
        
        // Bouncy sound with frequency sweep
        const frequency = 300 + 200 * Math.sin(time * 15);
        let sample = Math.sin(2 * Math.PI * frequency * time);
        
        // Apply bouncy envelope
        const envelope = Math.exp(-time * 8) * Math.sin(time * 20);
        data[i] = sample * envelope * 0.3;
      }

      this.bufferToBlob(buffer, resolve);
    });
  }

  /**
   * Creates a special square activation sound
   */
  createSpecialSquareSound(): Promise<Blob> {
    return new Promise((resolve) => {
      const duration = 0.6;
      const sampleRate = this.audioContext.sampleRate;
      const length = sampleRate * duration;
      const buffer = this.audioContext.createBuffer(1, length, sampleRate);
      const data = buffer.getChannelData(0);

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

      this.bufferToBlob(buffer, resolve);
    });
  }

  /**
   * Creates a victory fanfare sound
   */
  createVictorySound(): Promise<Blob> {
    return new Promise((resolve) => {
      const duration = 2.0;
      const sampleRate = this.audioContext.sampleRate;
      const length = sampleRate * duration;
      const buffer = this.audioContext.createBuffer(1, length, sampleRate);
      const data = buffer.getChannelData(0);

      // Victory melody notes (C-E-G-C major chord progression)
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

      this.bufferToBlob(buffer, resolve);
    });
  }

  /**
   * Creates a button click sound
   */
  createButtonClickSound(): Promise<Blob> {
    return new Promise((resolve) => {
      const duration = 0.1;
      const sampleRate = this.audioContext.sampleRate;
      const length = sampleRate * duration;
      const buffer = this.audioContext.createBuffer(1, length, sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < length; i++) {
        const time = i / sampleRate;
        
        // Sharp click sound
        const frequency = 800;
        let sample = Math.sin(2 * Math.PI * frequency * time);
        
        // Apply sharp envelope
        const envelope = Math.exp(-time * 50);
        data[i] = sample * envelope * 0.3;
      }

      this.bufferToBlob(buffer, resolve);
    });
  }

  /**
   * Creates a correct answer sound (positive chime)
   */
  createCorrectAnswerSound(): Promise<Blob> {
    return new Promise((resolve) => {
      const duration = 0.8;
      const sampleRate = this.audioContext.sampleRate;
      const length = sampleRate * duration;
      const buffer = this.audioContext.createBuffer(1, length, sampleRate);
      const data = buffer.getChannelData(0);

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

      this.bufferToBlob(buffer, resolve);
    });
  }

  /**
   * Creates a wrong answer sound (gentle negative tone)
   */
  createWrongAnswerSound(): Promise<Blob> {
    return new Promise((resolve) => {
      const duration = 0.5;
      const sampleRate = this.audioContext.sampleRate;
      const length = sampleRate * duration;
      const buffer = this.audioContext.createBuffer(1, length, sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < length; i++) {
        const time = i / sampleRate;
        
        // Gentle descending tone
        const frequency = 300 - time * 100;
        let sample = Math.sin(2 * Math.PI * frequency * time);
        
        // Apply gentle envelope
        const envelope = Math.exp(-time * 3) * (1 - Math.exp(-time * 10));
        data[i] = sample * envelope * 0.3;
      }

      this.bufferToBlob(buffer, resolve);
    });
  }

  /**
   * Converts AudioBuffer to Blob for saving as file
   */
  private bufferToBlob(buffer: AudioBuffer, callback: (blob: Blob) => void): void {
    const length = buffer.length;
    const arrayBuffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(arrayBuffer);

    // WAV header
    const writeString = (offset: number, string: string) => {
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
    view.setUint32(24, buffer.sampleRate, true);
    view.setUint32(28, buffer.sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * 2, true);

    // Convert audio data
    const data = buffer.getChannelData(0);
    let offset = 44;
    for (let i = 0; i < length; i++) {
      const sample = Math.max(-1, Math.min(1, data[i]));
      view.setInt16(offset, sample * 0x7FFF, true);
      offset += 2;
    }

    callback(new Blob([arrayBuffer], { type: 'audio/wav' }));
  }

  /**
   * Generates all sound effects and saves them as files
   */
  async generateAllSounds(): Promise<{[key: string]: Blob}> {
    const sounds: {[key: string]: Blob} = {};
    
    sounds.diceRoll = await this.createDiceRollSound();
    sounds.playerMove = await this.createPlayerMoveSound();
    sounds.specialSquare = await this.createSpecialSquareSound();
    sounds.victory = await this.createVictorySound();
    sounds.buttonClick = await this.createButtonClickSound();
    sounds.correctAnswer = await this.createCorrectAnswerSound();
    sounds.wrongAnswer = await this.createWrongAnswerSound();
    
    return sounds;
  }
}