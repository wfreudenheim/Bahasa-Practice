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

export interface VocabItem {
    indonesian: string;
    english: string;
    source?: string;
    id?: string;
}

export interface VocabSet {
    name: string;
    filename: string;
    items: VocabItem[];
    lastModified: Date;
    selected: boolean;
} 