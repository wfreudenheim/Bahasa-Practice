import React, { useState, useRef } from 'react';
import { VocabSet, VocabItem } from './interfaces/vocab';
import { Layout } from './components/Layout/Layout';
import { VocabularySidebar } from './components/VocabularySidebar/VocabularySidebar';
import { MainContent, MainContentHandle } from './components/MainContent/MainContent';
import { Header } from './components/Header/Header';
import './App.css';

function App() {
  const [vocabSets, setVocabSets] = useState<VocabSet[]>([]);
  const [selectedSets, setSelectedSets] = useState<VocabSet[]>([]);
  const [isInGame, setIsInGame] = useState(false);
  const mainContentRef = useRef<MainContentHandle>(null);

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

  const handleHomeClick = () => {
    mainContentRef.current?.handleBackToGames();
  };

  // Get all words from selected sets
  const selectedWords: VocabItem[] = selectedSets.flatMap(set => set.items);

  return (
    <div className="App">
      <Header isInGame={isInGame} onHomeClick={handleHomeClick} />
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
            ref={mainContentRef}
            selectedWords={selectedWords}
            onGameStateChange={setIsInGame}
          />
        }
        hideSidebar={isInGame}
      />
    </div>
  );
}

export default App;
