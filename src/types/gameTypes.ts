export interface GameConfig {
    wordCount: number;
    timeLimit: number; // in seconds
    numberOfParagraphs?: number; // optional, for story-based games
    storyComplexity?: 'easy' | 'medium' | 'hard'; // optional, for story-based games
}

export interface GameSetupProps {
    onConfigSubmit: (config: GameConfig) => void;
    defaultConfig?: GameConfig;
    showStoryOptions?: boolean; // changed from showParagraphOption
    minWordCount?: number;
    maxWordCount?: number;
    minTimeLimit?: number;
    maxTimeLimit?: number;
}

export interface GameResult {
    score: number;
    matches: number;
    attempts: number;
    timeUsed: number;
}

export type TimerMode = 'countdown' | 'stopwatch';

export interface TimerProps {
    duration: number; // in seconds
    mode: TimerMode;
    onComplete?: () => void;
    onTick?: (remainingTime: number) => void;
    autoStart?: boolean;
    shouldStop?: boolean; // Whether the timer should be forcibly stopped
}

// Update the GameType to include our test
export type GameType = 'flashcards' | 'matching' | 'quiz' | 'setup-test'; 