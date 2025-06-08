import React, { useState, useEffect } from 'react';
import { VocabularyLoader } from '../services/VocabularyLoader';
import { VocabularyFile, VocabularyFolder } from '../types/vocabulary';
import './VocabularyBrowser.css';

interface VocabularyBrowserProps {
  onVocabSelected: (files: VocabularyFile[]) => void;
}

const loader = new VocabularyLoader();

export const VocabularyBrowser: React.FC<VocabularyBrowserProps> = ({ onVocabSelected }) => {
  const [structure, setStructure] = useState<VocabularyFolder[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [loadedFiles, setLoadedFiles] = useState<Map<string, VocabularyFile>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStructure();
  }, []);

  const loadStructure = async () => {
    try {
      const result = await loader.scanVocabularyStructure();
      setStructure(result.folders);
    } catch (err) {
      setError('Failed to load vocabulary structure');
      console.error(err);
    }
  };

  const handleFileSelect = (file: VocabularyFile) => {
    const newSelectedFiles = new Set(selectedFiles);
    if (selectedFiles.has(file.path)) {
      newSelectedFiles.delete(file.path);
    } else {
      newSelectedFiles.add(file.path);
    }
    setSelectedFiles(newSelectedFiles);
  };

  const handleLoadSelected = async () => {
    if (selectedFiles.size === 0) return;

    setLoading(true);
    try {
      const selectedFilesArray = Array.from(selectedFiles);
      const loadedFilesArray: VocabularyFile[] = [];

      for (const filePath of selectedFilesArray) {
        // Find the file in the structure
        const file = findFileInStructure(filePath, structure);
        if (file) {
          loadedFilesArray.push(file);
          const newLoadedFiles = new Map(loadedFiles);
          newLoadedFiles.set(file.path, file);
          setLoadedFiles(newLoadedFiles);
        }
      }

      onVocabSelected(loadedFilesArray);
    } catch (err) {
      setError('Failed to load selected files');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const findFileInStructure = (filePath: string, folders: VocabularyFolder[]): VocabularyFile | null => {
    for (const folder of folders) {
      // Check files in current folder
      const file = folder.files.find(f => f.path === filePath);
      if (file) return file;

      // Check subfolders recursively
      const inSubfolder = findFileInStructure(filePath, folder.subfolders);
      if (inSubfolder) return inSubfolder;
    }
    return null;
  };

  const renderFolder = (folder: VocabularyFolder) => (
    <div key={folder.path} className="folder">
      <div className="folder-header">
        <span className="folder-name">{folder.name}</span>
        <span className="file-count">({folder.files.length} files)</span>
      </div>
      <div className="folder-content">
        {folder.files.map(file => (
          <div
            key={file.path}
            className={`file-item ${selectedFiles.has(file.path) ? 'selected' : ''}`}
            onClick={() => handleFileSelect(file)}
          >
            <span className="file-name">{file.name}</span>
            {loadedFiles.has(file.path) && (
              <span className="word-count">
                ({file.words.length} words)
              </span>
            )}
          </div>
        ))}
        {folder.subfolders.map(renderFolder)}
      </div>
    </div>
  );

  return (
    <div className="vocabulary-browser">
      <div className="browser-header">
        <h2>Vocabulary Files</h2>
        <button
          onClick={handleLoadSelected}
          disabled={selectedFiles.size === 0 || loading}
        >
          {loading ? 'Loading...' : `Load Selected (${selectedFiles.size})`}
        </button>
      </div>
      {error && <div className="error-message">{error}</div>}
      <div className="folder-structure">
        {structure.map(renderFolder)}
      </div>
    </div>
  );
}; 