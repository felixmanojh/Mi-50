/**
 * Dynamic Math Question Generator for ages 6-7
 * Creates age-appropriate addition and subtraction problems
 */

export interface MathQuestion {
  question: string;
  answer: number;
  num1: number;
  num2: number;
  operation: '+' | '-';
  difficulty: 'easy' | 'medium' | 'hard';
}

export class MathQuestionGenerator {
  private usedQuestions: Set<string> = new Set();

  /**
   * Generates a random math question appropriate for ages 6-7
   */
  generateQuestion(difficulty: 'easy' | 'medium' | 'hard' = 'easy'): MathQuestion {
    let question: MathQuestion;
    let attempts = 0;
    const maxAttempts = 50;

    do {
      question = this.createRandomQuestion(difficulty);
      attempts++;
    } while (this.usedQuestions.has(question.question) && attempts < maxAttempts);

    // Add to used questions (keep last 20 to avoid immediate repeats)
    this.usedQuestions.add(question.question);
    if (this.usedQuestions.size > 20) {
      const first = this.usedQuestions.values().next().value;
      this.usedQuestions.delete(first);
    }

    return question;
  }

  /**
   * Creates a random question based on difficulty level
   */
  private createRandomQuestion(difficulty: 'easy' | 'medium' | 'hard'): MathQuestion {
    const operation = Math.random() < 0.6 ? '+' : '-'; // Favor addition for young kids
    
    switch (difficulty) {
      case 'easy':
        return this.generateEasyQuestion(operation);
      case 'medium':
        return this.generateMediumQuestion(operation);
      case 'hard':
        return this.generateHardQuestion(operation);
      default:
        return this.generateEasyQuestion(operation);
    }
  }

  /**
   * Easy questions: numbers 1-10, results 1-15
   */
  private generateEasyQuestion(operation: '+' | '-'): MathQuestion {
    if (operation === '+') {
      const num1 = this.randomInt(1, 8);
      const num2 = this.randomInt(1, Math.min(7, 15 - num1)); // Keep result ≤ 15
      const answer = num1 + num2;
      
      return {
        question: `What is ${num1} + ${num2}?`,
        answer,
        num1,
        num2,
        operation,
        difficulty: 'easy'
      };
    } else {
      // Subtraction: ensure positive results
      const answer = this.randomInt(1, 10);
      const num2 = this.randomInt(1, Math.min(5, answer)); // Keep subtrahend small
      const num1 = answer + num2;
      
      return {
        question: `What is ${num1} - ${num2}?`,
        answer,
        num1,
        num2,
        operation,
        difficulty: 'easy'
      };
    }
  }

  /**
   * Medium questions: numbers 1-15, results 1-20
   */
  private generateMediumQuestion(operation: '+' | '-'): MathQuestion {
    if (operation === '+') {
      const num1 = this.randomInt(3, 12);
      const num2 = this.randomInt(2, Math.min(8, 20 - num1)); // Keep result ≤ 20
      const answer = num1 + num2;
      
      return {
        question: `What is ${num1} + ${num2}?`,
        answer,
        num1,
        num2,
        operation,
        difficulty: 'medium'
      };
    } else {
      const answer = this.randomInt(2, 15);
      const num2 = this.randomInt(2, Math.min(8, answer));
      const num1 = answer + num2;
      
      return {
        question: `What is ${num1} - ${num2}?`,
        answer,
        num1,
        num2,
        operation,
        difficulty: 'medium'
      };
    }
  }

  /**
   * Hard questions: numbers 1-20, results 1-25
   */
  private generateHardQuestion(operation: '+' | '-'): MathQuestion {
    if (operation === '+') {
      const num1 = this.randomInt(5, 18);
      const num2 = this.randomInt(3, Math.min(10, 25 - num1)); // Keep result ≤ 25
      const answer = num1 + num2;
      
      return {
        question: `What is ${num1} + ${num2}?`,
        answer,
        num1,
        num2,
        operation,
        difficulty: 'hard'
      };
    } else {
      const answer = this.randomInt(3, 20);
      const num2 = this.randomInt(3, Math.min(12, answer));
      const num1 = answer + num2;
      
      return {
        question: `What is ${num1} - ${num2}?`,
        answer,
        num1,
        num2,
        operation,
        difficulty: 'hard'
      };
    }
  }

  /**
   * Generates special themed questions
   */
  generateThemedQuestion(theme: 'animals' | 'toys' | 'food' | 'nature', difficulty: 'easy' | 'medium' | 'hard' = 'easy'): MathQuestion {
    const baseQuestion = this.generateQuestion(difficulty);
    const themedQuestion = this.applyTheme(baseQuestion, theme);
    
    return themedQuestion;
  }

  /**
   * Applies a theme to make questions more engaging
   */
  private applyTheme(question: MathQuestion, theme: 'animals' | 'toys' | 'food' | 'nature'): MathQuestion {
    const themes = {
      animals: {
        items: ['🐶 dogs', '🐱 cats', '🐰 rabbits', '🐦 birds', '🐸 frogs', '🦆 ducks'],
        addVerbs: ['join', 'come to play', 'arrive at the park'],
        subtractVerbs: ['go home', 'run away', 'go to sleep']
      },
      toys: {
        items: ['🎾 balls', '🧸 teddy bears', '🚗 toy cars', '🎲 dice', '🪀 yo-yos', '🎯 darts'],
        addVerbs: ['are added', 'join the pile', 'are brought out'],
        subtractVerbs: ['are put away', 'get lost', 'are given away']
      },
      food: {
        items: ['🍎 apples', '🍌 bananas', '🍪 cookies', '🧁 cupcakes', '🍓 strawberries', '🥕 carrots'],
        addVerbs: ['are added', 'are picked', 'are baked'],
        subtractVerbs: ['are eaten', 'are shared', 'fall down']
      },
      nature: {
        items: ['🌸 flowers', '🌟 stars', '🍀 leaves', '🌰 acorns', '🦋 butterflies', '🐝 bees'],
        addVerbs: ['bloom', 'appear', 'come out'],
        subtractVerbs: ['fall down', 'fly away', 'hide']
      }
    };

    const themeData = themes[theme];
    const item = themeData.items[Math.floor(Math.random() * themeData.items.length)];
    
    let themedQuestion: string;
    
    if (question.operation === '+') {
      const verb = themeData.addVerbs[Math.floor(Math.random() * themeData.addVerbs.length)];
      themedQuestion = `There are ${question.num1} ${item}. Then ${question.num2} more ${verb}. How many are there now?`;
    } else {
      const verb = themeData.subtractVerbs[Math.floor(Math.random() * themeData.subtractVerbs.length)];
      themedQuestion = `There are ${question.num1} ${item}. Then ${question.num2} ${verb}. How many are left?`;
    }

    return {
      ...question,
      question: themedQuestion
    };
  }

  /**
   * Generates questions focusing on specific number concepts
   */
  generateConceptQuestion(concept: 'doubles' | 'counting' | 'patterns'): MathQuestion {
    switch (concept) {
      case 'doubles':
        return this.generateDoublesQuestion();
      case 'counting':
        return this.generateCountingQuestion();
      case 'patterns':
        return this.generatePatternQuestion();
      default:
        return this.generateQuestion('easy');
    }
  }

  private generateDoublesQuestion(): MathQuestion {
    const num = this.randomInt(1, 10);
    return {
      question: `What is ${num} + ${num}? (Double ${num})`,
      answer: num * 2,
      num1: num,
      num2: num,
      operation: '+',
      difficulty: 'easy'
    };
  }

  private generateCountingQuestion(): MathQuestion {
    const start = this.randomInt(1, 8);
    const count = this.randomInt(1, 5);
    return {
      question: `Count up ${count} from ${start}. What number do you get?`,
      answer: start + count,
      num1: start,
      num2: count,
      operation: '+',
      difficulty: 'easy'
    };
  }

  private generatePatternQuestion(): MathQuestion {
    const base = this.randomInt(2, 6);
    const multiplier = this.randomInt(2, 4);
    const num1 = base;
    const num2 = base * multiplier;
    return {
      question: `What is ${num1} + ${num2}?`,
      answer: num1 + num2,
      num1,
      num2,
      operation: '+',
      difficulty: 'medium'
    };
  }

  /**
   * Resets the used questions cache
   */
  reset(): void {
    this.usedQuestions.clear();
  }

  /**
   * Utility function for random integers
   */
  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Gets statistics about generated questions
   */
  getStats(): { totalGenerated: number; uniqueQuestions: number } {
    return {
      totalGenerated: this.usedQuestions.size,
      uniqueQuestions: this.usedQuestions.size
    };
  }
}