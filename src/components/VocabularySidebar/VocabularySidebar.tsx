import React, { useEffect, useState, useCallback, memo } from 'react';
import { VocabSet, VocabFolder } from '../../interfaces/vocab';
import { VocabList } from '../VocabList/VocabList';
import { VocabularyLoader } from '../../services/VocabularyLoader';
import { SelectionManager } from '../../services/SelectionManager';
import './VocabularySidebar.css';

interface VocabularySidebarProps {
  vocabSets: VocabSet[];
  selectedSets: VocabSet[];
  onVocabLoaded: (vocabSet: VocabSet) => void;
  onSelectionChange: (selectedSets: VocabSet[]) => void;
  onClose?: () => void;
  selectionManager: SelectionManager;
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

export const VocabularySidebar = memo(({ 
  vocabSets, 
  selectedSets: externalSelectedSets,
  onVocabLoaded,
  onSelectionChange,
  onClose,
  selectionManager
}: VocabularySidebarProps) => {
  const [loading, setLoading] = useState(false);
  const [folderStructure, setFolderStructure] = useState<VocabFolder[]>([]);
  // New state for tracking expanded folders
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const handleSelectionChange = useCallback((newSelectedSets: VocabSet[]) => {
    onSelectionChange(newSelectedSets);
  }, [onSelectionChange]);

  const handleFolderToggle = useCallback((toggledFolder: VocabFolder) => {
    console.log('Toggling folder:', toggledFolder.path);
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(toggledFolder.path)) {
        next.delete(toggledFolder.path);
      } else {
        next.add(toggledFolder.path);
      }
      return next;
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
            subfolders
          };
        };

        // Convert all top-level folders
        const folders = structure.folders.map(folder => convertFolder(folder));
        console.log('Initial folder structure:', JSON.stringify(folders, null, 2));
        setFolderStructure(folders);
      } catch (error) {
        console.error('Failed to load vocabulary structure:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVocabularyStructure();
  }, [onVocabLoaded]);

  const handleClearSelection = useCallback(() => {
    onSelectionChange(selectionManager.clearSelection());
  }, [onSelectionChange, selectionManager]);

  // Debug logging to track expanded folders
  useEffect(() => {
    console.log('Expanded folders:', Array.from(expandedFolders));
  }, [expandedFolders]);

  // Function to check if a folder is expanded
  const isFolderExpanded = useCallback((folderPath: string) => {
    return expandedFolders.has(folderPath);
  }, [expandedFolders]);

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
            selectionManager={selectionManager}
            isFolderExpanded={isFolderExpanded}
          />
        )}
      </div>
      {externalSelectedSets.length > 0 && (
        <div className="selection-summary">
          <div className="selection-info">
            <span>{externalSelectedSets.length} {externalSelectedSets.length === 1 ? 'set' : 'sets'}</span>
            <span>•</span>
            <span>{externalSelectedSets.reduce((sum, set) => sum + (set.wordCount || 0), 0)} words</span>
          </div>
          <button 
            className="clear-selection"
            onClick={handleClearSelection}
            aria-label="Clear selection"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}); 