# Technical Specifications and Implementation Guide

## Core Data Types

### TypeScript Interfaces
```typescript
// Core vocabulary types
interface VocabItem {
  indonesian: string;
  english: string;
  source?: string;
  id?: string;
}

interface VocabSet {
  name: string;
  filename: string;
  items: VocabItem[];
  lastModified: Date;
  selected: boolean;
}

// Game system types
interface GameConfig {
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  timeLimit?: number;
  wordCount?: number;
  selectedWords?: VocabItem[];
  aiGenerated?: boolean;
}

interface GameResult {
  score: number;
  totalQuestions: number;
  timeSpent: number;
  gameType: string;
  vocabulary: VocabItem[];
}

interface Game {
  id: string;
  name: string;
  description: string;
  component: React.ComponentType<GameProps>;
  requiresAI?: boolean;
  minWords?: number;
  maxWords?: number;
  category: 'static' | 'ai-generated' | 'hybrid';
}

interface GameProps {
  vocabulary: VocabItem[];
  config: GameConfig;
  onComplete: (result: GameResult) => void;
  onExit: () => void;
}

// API types
interface ClaudeRequest {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}

interface ClaudeResponse {
  content: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}
```

## Component Architecture

### Game Framework Pattern
All games follow this standardized pattern:

```typescript
interface BaseGameProps {
  vocabulary: VocabItem[];
  config: GameConfig;
  onComplete: (result: GameResult) => void;
  onExit: () => void;
}

// Example game component structure
const FlashcardGame: React.FC<BaseGameProps> = ({
  vocabulary,
  config,
  onComplete,
  onExit
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Game logic here
  
  return (
    <div className="game-container">
      {/* Game UI */}
    </div>
  );
};
```

### Vocabulary Processing Service
```typescript
class VocabService {
  static parseFile(content: string, filename: string): VocabSet {
    const lines = content.split('\n').filter(line => line.trim());
    const items: VocabItem[] = lines.map((line, index) => {
      const [indonesian, english] = line.split('\t');
      return {
        indonesian: indonesian?.trim() || '',
        english: english?.trim() || '',
        source: filename,
        id: `${filename}-${index}`
      };
    }).filter(item => item.indonesian && item.english);
    
    return {
      name: filename.replace('.txt', ''),
      filename,
      items,
      lastModified: new Date(),
      selected: false
    };
  }
  
  static combineVocabSets(sets: VocabSet[]): VocabItem[] {
    return sets
      .filter(set => set.selected)
      .flatMap(set => set.items);
  }
  
  static shuffleWords(words: VocabItem[]): VocabItem[] {
    return [...words].sort(() => Math.random() - 0.5);
  }
  
  static selectRandomWords(words: VocabItem[], count: number): VocabItem[] {
    const shuffled = this.shuffleWords(words);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }
}
```

### Game Registry System
```typescript
class GameRegistry {
  private static games: Map<string, Game> = new Map();
  
  static register(game: Game): void {
    this.games.set(game.id, game);
  }
  
  static getAvailableGames(vocabularyCount: number): Game[] {
    return Array.from(this.games.values()).filter(game => {
      if (game.minWords && vocabularyCount < game.minWords) return false;
      if (game.maxWords && vocabularyCount > game.maxWords) return false;
      return true;
    });
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
```

## Claude API Integration

### API Service Implementation
```typescript
class ClaudeAPIService {
  private static apiKey: string = '';
  private static baseURL = 'https://api.anthropic.com/v1/messages';
  
  static setApiKey(key: string): void {
    this.apiKey = key;
  }
  
  static async generateStory(
    vocabulary: VocabItem[],
    difficulty: string = 'beginner',
    context: string = ''
  ): Promise<string> {
    const vocabList = vocabulary.map(v => v.indonesian).join(', ');
    
    const prompt = `Generate a short story in Bahasa Indonesia suitable for ${difficulty} learners. 
    The story should be 3-5 sentences long and naturally incorporate these vocabulary words: ${vocabList}.
    ${context ? `Context: ${context}` : ''}
    
    Return only the story text, ensuring simple grammar and natural word usage.`;
    
    const response = await this.makeRequest(prompt);
    return response.content;
  }
  
  static async generateFillInBlanks(
    vocabulary: VocabItem[],
    difficulty: string = 'beginner'
  ): Promise<{ story: string; answers: string[] }> {
    const vocabList = vocabulary.map(v => v.indonesian).join(', ');
    
    const prompt = `Create a short story in Bahasa Indonesia for ${difficulty} learners. 
    Replace exactly 5-7 words with [BLANK] markers, choosing from this vocabulary: ${vocabList}.
    
    Format your response as:
    STORY: [Your story with [BLANK] markers]
    ANSWERS: [comma-separated list of the words that go in the blanks]`;
    
    const response = await this.makeRequest(prompt);
    return this.parseFillInBlanksResponse(response.content);
  }
  
  private static async makeRequest(prompt: string): Promise<ClaudeResponse> {
    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });
    
    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return {
      content: data.content[0].text,
      usage: data.usage
    };
  }
}
```

## Styling Guidelines

### CSS Module Structure
```css
/* GameContainer.module.css */
.gameContainer {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.gameHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e0e0e0;
}

.gameContent {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.gameControls {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  background: #4CAF50;
  color: white;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s;
}

.button:hover {
  background: #45a049;
}

.button:disabled {
  background: #cccccc;
  cursor: not-allowed;
}
```

### Design Tokens
```typescript
export const designTokens = {
  colors: {
    primary: '#4CAF50',
    primaryHover: '#45a049',
    secondary: '#2196F3',
    danger: '#f44336',
    success: '#4CAF50',
    warning: '#ff9800',
    background: '#f5f5f5',
    surface: '#ffffff',
    text: '#333333',
    textSecondary: '#666666',
    border: '#e0e0e0'
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px'
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px'
  },
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
    md: '0 2px 8px rgba(0, 0, 0, 0.1)',
    lg: '0 4px 16px rgba(0, 0, 0, 0.15)'
  }
};
```

## State Management

### Context Providers
```typescript
// VocabularyContext
interface VocabularyContextType {
  vocabSets: VocabSet[];
  selectedVocabulary: VocabItem[];
  addVocabSet: (set: VocabSet) => void;
  toggleSetSelection: (filename: string) => void;
  removeVocabSet: (filename: string) => void;
  getSelectedWords: () => VocabItem[];
}

// GameContext
interface GameContextType {
  activeGames: { [tabId: string]: Game };
  openGame: (game: Game, vocabulary: VocabItem[], config: GameConfig) => string;
  closeGame: (tabId: string) => void;
  switchToGame: (tabId: string) => void;
  activeTabId: string | null;
}
```

## Error Handling Strategy

### Error Types
```typescript
enum ErrorType {
  FILE_PARSE_ERROR = 'FILE_PARSE_ERROR',
  API_ERROR = 'API_ERROR',
  GAME_ERROR = 'GAME_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR'
}

interface AppError {
  type: ErrorType;
  message: string;
  details?: any;
  timestamp: Date;
}

class ErrorHandler {
  static handle(error: AppError): void {
    console.error(`[${error.type}] ${error.message}`, error.details);
    
    // Show user-friendly message
    switch (error.type) {
      case ErrorType.FILE_PARSE_ERROR:
        this.showMessage('Could not read vocabulary file. Please check the format.', 'error');
        break;
      case ErrorType.API_ERROR:
        this.showMessage('Connection error. Please check your internet and try again.', 'error');
        break;
      default:
        this.showMessage('Something went wrong. Please try again.', 'error');
    }
  }
  
  private static showMessage(message: string, type: 'error' | 'warning' | 'info'): void {
    // Implementation depends on chosen notification system
  }
}
```

## Testing Patterns

### Component Testing Template
```typescript
// Example test for flashcard game
describe('FlashcardGame', () => {
  const mockVocab: VocabItem[] = [
    { indonesian: 'laut', english: 'sea' },
    { indonesian: 'panas', english: 'hot' }
  ];
  
  const mockConfig: GameConfig = {
    difficulty: 'beginner',
    timeLimit: 60
  };
  
  it('renders first vocabulary item', () => {
    render(
      <FlashcardGame 
        vocabulary={mockVocab}
        config={mockConfig}
        onComplete={jest.fn()}
        onExit={jest.fn()}
      />
    );
    
    expect(screen.getByText('laut')).toBeInTheDocument();
  });
  
  it('flips card on click', () => {
    render(
      <FlashcardGame 
        vocabulary={mockVocab}
        config={mockConfig}
        onComplete={jest.fn()}
        onExit={jest.fn()}
      />
    );
    
    const card = screen.getByTestId('flashcard');
    fireEvent.click(card);
    
    expect(screen.getByText('sea')).toBeInTheDocument();
  });
});
```

## Performance Optimization Guidelines

### Best Practices
1. **Memoization**: Use `React.memo` for game components
2. **Lazy Loading**: Code-split games with `React.lazy`
3. **Efficient Updates**: Use `useCallback` for game event handlers
4. **Vocabulary Caching**: Store processed vocabulary in localStorage
5. **API Throttling**: Implement rate limiting for Claude API calls

### Bundle Optimization
- Tree-shake unused utilities
- Optimize imports (avoid importing entire libraries)
- Use production builds for deployment
- Implement code splitting at game level