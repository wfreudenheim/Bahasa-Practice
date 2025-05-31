import React, { useState, useEffect } from 'react';
import styles from '../RetrievalRushGame.module.css';

interface ResponsePhaseProps {
  prompt: {
    text: string;
    category: string;
  };
  timeRemaining: number;
  onComplete: (response: string) => void;
}

const ResponsePhase: React.FC<ResponsePhaseProps> = ({
  prompt,
  timeRemaining: initialTime,
  onComplete
}) => {
  const [response, setResponse] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(time => {
          if (time <= 1) {
            setIsActive(false);
            // Auto-complete when time runs out
            handleComplete();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, timeRemaining]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleComplete = () => {
    if (isActive) {
      setIsActive(false);
      onComplete(response);
    }
  };

  return (
    <div className={styles.phaseContainer}>
      <div className={styles.responseHeader}>
        <div className={styles.timer}>
          Time Remaining: {formatTime(timeRemaining)}
        </div>
        <button
          className={styles.completeButton}
          onClick={handleComplete}
          disabled={!isActive}
        >
          Complete
        </button>
      </div>

      <div className={styles.promptDisplay}>
        <h3>Your Prompt:</h3>
        <p className={styles.promptText}>{prompt.text}</p>
      </div>

      <div className={styles.responseSection}>
        <h3>Your Response:</h3>
        <textarea
          className={styles.responseInput}
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Type your response in Indonesian..."
          disabled={!isActive}
          autoFocus
        />
      </div>

      {timeRemaining === 0 && (
        <div className={styles.timeUpMessage}>
          Time's up! Your response has been submitted.
        </div>
      )}
    </div>
  );
};

export default ResponsePhase; 