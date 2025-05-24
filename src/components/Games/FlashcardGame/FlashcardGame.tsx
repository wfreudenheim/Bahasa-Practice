import React, { useState, useEffect } from 'react';
import { VocabItem } from '../../../interfaces/vocab';
import './FlashcardGame.css';

interface FlashcardGameProps {
  words: VocabItem[];
  onBack: () => void;
}

export const FlashcardGame: React.FC<FlashcardGameProps> = ({ words, onBack }) => {
  const [remainingWords, setRemainingWords] = useState<VocabItem[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showIndonesianFirst, setShowIndonesianFirst] = useState(true);
  
  // Initialize/reset the game
  useEffect(() => {
    resetGame();
  }, [words]);

  const resetGame = () => {
    // Shuffle the words array
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    setRemainingWords(shuffled);
    setCurrentWordIndex(0);
    setIsFlipped(false);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleGotIt = () => {
    // Remove the current word from remaining words
    const newRemaining = remainingWords.filter((_, index) => index !== currentWordIndex);
    setRemainingWords(newRemaining);
    
    // Reset for next word
    setCurrentWordIndex(prev => 
      prev >= newRemaining.length - 1 ? 0 : prev
    );
    setIsFlipped(false);
  };

  const handleNeedsPractice = () => {
    // Move to next word
    setCurrentWordIndex(prev => 
      prev >= remainingWords.length - 1 ? 0 : prev + 1
    );
    setIsFlipped(false);
  };

  const toggleLanguageOrder = () => {
    setShowIndonesianFirst(!showIndonesianFirst);
    setIsFlipped(false);
  };

  if (remainingWords.length === 0) {
    return (
      <div className="flashcard-game">
        <div className="game-header">
          <button onClick={onBack} className="back-button">← Back</button>
          <h2>Flashcards</h2>
        </div>
        <div className="completion-message">
          <h3>Congratulations! 🎉</h3>
          <p>You've completed all the words in this set!</p>
          <button onClick={resetGame} className="reset-button">
            Practice Again
          </button>
        </div>
      </div>
    );
  }

  const currentWord = remainingWords[currentWordIndex];
  const frontText = showIndonesianFirst ? currentWord.indonesian : currentWord.english;
  const backText = showIndonesianFirst ? currentWord.english : currentWord.indonesian;

  return (
    <div className="flashcard-game">
      <div className="game-header">
        <button onClick={onBack} className="back-button">← Back</button>
        <h2>Flashcards</h2>
        <div className="game-controls">
          <button 
            onClick={toggleLanguageOrder} 
            className="language-toggle"
          >
            {showIndonesianFirst ? 'Show English First' : 'Show Indonesian First'}
          </button>
          <button onClick={resetGame} className="reset-button">
            Reset
          </button>
        </div>
      </div>

      <div className="game-stats">
        <span>Remaining words: {remainingWords.length}</span>
        <span>Mastered words: {words.length - remainingWords.length}</span>
      </div>

      <div 
        className={`flashcard ${isFlipped ? 'flipped' : ''}`}
        onClick={handleFlip}
      >
        <div className="flashcard-inner">
          <div className="flashcard-front">
            <p>{frontText}</p>
          </div>
          <div className="flashcard-back">
            <p>{backText}</p>
          </div>
        </div>
      </div>

      <div className="action-buttons">
        <button 
          onClick={handleNeedsPractice}
          className="practice-button"
        >
          👎 Need Practice
        </button>
        <button 
          onClick={handleGotIt}
          className="got-it-button"
        >
          👍 Got It!
        </button>
      </div>
    </div>
  );
}; 