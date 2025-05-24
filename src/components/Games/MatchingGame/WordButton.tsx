import React from 'react';
import styles from './MatchingGame.module.css';

interface WordButtonProps {
  text: string;
  isSelected: boolean;
  isMatched: boolean;
  onClick: () => void;
}

export const WordButton: React.FC<WordButtonProps> = ({
  text,
  isSelected,
  isMatched,
  onClick
}) => {
  const buttonClasses = [
    styles.wordButton,
    isSelected && styles.selected,
    isMatched && styles.matched
  ].filter(Boolean).join(' ');

  return (
    <button
      className={buttonClasses}
      onClick={onClick}
      disabled={isMatched}
    >
      {text}
    </button>
  );
}; 