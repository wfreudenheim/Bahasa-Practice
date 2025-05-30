import { VocabItem } from './vocabulary';

export interface GameResult {
  score: number;
  totalQuestions: number;
  timeSpent: number;
  gameType: string;
}

export interface GameProps {
  vocabulary?: VocabItem[];
  words?: VocabItem[]; // For backward compatibility
  onGameComplete: (result: GameResult) => void;
  onBack?: () => void;
  config?: {
    wordCount: number;
    timeLimit: number;
  };
} 