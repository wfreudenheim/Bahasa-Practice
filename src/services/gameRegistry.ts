import { VocabItem } from '../types/vocabulary';
import { FlashcardGame } from '../components/Games/FlashcardGame/FlashcardGame';
import { MatchingGame } from '../components/Games/MatchingGame/MatchingGame';
import { FillInStoryGame } from '../components/Games/FillInStory/FillInStoryGame';
import { GameSetupTest } from '../components/GameSetupTest/GameSetupTest';
import { ClaudeTest } from '../components/ClaudeTest/ClaudeTest';
import { ExternalFillBlanks } from '../components/Games/ExternalFillBlanks/ExternalFillBlanks';
import { RetrievalRushGame } from '../components/Games/RetrievalRush/RetrievalRushGame';

export interface Game {
  id: string;
  name: string;
  description: string;
  component: React.ComponentType<any>;
  requiresAI?: boolean;
  minWords?: number;
  maxWords?: number;
  category: 'static' | 'ai-generated' | 'hybrid' | 'development' | 'external';
  requiresVocabulary?: boolean;
}

class GameRegistry {
  private static games: Map<string, Game> = new Map();
  
  static register(game: Game): void {
    this.games.set(game.id, game);
  }
  
  static getAllGames(): Game[] {
    return Array.from(this.games.values());
  }
  
  static getAvailableGames(vocabularyCount: number): Game[] {
    console.log('Getting available games for vocabulary count:', vocabularyCount);
    console.log('All registered games:', Array.from(this.games.values()).map(g => ({
      id: g.id,
      minWords: g.minWords,
      maxWords: g.maxWords,
      category: g.category
    })));
    
    const games = Array.from(this.games.values()).filter(game => {
      const meetsMinRequirement = !game.minWords || vocabularyCount >= game.minWords;
      const meetsMaxRequirement = !game.maxWords || vocabularyCount <= game.maxWords;
      console.log(`Game ${game.id}:`, {
        vocabularyCount,
        minWords: game.minWords,
        maxWords: game.maxWords,
        meetsMin: meetsMinRequirement,
        meetsMax: meetsMaxRequirement
      });
      return meetsMinRequirement && meetsMaxRequirement;
    });

    console.log('Available games after filtering:', games.map(g => g.id));
    return games;
  }
  
  static getGame(id: string): Game | undefined {
    return this.games.get(id);
  }
}

// Register games
GameRegistry.register({
  id: 'flashcards',
  name: 'Flashcards',
  description: 'Practice vocabulary with flip cards',
  component: FlashcardGame,
  category: 'static',
  minWords: 1
});

GameRegistry.register({
  id: 'matching',
  name: 'Matching Game',
  description: 'Match Indonesian words with their English translations',
  component: MatchingGame,
  category: 'static',
  minWords: 4,
  maxWords: 500
});

GameRegistry.register({
  id: 'fill-in-story',
  name: 'Fill in the Story',
  description: 'Complete Indonesian stories by filling in vocabulary blanks',
  component: FillInStoryGame,
  category: 'ai-generated',
  requiresAI: true,
  minWords: 3,
  maxWords: 50
});

// Register development games
GameRegistry.register({
  id: 'setup-test',
  name: 'Game Setup Test',
  description: 'Test new game configuration',
  component: GameSetupTest,
  category: 'development',
  minWords: 1
});

GameRegistry.register({
  id: 'claude-test',
  name: 'Claude Story Generator',
  description: 'Test AI story generation',
  component: ClaudeTest,
  category: 'development',
  minWords: 1,
  requiresAI: true
});

// Register external content game
GameRegistry.register({
  id: 'external-fill-blanks',
  name: 'Fill in the Blanks',
  description: 'Practice with custom fill-in-the-blank exercises',
  component: ExternalFillBlanks,
  category: 'external',
  minWords: 0,
  requiresVocabulary: false
});

// Register Retrieval Rush game
GameRegistry.register({
  id: 'retrieval-rush',
  name: 'Retrieval Rush',
  description: 'Practice Indonesian speaking with AI-generated prompts and feedback',
  component: RetrievalRushGame,
  category: 'ai-generated',
  requiresAI: true,
  minWords: 0,
  requiresVocabulary: false
});

export default GameRegistry; 