import React, { useState } from 'react';
import { GameView, GameType } from '../Games/GameView';
import { VocabItem } from '../../interfaces/vocab';
import './MainContent.css';

interface MainContentProps {
  selectedWords: VocabItem[];
}

export const MainContent: React.FC<MainContentProps> = ({ selectedWords }) => {
  const [currentGame, setCurrentGame] = useState<GameType | null>(null);

  const handleGameSelect = (gameType: GameType) => {
    setCurrentGame(gameType);
  };

  const handleBackToGames = () => {
    setCurrentGame(null);
  };

  if (currentGame) {
    return (
      <GameView 
        gameType={currentGame}
        onBack={handleBackToGames}
        selectedWords={selectedWords}
      />
    );
  }

  return (
    <div className="main-content">
      <div className="welcome-section">
        <h2>Choose a Practice Game</h2>
        <p>{selectedWords.length} vocabulary words selected</p>
        
        <div className="game-section">
          <h3>Static Games</h3>
          <div className="game-grid">
            <button 
              className="game-button flashcards"
              onClick={() => handleGameSelect('flashcards')}
              disabled={selectedWords.length === 0}
            >
              <h4>Flashcards</h4>
              <p>Basic practice</p>
            </button>
            <button 
              className="game-button matching"
              onClick={() => handleGameSelect('matching')}
              disabled={selectedWords.length === 0}
            >
              <h4>Matching</h4>
              <p>Connect words</p>
            </button>
            <button 
              className="game-button quiz"
              onClick={() => handleGameSelect('quiz')}
              disabled={selectedWords.length === 0}
            >
              <h4>Quiz</h4>
              <p>Multiple choice</p>
            </button>
          </div>

          <h3>Development & Testing</h3>
          <div className="game-grid">
            <button 
              className="game-button setup-test"
              onClick={() => handleGameSelect('setup-test')}
              disabled={selectedWords.length === 0}
            >
              <h4>Game Setup Test</h4>
              <p>Test new game configuration</p>
            </button>
          </div>

          <h3>AI-Generated Games</h3>
          <div className="game-grid">
            <button 
              className="game-button ai-game"
              disabled={true}
            >
              <h4>Coming Soon</h4>
              <p>AI-powered practice</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 