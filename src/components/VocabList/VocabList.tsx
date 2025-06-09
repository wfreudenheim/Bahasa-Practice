import React, { useState, useCallback, memo, useEffect, useMemo } from 'react';
import { VocabSet, VocabFolder } from '../../interfaces/vocab';
import './VocabList.css';
import { SelectionManager } from '../../services/SelectionManager';

interface VocabListProps {
  vocabSets: VocabSet[];
  selectedSets: VocabSet[];
  onSelectionChange: (selectedSets: VocabSet[]) => void;
  folders: VocabFolder[];
  onFolderToggle?: (folder: VocabFolder) => void;
  selectionManager: SelectionManager;
}

const VocabSetItem = memo(({ 
  set, 
  isSelected, 
  isExpanded,
  onSelect,
  onToggleExpand,
  highlightText
}: { 
  set: VocabSet;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: (setOrSets: VocabSet | VocabSet[]) => void;
  onToggleExpand: (id: string) => void;
  highlightText: (text: string) => React.ReactNode;
}) => {
  const handleSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onSelect(set);
  }, [set, onSelect]);

  return (
    <div
      key={set.id}
      className={`vocab-set ${isSelected ? 'selected' : ''}`}
    >
      <div className="vocab-set-header">
        <div className="vocab-set-label">
          <div className="checkbox-container">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={handleSelect}
            />
          </div>
          <div className="title-container">
            <div className="vocab-set-title">{highlightText(set.filename)}</div>
            <div className="word-count">{set.wordCount} words</div>
          </div>
          <button 
            className="expand-button"
            onClick={() => onToggleExpand(set.id)}
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        </div>
      </div>
      {isExpanded && (
        <div className="vocab-preview">
          <table className="vocab-table">
            <thead>
              <tr>
                <th>Indonesian</th>
                <th>English</th>
              </tr>
            </thead>
            <tbody>
              {set.items.map((item, index) => (
                <tr key={index}>
                  <td>{highlightText(item.indonesian)}</td>
                  <td>{highlightText(item.english)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for memo
  return prevProps.set.id === nextProps.set.id &&
         prevProps.isSelected === nextProps.isSelected &&
         prevProps.isExpanded === nextProps.isExpanded &&
         prevProps.highlightText === nextProps.highlightText;
});

const FolderItem = memo(({ 
  folder,
  selectedSets,
  expandedSets,
  onFolderToggle,
  onSetSelect,
  onSetExpand,
  highlightText,
  selectionManager
}: {
  folder: VocabFolder;
  selectedSets: VocabSet[];
  expandedSets: Set<string>;
  onFolderToggle: (folder: VocabFolder, e: React.MouseEvent) => void;
  onSetSelect: (setOrSets: VocabSet | VocabSet[]) => void;
  onSetExpand: (id: string) => void;
  highlightText: (text: string) => React.ReactNode;
  selectionManager: SelectionManager;
}) => {
  const handleFolderSelect = useCallback(() => {
    const newSelectedSets = selectionManager.toggleFolder(folder);
    onSetSelect(newSelectedSets);
  }, [folder, selectionManager, onSetSelect]);

  const handleIndividualSetSelect = useCallback((setOrSets: VocabSet | VocabSet[]) => {
    const set = Array.isArray(setOrSets) ? setOrSets[0] : setOrSets;
    const newSelectedSets = selectionManager.toggleSet(set);
    onSetSelect(newSelectedSets);
  }, [selectionManager, onSetSelect]);

  const isAllSelected = selectionManager.isFolderSelected(folder);
  const isPartiallySelected = selectionManager.isFolderPartiallySelected(folder);

  // Calculate total sets and words in folder and subfolders
  const { totalSets, totalWords } = useMemo(() => {
    const countSetsAndWords = (f: VocabFolder): { sets: number; words: number } => {
      const directSets = f.sets.length;
      const directWords = f.sets.reduce((sum, set) => sum + set.wordCount, 0);
      
      const subfoldersCount = f.subfolders.reduce((acc, subfolder) => {
        const subCount = countSetsAndWords(subfolder);
        return {
          sets: acc.sets + subCount.sets,
          words: acc.words + subCount.words
        };
      }, { sets: 0, words: 0 });

      return {
        sets: directSets + subfoldersCount.sets,
        words: directWords + subfoldersCount.words
      };
    };

    const counts = countSetsAndWords(folder);
    return {
      totalSets: counts.sets,
      totalWords: counts.words
    };
  }, [folder]);

  const handleExpandClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Expand button clicked for folder:', folder.path);
    onFolderToggle(folder, e);
  }, [folder, onFolderToggle]);

  return (
    <div key={folder.path} className="folder">
      <div className="folder-header">
        <div className="folder-checkbox">
          <input
            type="checkbox"
            checked={isAllSelected}
            ref={el => {
              if (el) {
                el.indeterminate = isPartiallySelected;
              }
            }}
            onChange={handleFolderSelect}
            onClick={e => e.stopPropagation()}
          />
        </div>
        <div className="folder-title">
          <button 
            className="folder-icon-button"
            onClick={handleExpandClick}
            aria-label={folder.isExpanded ? "Collapse folder" : "Expand folder"}
          >
            <span className="folder-icon">{folder.isExpanded ? '▼' : '▶'}</span>
          </button>
          <div className="folder-info">
            <div className="folder-name">{highlightText(folder.name)}</div>
            <div className="folder-count">
              {totalSets} {totalSets === 1 ? 'set' : 'sets'} • {totalWords} words
            </div>
          </div>
        </div>
      </div>
      {folder.isExpanded && (
        <div className="folder-content">
          {folder.sets.map(set => (
            <VocabSetItem
              key={set.id}
              set={set}
              isSelected={selectionManager.isSelected(set.id)}
              isExpanded={expandedSets.has(set.id)}
              onSelect={handleIndividualSetSelect}
              onToggleExpand={onSetExpand}
              highlightText={highlightText}
            />
          ))}
          {folder.subfolders.map(subfolder => (
            <FolderItem
              key={subfolder.path}
              folder={subfolder}
              selectedSets={selectedSets}
              expandedSets={expandedSets}
              onFolderToggle={onFolderToggle}
              onSetSelect={onSetSelect}
              onSetExpand={onSetExpand}
              highlightText={highlightText}
              selectionManager={selectionManager}
            />
          ))}
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Improved comparison function for memo
  if (prevProps.folder.path !== nextProps.folder.path ||
      prevProps.folder.isExpanded !== nextProps.folder.isExpanded ||
      prevProps.expandedSets.size !== nextProps.expandedSets.size ||
      prevProps.highlightText !== nextProps.highlightText) {
    return false;
  }

  // Deep comparison of selected sets
  if (prevProps.selectedSets.length !== nextProps.selectedSets.length) {
    return false;
  }

  const prevSelectedIds = new Set(prevProps.selectedSets.map(s => s.id));
  const nextSelectedIds = new Set(nextProps.selectedSets.map(s => s.id));

  // Check if any IDs were added or removed
  for (const id of prevSelectedIds) {
    if (!nextSelectedIds.has(id)) return false;
  }
  for (const id of nextSelectedIds) {
    if (!prevSelectedIds.has(id)) return false;
  }

  return true;
});

export const VocabList: React.FC<VocabListProps> = memo(({
  vocabSets,
  selectedSets,
  onSelectionChange,
  folders,
  onFolderToggle,
  selectionManager
}) => {
  const [expandedSets, setExpandedSets] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  // Helper function to check if a set matches the search query
  const matchesSearch = useCallback((set: VocabSet): boolean => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    
    // Check filename
    if (set.filename.toLowerCase().includes(query)) return true;
    
    // Check words
    return set.items.some(item => 
      item.indonesian.toLowerCase().includes(query) ||
      item.english.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Helper function to check if a folder contains any matching sets
  const folderContainsMatch = useCallback((folder: VocabFolder): boolean => {
    // Check direct sets
    if (folder.sets.some(matchesSearch)) return true;
    
    // Check subfolders recursively
    return folder.subfolders.some(subfolder => folderContainsMatch(subfolder));
  }, [matchesSearch]);

  // Update expanded state when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) return;

    // If there's a search query, expand folders that contain matches
    if (onFolderToggle) {
      const expandMatchingFolders = (folder: VocabFolder) => {
        if (folderContainsMatch(folder) && !folder.isExpanded) {
          onFolderToggle(folder);
        }
        folder.subfolders.forEach(expandMatchingFolders);
      };
      folders.forEach(expandMatchingFolders);
    }
  }, [searchQuery, folders, folderContainsMatch, onFolderToggle]);

  const toggleSet = useCallback((id: string) => {
    setExpandedSets(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(id)) {
        newExpanded.delete(id);
      } else {
        newExpanded.add(id);
      }
      return newExpanded;
    });
  }, []);

  const handleSetSelect = useCallback((setOrSets: VocabSet | VocabSet[]) => {
    if (Array.isArray(setOrSets)) {
      onSelectionChange(setOrSets);
    } else {
      const newSelectedSets = selectionManager.toggleSet(setOrSets);
      onSelectionChange(newSelectedSets);
    }
  }, [onSelectionChange, selectionManager]);

  const handleFolderToggle = useCallback((folder: VocabFolder, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFolderToggle) {
      onFolderToggle(folder);
    }
  }, [onFolderToggle]);

  const highlightText = useCallback((text: string) => {
    if (!searchQuery.trim()) return text;
    const query = searchQuery.toLowerCase();
    const index = text.toLowerCase().indexOf(query);
    if (index === -1) return text;
    
    return (
      <>
        {text.slice(0, index)}
        <span className="highlight">{text.slice(index, index + query.length)}</span>
        {text.slice(index + query.length)}
      </>
    );
  }, [searchQuery]);

  const renderFilteredFolders = useCallback((folders: VocabFolder[]) => {
    return folders
      .filter(folder => !searchQuery.trim() || folderContainsMatch(folder))
      .map(folder => (
        <FolderItem
          key={folder.path}
          folder={folder}
          selectedSets={selectedSets}
          expandedSets={expandedSets}
          onFolderToggle={handleFolderToggle}
          onSetSelect={handleSetSelect}
          onSetExpand={toggleSet}
          highlightText={highlightText}
          selectionManager={selectionManager}
        />
      ));
  }, [searchQuery, folderContainsMatch, selectedSets, expandedSets, handleFolderToggle, handleSetSelect, toggleSet, highlightText, selectionManager]);

  if (!folders.length && !vocabSets.length) {
    return <div className="no-vocab">No vocabulary sets available</div>;
  }

  return (
    <div className="vocab-list">
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search vocabulary sets..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button 
            className="clear-search"
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>
      {renderFilteredFolders(folders)}
    </div>
  );
}); 