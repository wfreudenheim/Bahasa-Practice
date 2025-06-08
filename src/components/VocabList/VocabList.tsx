import React, { useState, useEffect, useMemo } from 'react';
import { VocabSet, VocabFolder } from '../../interfaces/vocab';
import './VocabList.css';

interface VocabListProps {
  vocabSets: VocabSet[];
  onSelectionChange: (selectedSets: VocabSet[]) => void;
  selectedSets: VocabSet[];
}

// Helper function to format folder names
const formatFolderName = (name: string): string => {
  if (name === '/') return '';
  return name
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Helper function to get all sets in a folder and its subfolders
const getAllSetsInFolder = (folder: VocabFolder): VocabSet[] => {
  const sets: VocabSet[] = [...folder.sets];
  folder.subfolders.forEach(subfolder => {
    sets.push(...getAllSetsInFolder(subfolder));
  });
  return sets;
};

// Helper function to check if a folder is partially selected
const isFolderPartiallySelected = (folder: VocabFolder, selectedIds: Set<string>): boolean => {
  const allSets = getAllSetsInFolder(folder);
  const selectedCount = allSets.filter(set => selectedIds.has(set.id)).length;
  return selectedCount > 0 && selectedCount < allSets.length;
};

// Helper function to check if a folder is fully selected
const isFolderFullySelected = (folder: VocabFolder, selectedIds: Set<string>): boolean => {
  const allSets = getAllSetsInFolder(folder);
  return allSets.length > 0 && allSets.every(set => selectedIds.has(set.id));
};

export const VocabList: React.FC<VocabListProps> = ({ 
  vocabSets, 
  onSelectionChange,
  selectedSets
}) => {
  const [expandedSetId, setExpandedSetId] = useState<string | null>(null);
  const [selectedSetIds, setSelectedSetIds] = useState<Set<string>>(new Set());
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/', 'week01', 'themes']));
  const [searchQuery, setSearchQuery] = useState('');

  // Update internal selection state when selectedSets prop changes
  useEffect(() => {
    const newSelectedIds = new Set(selectedSets.map(set => set.id));
    setSelectedSetIds(newSelectedIds);
  }, [selectedSets]);

  // Filter sets based on search query
  const filteredSets = useMemo(() => {
    if (!searchQuery.trim()) return vocabSets;
    
    const query = searchQuery.toLowerCase().trim();
    return vocabSets.filter(set => {
      // Search in filename and path
      if (set.filename.toLowerCase().includes(query)) return true;
      if (set.path?.toLowerCase().includes(query)) return true;
      
      // Search in vocabulary items
      return set.items.some(item => 
        item.indonesian.toLowerCase().includes(query) ||
        item.english.toLowerCase().includes(query)
      );
    });
  }, [vocabSets, searchQuery]);

  // Highlight matching text if there's a search query
  const highlightText = (text: string) => {
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
  };

  // Organize sets into folder structure
  const folderStructure = useMemo(() => {
    const structure: Record<string, VocabFolder> = {
      '/': {
        name: 'Root',
        path: '/',
        sets: [],
        subfolders: [],
        isExpanded: true
      }
    };
    
    filteredSets.forEach(set => {
      const path = set.path || '/';
      const parts = path.split('/').filter(Boolean);
      
      if (parts.length === 0) {
        // Root level sets
        structure['/'].sets.push(set);
      } else {
        // Create folder hierarchy
        let currentPath = '';
        parts.forEach((part, index) => {
          currentPath = currentPath ? `${currentPath}/${part}` : part;
          if (!structure[currentPath]) {
            structure[currentPath] = {
              name: formatFolderName(part),
              path: currentPath,
              sets: [],
              subfolders: [],
              isExpanded: expandedFolders.has(currentPath)
            };
          }
          
          // Add set to its immediate parent folder
          if (index === parts.length - 1) {
            structure[currentPath].sets.push(set);
          }
        });
      }
    });
    
    // Build folder hierarchy
    Object.values(structure).forEach(folder => {
      if (folder.path === '/') return;
      const parentPath = folder.path.split('/').slice(0, -1).join('/') || '/';
      if (structure[parentPath]) {
        structure[parentPath].subfolders.push(folder);
      }
    });
    
    // Sort sets within each folder
    Object.values(structure).forEach(folder => {
      folder.sets.sort((a, b) => a.filename.localeCompare(b.filename));
      folder.subfolders.sort((a, b) => a.name.localeCompare(b.name));
    });
    
    return structure['/'];
  }, [filteredSets, expandedFolders]);

  const handleSetClick = (setId: string, event: React.MouseEvent) => {
    if ((event.target as HTMLElement).tagName !== 'INPUT') {
      setExpandedSetId(expandedSetId === setId ? null : setId);
    }
  };

  const handleCheckboxChange = (setId: string) => {
    const newSelectedSetIds = new Set(selectedSetIds);
    if (selectedSetIds.has(setId)) {
      newSelectedSetIds.delete(setId);
    } else {
      newSelectedSetIds.add(setId);
    }
    setSelectedSetIds(newSelectedSetIds);
    onSelectionChange(vocabSets.filter(set => newSelectedSetIds.has(set.id)));
  };

  const handleFolderClick = (path: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    // Expand all folders when searching
    if (event.target.value.trim()) {
      const allPaths = new Set(['/', ...vocabSets.map(set => set.path || '/').filter(Boolean)]);
      setExpandedFolders(allPaths);
    }
  };

  const handleFolderSelection = (folder: VocabFolder) => {
    const allSets = getAllSetsInFolder(folder);
    const newSelectedIds = new Set(selectedSetIds);
    
    if (isFolderFullySelected(folder, selectedSetIds)) {
      // Deselect all sets in this folder and its subfolders
      allSets.forEach(set => newSelectedIds.delete(set.id));
    } else {
      // Select all sets in this folder and its subfolders
      allSets.forEach(set => newSelectedIds.add(set.id));
    }
    
    setSelectedSetIds(newSelectedIds);
    onSelectionChange(vocabSets.filter(set => newSelectedIds.has(set.id)));
  };

  const renderVocabSet = (set: VocabSet) => {
    return (
      <div key={set.id} className="vocab-set">
        <div 
          className="vocab-set-header"
          onClick={(e) => handleSetClick(set.id, e)}
        >
          <label className="vocab-set-label">
            <input
              type="checkbox"
              checked={selectedSetIds.has(set.id)}
              onChange={() => handleCheckboxChange(set.id)}
            />
            <span className="vocab-set-title">{highlightText(set.filename)}</span>
          </label>
          <span className="word-count">{set.wordCount} words</span>
        </div>
        
        {expandedSetId === set.id && (
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
                  <tr key={index} className={
                    searchQuery && (
                      item.indonesian.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      item.english.toLowerCase().includes(searchQuery.toLowerCase())
                    ) ? 'highlight-row' : ''
                  }>
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
  };

  const renderFolder = (folder: VocabFolder) => {
    if (!folder || (folder.sets.length === 0 && folder.subfolders.length === 0)) {
      return null;
    }

    const isFullySelected = isFolderFullySelected(folder, selectedSetIds);
    const isPartiallySelected = isFolderPartiallySelected(folder, selectedSetIds);
    
    return (
      <div key={folder.path} className="folder">
        {folder.path !== '/' && (
          <div className="folder-header">
            <div className="folder-title" onClick={() => handleFolderClick(folder.path)}>
              <span className="folder-icon">
                {folder.isExpanded ? '▼' : '▶'}
              </span>
              <span>{highlightText(folder.name)}</span>
            </div>
            <label className="folder-checkbox">
              <input
                type="checkbox"
                checked={isFullySelected}
                ref={input => {
                  if (input) {
                    input.indeterminate = isPartiallySelected && !isFullySelected;
                  }
                }}
                onChange={() => handleFolderSelection(folder)}
              />
            </label>
          </div>
        )}
        {(folder.path === '/' || folder.isExpanded) && (
          <>
            {folder.sets.map(renderVocabSet)}
            {folder.subfolders.map(renderFolder)}
          </>
        )}
      </div>
    );
  };

  if (vocabSets.length === 0) {
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
          onChange={handleSearchChange}
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
      {renderFolder(folderStructure)}
      {filteredSets.length === 0 && searchQuery && (
        <div className="no-results">No matching vocabulary sets found</div>
      )}
    </div>
  );
}; 