import React, { useState } from 'react';
import { GameTimer } from './GameTimer';
import { GameControls } from './GameControls';
import styles from './GameHeader.module.css';

interface GameHeaderProps {
  initialTime: number;
  wordCount: number;
  onTimeUp?: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  initialTime,
  wordCount,
  onTimeUp
}) => {
  const [isPaused, setIsPaused] = useState(false);

  const handlePauseToggle = () => {
    setIsPaused(!isPaused);
  };

  const handleReset = () => {
    // Reset logic will be handled by parent component
  };

  return (
    <div className={styles.header}>
      <div className={styles.info}>
        <h2>Game Setup Test</h2>
        <p>{wordCount} words selected</p>
      </div>
      <div className={styles.controls}>
        <GameTimer 
          initialTime={initialTime}
          onTimeUp={onTimeUp}
          isPaused={isPaused}
        />
        <GameControls
          isPaused={isPaused}
          onPauseToggle={handlePauseToggle}
          onReset={handleReset}
        />
      </div>
    </div>
  );
}; 