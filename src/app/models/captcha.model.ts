export type CaptchaType = 'image-select' | 'math' | 'text-input';

export interface BaseChallenge {
  id: string;
  type: CaptchaType;
  instruction: string;
}

export interface ImageSelectChallenge extends BaseChallenge {
  type: 'image-select';
  targetCategory: string; // e.g. "cats"
  images: { id: string; url: string; isTarget: boolean }[];
}

export interface MathChallenge extends BaseChallenge {
  type: 'math';
  question: string;
  correctAnswer: number;
}

export interface TextInputChallenge extends BaseChallenge {
  type: 'text-input';
  codeToType: string;
  captchaImageUrl?: string;
}

export type Challenge = ImageSelectChallenge | MathChallenge | TextInputChallenge;

export interface SessionState {
  challenges: Challenge[];
  currentIndex: number;
  completed: boolean;
  userAnswers: Record<string, any>;
  sessionStartTime: number;
}