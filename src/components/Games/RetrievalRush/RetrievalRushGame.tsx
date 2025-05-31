import React, { useState } from 'react';
import { VocabItem } from '../../../types/vocabulary';
import { GameConfig } from '../../../types/gameTypes';
import styles from './RetrievalRushGame.module.css';
import SetupPhase from './components/SetupPhase';
import PromptSelectionPhase from './components/PromptSelectionPhase';
import ResponsePhase from './components/ResponsePhase';
import AnalysisPhase from './components/AnalysisPhase';
import { ClaudeService } from '../../../services/claudeService';

interface RetrievalRushGameProps {
  words: VocabItem[]; // Note: This will be empty as we don't require vocabulary
  onBack: () => void;
  config?: GameConfig;
}

type GamePhase = 'setup' | 'prompt-selection' | 'responding' | 'analysis';

interface Prompt {
  id: string;
  text: string;
  category: string;
  difficulty: string;
  estimatedTime: number;
}

interface GameState {
  phase: GamePhase;
  prompts: Prompt[];
  selectedPrompt: Prompt | null;
  response: string;
  timeRemaining: number;
  isTimerActive: boolean;
  analysis: any | null;
  loading: boolean;
  error: string | null;
  promptLanguage: 'english' | 'indonesian';
}

interface PromptAnalysis {
  strengths: string[];
  grammarCorrections: Array<{
    original: string;
    corrected: string;
    explanation: string;
  }>;
  vocabularySuggestions: string[];
  culturalTips: string[];
  improvementAreas: string[];
  newVocabulary: Array<{
    indonesian: string;
    english: string;
  }>;
}

const claudeService = new ClaudeService();

export const RetrievalRushGame: React.FC<RetrievalRushGameProps> = ({
  onBack,
  config
}) => {
  const [gameState, setGameState] = useState<GameState>({
    phase: 'setup',
    prompts: [],
    selectedPrompt: null,
    response: '',
    timeRemaining: 0,
    isTimerActive: false,
    analysis: null,
    loading: false,
    error: null,
    promptLanguage: 'english'
  });

  const handleStartOver = () => {
    setGameState(prev => ({
      ...prev,
      phase: 'setup',
      prompts: [],
      selectedPrompt: null,
      response: '',
      timeRemaining: 0,
      isTimerActive: false,
      analysis: null,
      error: null
    }));
  };

  const handleGeneratePrompts = async (
    difficulty: 'beginner' | 'intermediate' | 'advanced',
    promptLanguage: 'english' | 'indonesian'
  ) => {
    setGameState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const prompts = await claudeService.generatePrompts(difficulty, promptLanguage);
      setGameState(prev => ({
        ...prev,
        loading: false,
        prompts,
        promptLanguage,
        phase: 'prompt-selection'
      }));
    } catch (error) {
      setGameState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to generate prompts. Please try again.'
      }));
    }
  };

  const handleSelectPrompt = (prompt: Prompt, selectedTime: number) => {
    setGameState(prev => ({
      ...prev,
      selectedPrompt: prompt,
      timeRemaining: selectedTime,
      phase: 'responding'
    }));
  };

  const handleResponseComplete = async (response: string) => {
    setGameState(prev => ({ ...prev, loading: true, response }));
    try {
      const analysis = await claudeService.analyzeResponse(
        gameState.selectedPrompt!,
        response,
        gameState.promptLanguage
      );
      setGameState(prev => ({
        ...prev,
        loading: false,
        analysis,
        phase: 'analysis'
      }));
    } catch (error) {
      setGameState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to analyze response. Please try again.'
      }));
    }
  };

  const renderPhase = () => {
    switch (gameState.phase) {
      case 'setup':
        return (
          <SetupPhase
            onGeneratePrompts={handleGeneratePrompts}
            isLoading={gameState.loading}
          />
        );
      case 'prompt-selection':
        return (
          <PromptSelectionPhase
            prompts={gameState.prompts}
            onSelectPrompt={handleSelectPrompt}
          />
        );
      case 'responding':
        return gameState.selectedPrompt ? (
          <ResponsePhase
            prompt={gameState.selectedPrompt}
            timeRemaining={gameState.timeRemaining}
            onComplete={handleResponseComplete}
          />
        ) : null;
      case 'analysis':
        return gameState.selectedPrompt && gameState.analysis ? (
          <AnalysisPhase
            prompt={gameState.selectedPrompt}
            response={gameState.response}
            analysis={gameState.analysis}
            onStartOver={handleStartOver}
          />
        ) : null;
    }
  };

  return (
    <div className={styles.gameContainer}>
      <div className={styles.gameHeader}>
        <button onClick={onBack} className={styles.backButton}>← Back</button>
        <h2>Retrieval Rush</h2>
      </div>
      {gameState.loading && (
        <div className={styles.loadingState}>Loading...</div>
      )}
      {gameState.error && (
        <div className={styles.errorState}>{gameState.error}</div>
      )}
      {renderPhase()}
    </div>
  );
};

export default RetrievalRushGame; 