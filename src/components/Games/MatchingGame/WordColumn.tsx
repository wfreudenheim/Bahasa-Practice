import React from 'react';
import { VocabItem } from '../../../interfaces/vocab';
import { WordButton } from './WordButton';
import styles from './MatchingGame.module.css';

interface WordColumnProps {
  words: VocabItem[];
  side: 'left' | 'right';
  selectedIndex: number | null;
  matchedPairs: Map<number, number>;
  onSelect: (side: 'left' | 'right', index: number) => void;
}

export const WordColumn: React.FC<WordColumnProps> = ({
  words,
  side,
  selectedIndex,
  matchedPairs,
  onSelect
}) => {
  const isMatched = (index: number) => {
    if (side === 'left') {
      return matchedPairs.has(index);
    } else {
      return Array.from(matchedPairs.values()).includes(index);
    }
  };

  return (
    <div className={styles.wordColumn}>
      {words.map((word, index) => (
        <WordButton
          key={`${side}-${index}`}
          text={side === 'left' ? word.indonesian : word.english}
          isSelected={selectedIndex === index}
          isMatched={isMatched(index)}
          onClick={() => onSelect(side, index)}
        />
      ))}
    </div>
  );
}; 