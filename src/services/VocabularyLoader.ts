import { VocabularyStructure, VocabularyFolder, VocabularyFile, VocabularyWord } from '../types/vocabulary';

export class VocabularyLoader {
  private vocabularyPath: string;

  constructor() {
    this.vocabularyPath = '/vocabulary'; // Path relative to public directory
  }

  private async readVocabFile(filePath: string): Promise<VocabularyWord[]> {
    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const content = await response.text();
      return content
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
          const [indonesian, english] = line.split('\t').map(s => s.trim());
          if (!indonesian || !english) {
            console.warn(`Invalid line in ${filePath}: ${line}`);
            return null;
          }
          return { indonesian, english };
        })
        .filter((word): word is VocabularyWord => word !== null);
    } catch (error) {
      console.error(`Error reading vocab file ${filePath}:`, error);
      return [];
    }
  }

  private async scanFolder(folderPath: string): Promise<VocabularyFolder> {
    try {
      const response = await fetch(`${folderPath}/index.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const folderData = await response.json();
      
      const files: VocabularyFile[] = [];
      const subfolders: VocabularyFolder[] = [];

      // Process files
      for (const file of folderData.files || []) {
        if (file.name.endsWith('.txt')) {
          const words = await this.readVocabFile(`${folderPath}/${file.name}`);
          files.push({
            path: `${folderPath}/${file.name}`,
            name: file.name,
            words,
            loaded: words.length > 0
          });
        }
      }

      // Process subfolders recursively
      for (const subfolder of folderData.folders || []) {
        const subfolderData = await this.scanFolder(`${folderPath}/${subfolder}`);
        subfolders.push(subfolderData);
      }

      return {
        name: folderPath.split('/').pop() || '',
        path: folderPath,
        files,
        subfolders
      };
    } catch (error) {
      console.error(`Error scanning folder ${folderPath}:`, error);
      return {
        name: folderPath.split('/').pop() || '',
        path: folderPath,
        files: [],
        subfolders: []
      };
    }
  }

  public async scanVocabularyStructure(): Promise<VocabularyStructure> {
    try {
      const response = await fetch(`${this.vocabularyPath}/index.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      const folders: VocabularyFolder[] = [];
      for (const folderName of data.folders || []) {
        const folder = await this.scanFolder(`${this.vocabularyPath}/${folderName}`);
        folders.push(folder);
      }

      return { folders };
    } catch (error) {
      console.error('Error scanning vocabulary structure:', error);
      return { folders: [] };
    }
  }
} 