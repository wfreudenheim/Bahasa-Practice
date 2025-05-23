import React, { useEffect, useState } from 'react';
import { VocabularyLoader } from '../services/VocabularyLoader';
import { VocabularyStructure, VocabularyFolder, VocabularyFile } from '../types/vocabulary';
import './VocabularyBrowser.css';

const loader = new VocabularyLoader();

export const VocabularyBrowser: React.FC = () => {
    const [structure, setStructure] = useState<VocabularyStructure | null>(null);
    const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
    const [loadedFiles, setLoadedFiles] = useState<Map<string, VocabularyFile>>(new Map());
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadStructure();
    }, []);

    const loadStructure = async () => {
        try {
            const structure = await loader.scanVocabularyStructure();
            setStructure(structure);
        } catch (error) {
            console.error('Failed to load vocabulary structure:', error);
        }
    };

    const handleFileSelect = (path: string) => {
        const newSelected = new Set(selectedFiles);
        if (newSelected.has(path)) {
            newSelected.delete(path);
        } else {
            newSelected.add(path);
        }
        setSelectedFiles(newSelected);
    };

    const loadSelectedFiles = async () => {
        setLoading(true);
        try {
            const files = await loader.loadMultipleFiles(Array.from(selectedFiles));
            const newLoadedFiles = new Map(loadedFiles);
            files.forEach(file => {
                newLoadedFiles.set(file.path, file);
            });
            setLoadedFiles(newLoadedFiles);
        } catch (error) {
            console.error('Failed to load files:', error);
        }
        setLoading(false);
    };

    const renderFolder = (folder: VocabularyFolder) => (
        <div key={folder.path} className="folder">
            <h3>{folder.name}</h3>
            <div className="files">
                {folder.files.map(file => (
                    <div key={file.path} className="file">
                        <label>
                            <input
                                type="checkbox"
                                checked={selectedFiles.has(file.path)}
                                onChange={() => handleFileSelect(file.path)}
                            />
                            {file.name}
                        </label>
                        {loadedFiles.has(file.path) && (
                            <span className="word-count">
                                ({loadedFiles.get(file.path)?.wordCount} words)
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );

    const renderLoadedWords = () => {
        const allWords = Array.from(loadedFiles.values()).flatMap(file => file.words);
        return (
            <div className="loaded-words">
                <h3>Loaded Words</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Indonesian</th>
                            <th>English</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allWords.map((word, index) => (
                            <tr key={index}>
                                <td>{word.indonesian}</td>
                                <td>{word.english}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    if (!structure) {
        return <div>Loading vocabulary structure...</div>;
    }

    return (
        <div className="vocabulary-browser">
            <div className="sidebar">
                <h2>Vocabulary Files</h2>
                {structure.folders.map(renderFolder)}
                <button
                    onClick={loadSelectedFiles}
                    disabled={selectedFiles.size === 0 || loading}
                    className="load-button"
                >
                    {loading ? 'Loading...' : `Load Selected Files (${selectedFiles.size})`}
                </button>
            </div>
            <div className="content">
                {loadedFiles.size > 0 && renderLoadedWords()}
            </div>
        </div>
    );
}; 