import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { GameView } from '../Games/GameView';
import { VocabItem } from '../../types/vocabulary';
import { GameType } from '../../types/gameTypes';
import GameRegistry, { Game } from '../../services/gameRegistry';
import './MainContent.css';

interface MainContentProps {
  selectedWords: VocabItem[];
  onGameStateChange?: (isInGame: boolean) => void;
}

export interface MainContentHandle {
  handleBackToGames: () => void;
}

export const MainContent = forwardRef<MainContentHandle, MainContentProps>(
  ({ selectedWords, onGameStateChange }, ref) => {
    const [currentGame, setCurrentGame] = useState<GameType | null>(null);

    useEffect(() => {
      onGameStateChange?.(currentGame !== null);
    }, [currentGame, onGameStateChange]);

    const handleGameSelect = (gameType: GameType) => {
      setCurrentGame(gameType);
    };

    const handleBackToGames = () => {
      setCurrentGame(null);
    };

    useImperativeHandle(ref, () => ({
      handleBackToGames
    }));

    const getGameDisabledReason = (game: Game): string | null => {
      // If the game doesn't require vocabulary, it's always enabled
      if (game.requiresVocabulary === false) return null;
      
      // For all other games, check vocabulary requirements
      if (selectedWords.length === 0) return 'Select vocabulary words to play';
      if (game.minWords && selectedWords.length < game.minWords) {
        return `Requires at least ${game.minWords} words`;
      }
      if (game.maxWords && selectedWords.length > game.maxWords) {
        return `Limited to ${game.maxWords} words maximum`;
      }
      return null;
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

    // Get all games instead of just available ones
    const allGames = GameRegistry.getAllGames();
    const staticGames = allGames.filter(game => game.category === 'static');
    const aiGames = allGames.filter(game => game.category === 'ai-generated');
    const devGames = allGames.filter(game => game.category === 'development');
    const externalGames = allGames.filter(game => game.category === 'external');

    return (
      <div className="main-content">
        <div className="welcome-section">
          <h2>Choose a Practice Game</h2>
          <p>{selectedWords.length} vocabulary words selected</p>
          
          <div className="game-section">
            <h3>Static Games</h3>
            <div className="game-grid">
              {staticGames.map(game => {
                const disabledReason = getGameDisabledReason(game);
                return (
                  <button 
                    key={game.id}
                    className={`game-button ${game.id} ${disabledReason ? 'disabled' : ''}`}
                    onClick={() => handleGameSelect(game.id as GameType)}
                    disabled={!!disabledReason}
                    title={disabledReason || ''}
                  >
                    <h4>{game.name}</h4>
                    <p>{game.description}</p>
                    {disabledReason && <small className="disabled-reason">{disabledReason}</small>}
                  </button>
                );
              })}
            </div>

            {aiGames.length > 0 && (
              <>
                <h3>AI-Generated Games</h3>
                <div className="game-grid">
                  {aiGames.map(game => {
                    const disabledReason = getGameDisabledReason(game);
                    return (
                      <button 
                        key={game.id}
                        className={`game-button ${game.id} ${disabledReason ? 'disabled' : ''}`}
                        onClick={() => handleGameSelect(game.id as GameType)}
                        disabled={!!disabledReason}
                        title={disabledReason || ''}
                      >
                        <h4>{game.name}</h4>
                        <p>{game.description}</p>
                        {disabledReason && <small className="disabled-reason">{disabledReason}</small>}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {externalGames.length > 0 && (
              <>
                <h3>External Content Games</h3>
                <div className="game-grid">
                  {externalGames.map(game => {
                    const disabledReason = getGameDisabledReason(game);
                    return (
                      <button 
                        key={game.id}
                        className={`game-button ${game.id} ${disabledReason ? 'disabled' : ''}`}
                        onClick={() => handleGameSelect(game.id as GameType)}
                        disabled={!!disabledReason}
                        title={disabledReason || ''}
                      >
                        <h4>{game.name}</h4>
                        <p>{game.description}</p>
                        {disabledReason && <small className="disabled-reason">{disabledReason}</small>}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {devGames.length > 0 && (
              <>
                <h3>Development & Testing</h3>
                <div className="game-grid">
                  {devGames.map(game => {
                    const disabledReason = getGameDisabledReason(game);
                    return (
                      <button 
                        key={game.id}
                        className={`game-button ${game.id} ${disabledReason ? 'disabled' : ''}`}
                        onClick={() => handleGameSelect(game.id as GameType)}
                        disabled={!!disabledReason}
                        title={disabledReason || ''}
                      >
                        <h4>{game.name}</h4>
                        <p>{game.description}</p>
                        {disabledReason && <small className="disabled-reason">{disabledReason}</small>}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
); 