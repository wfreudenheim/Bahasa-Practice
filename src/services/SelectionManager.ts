import { VocabSet, VocabFolder } from '../interfaces/vocab';

export class SelectionManager {
  private selectedIds: Set<string>;
  private vocabSets: Map<string, VocabSet>;

  constructor() {
    this.selectedIds = new Set();
    this.vocabSets = new Map();
  }

  // Update the available vocab sets
  updateVocabSets(sets: VocabSet[]) {
    this.vocabSets = new Map(sets.map(set => [set.id, set]));
  }

  // Get all selected sets
  getSelectedSets(): VocabSet[] {
    return Array.from(this.selectedIds)
      .map(id => this.vocabSets.get(id))
      .filter((set): set is VocabSet => set !== undefined);
  }

  // Toggle a single set
  toggleSet(set: VocabSet): VocabSet[] {
    if (this.selectedIds.has(set.id)) {
      this.selectedIds.delete(set.id);
    } else {
      this.selectedIds.add(set.id);
    }
    return this.getSelectedSets();
  }

  // Get all sets in a folder and its subfolders
  private getAllSetsInFolder(folder: VocabFolder): VocabSet[] {
    const sets = [...folder.sets];
    folder.subfolders.forEach(subfolder => {
      sets.push(...this.getAllSetsInFolder(subfolder));
    });
    return sets;
  }

  // Toggle all sets in a folder
  toggleFolder(folder: VocabFolder): VocabSet[] {
    const folderSets = this.getAllSetsInFolder(folder);
    const folderSetIds = new Set(folderSets.map(set => set.id));
    
    // Check if all sets in the folder are currently selected
    const allSelected = folderSets.every(set => this.selectedIds.has(set.id));
    
    if (allSelected) {
      // Remove all sets in this folder
      folderSetIds.forEach(id => this.selectedIds.delete(id));
    } else {
      // Add all sets in this folder
      folderSets.forEach(set => this.selectedIds.add(set.id));
    }
    
    return this.getSelectedSets();
  }

  // Check if a set is selected
  isSelected(setId: string): boolean {
    return this.selectedIds.has(setId);
  }

  // Check if all sets in a folder are selected
  isFolderSelected(folder: VocabFolder): boolean {
    const folderSets = this.getAllSetsInFolder(folder);
    return folderSets.length > 0 && folderSets.every(set => this.selectedIds.has(set.id));
  }

  // Check if some but not all sets in a folder are selected
  isFolderPartiallySelected(folder: VocabFolder): boolean {
    const folderSets = this.getAllSetsInFolder(folder);
    const hasSelected = folderSets.some(set => this.selectedIds.has(set.id));
    return hasSelected && !this.isFolderSelected(folder);
  }

  // Clear all selections
  clearSelection(): VocabSet[] {
    this.selectedIds.clear();
    return [];
  }
} 