import React, { useState, useEffect, useCallback } from 'react';
import { TimerProps } from '../../types/gameTypes';
import styles from './Timer.module.css';

export const Timer: React.FC<TimerProps> = ({
    duration,
    mode = 'countdown',
    onComplete,
    onTick,
    autoStart = false,
    shouldStop = false
}) => {
    const [time, setTime] = useState(mode === 'countdown' ? duration : 0);
    const [isRunning, setIsRunning] = useState(autoStart);

    // Stop timer when shouldStop becomes true
    useEffect(() => {
        if (shouldStop && isRunning) {
            setIsRunning(false);
        }
    }, [shouldStop]);

    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const getTimerColor = () => {
        const percentage = mode === 'countdown' 
            ? (time / duration) * 100 
            : ((duration - time) / duration) * 100;
        
        if (percentage > 20) {
            return `hsl(${percentage * 1.2}, 70%, 45%)`; // Gradual change from green to yellow
        }
        // Last 20% - more dramatic color change
        return `hsl(${percentage * 1.2}, 85%, 45%)`; // Yellow to red
    };

    const tick = useCallback(() => {
        if (mode === 'countdown') {
            setTime(prevTime => {
                const newTime = prevTime - 1;
                if (newTime <= 0) {
                    setIsRunning(false);
                    onComplete?.();
                    return 0;
                }
                onTick?.(newTime);
                return newTime;
            });
        } else {
            setTime(prevTime => {
                const newTime = prevTime + 1;
                if (newTime >= duration) {
                    setIsRunning(false);
                    onComplete?.();
                    return duration;
                }
                onTick?.(newTime);
                return newTime;
            });
        }
    }, [mode, duration, onComplete, onTick]);

    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        if (isRunning && !shouldStop) {
            intervalId = setInterval(tick, 1000);
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [isRunning, shouldStop, tick]);

    const toggleTimer = () => {
        if (!shouldStop) {
            setIsRunning(prev => !prev);
        }
    };

    const resetTimer = () => {
        setIsRunning(false);
        setTime(mode === 'countdown' ? duration : 0);
    };

    return (
        <div className={styles.timerContainer}>
            <div 
                className={styles.timer}
                style={{ backgroundColor: getTimerColor() }}
            >
                <span className={styles.time}>{formatTime(time)}</span>
            </div>
            <div className={styles.controls}>
                <button 
                    className={`${styles.controlButton} ${isRunning ? styles.pause : styles.play}`}
                    onClick={toggleTimer}
                    disabled={shouldStop}
                >
                    {isRunning ? 'Pause' : 'Resume'}
                </button>
                <button 
                    className={`${styles.controlButton} ${styles.reset}`}
                    onClick={resetTimer}
                    disabled={shouldStop}
                >
                    Reset
                </button>
            </div>
        </div>
    );
}; 