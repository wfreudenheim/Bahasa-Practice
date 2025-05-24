import React from 'react';
import { FlashcardGame } from './FlashcardGame/FlashcardGame';
import { VocabItem } from '../../interfaces/vocab';
import './GameView.css';

export type GameType = 'flashcards' | 'matching' | 'quiz';

interface GameViewProps {
  gameType: GameType;
  onBack: () => void;
  selectedWords: VocabItem[];
}

export const GameView: React.FC<GameViewProps> = ({ 
  gameType, 
  onBack,
  selectedWords 
}) => {
  if (selectedWords.length === 0) {
    return (
      <div className="game-view empty-state">
        <h2>No Words Selected</h2>
        <p>Please select some vocabulary words to practice with.</p>
        <button onClick={onBack} className="back-button">
          ← Back to Game Selection
        </button>
      </div>
    );
  }

  switch (gameType) {
    case 'flashcards':
      return <FlashcardGame words={selectedWords} onBack={onBack} />;
    case 'matching':
      return (
        <div className="game-view">
          <h2>Matching Game</h2>
          <p>Coming soon!</p>
          <button onClick={onBack}>Back</button>
        </div>
      );
    case 'quiz':
      return (
        <div className="game-view">
          <h2>Quiz Game</h2>
          <p>Coming soon!</p>
          <button onClick={onBack}>Back</button>
        </div>
      );
    default:
      return (
        <div className="game-view">
          <h2>Unknown Game Type</h2>
          <button onClick={onBack}>Back</button>
        </div>
      );
  }
}; 