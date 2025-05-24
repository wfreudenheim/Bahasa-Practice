import React, { useState } from 'react';
import { GameSetup } from '../GameSetup/GameSetup';
import { Timer } from '../Timer/Timer';
import { GameConfig } from '../../types/gameTypes';
import { VocabItem } from '../../interfaces/vocab';
import styles from './GameSetupTest.module.css';

interface GameSetupTestProps {
    onBack?: () => void;
    selectedWords?: VocabItem[];
}

export const GameSetupTest: React.FC<GameSetupTestProps> = ({ onBack, selectedWords = [] }) => {
    const [gameStarted, setGameStarted] = useState(false);
    const [config, setConfig] = useState<GameConfig | null>(null);

    const handleConfigSubmit = (newConfig: GameConfig) => {
        setConfig(newConfig);
        setGameStarted(true);
    };

    const handleGameComplete = () => {
        alert('Time\'s up! Game complete!');
        setGameStarted(false);
        setConfig(null);
    };

    const handleTimerTick = (remainingTime: number) => {
        console.log(`Time remaining: ${remainingTime} seconds`);
    };

    const handleBack = () => {
        if (gameStarted) {
            setGameStarted(false);
            setConfig(null);
        } else if (onBack) {
            onBack();
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <button className={styles.backButton} onClick={handleBack}>
                    ← {gameStarted ? 'Back to Setup' : 'Back to Games'}
                </button>
                <h2>Game Setup Test</h2>
            </div>

            {gameStarted && config && (
                <div className={styles.timerSection}>
                    <Timer
                        duration={config.timeLimit}
                        mode="countdown"
                        onComplete={handleGameComplete}
                        onTick={handleTimerTick}
                        autoStart={true}
                    />
                </div>
            )}

            {!gameStarted ? (
                <GameSetup
                    onConfigSubmit={handleConfigSubmit}
                    showStoryOptions={true}
                    defaultConfig={{
                        wordCount: Math.min(20, selectedWords.length),
                        timeLimit: 120,
                        numberOfParagraphs: 1,
                        storyComplexity: 'medium'
                    }}
                    maxWordCount={selectedWords.length}
                />
            ) : (
                <div className={styles.gameSection}>
                    <div className={styles.gameStats}>
                        <p>Words selected: {config?.wordCount}</p>
                        {config?.numberOfParagraphs && (
                            <p>Number of paragraphs: {config.numberOfParagraphs}</p>
                        )}
                        {config?.storyComplexity && (
                            <p>Story complexity: {config.storyComplexity}</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};