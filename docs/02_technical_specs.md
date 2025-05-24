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
interface ClaudeConfig {
  paragraphs: number;
  difficulty: 'easy' | 'medium' | 'hard';
  customPrompt?: string;
}

interface GeneratedContent {
  indonesian: string;
  english: string;
  usedVocabulary: string[];
}

class ClaudeService {
  private baseUrl = 'https://api.anthropic.com/v1/messages';
  
  // Environment variable must be set
  private static readonly API_KEY = process.env.CLAUDE_API_KEY;
  
  async generateStory(vocabulary: VocabItem[], config: ClaudeConfig): Promise<GeneratedContent> {
    const prompt = this.buildPrompt(vocabulary, config);
    
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ClaudeService.API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: this.calculateMaxTokens(config.paragraphs),
          messages: [{
            role: 'user',
            content: prompt
          }],
          system: "Generate educational Indonesian language content with English translations."
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseResponse(data);
    } catch (error) {
      console.error('Error generating story:', error);
      throw error;
    }
  }

  private calculateMaxTokens(paragraphs: number): number {
    // Estimate ~100 tokens per paragraph for each language, plus overhead
    return Math.min(300 + (paragraphs * 200), 1000);
  }

  private buildPrompt(vocabulary: VocabItem[], config: ClaudeConfig): string {
    const vocabList = vocabulary.map(v => v.indonesian).join(', ');
    const difficultyMap = {
      easy: 'beginner',
      medium: 'intermediate',
      hard: 'advanced'
    };

    let prompt = `Use these Indonesian words: ${vocabList}\n\n`;
    
    if (config.customPrompt) {
      prompt += `Task: ${config.customPrompt}\n\n`;
    } else {
      prompt += 'Task: Create a short story\n\n';
    }

    prompt += `Level: ${difficultyMap[config.difficulty]}\n`;
    prompt += `Paragraphs: ${config.paragraphs}\n\n`;
    prompt += `Formatting Instructions:
- Start each new line of dialogue on a new line
- Add a blank line between different speakers
- Keep proper spacing around punctuation marks
- Ensure consistent paragraph breaks\n\n`;
    prompt += `[INDONESIAN]\n[ENGLISH]\n[USED_VOCABULARY]`;

    return prompt;
  }

  private parseResponse(response: any): GeneratedContent {
    if (!response.content || !Array.isArray(response.content) || response.content.length === 0) {
      throw new Error('Invalid API response format');
    }

    const content = response.content[0].text;
    console.log('Raw Claude response:', content);

    const sections = content.split(/\[(INDONESIAN|ENGLISH|USED_VOCABULARY)\]/i).filter(Boolean);
    
    if (sections.length < 3) {
      throw new Error('Response missing required sections');
    }

    let indonesian = '', english = '', usedVocabulary: string[] = [];
    
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i].trim();
      const nextSection = sections[i + 1]?.trim() || '';
      
      if (section.toUpperCase() === 'INDONESIAN') {
        indonesian = nextSection;
      } else if (section.toUpperCase() === 'ENGLISH') {
        english = nextSection;
      } else if (section.toUpperCase() === 'USED_VOCABULARY') {
        usedVocabulary = nextSection.split('\n').map((word: string) => word.trim()).filter(Boolean);
      }
    }

    if (!indonesian || !english || !usedVocabulary.length) {
      console.error('Parsed sections:', { indonesian, english, usedVocabulary });
      throw new Error('Failed to parse one or more required sections from Claude response');
    }

    return { indonesian, english, usedVocabulary };
  }
}
```

### Environment Configuration
The Claude API key must be stored in an environment variable:
```
CLAUDE_API_KEY=your_claude_api_key_here
```

### Token Usage and Optimization
- Base tokens: 300
- Additional tokens per paragraph: 200
- Maximum token cap: 1000
- Model: claude-3-haiku-20240307
- Optimized prompt structure for minimal token usage
- Proper formatting instructions for consistent output

## Claude API Prompt Engineering

### Prompt Structure Best Practices
```typescript
interface PromptConfig {
  format: string;
  examples?: string[];
  constraints: string[];
  contextData: any;
}

class PromptBuilder {
  static buildStructuredPrompt(config: PromptConfig): string {
    return `
${config.contextData ? `Context:\n${JSON.stringify(config.contextData, null, 2)}\n\n` : ''}
Task Description:
${config.format}

Output Format:
[SECTION1]
(Content for section 1)

[SECTION2]
(Content for section 2)

${config.examples ? `Examples:\n${config.examples.join('\n\n')}\n\n` : ''}
Requirements:
${config.constraints.map(c => `- ${c}`).join('\n')}

Important:
- Keep section markers exactly as shown
- Do not nest section markers
- Do not include metadata within content
- Maintain consistent formatting
`;
  }
}

// Example Usage:
const prompt = PromptBuilder.buildStructuredPrompt({
  format: "Create a conversation using these Indonesian words: ${vocabList}",
  examples: [
    "[INDONESIAN]\nHalo, apa kabar?\n\n[ENGLISH]\nHello, how are you?"
  ],
  constraints: [
    "Use natural, conversational language",
    "Include all required vocabulary words",
    "Maintain consistent difficulty level",
    "Keep sections clearly separated"
  ],
  contextData: {
    difficulty: "beginner",
    requiredWords: ["laut", "pantai"],
    style: "casual conversation"
  }
});
```

### Response Format Guidelines
```typescript
interface SectionConfig {
  name: string;
  required: boolean;
  pattern: RegExp;
  fallback?: (content: string) => string[];
}

const sectionConfigs: SectionConfig[] = [
  {
    name: 'INDONESIAN',
    required: true,
    pattern: /\[INDONESIAN\]\s*([\s\S]*?)(?=\s*\[|$)/,
  },
  {
    name: 'ENGLISH',
    required: true,
    pattern: /\[ENGLISH\]\s*([\s\S]*?)(?=\s*\[|$)/,
  },
  {
    name: 'USED_VOCABULARY',
    required: false,
    pattern: /\[USED_VOCABULARY\]\s*([\s\S]*?)(?=\s*\[|$)/,
    fallback: (content: string) => {
      // Extract words that appear in both languages
      const words = content.match(/\b\w+\b/g) || [];
      return words.filter(word => 
        content.toLowerCase().includes(word.toLowerCase())
      );
    }
  }
];
```

### Prompt Templates by Use Case

#### 1. Conversation Generation
```typescript
const conversationPrompt = `
Context:
- Vocabulary Level: ${level}
- Required Words: ${vocabList}
- Style: Natural dialogue
- Speakers: Tourist and Local

Format your response exactly like this:
[INDONESIAN]
Speaker1: (Indonesian text)
Speaker2: (Indonesian response)

[ENGLISH]
Speaker1: (English translation)
Speaker2: (English translation)

[USED_VOCABULARY]
word1, word2, word3

Requirements:
- Use natural conversational flow
- Include all required vocabulary
- Keep translations accurately matched
- Maintain consistent difficulty
- Do not include section markers in the content
`;
```

#### 2. Story Generation
```typescript
const storyPrompt = `
Context:
- Theme: ${theme}
- Required Words: ${vocabList}
- Length: ${paragraphCount} paragraphs
- Style: Descriptive narrative

Format your response exactly like this:
[INDONESIAN]
(Full Indonesian story text)

[ENGLISH]
(Full English translation)

[USED_VOCABULARY]
word1, word2, word3

Requirements:
- Create a coherent narrative
- Use descriptive language
- Include all required vocabulary
- Keep paragraphs aligned between languages
- Maintain consistent formatting
`;
```

### Error Recovery Strategies
```typescript
class ResponseValidator {
  static validateResponse(content: string, configs: SectionConfig[]): boolean {
    return configs.every(config => {
      if (!config.required) return true;
      const match = content.match(config.pattern);
      return match && match[1].trim().length > 0;
    });
  }

  static recoverMissingSection(content: string, config: SectionConfig): string {
    if (config.fallback) {
      return config.fallback(content).join(', ');
    }
    throw new Error(`Required section [${config.name}] is missing`);
  }

  static cleanupResponse(content: string): string {
    return content
      .replace(/\[.*?\](?!\s*\n)/g, '') // Remove inline markers
      .replace(/\n{3,}/g, '\n\n')      // Normalize spacing
      .trim();
  }
}
```

### Prompt Optimization Tips
1. **Clear Section Boundaries**
   - Use distinct markers: [SECTION_NAME]
   - Add newlines between sections
   - Avoid nested markers
   - Use consistent capitalization

2. **Error Prevention**
   - Explicitly state what NOT to do
   - Provide example formats
   - Include validation requirements
   - Specify exact marker syntax

3. **Content Structure**
   - Start with context/requirements
   - Show exact format expected
   - Include examples if complex
   - List specific constraints

4. **Recovery Mechanisms**
   - Implement fallback strategies
   - Include content validation
   - Clean up malformed responses
   - Handle missing sections gracefully

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

## Environment Variables and API Integration

### Create React App Environment Variables
- Always use `REACT_APP_` prefix for all environment variables
- Avoid using "KEY" in environment variable names when deploying to Vercel
- Use simple, clear names (e.g., `REACT_APP_CLAUDE_API` instead of `REACT_APP_CLAUDE_API_KEY`)
- Local `.env` file must exactly match Vercel environment variables

### Environment Variable Debugging
```typescript
// Effective debugging in services
console.log('Environment Debug:');
console.log('Available env vars:', Object.keys(process.env).filter(key => key.startsWith('REACT_APP_')));
console.log('API exists:', !!process.env.REACT_APP_CLAUDE_API);
console.log('API type:', typeof process.env.REACT_APP_CLAUDE_API);
```

### Claude API Integration Best Practices

#### Structured Response Format
```typescript
// Example prompt structure
const prompt = `Guidelines:
- Write ${config.paragraphs} exchanges between speakers
- Level: ${difficultyMap[config.difficulty]}
- Format the response in exactly this structure:
[INDONESIAN]
(Full Indonesian content here)

[ENGLISH]
(Full English translation here)

[USED_VOCABULARY]
(List of used words)

Do not include any section markers or metadata within the content itself.`;
```

#### Response Parsing
```typescript
// Robust section extraction
const indonesianMatch = content.match(/\[INDONESIAN\]\s*([\s\S]*?)(?=\s*\[ENGLISH\]|$)/);
const englishMatch = content.match(/\[ENGLISH\]\s*([\s\S]*?)(?=\s*\[USED_VOCABULARY\]|$)/);

// Handle optional sections gracefully
const vocabMatch = content.match(/\[USED_VOCABULARY\]\s*([\s\S]*?)$/);
const usedVocabulary = vocabMatch 
  ? vocabMatch[1].split(/[,\n]/).map(word => word.trim()).filter(Boolean)
  : extractVocabFromContent(content); // Fallback strategy
```

### Error Handling
- Include descriptive error messages with specific fix instructions
- Add debugging checkpoints for complex operations
- Consider environment-specific error messages
- Validate both input and output formats
- Handle edge cases (missing sections, incomplete responses)