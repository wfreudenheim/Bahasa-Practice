import { VocabularyStructure, VocabularyFolder, VocabularyFile, VocabularyWord } from '../types/vocabulary';

export class VocabularyLoader {
    private structure: VocabularyStructure | null = null;

    private async fetchDirectoryStructure(path: string): Promise<string[]> {
        try {
            const response = await fetch(`${path}/index.json`);
            if (!response.ok) {
                throw new Error(`Failed to load directory structure: ${path}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error loading directory structure:', error);
            return [];
        }
    }

    async scanVocabularyStructure(): Promise<VocabularyStructure> {
        const folders: VocabularyFolder[] = [];
        let totalFiles = 0;

        // Known folder names
        const knownFolders = ['week01', 'week02', 'themes', 'advanced'];

        for (const folderName of knownFolders) {
            const files = await this.fetchDirectoryStructure(`/vocabulary/${folderName}`);
            
            if (files.length > 0) {
                const folder: VocabularyFolder = {
                    name: folderName,
                    path: `/vocabulary/${folderName}`,
                    files: files.map(filename => ({
                        name: filename,
                        path: `/vocabulary/${folderName}/${filename}`,
                        words: [],
                        wordCount: 0,
                        loaded: false
                    })),
                    subfolders: []
                };
                
                totalFiles += files.length;
                folders.push(folder);
            }
        }

        this.structure = {
            folders,
            totalFiles,
            lastLoaded: new Date()
        };

        return this.structure;
    }

    async loadVocabularyFile(path: string): Promise<VocabularyFile> {
        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`Failed to load file: ${path}`);
            }

            const content = await response.text();
            const words: VocabularyWord[] = content
                .trim()
                .split('\n')
                .map(line => {
                    const [indonesian, english] = line.trim().split('\t');
                    return { indonesian, english };
                });

            return {
                name: path.split('/').pop() || '',
                path,
                words,
                wordCount: words.length,
                loaded: true
            };
        } catch (error) {
            return {
                name: path.split('/').pop() || '',
                path,
                words: [],
                wordCount: 0,
                loaded: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    async loadMultipleFiles(paths: string[]): Promise<VocabularyFile[]> {
        return Promise.all(paths.map(path => this.loadVocabularyFile(path)));
    }

    async refreshStructure(): Promise<VocabularyStructure> {
        return this.scanVocabularyStructure();
    }
} 