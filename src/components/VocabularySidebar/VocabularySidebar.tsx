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

  const handleSelectionChange = useCallback((newSelectedSets: VocabSet[]) => {
    onSelectionChange(newSelectedSets);
  }, [onSelectionChange]);

  const handleFolderToggle = useCallback((toggledFolder: VocabFolder) => {
    console.log('Toggling folder:', toggledFolder.path);
    setFolderStructure(prevStructure => {
      const updateFolders = (folders: VocabFolder[]): VocabFolder[] => {
        return folders.map(folder => {
          if (folder.path === toggledFolder.path) {
            console.log('Found folder to toggle:', folder.path, 'current state:', folder.isExpanded);
            // Create a new folder object with updated isExpanded state
            return {
              ...folder,
              isExpanded: !folder.isExpanded,
              // Keep the same sets and subfolders
              sets: [...folder.sets],
              subfolders: folder.subfolders.map(sub => ({...sub}))
            };
          }
          if (folder.subfolders.length > 0) {
            // Create a new folder object with updated subfolders
            return {
              ...folder,
              sets: [...folder.sets],
              subfolders: updateFolders(folder.subfolders)
            };
          }
          // Create a new folder object for unchanged folders
          return {...folder, sets: [...folder.sets], subfolders: [...folder.subfolders]};
        });
      };
      const newStructure = updateFolders(prevStructure);
      console.log('New structure:', JSON.stringify(newStructure, null, 2));
      return newStructure;
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

  // Debug logging to track folder structure changes
  useEffect(() => {
    const logFolderState = (folders: VocabFolder[], level = 0) => {
      folders.forEach(folder => {
        console.log(
          ' '.repeat(level * 2) + 
          `${folder.name}: ${folder.isExpanded ? 'expanded' : 'collapsed'}`
        );
        logFolderState(folder.subfolders, level + 1);
      });
    };
    console.log('Folder structure updated:');
    logFolderState(folderStructure);
  }, [folderStructure]);

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
            selectionManager={selectionManager}
          />
        )}
      </div>
      <div className="selection-summary">
        <button 
          className="clear-selection"
          onClick={handleClearSelection}
          disabled={externalSelectedSets.length === 0}
        >
          <XIcon /> Clear selection
        </button>
        {externalSelectedSets.length > 0 && (
          <>
            <p>Selected: {externalSelectedSets.length} {externalSelectedSets.length === 1 ? 'set' : 'sets'}</p>
            <p>{externalSelectedSets.reduce((sum, set) => sum + (set.wordCount || 0), 0)} words total</p>
          </>
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for memo
  return prevProps.vocabSets === nextProps.vocabSets &&
         prevProps.selectedSets === nextProps.selectedSets &&
         prevProps.onVocabLoaded === nextProps.onVocabLoaded &&
         prevProps.onSelectionChange === nextProps.onSelectionChange;
}); 