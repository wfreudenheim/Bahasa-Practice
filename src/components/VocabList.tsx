import React from 'react';
import { VocabSet } from '../interfaces/vocab';

interface VocabListProps {
  vocabSets: VocabSet[];
}

export const VocabList: React.FC<VocabListProps> = ({ vocabSets }) => {
  if (vocabSets.length === 0) {
    return <div className="no-vocab">No vocabulary sets uploaded yet</div>;
  }

  return (
    <div className="vocab-list">
      {vocabSets.map((set) => (
        <div key={set.id} className="vocab-set">
          <div className="vocab-set-header">
            <h3>{set.filename}</h3>
            <span className="word-count">{set.wordCount} words</span>
          </div>
          <table className="vocab-table">
            <thead>
              <tr>
                <th>Indonesian</th>
                <th>English</th>
              </tr>
            </thead>
            <tbody>
              {set.items.map((item, index) => (
                <tr key={`${set.id}-${index}`}>
                  <td>{item.indonesian}</td>
                  <td>{item.english}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}; 