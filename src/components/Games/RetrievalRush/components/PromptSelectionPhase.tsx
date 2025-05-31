import React, { useState } from 'react';
import styles from '../RetrievalRushGame.module.css';

interface Prompt {
  id: string;
  text: string;
  category: string;
  difficulty: string;
  estimatedTime: number;
}

interface PromptSelectionPhaseProps {
  prompts: Prompt[];
  onSelectPrompt: (prompt: Prompt, selectedTime: number) => void;
}

const PromptSelectionPhase: React.FC<PromptSelectionPhaseProps> = ({
  prompts,
  onSelectPrompt
}) => {
  const [selectedTime, setSelectedTime] = useState(120); // Default 2 minutes

  return (
    <div className={styles.phaseContainer}>
      <h3>Select a Speaking Prompt</h3>
      <p>Choose a prompt to practice your Indonesian speaking skills.</p>
      
      <div className={styles.promptControls}>
        <div className={styles.controlGroup}>
          <label htmlFor="time-select">Response Time:</label>
          <select 
            id="time-select"
            value={selectedTime}
            onChange={(e) => setSelectedTime(Number(e.target.value))}
            className={styles.timeSelect}
          >
            <option value={60}>1 minute</option>
            <option value={120}>2 minutes</option>
            <option value={180}>3 minutes</option>
            <option value={240}>4 minutes</option>
            <option value={300}>5 minutes</option>
          </select>
        </div>
      </div>
      
      <div className={styles.promptList}>
        {prompts.map((prompt) => (
          <div key={prompt.id} className={styles.promptCard}>
            <div className={styles.promptContent}>
              <p className={styles.promptText}>{prompt.text}</p>
              <div className={styles.promptMeta}>
                <span className={styles.promptCategory}>{prompt.category}</span>
              </div>
            </div>
            <button
              className={styles.selectPromptButton}
              onClick={() => onSelectPrompt(prompt, selectedTime)}
            >
              Select Prompt
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PromptSelectionPhase; 