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
      return this.parseVocabContent(content, filePath);
    } catch (error) {
      console.error(`Error reading vocab file ${filePath}:`, error);
      return [];
    }
  }

  private parseVocabContent(content: string, source: string): VocabularyWord[] {
    return content
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        const [indonesian, english] = line.split('\t').map(s => s.trim());
        if (!indonesian || !english) {
          console.warn(`Invalid line in ${source}: ${line}`);
          return null;
        }
        return { indonesian, english };
      })
      .filter((word): word is VocabularyWord => word !== null);
  }

  public async loadMultipleFiles(files: (File | string)[]): Promise<VocabularyFile[]> {
    const loadedFiles: VocabularyFile[] = [];

    for (const file of files) {
      try {
        let content: string;
        let fileName: string;

        if (typeof file === 'string') {
          // Handle file path
          const response = await fetch(file);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          content = await response.text();
          fileName = file.split('/').pop() || file;
        } else {
          // Handle File object
          content = await file.text();
          fileName = file.name;
        }

        const words = this.parseVocabContent(content, fileName);
        loadedFiles.push({
          path: fileName,
          name: fileName,
          words,
          wordCount: words.length,
          loaded: true
        });
      } catch (error) {
        console.error(`Error loading file ${typeof file === 'string' ? file : file.name}:`, error);
      }
    }

    return loadedFiles;
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
            wordCount: words.length,
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

      // Calculate total files
      const totalFiles = folders.reduce((sum, folder) => {
        const countFilesInFolder = (f: VocabularyFolder): number => {
          return f.files.length + f.subfolders.reduce((subSum, subFolder) => 
            subSum + countFilesInFolder(subFolder), 0
          );
        };
        return sum + countFilesInFolder(folder);
      }, 0);

      return { 
        folders,
        totalFiles,
        lastLoaded: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error scanning vocabulary structure:', error);
      return { 
        folders: [],
        totalFiles: 0,
        lastLoaded: new Date().toISOString()
      };
    }
  }
} 