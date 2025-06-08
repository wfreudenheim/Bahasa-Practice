import React, { useState, useCallback } from 'react';
import { VocabSet, VocabFolder } from '../../interfaces/vocab';
import './VocabList.css';

interface VocabListProps {
  vocabSets: VocabSet[];
  selectedSets: VocabSet[];
  onSelectionChange: (selectedSets: VocabSet[]) => void;
  folders: VocabFolder[];
  onFolderToggle?: (folder: VocabFolder) => void;
}

export const VocabList: React.FC<VocabListProps> = ({
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

  const getAllSets = (folder: VocabFolder): VocabSet[] => {
    const sets = [...folder.sets];
    folder.subfolders.forEach(subfolder => {
      sets.push(...getAllSets(subfolder));
    });
    return sets;
  };

  const handleFolderSelect = (folder: VocabFolder, e: React.MouseEvent) => {
    e.stopPropagation();
    const folderSets = getAllSets(folder);
    const isAllSelected = folderSets.every(set => 
      selectedSets.some(s => s.id === set.id)
    );

    let newSelectedSets: VocabSet[];
    if (isAllSelected) {
      // Deselect all sets in this folder
      newSelectedSets = selectedSets.filter(set => 
        !folderSets.some(fs => fs.id === set.id)
      );
    } else {
      // Select all sets in this folder
      const setsToAdd = folderSets.filter(set => 
        !selectedSets.some(s => s.id === set.id)
      );
      newSelectedSets = [...selectedSets, ...setsToAdd];
    }
    onSelectionChange(newSelectedSets);
  };

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

  const renderFolder = (folder: VocabFolder) => {
    const folderSets = getAllSets(folder);
    const isAllSelected = folderSets.length > 0 && folderSets.every(set => 
      selectedSets.some(s => s.id === set.id)
    );
    const isPartiallySelected = !isAllSelected && folderSets.some(set => 
      selectedSets.some(s => s.id === set.id)
    );

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
              onChange={() => {}} // Required for controlled component
              onClick={(e) => handleFolderSelect(folder, e)}
            />
          </div>
          <div 
            className="folder-title" 
            onClick={(e) => handleFolderToggle(folder, e)}
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
              <div
                key={set.id}
                className={`vocab-set ${selectedSets.some(s => s.id === set.id) ? 'selected' : ''}`}
              >
                <div className="vocab-set-header">
                  <div className="vocab-set-label">
                    <div className="checkbox-container">
                      <input
                        type="checkbox"
                        checked={selectedSets.some(s => s.id === set.id)}
                        onChange={() => handleSetSelect(set)}
                      />
                    </div>
                    <div className="title-container">
                      <span className="vocab-set-title">{highlightText(set.filename)}</span>
                      <span className="word-count">({set.wordCount} words)</span>
                    </div>
                    <button 
                      className="expand-button"
                      onClick={() => toggleSet(set.id)}
                      aria-label={expandedSets.has(set.id) ? "Collapse" : "Expand"}
                    >
                      {expandedSets.has(set.id) ? '▼' : '▶'}
                    </button>
                  </div>
                </div>
                {expandedSets.has(set.id) && (
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
            ))}
            {folder.subfolders.map(renderFolder)}
          </div>
        )}
      </div>
    );
  };

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
      {folders.map(renderFolder)}
    </div>
  );
}; 