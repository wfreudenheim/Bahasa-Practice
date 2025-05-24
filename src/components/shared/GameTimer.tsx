import React, { useEffect, useState } from 'react';
import styles from './GameTimer.module.css';

interface GameTimerProps {
  initialTime: number; // in seconds
  onTimeUp?: () => void;
  isPaused?: boolean;
}

export const GameTimer: React.FC<GameTimerProps> = ({
  initialTime,
  onTimeUp,
  isPaused = false
}) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            clearInterval(interval);
            onTimeUp?.();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, isPaused, timeLeft, onTimeUp]);

  const getTimerColor = () => {
    const percentage = (timeLeft / initialTime) * 100;
    if (percentage > 20) {
      return `hsl(${percentage * 1.2}, 70%, 45%)`; // Gradual change from green to yellow
    }
    // Last 20% - more dramatic color change
    return `hsl(${percentage * 1.2}, 85%, 45%)`; // Yellow to red
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className={styles.timerContainer}
      style={{ backgroundColor: getTimerColor() }}
    >
      <span className={styles.time}>{formatTime(timeLeft)}</span>
    </div>
  );
}; 