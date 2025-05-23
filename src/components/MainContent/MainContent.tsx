import React, { useState } from 'react';
import { GameView } from '../GameView/GameView';
import './MainContent.css';

interface MainContentProps {
  selectedWordCount: number;
}

type GameType = 'flashcards' | 'matching' | 'quiz' | 'story' | 'fill-blanks';

export const MainContent: React.FC<MainContentProps> = ({ selectedWordCount }) => {
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
        selectedWordCount={selectedWordCount}
      />
    );
  }

  return (
    <div className="main-content">
      <div className="welcome-section">
        <h2>Choose a Practice Game</h2>
        <p>{selectedWordCount} vocabulary words selected</p>
        
        <div className="game-section">
          <h3>Static Games</h3>
          <div className="game-grid">
            <button 
              className="game-button flashcards"
              onClick={() => handleGameSelect('flashcards')}
            >
              <h4>Flashcards</h4>
              <p>Basic practice</p>
            </button>
            <button 
              className="game-button matching"
              onClick={() => handleGameSelect('matching')}
            >
              <h4>Matching</h4>
              <p>Connect words</p>
            </button>
            <button 
              className="game-button quiz"
              onClick={() => handleGameSelect('quiz')}
            >
              <h4>Quiz</h4>
              <p>Multiple choice</p>
            </button>
          </div>

          <h3>AI-Generated Games</h3>
          <div className="game-grid">
            <button 
              className="game-button story"
              onClick={() => handleGameSelect('story')}
            >
              <h4>Story</h4>
              <p>Read & practice</p>
            </button>
            <button 
              className="game-button fill-blanks"
              onClick={() => handleGameSelect('fill-blanks')}
            >
              <h4>Fill Blanks</h4>
              <p>Complete story</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 