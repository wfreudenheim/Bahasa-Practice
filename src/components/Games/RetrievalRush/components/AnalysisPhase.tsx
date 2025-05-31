import React from 'react';
import styles from '../RetrievalRushGame.module.css';

interface SuggestedVocab {
  indonesian: string;
  english: string;
}

interface AnalysisPhaseProps {
  prompt: {
    text: string;
    category: string;
  };
  response: string;
  analysis: {
    strengths: string[];
    grammarCorrections: Array<{
      original: string;
      corrected: string;
      explanation: string;
    }>;
    culturalTips: string[];
    improvementAreas: string[];
    suggestedVocabulary: SuggestedVocab[];
  };
  onStartOver: () => void;
}

const AnalysisPhase: React.FC<AnalysisPhaseProps> = ({
  prompt,
  response,
  analysis,
  onStartOver
}) => {
  return (
    <div className={styles.analysisContainer}>
      <div className={styles.analysisColumns}>
        {/* Left Column - Original Prompt and Response */}
        <div className={styles.analysisColumn}>
          <div className={styles.promptSection}>
            <h3 className={styles.sectionTitle}>Your Prompt:</h3>
            <div className={styles.card}>
              {prompt.text}
            </div>
          </div>

          <div className={styles.responseSection}>
            <h3 className={styles.sectionTitle}>Your Response:</h3>
            <div className={styles.card}>
              {response}
            </div>
          </div>
        </div>

        {/* Right Column - Analysis */}
        <div className={styles.analysisColumn}>
          <h3>Analysis</h3>
          
          <section className={styles.analysisSection}>
            <h4>Strengths</h4>
            <ul>
              {analysis.strengths.map((strength, index) => (
                <li key={index}>{strength}</li>
              ))}
            </ul>
          </section>

          <section className={styles.analysisSection}>
            <h4>Grammar Corrections</h4>
            {analysis.grammarCorrections.map((correction, index) => (
              <div key={index} className={styles.correction}>
                <div className={styles.correctionText}>
                  <span className={styles.original}>{correction.original}</span>
                  {' → '}
                  <span className={styles.corrected}>{correction.corrected}</span>
                </div>
                <p className={styles.explanation}>{correction.explanation}</p>
              </div>
            ))}
          </section>

          <section className={styles.analysisSection}>
            <h4>Cultural Tips</h4>
            <ul>
              {analysis.culturalTips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </section>

          <section className={styles.analysisSection}>
            <h4>Areas for Improvement</h4>
            <ul>
              {analysis.improvementAreas.map((area, index) => (
                <li key={index}>{area}</li>
              ))}
            </ul>
          </section>

          <section className={styles.analysisSection}>
            <h4>Suggested New Vocabulary</h4>
            <div className={styles.vocabList}>
              {analysis.suggestedVocabulary.map((vocab, index) => (
                <div key={index} className={styles.vocabItem}>
                  <span className={styles.indonesian}>{vocab.indonesian}</span>
                  <span className={styles.english}>{vocab.english}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className={styles.analysisActions}>
        <button
          className={styles.startOverButton}
          onClick={onStartOver}
        >
          Try Another Prompt
        </button>
      </div>
    </div>
  );
};

export default AnalysisPhase; 