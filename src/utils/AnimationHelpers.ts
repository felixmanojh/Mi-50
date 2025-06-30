export class AnimationHelpers {
  static readonly CONFETTI_DURATION = 3000;
  static readonly SQUARE_ANIMATION_DURATION = 2000;
  static readonly DICE_ANIMATION_DURATION = 1000;
  static readonly TURN_TRANSITION_DELAY = 2000;
  static readonly SPECIAL_SQUARE_DELAY = 1500;

  static createDiceRollAnimation() {
    return {
      animate: {
        rotate: [0, 10, -10, 0],
        scale: [1, 1.1, 1]
      },
      transition: { duration: 0.2 }
    };
  }

  static createSquareHighlightAnimation() {
    return {
      animate: {
        scale: [1, 1.5, 1.2, 1.5, 1],
        boxShadow: [
          '0 0 0px rgba(255, 215, 0, 0)',
          '0 0 30px rgba(255, 215, 0, 0.8)',
          '0 0 60px rgba(255, 215, 0, 1)',
          '0 0 30px rgba(255, 215, 0, 0.8)',
          '0 0 0px rgba(255, 215, 0, 0)'
        ],
        rotate: [0, 5, -5, 5, 0]
      },
      transition: {
        scale: { duration: 2, ease: 'easeInOut' },
        boxShadow: { duration: 2, ease: 'easeInOut' },
        rotate: { duration: 2, ease: 'easeInOut' }
      }
    };
  }

  static createPlayerMovementAnimation(x: number, y: number) {
    return {
      animate: {
        x: `${x}%`,
        y: `${y}%`,
        scale: 1.2
      },
      transition: { type: 'spring', stiffness: 400, damping: 15 }
    };
  }

  static createVictoryAnimation() {
    return {
      animate: {
        scale: [1, 1.1, 1],
        rotate: [0, 5, -5, 0]
      },
      transition: { duration: 2, repeat: Infinity }
    };
  }

  static createButtonHoverAnimation() {
    return {
      whileHover: { scale: 1.05 },
      whileTap: { scale: 0.95 }
    };
  }

  static createFloatingAnimation(delay: number = 0) {
    return {
      animate: {
        y: [0, -10, 0],
        rotate: [0, 5, -5, 0]
      },
      transition: {
        duration: 2,
        repeat: Infinity,
        delay
      }
    };
  }

  static createPulseAnimation() {
    return {
      animate: { scale: [1, 1.05, 1] },
      transition: { duration: 2, repeat: Infinity }
    };
  }

  static createSparkleAnimation(delay: number = 0) {
    return {
      animate: {
        scale: [0, 1, 0],
        opacity: [0, 1, 0]
      },
      transition: { duration: 2, repeat: 3, delay }
    };
  }

  static createGlowAnimation() {
    return {
      animate: {
        boxShadow: [
          "0 0 20px rgba(59, 130, 246, 0.4)",
          "0 0 40px rgba(59, 130, 246, 0.6)",
          "0 0 20px rgba(59, 130, 246, 0.4)"
        ]
      },
      transition: { duration: 2, repeat: Infinity }
    };
  }

  static createBounceInAnimation(delay: number = 0) {
    return {
      initial: { scale: 0, rotate: 180 },
      animate: { scale: 1, rotate: 0 },
      transition: {
        delay,
        type: "spring",
        stiffness: 300
      }
    };
  }

  static createSlideInAnimation(direction: 'left' | 'right' | 'up' | 'down' = 'up', delay: number = 0) {
    const directions = {
      left: { x: -100, y: 0 },
      right: { x: 100, y: 0 },
      up: { x: 0, y: 50 },
      down: { x: 0, y: -50 }
    };

    return {
      initial: { opacity: 0, ...directions[direction] },
      animate: { opacity: 1, x: 0, y: 0 },
      transition: { delay, duration: 0.5 }
    };
  }

  static createStaggeredAnimation(index: number, baseDelay: number = 0.1) {
    return {
      initial: { opacity: 0, scale: 0 },
      animate: { opacity: 1, scale: 1 },
      transition: { delay: baseDelay * index, type: "spring", stiffness: 300 }
    };
  }

  static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}