import React from 'react';
import { VocabItem } from '../../interfaces/vocab';
import GameRegistry from '../../services/gameRegistry';
import './GameView.css';

interface GameViewProps {
  gameType: string;
  onBack: () => void;
  selectedWords: VocabItem[];
  config?: {
    wordCount: number;
    timeLimit: number;
  };
}

export const GameView: React.FC<GameViewProps> = ({ 
  gameType, 
  onBack,
  selectedWords,
  config = { wordCount: 10, timeLimit: 120 }
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

  const handleGameComplete = (result: any) => {
    console.log('Game completed:', result);
    // TODO: Handle game completion, save stats, etc.
  };

  const game = GameRegistry.getGame(gameType);
  if (!game) {
    return (
      <div className="game-view">
        <div className="game-header">
          <button onClick={onBack} className="back-button">← Back</button>
          <div className="game-info">
            <h2>Unknown Game Type</h2>
          </div>
        </div>
      </div>
    );
  }

  const GameComponent = game.component;
  return (
    <GameComponent
      words={selectedWords}
      onBack={onBack}
      config={config}
      onComplete={handleGameComplete}
    />
  );
}; 