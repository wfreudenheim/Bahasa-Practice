import React, { useEffect, useState, useCallback } from 'react';
import { VocabSet, VocabFolder } from '../../interfaces/vocab';
import { VocabList } from '../VocabList/VocabList';
import { VocabularyLoader } from '../../services/VocabularyLoader';
import './VocabularySidebar.css';

interface VocabularySidebarProps {
  vocabSets: VocabSet[];
  selectedSets: VocabSet[];
  onVocabLoaded: (vocabSet: VocabSet) => void;
  onSelectionChange: (selectedSets: VocabSet[]) => void;
  onClose?: () => void;
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
  selectedSets: externalSelectedSets,
  onVocabLoaded,
  onSelectionChange,
  onClose
}) => {
  const [loading, setLoading] = useState(false);
  const [folderStructure, setFolderStructure] = useState<VocabFolder[]>([]);

  const handleSelectionChange = (newSelectedSets: VocabSet[]) => {
    onSelectionChange(newSelectedSets);
  };

  const handleFolderToggle = useCallback((toggledFolder: VocabFolder) => {
    setFolderStructure(prevStructure => {
      const updateFolders = (folders: VocabFolder[]): VocabFolder[] => {
        return folders.map(folder => {
          if (folder.path === toggledFolder.path) {
            return {
              ...folder,
              isExpanded: !folder.isExpanded
            };
          }
          return {
            ...folder,
            subfolders: updateFolders(folder.subfolders)
          };
        });
      };
      return updateFolders(prevStructure);
    });
  }, []);

  // Load vocabulary structure on mount
  useEffect(() => {
    const loadVocabularyStructure = async () => {
      try {
        setLoading(true);
        const structure = await loader.scanVocabularyStructure();
        
        // Convert the structure to our VocabFolder format
        const convertFolder = (folder: any, parentPath: string = ''): VocabFolder => {
          const currentPath = parentPath ? `${parentPath}/${folder.name}` : folder.name;
          
          // Convert files to VocabSets
          const sets = folder.files.map((file: any) => {
            const vocabSet: VocabSet = {
              id: file.path,
              filename: formatDisplayName(file.name),
              items: file.words.map((word: any) => ({
                indonesian: word.indonesian,
                english: word.english
              })),
              wordCount: file.words.length,
              dateAdded: new Date(),
              path: currentPath
            };
            // Also notify parent component about the new vocab set
            onVocabLoaded(vocabSet);
            return vocabSet;
          });

          // Convert subfolders recursively
          const subfolders = folder.subfolders.map((subfolder: any) => 
            convertFolder(subfolder, currentPath)
          );

          return {
            name: folder.name,
            path: currentPath,
            sets,
            subfolders,
            isExpanded: false // Start with folders collapsed
          };
        };

        // Convert all top-level folders
        const folders = structure.folders.map(folder => convertFolder(folder));
        setFolderStructure(folders);
      } catch (error) {
        console.error('Failed to load vocabulary structure:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVocabularyStructure();
  }, [onVocabLoaded]);

  return (
    <div className="vocabulary-sidebar">
      <div className="mobile-header">
        <h2>Vocabulary Sets</h2>
        <button className="close-button" onClick={onClose} aria-label="Close sidebar">
          ×
        </button>
      </div>
      <div className="upload-section">
        <h3>Upload Vocabulary Files</h3>
        {/* FileUpload component will go here */}
      </div>
      <div className="available-sets">
        {loading ? (
          <div>Loading vocabulary sets...</div>
        ) : (
          <VocabList 
            vocabSets={vocabSets}
            selectedSets={externalSelectedSets}
            onSelectionChange={handleSelectionChange}
            folders={folderStructure}
            onFolderToggle={handleFolderToggle}
          />
        )}
      </div>
      <div className="selection-summary">
        <button 
          className="clear-selection"
          onClick={() => onSelectionChange([])}
          disabled={externalSelectedSets.length === 0}
        >
          <XIcon /> Clear selection
        </button>
        <p>Selected: {externalSelectedSets.length} sets</p>
        <p>{externalSelectedSets.reduce((sum, set) => sum + set.wordCount, 0)} words total</p>
      </div>
    </div>
  );
}; 