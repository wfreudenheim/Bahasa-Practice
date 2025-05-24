import React, { useState, useEffect, useCallback } from 'react';
import { VocabItem } from '../../../interfaces/vocab';
import { Timer } from '../../Timer/Timer';
import { WordColumn } from './WordColumn';
import { GameSetup } from '../../GameSetup/GameSetup';
import styles from './MatchingGame.module.css';

interface MatchingGameProps {
  words: VocabItem[];
  onBack: () => void;
  config?: {
    wordCount: number;
    timeLimit: number;
  };
  onComplete: (result: GameResult) => void;
}

interface GameResult {
  score: number;
  matches: number;
  attempts: number;
  timeUsed: number;
}

interface MatchingGameState {
  leftWords: VocabItem[];
  rightWords: VocabItem[];
  selectedLeft: number | null;
  selectedRight: number | null;
  matchedPairs: Map<number, number>;
  score: number;
  attempts: number;
  timeRemaining: number;
  gameStatus: 'playing' | 'won' | 'timeout';
}

const calculateScore = (matches: number, totalWords: number, timeUsed: number, timeLimit: number, attempts: number) => {
  const completionRate = matches / totalWords;
  const efficiency = totalWords / Math.max(attempts, totalWords);
  const timeBonus = timeLimit > 0 ? Math.max(0, (timeLimit - timeUsed) / timeLimit) : 0;
  return Math.round(completionRate * 100 + efficiency * 50 + timeBonus * 25);
};

// Fisher-Yates shuffle algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const MatchingGame: React.FC<MatchingGameProps> = ({ words, onBack, config: initialConfig, onComplete }) => {
  const [isSetup, setIsSetup] = useState(true);
  const [config, setConfig] = useState(initialConfig || { wordCount: 10, timeLimit: 120 });
  const [gameState, setGameState] = useState<MatchingGameState | null>(null);
  const [timerKey, setTimerKey] = useState(0); // Add key to force timer remount

  const initializeGame = useCallback((gameConfig: typeof config) => {
    // First shuffle all words to randomize selection
    const shuffledAllWords = shuffleArray(words);
    // Take the first n words as our selection
    const selectedWords = shuffledAllWords.slice(0, gameConfig.wordCount);
    // Shuffle the selected words again for the right column
    const shuffledRight = shuffleArray(selectedWords);
    
    setGameState({
      leftWords: selectedWords,
      rightWords: shuffledRight,
      selectedLeft: null,
      selectedRight: null,
      matchedPairs: new Map(),
      score: 0,
      attempts: 0,
      timeRemaining: gameConfig.timeLimit,
      gameStatus: 'playing'
    });
    setTimerKey(prev => prev + 1); // Force timer to reset
  }, [words]);

  const handleConfigSubmit = (newConfig: typeof config) => {
    setConfig(newConfig);
    setIsSetup(false);
    initializeGame(newConfig);
  };

  const handleWordSelect = useCallback((side: 'left' | 'right', index: number) => {
    if (!gameState || gameState.gameStatus !== 'playing') return;
    if (side === 'left' && gameState.matchedPairs.has(index)) return;
    if (side === 'right' && Array.from(gameState.matchedPairs.values()).includes(index)) return;

    setGameState(prev => {
      if (!prev) return prev;
      const newState = { ...prev };

      if (side === 'left') {
        newState.selectedLeft = index;
      } else {
        newState.selectedRight = index;
      }

      // Check for match if both sides are selected
      if (newState.selectedLeft !== null && newState.selectedRight !== null) {
        const leftWord = prev.leftWords[newState.selectedLeft];
        const rightWord = prev.rightWords[newState.selectedRight];
        
        newState.attempts++;

        if (leftWord.indonesian === rightWord.indonesian) {
          // Correct match
          newState.matchedPairs.set(newState.selectedLeft, newState.selectedRight);
          newState.score++;

          // Check for win condition
          if (newState.matchedPairs.size === prev.leftWords.length) {
            newState.gameStatus = 'won';
          }
        }

        // Reset selections after checking match
        setTimeout(() => {
          setGameState(current => {
            if (!current) return current;
            return {
              ...current,
              selectedLeft: null,
              selectedRight: null
            };
          });
        }, 200);
      }

      return newState;
    });
  }, [gameState]);

  const handleTimeUp = useCallback(() => {
    setGameState(prev => prev ? { ...prev, gameStatus: 'timeout' } : null);
  }, []);

  const handleTimerTick = useCallback((timeRemaining: number) => {
    setGameState(prev => prev ? { ...prev, timeRemaining } : null);
  }, []);

  useEffect(() => {
    if (gameState && gameState.gameStatus !== 'playing') {
      const timeUsed = config.timeLimit - gameState.timeRemaining;
      const result: GameResult = {
        score: calculateScore(
          gameState.matchedPairs.size,
          gameState.leftWords.length,
          timeUsed,
          config.timeLimit,
          gameState.attempts
        ),
        matches: gameState.matchedPairs.size,
        attempts: gameState.attempts,
        timeUsed
      };
      onComplete(result);
    }
  }, [gameState?.gameStatus, config.timeLimit, onComplete]);

  if (isSetup) {
    return (
      <GameSetup
        onConfigSubmit={handleConfigSubmit}
        defaultConfig={config}
        minWordCount={4}
        maxWordCount={Math.min(20, words.length)}
        minTimeLimit={30}
        maxTimeLimit={300}
      />
    );
  }

  if (!gameState) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={onBack} className={styles.backButton}>← Back</button>
        <h2>Word Matching</h2>
        <div className={styles.stats}>
          <span>Matches: {gameState.matchedPairs.size} / {gameState.leftWords.length}</span>
          <Timer
            key={timerKey}
            duration={config.timeLimit}
            mode="countdown"
            onComplete={handleTimeUp}
            onTick={handleTimerTick}
            autoStart={true}
            shouldStop={gameState.gameStatus !== 'playing'}
          />
        </div>
      </div>

      <div className={styles.gameArea}>
        <WordColumn
          words={gameState.leftWords}
          side="left"
          selectedIndex={gameState.selectedLeft}
          matchedPairs={gameState.matchedPairs}
          onSelect={handleWordSelect}
        />
        <WordColumn
          words={gameState.rightWords}
          side="right"
          selectedIndex={gameState.selectedRight}
          matchedPairs={gameState.matchedPairs}
          onSelect={handleWordSelect}
        />
      </div>

      {gameState.gameStatus !== 'playing' && (
        <div className={styles.gameOver}>
          <h3>{gameState.gameStatus === 'won' ? 'Congratulations! 🎉' : 'Time\'s Up! ⏰'}</h3>
          <p>You matched {gameState.matchedPairs.size} out of {gameState.leftWords.length} words</p>
          <p>Attempts: {gameState.attempts}</p>
          <button onClick={() => setIsSetup(true)} className={styles.playAgainButton}>
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}; 