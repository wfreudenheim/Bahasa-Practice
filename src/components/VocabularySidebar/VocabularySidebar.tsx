import React, { useEffect, useState } from 'react';
import { VocabSet, VocabItem } from '../../interfaces/vocab';
import { VocabList } from '../VocabList/VocabList';
import { VocabularyLoader } from '../../services/VocabularyLoader';
import './VocabularySidebar.css';

interface VocabularySidebarProps {
  vocabSets: VocabSet[];
  onVocabLoaded: (vocabSet: VocabSet) => void;
  onSelectionChange: (selectedSets: VocabSet[]) => void;
}

// Simple X icon component
const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const loader = new VocabularyLoader();

// Helper function to format file names
const formatDisplayName = (filename: string): string => {
  return filename
    .replace(/\.txt$/, '') // Remove .txt extension
    .split('_') // Split by underscores
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize first letter
    .join(' '); // Join with spaces
};

export const VocabularySidebar: React.FC<VocabularySidebarProps> = ({ 
  vocabSets, 
  onVocabLoaded,
  onSelectionChange 
}) => {
  const [selectedSets, setSelectedSets] = useState<VocabSet[]>([]);
  const [loading, setLoading] = useState(false);

  // Load vocabulary structure on mount
  useEffect(() => {
    const loadVocabularyStructure = async () => {
      try {
        setLoading(true);
        const structure = await loader.scanVocabularyStructure();
        
        // Keep track of existing vocab sets to prevent duplicates
        const existingPaths = new Set(vocabSets.map(set => set.id));
        
        // Load each file in the structure
        for (const folder of structure.folders) {
          for (const file of folder.files) {
            // Skip if already loaded
            if (existingPaths.has(file.path)) continue;

            const loadedFile = await loader.loadVocabularyFile(file.path);
            if (loadedFile.loaded && loadedFile.words.length > 0) {
              // Convert to VocabSet format with formatted filename
              const vocabSet: VocabSet = {
                id: loadedFile.path,
                filename: formatDisplayName(loadedFile.name),
                items: loadedFile.words.map(word => ({
                  indonesian: word.indonesian,
                  english: word.english
                })),
                wordCount: loadedFile.words.length,
                dateAdded: new Date(),
                path: formatDisplayName(folder.name)
              };
              onVocabLoaded(vocabSet);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load vocabulary structure:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVocabularyStructure();
  }, [onVocabLoaded, vocabSets]);

  const handleSelectionChange = (newSelectedSets: VocabSet[]) => {
    setSelectedSets(newSelectedSets);
    onSelectionChange(newSelectedSets);
  };

  const handleClearSelection = () => {
    setSelectedSets([]);
    onSelectionChange([]);
  };

  // Calculate total selected words
  const totalWords = selectedSets.reduce((sum, set) => sum + set.wordCount, 0);

  return (
    <div className="vocabulary-sidebar">
      <h2>Vocabulary Sets</h2>
      <div className="upload-section">
        <h3>Upload Vocabulary Files</h3>
        {/* FileUpload component will go here */}
      </div>
      <div className="available-sets">
        <VocabList 
          vocabSets={vocabSets}
          selectedSets={selectedSets}
          onSelectionChange={handleSelectionChange}
        />
      </div>
      <div className="selection-summary">
        <button 
          className="clear-selection"
          onClick={handleClearSelection}
          disabled={selectedSets.length === 0}
        >
          <XIcon /> Clear selection
        </button>
        <p>Selected: {selectedSets.length} sets</p>
        <p>{totalWords} words total</p>
      </div>
    </div>
  );
}; 