import React from 'react';
import styles from './GameControls.module.css';

interface GameControlsProps {
  isPaused: boolean;
  onPauseToggle: () => void;
  onReset: () => void;
}

export const GameControls: React.FC<GameControlsProps> = ({
  isPaused,
  onPauseToggle,
  onReset,
}) => {
  return (
    <div className={styles.controls}>
      <button 
        className={`${styles.controlButton} ${isPaused ? styles.paused : ''}`}
        onClick={onPauseToggle}
      >
        {isPaused ? 'Resume' : 'Pause'}
      </button>
      <button 
        className={`${styles.controlButton} ${styles.reset}`}
        onClick={onReset}
      >
        Reset
      </button>
    </div>
  );
}; 