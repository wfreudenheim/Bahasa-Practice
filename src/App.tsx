import React, { useState } from 'react';
import { VocabSet } from './interfaces/vocab';
import { Layout } from './components/Layout/Layout';
import { VocabularySidebar } from './components/VocabularySidebar/VocabularySidebar';
import { MainContent } from './components/MainContent/MainContent';
import './App.css';

function App() {
  const [vocabSets, setVocabSets] = useState<VocabSet[]>([]);
  const [selectedSets, setSelectedSets] = useState<VocabSet[]>([]);

  const handleVocabLoaded = (newVocabSet: VocabSet) => {
    setVocabSets(prev => {
      // Check if we already have this set
      const exists = prev.some(set => set.id === newVocabSet.id);
      if (exists) return prev;
      return [...prev, newVocabSet];
    });
  };

  const handleSelectionChange = (newSelectedSets: VocabSet[]) => {
    setSelectedSets(newSelectedSets);
  };

  // Calculate total selected words
  const selectedWordCount = selectedSets.reduce((sum, set) => sum + set.wordCount, 0);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Bahasa Indonesia Vocabulary Practice</h1>
      </header>
      <Layout 
        sidebar={
          <VocabularySidebar 
            vocabSets={vocabSets}
            onVocabLoaded={handleVocabLoaded}
            onSelectionChange={handleSelectionChange}
          />
        }
        main={
          <MainContent 
            selectedWordCount={selectedWordCount}
          />
        }
      />
    </div>
  );
}

export default App;
