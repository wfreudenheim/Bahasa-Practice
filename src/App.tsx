import React, { useState, useRef, useMemo, useCallback } from 'react';
import { VocabSet, VocabItem } from './interfaces/vocab';
import { Layout } from './components/Layout/Layout';
import { VocabularySidebar } from './components/VocabularySidebar/VocabularySidebar';
import { MainContent, MainContentHandle } from './components/MainContent/MainContent';
import { Header } from './components/Header/Header';
import { SelectionManager } from './services/SelectionManager';
import './App.css';

// Create a single instance of SelectionManager
const selectionManager = new SelectionManager();

function App() {
  // Main state for all vocab sets
  const [vocabSets, setVocabSets] = useState<VocabSet[]>([]);
  const [selectedSets, setSelectedSets] = useState<VocabSet[]>([]);
  const [isInGame, setIsInGame] = useState(false);
  const mainContentRef = useRef<MainContentHandle>(null);

  const handleVocabLoaded = useCallback((newVocabSet: VocabSet) => {
    setVocabSets(prev => {
      const newSets = prev.some(set => set.id === newVocabSet.id) 
        ? prev 
        : [...prev, newVocabSet];
      
      // Update selection manager with new vocab sets
      selectionManager.updateVocabSets(newSets);
      return newSets;
    });
  }, []);

  const handleSelectionChange = useCallback((newSelectedSets: VocabSet[]) => {
    setSelectedSets(newSelectedSets);
  }, []);

  const handleHomeClick = useCallback(() => {
    mainContentRef.current?.handleBackToGames();
  }, []);

  // Memoize selected words calculation
  const selectedWords = useMemo(() => 
    selectedSets.flatMap(set => set.items),
    [selectedSets]
  );

  return (
    <div className="App">
      <Header isInGame={isInGame} onHomeClick={handleHomeClick} />
      <Layout 
        sidebar={
          <VocabularySidebar 
            vocabSets={vocabSets}
            selectedSets={selectedSets}
            onVocabLoaded={handleVocabLoaded}
            onSelectionChange={handleSelectionChange}
            selectionManager={selectionManager}
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
