import React, { useState, ReactElement } from 'react';
import { ClaudeService, ClaudeConfig, GeneratedContent } from '../../services/claudeService';
import { VocabItem } from '../../types/vocabulary';
import styles from './ClaudeTest.module.css';

interface ClaudeTestProps {
  selectedVocabulary: VocabItem[];
}

export const ClaudeTest: React.FC<ClaudeTestProps> = ({ selectedVocabulary }) => {
  const [config, setConfig] = useState<ClaudeConfig>({
    paragraphs: 1,
    difficulty: 'easy',
    customPrompt: ''
  });
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEnglish, setShowEnglish] = useState(true);

  const handleGenerate = async () => {
    if (selectedVocabulary.length === 0) {
      setError('Please select some vocabulary words');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const claudeService = new ClaudeService();
      const result = await claudeService.generateStory(selectedVocabulary, config);
      setContent(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const boldVocabWords = (text: string, isIndonesian: boolean): ReactElement => {
    // Split the text into lines and filter out empty lines
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    const processLine = (line: string): string => {
      const wordsToHighlight = selectedVocabulary.reduce((acc, item) => {
        if (isIndonesian) {
          acc[item.indonesian.toLowerCase()] = item.indonesian;
          acc[item.english.toLowerCase()] = item.english;
        } else {
          acc[item.english.toLowerCase()] = item.english;
          acc[item.indonesian.toLowerCase()] = item.indonesian;
        }
        return acc;
      }, {} as Record<string, string>);

      const pattern = '\\b(' + Object.keys(wordsToHighlight).map(word => 
        word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      ).join('|') + ')\\b';
      
      const regex = new RegExp(pattern, 'gi');
      
      return line.replace(regex, (match) => {
        const originalWord = wordsToHighlight[match.toLowerCase()];
        return `<strong class="${styles.vocabWord} ${isIndonesian ? styles.indonesian : styles.english}">${originalWord}</strong>`;
      });
    };

    return (
      <div className={styles.textContent}>
        {lines.map((line, index) => (
          <div key={index} className={styles.paragraph}>
            <span dangerouslySetInnerHTML={{ __html: processLine(line.trim()) }} />
          </div>
        ))}
      </div>
    );
  };

  const promptExamples = [
    'Create a dialogue between two friends meeting at a café',
    'Write a bedtime story for children',
    'Describe a traditional Indonesian celebration',
    'Write a recipe with cooking instructions',
    'Create a conversation between a tourist and a local'
  ];

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <div className={styles.configSection}>
          <label>
            Number of Paragraphs:
            <select
              value={config.paragraphs}
              onChange={(e) => setConfig({ ...config, paragraphs: parseInt(e.target.value) })}
            >
              {[1, 2, 3, 4, 5].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </label>

          <label>
            Difficulty:
            <select
              value={config.difficulty}
              onChange={(e) => setConfig({ ...config, difficulty: e.target.value as ClaudeConfig['difficulty'] })}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </label>

          <label className={styles.customPromptLabel}>
            Custom Prompt:
            <textarea
              value={config.customPrompt}
              onChange={(e) => setConfig({ ...config, customPrompt: e.target.value })}
              placeholder="Enter a custom prompt or select an example below"
              rows={3}
            />
          </label>

          <div className={styles.promptExamples}>
            <p>Example prompts (click to use):</p>
            <div className={styles.exampleButtons}>
              {promptExamples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setConfig({ ...config, customPrompt: example })}
                  className={styles.exampleButton}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={loading || selectedVocabulary.length === 0}
            className={styles.generateButton}
          >
            {loading ? 'Generating...' : 'Generate Content'}
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}
      </div>

      {content && (
        <>
          <div className={styles.translationToggle}>
            <button 
              onClick={() => setShowEnglish(!showEnglish)}
              className={styles.toggleButton}
            >
              {showEnglish ? 'Hide' : 'Show'} English Translation
            </button>
          </div>
          <div className={styles.content}>
            <div className={styles.textColumns}>
              <div className={styles.column}>
                <h3>Bahasa Indonesia</h3>
                {boldVocabWords(content.indonesian, true)}
              </div>
              <div className={`${styles.column} ${!showEnglish ? styles.hidden : ''}`}>
                <h3>English</h3>
                {boldVocabWords(content.english, false)}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}; 