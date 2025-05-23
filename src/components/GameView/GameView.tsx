import React from 'react';
import './GameView.css';

interface GameViewProps {
  gameType: 'flashcards' | 'matching' | 'quiz' | 'story' | 'fill-blanks';
  onBack: () => void;
  selectedWordCount: number;
}

export const GameView: React.FC<GameViewProps> = ({ 
  gameType, 
  onBack,
  selectedWordCount 
}) => {
  return (
    <div className="game-view">
      <div className="game-header">
        <button className="back-button" onClick={onBack}>
          ← Back to games
        </button>
        <div className="game-info">
          <h2>{gameType.charAt(0).toUpperCase() + gameType.slice(1)}</h2>
          <p>{selectedWordCount} words selected</p>
        </div>
      </div>
      <div className="game-content">
        <p className="placeholder-text">
          {gameType} game coming soon!
        </p>
      </div>
    </div>
  );
}; 