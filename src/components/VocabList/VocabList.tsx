import React, { useState, useCallback, memo } from 'react';
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
  onSelect: (set: VocabSet) => void;
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
  onSetSelect: (set: VocabSet) => void;
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
      onSetSelect(folderSets[0]); // This will trigger deselection of all sets
    } else {
      const setsToAdd = folderSets.filter(set => 
        !selectedSets.some(s => s.id === set.id)
      );
      setsToAdd.forEach(set => onSetSelect(set));
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

  const handleSetSelect = useCallback((set: VocabSet) => {
    const isSelected = selectedSets.some(s => s.id === set.id);
    const newSelectedSets = isSelected
      ? selectedSets.filter(s => s.id !== set.id)
      : [...selectedSets, set];
    onSelectionChange(newSelectedSets);
  }, [selectedSets, onSelectionChange]);

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
      {folders.map(folder => (
        <FolderItem
          key={folder.path}
          folder={folder}
          selectedSets={selectedSets}
          expandedSets={expandedSets}
          onFolderToggle={handleFolderToggle}
          onSetSelect={handleSetSelect}
          onSetExpand={toggleSet}
          highlightText={highlightText}
        />
      ))}
    </div>
  );
}); 