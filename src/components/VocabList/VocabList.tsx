import React, { useState, useCallback, memo, useEffect } from 'react';
import { VocabSet, VocabFolder } from '../../interfaces/vocab';
import './VocabList.css';

interface VocabListProps {
  vocabSets: VocabSet[];
  selectedSets: VocabSet[];
  onSelectionChange: (selectedSets: VocabSet[]) => void;
  folders: VocabFolder[];
  onFolderToggle?: (folder: VocabFolder) => void;
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
}) => (
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
            onChange={() => onSelect(set)}
          />
        </div>
        <div className="title-container">
          <span className="vocab-set-title">{highlightText(set.filename)}</span>
          <span className="word-count">({set.wordCount} words)</span>
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
));

const FolderItem = memo(({ 
  folder,
  selectedSets,
  expandedSets,
  onFolderToggle,
  onSetSelect,
  onSetExpand,
  highlightText
}: {
  folder: VocabFolder;
  selectedSets: VocabSet[];
  expandedSets: Set<string>;
  onFolderToggle: (folder: VocabFolder, e: React.MouseEvent) => void;
  onSetSelect: (setOrSets: VocabSet | VocabSet[]) => void;
  onSetExpand: (id: string) => void;
  highlightText: (text: string) => React.ReactNode;
}) => {
  const getAllSets = (folder: VocabFolder): VocabSet[] => {
    const sets = [...folder.sets];
    folder.subfolders.forEach(subfolder => {
      sets.push(...getAllSets(subfolder));
    });
    return sets;
  };

  const folderSets = getAllSets(folder);
  const isAllSelected = folderSets.length > 0 && folderSets.every(set => 
    selectedSets.some(s => s.id === set.id)
  );
  const isPartiallySelected = !isAllSelected && folderSets.some(set => 
    selectedSets.some(s => s.id === set.id)
  );

  const handleFolderSelect = () => {
    if (isAllSelected) {
      // Deselect all sets in this folder and its subfolders
      const setsToRemove = folderSets.filter(set => 
        selectedSets.some(s => s.id === set.id)
      );
      const newSelectedSets = selectedSets.filter(set => 
        !setsToRemove.some(s => s.id === set.id)
      );
      onSetSelect(newSelectedSets);
    } else {
      // Select all sets in this folder and its subfolders
      const setsToAdd = folderSets.filter(set => 
        !selectedSets.some(s => s.id === set.id)
      );
      const newSelectedSets = [...selectedSets, ...setsToAdd];
      onSetSelect(newSelectedSets);
    }
  };

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
        <div 
          className="folder-title" 
          onClick={(e) => onFolderToggle(folder, e)}
        >
          <span className="folder-icon">{folder.isExpanded ? '▼' : '▶'}</span>
          <span className="folder-name">{highlightText(folder.name)}</span>
          <span className="folder-count">
            ({folderSets.length} {folderSets.length === 1 ? 'set' : 'sets'})
          </span>
        </div>
      </div>
      {folder.isExpanded && (
        <div className="folder-content">
          {folder.sets.map(set => (
            <VocabSetItem
              key={set.id}
              set={set}
              isSelected={selectedSets.some(s => s.id === set.id)}
              isExpanded={expandedSets.has(set.id)}
              onSelect={onSetSelect}
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
  onFolderToggle
}) => {
  const [expandedSets, setExpandedSets] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

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

  // Update expanded folders when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setExpandedFolders(new Set());
      return;
    }

    const newExpandedFolders = new Set<string>();
    
    const expandMatchingFolders = (folder: VocabFolder) => {
      if (folderContainsMatch(folder)) {
        newExpandedFolders.add(folder.path);
        folder.subfolders.forEach(expandMatchingFolders);
      }
    };

    folders.forEach(expandMatchingFolders);
    setExpandedFolders(newExpandedFolders);
  }, [searchQuery, folders, folderContainsMatch]);

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
      const isSelected = selectedSets.some(s => s.id === setOrSets.id);
      const newSelectedSets = isSelected
        ? selectedSets.filter(s => s.id !== setOrSets.id)
        : [...selectedSets, setOrSets];
      onSelectionChange(newSelectedSets);
    }
  }, [selectedSets, onSelectionChange]);

  const handleFolderToggle = useCallback((folder: VocabFolder, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFolderToggle) {
      onFolderToggle(folder);
      // Update expanded folders state
      setExpandedFolders(prev => {
        const newExpanded = new Set(prev);
        if (folder.isExpanded) {
          newExpanded.delete(folder.path);
        } else {
          newExpanded.add(folder.path);
        }
        return newExpanded;
      });
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
          folder={{
            ...folder,
            isExpanded: folder.isExpanded || expandedFolders.has(folder.path),
            sets: folder.sets.filter(set => !searchQuery.trim() || matchesSearch(set))
          }}
          selectedSets={selectedSets}
          expandedSets={expandedSets}
          onFolderToggle={handleFolderToggle}
          onSetSelect={handleSetSelect}
          onSetExpand={toggleSet}
          highlightText={highlightText}
        />
      ));
  }, [searchQuery, folderContainsMatch, expandedFolders, selectedSets, expandedSets, handleFolderToggle, handleSetSelect, toggleSet, highlightText, matchesSearch]);

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