import React, { useState } from 'react';
import styles from '../RetrievalRushGame.module.css';

interface SetupPhaseProps {
  onGeneratePrompts: (difficulty: 'beginner' | 'intermediate' | 'advanced', promptLanguage: 'english' | 'indonesian') => void;
  isLoading: boolean;
}

export const SetupPhase: React.FC<SetupPhaseProps> = ({
  onGeneratePrompts,
  isLoading
}) => {
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [promptLanguage, setPromptLanguage] = useState<'english' | 'indonesian'>('english');

  return (
    <div className={styles.phaseContainer}>
      <h3>Generate Speaking Prompts</h3>
      <p>Select your difficulty level and prompt language to practice speaking Indonesian.</p>
      
      <div className={styles.setupOptions}>
        <div className={styles.difficultySelector}>
          <label>Difficulty Level:</label>
          <select 
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as 'beginner' | 'intermediate' | 'advanced')}
            disabled={isLoading}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div className={styles.difficultySelector}>
          <label>Prompt Language:</label>
          <select
            value={promptLanguage}
            onChange={(e) => setPromptLanguage(e.target.value as 'english' | 'indonesian')}
            disabled={isLoading}
          >
            <option value="english">English</option>
            <option value="indonesian">Indonesian</option>
          </select>
        </div>

        <button
          className={styles.generateButton}
          onClick={() => onGeneratePrompts(difficulty, promptLanguage)}
          disabled={isLoading}
        >
          {isLoading ? 'Generating...' : 'Generate Prompts'}
        </button>
      </div>
    </div>
  );
};

export default SetupPhase; 