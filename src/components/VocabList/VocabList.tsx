import React, { useState, useCallback, memo, useEffect } from 'react';
import { VocabSet, VocabFolder } from '../../interfaces/vocab';
import './VocabList.css';
import { SelectionManager } from '../../services/SelectionManager';

interface VocabListProps {
  vocabSets: VocabSet[];
  selectedSets: VocabSet[];
  onSelectionChange: (selectedSets: VocabSet[]) => void;
  folders: VocabFolder[];
  onFolderToggle: (folder: VocabFolder) => void;
  selectionManager: SelectionManager;
  isFolderExpanded: (folderPath: string) => boolean;
}

const VocabSetItem = memo(({ 
  set,
  isSelected,
  onSelect,
  highlightText
}: {
  set: VocabSet;
  isSelected: boolean;
  onSelect: (set: VocabSet) => void;
  highlightText: (text: string) => React.ReactNode;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`vocab-set ${isSelected ? 'selected' : ''}`}>
      <div className="vocab-set-header">
        <label className="vocab-set-label">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(set)}
          />
          <div className="title-container">
            <div className="vocab-set-title">{highlightText(set.filename)}</div>
            <div className="vocab-set-count">{set.wordCount} words</div>
          </div>
          <button 
            className="expand-button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        </label>
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
});

const FolderItem = memo(({ 
  folder,
  selectedSets,
  onFolderToggle,
  onSetSelect,
  highlightText,
  selectionManager,
  isFolderExpanded
}: {
  folder: VocabFolder;
  selectedSets: VocabSet[];
  onFolderToggle: (folder: VocabFolder) => void;
  onSetSelect: (setOrSets: VocabSet | VocabSet[]) => void;
  highlightText: (text: string) => React.ReactNode;
  selectionManager: SelectionManager;
  isFolderExpanded: (folderPath: string) => boolean;
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
  const isExpanded = isFolderExpanded(folder.path);

  // Calculate total sets and words in folder and subfolders
  const { totalSets, totalWords } = React.useMemo(() => {
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
    onFolderToggle(folder);
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
        <div className="folder-title" onClick={handleExpandClick}>
          <button 
            className="folder-icon-button"
            onClick={handleExpandClick}
            aria-label={isExpanded ? "Collapse folder" : "Expand folder"}
          >
            <span className="folder-icon">{isExpanded ? '▼' : '▶'}</span>
          </button>
          <div className="folder-info">
            <div className="folder-name">{highlightText(folder.name)}</div>
            <div className="folder-count">
              {totalSets} {totalSets === 1 ? 'set' : 'sets'} • {totalWords} words
            </div>
          </div>
        </div>
      </div>
      {isExpanded && (
        <div className="folder-content">
          {folder.sets.map(set => (
            <VocabSetItem
              key={set.id}
              set={set}
              isSelected={selectionManager.isSelected(set.id)}
              onSelect={handleIndividualSetSelect}
              highlightText={highlightText}
            />
          ))}
          {folder.subfolders.map(subfolder => (
            <FolderItem
              key={subfolder.path}
              folder={subfolder}
              selectedSets={selectedSets}
              onFolderToggle={onFolderToggle}
              onSetSelect={onSetSelect}
              highlightText={highlightText}
              selectionManager={selectionManager}
              isFolderExpanded={isFolderExpanded}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export const VocabList: React.FC<VocabListProps> = memo(({
  vocabSets,
  selectedSets,
  onSelectionChange,
  folders,
  onFolderToggle,
  selectionManager,
  isFolderExpanded
}) => {
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
          onFolderToggle={onFolderToggle}
          onSetSelect={(setOrSets) => {
            if (Array.isArray(setOrSets)) {
              onSelectionChange(setOrSets);
            } else {
              onSelectionChange([setOrSets]);
            }
          }}
          highlightText={highlightText}
          selectionManager={selectionManager}
          isFolderExpanded={isFolderExpanded}
        />
      ));
  }, [searchQuery, folderContainsMatch, selectedSets, onFolderToggle, onSelectionChange, highlightText, selectionManager, isFolderExpanded]);

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