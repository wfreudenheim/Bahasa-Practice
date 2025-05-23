import React, { useState, useEffect } from 'react';
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

export const VocabList: React.FC<VocabListProps> = ({ 
  vocabSets, 
  onSelectionChange,
  selectedSets
}) => {
  const [expandedSetId, setExpandedSetId] = useState<string | null>(null);
  const [selectedSetIds, setSelectedSetIds] = useState<Set<string>>(new Set());
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/', 'week01', 'themes']));

  // Update internal selection state when selectedSets prop changes
  useEffect(() => {
    const newSelectedIds = new Set(selectedSets.map(set => set.id));
    setSelectedSetIds(newSelectedIds);
  }, [selectedSets]);

  // Organize sets into folder structure
  const folderStructure = React.useMemo(() => {
    const structure: Record<string, VocabFolder> = {
      '/': {
        name: 'Root',
        path: '/',
        sets: [],
        subfolders: [],
        isExpanded: true
      }
    };
    
    vocabSets.forEach(set => {
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
  }, [vocabSets, expandedFolders]);

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

  const renderVocabSet = (set: VocabSet) => (
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
          <span className="vocab-set-title">{set.filename}</span>
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
                <tr key={index}>
                  <td>{item.indonesian}</td>
                  <td>{item.english}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderFolder = (folder: VocabFolder) => {
    if (!folder || (folder.sets.length === 0 && folder.subfolders.length === 0)) {
      return null;
    }
    
    return (
      <div key={folder.path} className="folder">
        {folder.path !== '/' && (
          <div 
            className="folder-header"
            onClick={() => handleFolderClick(folder.path)}
          >
            <span className="folder-icon">
              {folder.isExpanded ? '▼' : '▶'}
            </span>
            <span>{folder.name}</span>
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
      {renderFolder(folderStructure)}
    </div>
  );
}; 