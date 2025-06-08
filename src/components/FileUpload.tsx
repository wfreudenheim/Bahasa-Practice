import React, { ChangeEvent, useState } from 'react';
import { VocabSet, VocabItem } from '../interfaces/vocab';

interface FileUploadProps {
  onVocabLoaded: (vocabSet: VocabSet) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onVocabLoaded }) => {
  const [error, setError] = useState<string | null>(null);

  const parseVocabFile = (content: string): VocabItem[] => {
    return content
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        const [indonesian, english] = line.split('\t').map(s => s.trim());
        if (!indonesian || !english) {
          throw new Error('Invalid file format. Each line must contain Indonesian and English words separated by a tab.');
        }
        return { indonesian, english };
      });
  };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError(null);

    if (!file) return;
    if (!file.name.endsWith('.txt')) {
      setError('Please upload a .txt file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const items = parseVocabFile(content);
        const vocabSet: VocabSet = {
          id: crypto.randomUUID(),
          filename: file.name,
          items,
          wordCount: items.length,
          dateAdded: new Date(),
          path: 'Uploaded'
        };
        onVocabLoaded(vocabSet);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error parsing file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="file-upload">
      <input
        type="file"
        accept=".txt"
        onChange={handleFileUpload}
        className="file-input"
      />
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}; 