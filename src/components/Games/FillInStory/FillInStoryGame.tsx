import React, { useState, useEffect, useCallback } from 'react';
import { VocabItem } from '../../../types/vocabulary';
import { ClaudeService } from '../../../services/claudeService';
import { Timer } from '../../Timer/Timer';
import { GameSetup } from '../../GameSetup/GameSetup';
import { GameConfig } from '../../../types/gameTypes';
import styles from './FillInStoryGame.module.css';

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
  title: {
    indonesian: string;
    english: string;
  } | null;
  customPrompt: string;
}

interface FillInStoryGameProps {
  words: VocabItem[];
  onBack: () => void;
}

const claudeService = new ClaudeService();

export const FillInStoryGame: React.FC<FillInStoryGameProps> = ({
  words,
  onBack
}) => {
  const [gameState, setGameState] = useState<FillInStoryState>({
    phase: 'setup',
    story: '',
    blanks: [],
    wordBank: [],
    selectedWord: null,
    score: 0,
    timeRemaining: 120,
    isComplete: false,
    title: null,
    customPrompt: ''
  });

  const [setupConfig, setSetupConfig] = useState<GameConfig>({
    wordCount: Math.min(10, words.length),
    timeLimit: 120,
    numberOfParagraphs: 1,
    storyComplexity: 'medium'
  });

  const handleConfigSubmit = (config: GameConfig) => {
    setSetupConfig(config);
    initializeGame({
      ...config,
      customPrompt: gameState.customPrompt
    });
  };

  const initializeGame = useCallback(async (config: GameConfig) => {
    try {
      setGameState((prev: FillInStoryState) => ({ ...prev, phase: 'generating' }));
      
      // Map story complexity to difficulty levels
      const difficultyMap = {
        'easy': 'beginner',
        'medium': 'intermediate',
        'hard': 'advanced'
      } as const;
      
      const response = await claudeService.generateFillInStory(words, {
        difficulty: difficultyMap[config.storyComplexity || 'medium'],
        sentenceCount: config.numberOfParagraphs || 1,
        blankCount: Math.min(config.wordCount, words.length),
        customPrompt: config.customPrompt
      });

      const { story, answers, title } = response;
      
      // Create word bank from answers
      const wordBank: WordBankItem[] = answers.map((word: string, idx: number) => ({
        id: `word-${idx}`,
        word,
        isUsed: false
      }));

      // Create blanks array
      const blanks: BlankItem[] = answers.map((answer: string, idx: number) => ({
        id: `blank-${idx}`,
        position: idx,
        correctAnswer: answer,
        userAnswer: null,
        isCorrect: false
      }));

      setGameState((prev: FillInStoryState) => ({
        ...prev,
        phase: 'playing',
        story,
        blanks,
        wordBank: shuffleArray(wordBank),
        title
      }));

    } catch (error) {
      console.error('Failed to initialize game:', error);
      setGameState((prev: FillInStoryState) => ({ ...prev, phase: 'error' }));
    }
  }, [words]);

  const handleWordSelect = (wordId: string) => {
    if (gameState.phase !== 'playing') return;
    
    setGameState((prev: FillInStoryState) => ({
      ...prev,
      selectedWord: prev.selectedWord === wordId ? null : wordId
    }));
  };

  const handleBlankFill = (blankId: string) => {
    if (gameState.phase !== 'playing') return;

    // Find the current blank
    const currentBlank = gameState.blanks.find(b => b.id === blankId);
    if (!currentBlank) return;

    // If there's a selected word from the word bank
    if (gameState.selectedWord) {
      const selectedWord = gameState.wordBank.find(w => w.id === gameState.selectedWord);
      if (!selectedWord || selectedWord.isUsed) return;

      setGameState(prev => {
        const updatedBlanks = prev.blanks.map(blank => {
          if (blank.id === blankId) {
            const isCorrect = selectedWord.word === blank.correctAnswer;
            return {
              ...blank,
              userAnswer: selectedWord.word,
              isCorrect
            };
          }
          return blank;
        });

        const updatedWordBank = prev.wordBank.map(word => {
          if (word.id === prev.selectedWord) {
            return { ...word, isUsed: true };
          }
          return word;
        });

        const isComplete = updatedBlanks.every(blank => blank.userAnswer !== null && blank.isCorrect);
        const score = updatedBlanks.filter(blank => blank.isCorrect).length;

        return {
          ...prev,
          blanks: updatedBlanks,
          wordBank: updatedWordBank,
          selectedWord: null,
          score,
          isComplete,
          phase: isComplete ? 'completed' : 'playing'
        };
      });
    } 
    // If clicking on a filled blank that's incorrect, remove the word
    else if (currentBlank.userAnswer && !currentBlank.isCorrect) {
      setGameState(prev => {
        // Find the word in the word bank that matches this answer
        const wordToFree = prev.wordBank.find(w => w.word === currentBlank.userAnswer);

        const updatedBlanks = prev.blanks.map(blank => {
          if (blank.id === blankId) {
            return {
              ...blank,
              userAnswer: null,
              isCorrect: false
            };
          }
          return blank;
        });

        const updatedWordBank = prev.wordBank.map(word => {
          if (word.id === wordToFree?.id) {
            return { ...word, isUsed: false };
          }
          return word;
        });

        return {
          ...prev,
          blanks: updatedBlanks,
          wordBank: updatedWordBank,
          selectedWord: null
        };
      });
    }
  };

  const renderContent = () => {
    switch (gameState.phase) {
      case 'setup':
        return (
          <div className={styles.setupPhase}>
            <h2>Fill in the Story Game Setup</h2>
            <div className={styles.setupForm}>
              <div className={styles.setupOptions}>
                <GameSetup
                  onConfigSubmit={setSetupConfig}
                  defaultConfig={setupConfig}
                  showStoryOptions={true}
                  minWordCount={3}
                  maxWordCount={Math.min(50, words.length)}
                  minTimeLimit={30}
                  maxTimeLimit={600}
                  hideSubmitButton={true}
                />
                
                <div className={styles.customPromptSection}>
                  <div className={styles.formGroup}>
                    <label>Story Context (optional):</label>
                    <textarea
                      value={gameState.customPrompt}
                      onChange={(e) => setGameState(prev => ({ ...prev, customPrompt: e.target.value }))}
                      placeholder="Add a context for the story (e.g., 'Write a dialogue between friends' or 'Create a story about a family vacation')"
                      rows={3}
                      className={styles.customPromptInput}
                    />
                  </div>
                </div>
              </div>

              <button 
                onClick={() => handleConfigSubmit(setupConfig)}
                className={styles.startButton}
                disabled={setupConfig.wordCount < 3}
              >
                Start Game
              </button>
            </div>
          </div>
        );

      case 'generating':
        return (
          <div className={styles.loading}>
            <h3>Generating your story...</h3>
            <div className={styles.spinner}></div>
          </div>
        );

      case 'error':
        return (
          <div className={styles.error}>
            <h3>Oops! Something went wrong.</h3>
            <button onClick={() => initializeGame(setupConfig)}>Try Again</button>
            <button onClick={() => setGameState(prev => ({ ...prev, phase: 'setup' }))}>Change Settings</button>
          </div>
        );

      case 'playing':
      case 'completed':
        return (
          <>
            {setupConfig && <Timer 
              duration={setupConfig.timeLimit} 
              mode="countdown"
              onComplete={() => setGameState(prev => ({ ...prev, phase: 'completed' }))}
              autoStart={gameState.phase === 'playing'}
              shouldStop={gameState.phase === 'completed'}
            />}
            {gameState.title && (
              <div className={styles.storyTitle}>
                <h3>{gameState.title.indonesian}</h3>
                <p className={styles.englishTitle}>{gameState.title.english}</p>
              </div>
            )}
            <div className={styles.storyContainer}>
              {renderStoryWithBlanks()}
            </div>
            <div className={styles.wordBank}>
              {gameState.wordBank.map(word => (
                <button
                  key={word.id}
                  className={`${styles.wordBankItem} 
                    ${word.isUsed ? styles.used : ''} 
                    ${gameState.selectedWord === word.id ? styles.selected : ''}`}
                  onClick={() => handleWordSelect(word.id)}
                  disabled={word.isUsed || gameState.phase === 'completed'}
                >
                  {word.word}
                </button>
              ))}
            </div>
          </>
        );
    }
  };

  const renderStoryWithBlanks = () => {
    const storyParts = gameState.story.split('[BLANK]');
    return (
      <div className={styles.story}>
        {storyParts.map((part: string, index: number) => (
          <React.Fragment key={index}>
            {part}
            {index < gameState.blanks.length && (
              <button
                className={`${styles.blank} 
                  ${gameState.blanks[index].userAnswer ? styles.filled : ''} 
                  ${gameState.blanks[index].isCorrect ? styles.correct : 
                    gameState.blanks[index].userAnswer ? styles.incorrect : ''}`}
                onClick={() => handleBlankFill(gameState.blanks[index].id)}
                disabled={gameState.phase === 'completed' || gameState.blanks[index].isCorrect}
                title={gameState.blanks[index].isCorrect ? 'Correct!' : 
                  gameState.blanks[index].userAnswer ? 'Click to remove incorrect answer' : 
                  'Click to fill in the blank'}
              >
                {gameState.blanks[index].userAnswer || '_____'}
              </button>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={onBack} className={styles.backButton}>← Back</button>
        <h2>Fill in the Story</h2>
      </div>
      
      <div className={styles.gameArea}>
        {renderContent()}
      </div>

      {gameState.phase === 'completed' && (
        <div className={styles.completionMessage}>
          <h3>Great job! 🎉</h3>
          <p>Your score: {gameState.score} / {gameState.blanks.length}</p>
          <button onClick={() => setGameState(prev => ({ ...prev, phase: 'setup' }))}>
            Try Another Story
          </button>
        </div>
      )}
    </div>
  );
};

// Helper function to shuffle array
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
} 