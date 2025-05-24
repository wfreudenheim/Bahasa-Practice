export interface VocabItem {
    indonesian: string;
    english: string;
    notes?: string;
}

export interface VocabularyWord {
    indonesian: string;
    english: string;
}

export interface VocabularyFile {
    name: string;
    path: string;
    words: VocabularyWord[];
    wordCount: number;
    loaded: boolean;
    error?: string;
}

export interface VocabularyFolder {
    name: string;
    path: string;
    files: VocabularyFile[];
    subfolders: VocabularyFolder[];
}

export interface VocabularyStructure {
    folders: VocabularyFolder[];
    totalFiles: number;
    lastLoaded: Date;
}

export interface VocabSet {
    id: string;
    filename: string;
    items: VocabItem[];
    wordCount: number;
    dateAdded: Date;
    path?: string;
}

export interface VocabFolder {
    name: string;
    path: string;
    sets: VocabSet[];
    subfolders: VocabFolder[];
    isExpanded: boolean;
} 