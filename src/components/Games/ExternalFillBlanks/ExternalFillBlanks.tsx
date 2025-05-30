import React, { useState, useEffect } from 'react';
import { GameProps } from '../../../types/games';
import { Timer } from '../../Timer/Timer';
import styles from './ExternalFillBlanks.module.css';

interface ParsedQuestion {
  id: number;
  originalText: string;
  displayText: string;
  answers: string[];
  userAnswers: string[];
}

interface ExternalFillBlanksState {
  phase: 'setup' | 'playing' | 'results';
  rawContent: string;
  timePerQuestion: number;
  questions: ParsedQuestion[];
  totalTimeSeconds: number;
  startTime: number | null;
  showOverview: boolean;
  timeRemaining: number;
  score: {
    correct: number;
    total: number;
    percentage: number;
  } | null;
  questionOrder: number[];
}

const parseExternalContent = (content: string): ParsedQuestion[] => {
  const lines = content.split('\n').filter(line => line.trim());
  const questions: ParsedQuestion[] = [];
  
  lines.forEach((line, index) => {
    const numberMatch = line.match(/^\d+\.\s+(.+)$/);
    if (!numberMatch) return;
    
    const questionText = numberMatch[1];
    const answers: string[] = [];
    
    // Extract all [[answer]] patterns
    const answerMatches = Array.from(questionText.matchAll(/\[\[([^\]]+)\]\]/g));
    for (const match of answerMatches) {
      answers.push(match[1].trim());
    }
    
    // Replace [[answer]] with input placeholders
    const displayText = questionText.replace(/\[\[([^\]]+)\]\]/g, '___BLANK___');
    
    questions.push({
      id: index + 1,
      originalText: line,
      displayText,
      answers,
      userAnswers: new Array(answers.length).fill('')
    });
  });
  
  return questions;
};

const shuffleArray = (array: number[]) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const ExternalFillBlanks: React.FC<GameProps> = ({ onGameComplete, words = [], onBack }) => {
  const [state, setState] = useState<ExternalFillBlanksState>({
    phase: 'setup',
    rawContent: '',
    timePerQuestion: 10,
    questions: [],
    totalTimeSeconds: 0,
    startTime: null,
    showOverview: false,
    timeRemaining: 0,
    score: null,
    questionOrder: []
  });

  const calculateScore = () => {
    let correct = 0;
    let total = 0;

    state.questions.forEach(question => {
      question.answers.forEach((answer, index) => {
        total++;
        if (question.userAnswers[index]?.toLowerCase().trim() === answer.toLowerCase().trim()) {
          correct++;
        }
      });
    });

    return {
      correct,
      total,
      percentage: Math.round((correct / total) * 100)
    };
  };

  const handleContentChange = (content: string) => {
    setState(prev => ({
      ...prev,
      rawContent: content,
      showOverview: false
    }));
  };

  const handleTimePerQuestionChange = (seconds: number) => {
    setState(prev => ({
      ...prev,
      timePerQuestion: seconds,
      totalTimeSeconds: prev.questions.length * seconds
    }));
  };

  const handleParseAndPreview = () => {
    const parsedQuestions = parseExternalContent(state.rawContent);
    const totalTime = parsedQuestions.length * state.timePerQuestion;
    
    setState(prev => ({
      ...prev,
      questions: parsedQuestions,
      totalTimeSeconds: totalTime,
      showOverview: true
    }));
  };

  const handleStartGame = () => {
    const questionOrder = shuffleArray([...Array(state.questions.length)].map((_, i) => i));
    setState(prev => ({
      ...prev,
      phase: 'playing',
      startTime: Date.now(),
      timeRemaining: prev.totalTimeSeconds,
      questionOrder,
      score: null
    }));
  };

  const handlePlayAgain = () => {
    const newQuestions = state.questions.map(q => ({
      ...q,
      userAnswers: new Array(q.answers.length).fill('')
    }));
    const newQuestionOrder = shuffleArray([...Array(newQuestions.length)].map((_, i) => i));
    
    setState(prev => ({
      ...prev,
      phase: 'playing',
      startTime: Date.now(),
      timeRemaining: prev.totalTimeSeconds,
      questions: newQuestions,
      questionOrder: newQuestionOrder,
      score: null
    }));
  };

  const handleAnswerChange = (questionIndex: number, blankIndex: number, value: string) => {
    if (state.phase !== 'playing') return;
    
    setState(prev => {
      const newQuestions = [...prev.questions];
      newQuestions[questionIndex] = {
        ...newQuestions[questionIndex],
        userAnswers: newQuestions[questionIndex].userAnswers.map(
          (ans, i) => i === blankIndex ? value : ans
        )
      };
      return { ...prev, questions: newQuestions };
    });
  };

  const handleCheckAnswers = () => {
    const score = calculateScore();
    setState(prev => ({
      ...prev,
      phase: 'results',
      score
    }));
  };

  const handleTimeUp = () => {
    handleCheckAnswers();
  };

  const renderQuestion = (question: ParsedQuestion, displayIndex: number) => {
    const parts = question.displayText.split('___BLANK___');
    const isResults = state.phase === 'results';
    
    return (
      <div key={question.id} className={styles.questionContainer}>
        <h4>Question {displayIndex + 1}</h4>
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            {part}
            {index < parts.length - 1 && (
              <div className={styles.answerContainer}>
                {isResults && question.userAnswers[index]?.toLowerCase().trim() !== question.answers[index].toLowerCase().trim() && (
                  <div className={styles.correctAnswer}>
                    {question.answers[index]}
                  </div>
                )}
                <input
                  type="text"
                  value={question.userAnswers[index] || ''}
                  onChange={(e) => handleAnswerChange(state.questionOrder[displayIndex], index, e.target.value)}
                  className={`${styles.answerInput} ${
                    isResults 
                      ? question.userAnswers[index]?.toLowerCase().trim() === question.answers[index].toLowerCase().trim()
                        ? styles.correctInput
                        : styles.incorrectInput
                      : ''
                  }`}
                  readOnly={isResults}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const totalBlanks = state.questions.reduce((sum, q) => sum + q.answers.length, 0);

  return (
    <div className={styles.container}>
      {state.phase === 'setup' && (
        <div className={styles.setupContainer}>
          <div className={styles.header}>
            <button onClick={onBack} className={styles.backButton}>← Back</button>
            <h3>Fill in the Blanks</h3>
          </div>
          
          <div className={styles.inputSection}>
            <label>Paste your numbered fill-in-the-blanks content:</label>
            <textarea
              value={state.rawContent}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="1. Saya [[tidak]] suka makanan pedas.&#10;2. Ini [[bukan]] rumah saya."
              className={styles.contentTextarea}
              rows={10}
            />
          </div>
          
          <div className={styles.configSection}>
            <label>
              Time per question (seconds):
              <input
                type="number"
                value={state.timePerQuestion}
                onChange={(e) => handleTimePerQuestionChange(Number(e.target.value))}
                min={5}
                max={120}
                className={styles.timeInput}
              />
            </label>
          </div>
          
          <button 
            onClick={handleParseAndPreview}
            disabled={!state.rawContent.trim()}
            className={styles.parseButton}
          >
            Parse Content
          </button>

          {state.showOverview && state.questions.length > 0 && (
            <div className={styles.overview}>
              <h4>Content Overview</h4>
              <div className={styles.overviewStats}>
                <p>Total questions: {state.questions.length}</p>
                <p>Total blanks to fill: {totalBlanks}</p>
                <p>Time per question: {state.timePerQuestion} seconds</p>
                <p>Total time: {state.totalTimeSeconds} seconds</p>
              </div>
              <button 
                onClick={handleStartGame}
                className={styles.startButton}
              >
                Begin Practice
              </button>
            </div>
          )}
        </div>
      )}
      
      {(state.phase === 'playing' || state.phase === 'results') && (
        <div className={styles.gameContainer}>
          <div className={styles.gameHeader}>
            <button onClick={onBack} className={styles.backButton}>← Back</button>
            <h3>Fill in the Blanks</h3>
            {state.phase === 'playing' && (
              <Timer
                duration={state.totalTimeSeconds}
                mode="countdown"
                onComplete={handleTimeUp}
                onTick={(remaining) => setState(prev => ({ ...prev, timeRemaining: remaining }))}
                autoStart={true}
              />
            )}
          </div>

          {state.phase === 'results' && state.score && (
            <div className={styles.scoreContainer}>
              <div className={styles.scoreText}>
                Score: {state.score.correct} out of {state.score.total} ({state.score.percentage}%)
              </div>
              <button onClick={handlePlayAgain} className={styles.playAgainButton}>
                Play Again
              </button>
            </div>
          )}

          <div className={styles.progressInfo}>
            <span>{state.questions.length} Questions Total</span>
            <span>Time Remaining: {Math.floor(state.timeRemaining / 60)}:{(state.timeRemaining % 60).toString().padStart(2, '0')} / {Math.floor(state.totalTimeSeconds / 60)}:{(state.totalTimeSeconds % 60).toString().padStart(2, '0')}</span>
          </div>

          <div className={styles.questionsContainer}>
            {state.questionOrder.map((questionIndex, displayIndex) => 
              renderQuestion(state.questions[questionIndex], displayIndex)
            )}
          </div>

          {state.phase === 'playing' && (
            <button 
              onClick={handleCheckAnswers}
              className={styles.checkAnswersButton}
            >
              Check Answers
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ExternalFillBlanks; 