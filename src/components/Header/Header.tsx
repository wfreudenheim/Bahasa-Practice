import React from 'react';
import styles from './Header.module.css';

interface HeaderProps {
  isInGame: boolean;
  onHomeClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isInGame, onHomeClick }) => {
  return (
    <header className={styles.header}>
      <div 
        className={`${styles.title} ${isInGame ? styles.clickable : ''}`}
        onClick={isInGame ? onHomeClick : undefined}
      >
        <h1>
          <span className={styles.bahasa}>Bahasa</span>
          <span className={styles.indonesia}>Indonesia</span>
          <span className={styles.practice}>Vocabulary Practice</span>
        </h1>
      </div>
    </header>
  );
}; 