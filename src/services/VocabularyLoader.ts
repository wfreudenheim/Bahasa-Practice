import { VocabularyStructure, VocabularyFolder, VocabularyFile, VocabularyWord } from '../types/vocabulary';

// Predefined structure for initial development
const VOCABULARY_STRUCTURE = {
    'week01': ['basic_greetings.txt', 'numbers_1_10.txt'],
    'themes': ['beach_vacation.txt'],
};

export class VocabularyLoader {
    private structure: VocabularyStructure | null = null;

    async scanVocabularyStructure(): Promise<VocabularyStructure> {
        const folders: VocabularyFolder[] = [];
        let totalFiles = 0;

        for (const [folderName, files] of Object.entries(VOCABULARY_STRUCTURE)) {
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