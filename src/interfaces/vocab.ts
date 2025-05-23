export interface VocabItem {
  indonesian: string;
  english: string;
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