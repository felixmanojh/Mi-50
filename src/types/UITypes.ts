export interface AnimationState {
  showConfetti: boolean;
  animatingSquare: number | null;
  isRolling: boolean;
  specialAnimation: any;
}

export interface AudioState {
  isMuted: boolean;
  isLoading: boolean;
}

export interface TutorialState {
  showTutorial: boolean;
}

export interface PlayerDifficultyState {
  [playerId: number]: 'easy' | 'medium' | 'hard';
}

export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ButtonProps extends ComponentProps {
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

export interface ModalProps extends ComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}