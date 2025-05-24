export interface GameConfig {
    wordCount: number;
    timeLimit: number; // in seconds
    numberOfParagraphs?: number; // optional, for story-based games
    storyComplexity?: 'easy' | 'medium' | 'hard'; // optional, for story-based games
    customPrompt?: string; // optional, for story-based games
}

export interface GameSetupProps {
    onConfigSubmit: (config: GameConfig) => void;
    defaultConfig?: GameConfig;
    showStoryOptions?: boolean; // changed from showParagraphOption
    minWordCount?: number;
    maxWordCount?: number;
    minTimeLimit?: number;
    maxTimeLimit?: number;
    hideSubmitButton?: boolean; // option to hide the submit button when we want to control it externally
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

// Update the GameType to include all registered games
export type GameType = 'flashcards' | 'matching' | 'fill-in-story' | 'setup-test' | 'claude-test'; 