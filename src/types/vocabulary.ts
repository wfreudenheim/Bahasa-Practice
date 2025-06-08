export interface VocabItem {
    indonesian: string;
    english: string;
    source?: string;
    id?: string;
}

export interface VocabularyWord {
    indonesian: string;
    english: string;
}

export interface VocabularyFile {
    path: string;
    name: string;
    words: VocabularyWord[];
    loaded: boolean;
    wordCount?: number;  // Optional for backward compatibility
}

export interface VocabularyFolder {
    name: string;
    path: string;
    files: VocabularyFile[];
    subfolders: VocabularyFolder[];
    totalFiles?: number;  // Optional for backward compatibility
}

export interface VocabularyStructure {
    folders: VocabularyFolder[];
    totalFiles: number;
    lastLoaded: string;
}

// Legacy interfaces maintained for backward compatibility
export interface VocabSet {
    id: string;
    filename: string;
    items: VocabItem[];
    wordCount: number;
    dateAdded: Date;
    path: string;
    selected?: boolean;
}

export interface VocabFolder {
    name: string;
    path: string;
    sets: VocabSet[];
    subfolders: VocabFolder[];
    isExpanded: boolean;
} 