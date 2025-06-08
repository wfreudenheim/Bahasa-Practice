export interface VocabItem {
  indonesian: string;
  english: string;
  source?: string;
  id?: string;
}

export interface VocabSet {
  id: string;
  filename: string;
  items: VocabItem[];
  wordCount: number;
  dateAdded: Date;
  path: string;  // Full path to the set, e.g. "Aliyah Vocab/Week 1"
  selected?: boolean;
}

export interface VocabFolder {
  name: string;
  path: string;  // Full path to the folder, e.g. "Aliyah Vocab"
  sets: VocabSet[];
  subfolders: VocabFolder[];
  isExpanded: boolean;
} 