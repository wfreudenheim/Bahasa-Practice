export type GamePhase = 'setup' | 'generating' | 'playing' | 'completed' | 'error';

export interface BlankItem {
  id: string;
  position: number;
  correctAnswer: string;
  userAnswer: string | null;
  isCorrect: boolean;
}

export interface WordBankItem {
  id: string;
  word: string;
  isUsed: boolean;
}

export interface FillInStoryState {
  phase: GamePhase;
  story: string;
  blanks: BlankItem[];
  wordBank: WordBankItem[];
  selectedWord: string | null;
  score: number;
  timeRemaining: number;
  isComplete: boolean;
} 