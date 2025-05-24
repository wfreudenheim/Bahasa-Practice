import React, { useState, useEffect } from 'react';
import { GameHeader } from '../shared/GameHeader';
import styles from './GameSetup.module.css';

interface GameSetupProps {
  selectedWords: number;
  maxWords: number;
  onWordsChange: (count: number) => void;
}

export const GameSetup: React.FC<GameSetupProps> = ({
  selectedWords,
  maxWords,
  onWordsChange
}) => {
  const [wordCount, setWordCount] = useState(selectedWords);
  const [paragraphs, setParagraphs] = useState(1);
  const [complexity, setComplexity] = useState<'simple' | 'medium' | 'complex'>('medium');

  // Update word count when selected words changes
  useEffect(() => {
    setWordCount(Math.min(selectedWords, maxWords));
  }, [selectedWords, maxWords]);

  const handleWordCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(parseInt(e.target.value) || 0, maxWords);
    setWordCount(value);
    onWordsChange(value);
  };

  return (
    <div className={styles.container}>
      <GameHeader
        initialTime={60}
        wordCount={wordCount}
        onTimeUp={() => console.log('Time up!')}
      />
      
      <div className={styles.settings}>
        <div className={styles.setting}>
          <label htmlFor="wordCount">Words to include:</label>
          <input
            type="number"
            id="wordCount"
            value={wordCount}
            onChange={handleWordCountChange}
            min={1}
            max={maxWords}
            className={styles.input}
          />
          <span className={styles.maxWords}>Max: {maxWords}</span>
        </div>

        <div className={styles.setting}>
          <label htmlFor="paragraphs">Number of paragraphs:</label>
          <input
            type="number"
            id="paragraphs"
            value={paragraphs}
            onChange={(e) => setParagraphs(parseInt(e.target.value) || 1)}
            min={1}
            max={5}
            className={styles.input}
          />
        </div>

        <div className={styles.setting}>
          <label htmlFor="complexity">Story complexity:</label>
          <select
            id="complexity"
            value={complexity}
            onChange={(e) => setComplexity(e.target.value as any)}
            className={styles.select}
          >
            <option value="simple">Simple</option>
            <option value="medium">Medium</option>
            <option value="complex">Complex</option>
          </select>
        </div>
      </div>
    </div>
  );
}; 