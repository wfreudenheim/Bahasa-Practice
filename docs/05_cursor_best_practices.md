# Cursor Development Best Practices and Code Patterns

## Cursor-Specific Development Guidelines

### Prompting Strategy for Maximum Effectiveness

#### Structure Every Prompt with Clear Sections
```
GOAL: [What you want to achieve in one sentence]

REQUIREMENTS:
1. [Specific requirement 1]
2. [Specific requirement 2]
3. [Specific requirement 3]

CONSTRAINTS:
- [Technical constraints]
- [Design constraints]
- [Integration requirements]

REFERENCE:
- [Existing code patterns to follow]
- [Similar components to model after]

VALIDATION:
- [How you'll know it works correctly]
```

#### Reference Existing Patterns Explicitly
```
✅ GOOD: "Follow the same component structure as the FlashcardGame component"
✅ GOOD: "Use the GameProps interface established in the previous session"
✅ GOOD: "Apply the same styling patterns used in the vocabulary sidebar"

❌ AVOID: "Make it look nice"
❌ AVOID: "Add some styling"
❌ AVOID: "Similar to other games"
```

#### Be Specific About Integration Points
```
✅ GOOD: "The component should receive vocabulary through the GameProps interface and call onComplete when the user finishes all questions"
✅ GOOD: "Register this game in the GameRegistry with id 'matching', category 'static', and minWords: 2"

❌ AVOID: "Make it work with the existing system"
❌ AVOID: "Integrate it properly"
```

### Code Organization Patterns

#### Component File Structure
```typescript
// GameComponent.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { GameProps, GameResult } from '../../types/games';
import { VocabItem } from '../../types/vocab';
import styles from './GameComponent.module.css';

interface GameState {
  // Component-specific state
}

const GameComponent: React.FC<GameProps> = ({
  vocabulary,
  config,
  onComplete,
  onExit
}) => {
  // State declarations
  const [gameState, setGameState] = useState<GameState>({});
  
  // Effect hooks
  useEffect(() => {
    // Initialization logic
  }, [vocabulary]);
  
  // Event handlers (use useCallback for performance)
  const handleAction = useCallback(() => {
    // Handler logic
  }, [/* dependencies */]);
  
  // Render helpers
  const renderGameContent = () => {
    // Complex rendering logic
  };
  
  // Early returns for loading/error states
  if (!vocabulary.length) {
    return <div>No vocabulary available</div>;
  }
  
  return (
    <div className={styles.gameContainer}>
      {/* JSX content */}
    </div>
  );
};

export default GameComponent;
```

#### Service File Structure
```typescript
// apiService.ts
class APIService {
  private static instance: APIService;
  private apiKey: string = '';
  
  static getInstance(): APIService {
    if (!APIService.instance) {
      APIService.instance = new APIService();
    }
    return APIService.instance;
  }
  
  // Public methods with clear error handling
  async generateContent(params: GenerationParams): Promise<GeneratedContent> {
    try {
      const response = await this.makeRequest(params);
      return this.parseResponse(response);
    } catch (error) {
      throw new APIError(this.getErrorMessage(error));
    }
  }
  
  // Private helper methods
  private async makeRequest(params: GenerationParams): Promise<APIResponse> {
    // Implementation
  }
  
  private parseResponse(response: APIResponse): GeneratedContent {
    // Implementation
  }
  
  private getErrorMessage(error: any): string {
    // Error message mapping
  }
}

export default APIService.getInstance();
```

### TypeScript Patterns for Cursor

#### Always Define Interfaces First
When starting a new feature, begin with interface definitions:

```typescript
// Define data structures before implementation
interface MatchingGameState {
  selectedWords: { left?: VocabItem; right?: VocabItem };
  matches: VocabItem[];
  score: number;
  isComplete: boolean;
}

interface MatchingGameProps extends GameProps {
  // Game-specific props if needed
}
```

#### Use Discriminated Unions for State Management
```typescript
type GameStatus = 
  | { type: 'loading' }
  | { type: 'playing'; currentQuestion: number }
  | { type: 'completed'; finalScore: number }
  | { type: 'error'; message: string };
```

#### Generic Utility Types
```typescript
// Create reusable patterns
interface GameComponent<TState = any, TConfig = GameConfig> {
  state: TState;
  config: TConfig;
  vocabulary: VocabItem[];
}

type GameEventHandler<T = void> = (event: GameEvent) => T;
```

### React Patterns for Cursor

#### Custom Hooks for Game Logic
```typescript
// useGameTimer.ts
interface TimerOptions {
  duration: number;
  onComplete: () => void;
  autoStart?: boolean;
}

export const useGameTimer = ({ duration, onComplete, autoStart = false }: TimerOptions) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isActive, setIsActive] = useState(autoStart);
  
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      onComplete();
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, onComplete]);
  
  const start = () => setIsActive(true);
  const pause = () => setIsActive(false);
  const reset = () => {
    setTimeLeft(duration);
    setIsActive(false);
  };
  
  return { timeLeft, isActive, start, pause, reset };
};
```

#### Context Patterns
```typescript
// VocabularyContext.tsx
interface VocabularyContextType {
  vocabSets: VocabSet[];
  selectedVocabulary: VocabItem[];
  actions: {
    addVocabSet: (set: VocabSet) => void;
    toggleSetSelection: (filename: string) => void;
    clearSelection: () => void;
  };
}

const VocabularyContext = createContext<VocabularyContextType | null>(null);

export const useVocabulary = () => {
  const context = useContext(VocabularyContext);
  if (!context) {
    throw new Error('useVocabulary must be used within VocabularyProvider');
  }
  return context;
};
```

## Cursor Session Management

### Start Each Session with Context Setting
```
I'm continuing development on the Bahasa Indonesia vocabulary practice tool. 

CURRENT STATE:
- [Brief description of what's already built]
- [Key components that exist]
- [What was accomplished in the last session]

TODAY'S GOAL:
- [Specific objective for this session]

INTEGRATION REQUIREMENTS:
- [How this fits with existing code]
- [Interfaces that must be maintained]
```

### End Each Session with Validation
```
Before we finish this session, let's validate:

FUNCTIONALITY TESTS:
1. [Test case 1]
2. [Test case 2]
3. [Test case 3]

INTEGRATION TESTS:
1. [Does this work with existing components?]
2. [Are the interfaces consistent?]
3. [Does the styling match the app theme?]

NEXT SESSION PREP:
- [What should be tackled next]
- [Any setup needed for the next session]
```

### Error Recovery Patterns
When Cursor makes mistakes, use these recovery prompts:

```
There's an issue with [SPECIFIC PROBLEM]. Let's fix it step by step:

CURRENT ISSUE:
- [Describe the exact problem]
- [What's not working as expected]

EXPECTED BEHAVIOR:
- [What should happen instead]

CONSTRAINTS:
- [Don't change other working parts]
- [Maintain existing interfaces]

Please provide just the corrected code for [SPECIFIC FILE/FUNCTION].
```

## Code Quality Patterns

### Error Handling Strategy
```typescript
// Consistent error handling across components
class AppError extends Error {
  constructor(
    message: string,
    public type: ErrorType,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Use in components
const handleGameAction = async () => {
  try {
    await performAction();
  } catch (error) {
    if (error instanceof AppError) {
      showErrorMessage(error.message);
    } else {
      showErrorMessage('An unexpected error occurred');
    }
    console.error('Game action failed:', error);
  }
};
```

### Performance Patterns
```typescript
// Memoization for expensive calculations
const processedVocabulary = useMemo(() => {
  return vocabulary
    .filter(item => item.indonesian && item.english)
    .map(item => ({
      ...item,
      id: `${item.source}-${item.indonesian}`
    }));
}, [vocabulary]);

// Callback memoization for event handlers
const handleWordClick = useCallback((word: VocabItem) => {
  // Handler logic
}, [/* minimal dependencies */]);

// Component memoization
const WordItem = React.memo<WordItemProps>(({ word, onClick, isSelected }) => {
  return (
    <div 
      className={`word-item ${isSelected ? 'selected' : ''}`}
      onClick={() => onClick(word)}
    >
      {word.indonesian}
    </div>
  );
});
```

### Testing Patterns for Cursor
```typescript
// Component test template
describe('GameComponent', () => {
  const defaultProps: GameProps = {
    vocabulary: mockVocabulary,
    config: { difficulty: 'beginner' },
    onComplete: jest.fn(),
    onExit: jest.fn()
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders with initial state', () => {
    render(<GameComponent {...defaultProps} />);
    expect(screen.getByTestId('game-container')).toBeInTheDocument();
  });
  
  it('handles user interaction', async () => {
    render(<GameComponent {...defaultProps} />);
    
    const actionButton = screen.getByRole('button', { name: /action/i });
    fireEvent.click(actionButton);
    
    await waitFor(() => {
      expect(/* expected result */).toBeTruthy();
    });
  });
});
```

## Common Cursor Pitfalls and Solutions

### Problem: Cursor Overwrites Working Code
**Solution**: Be extremely specific about what needs to change
```
❌ "Update the matching game"
✅ "In the MatchingGame component, only modify the handleWordClick function to add score tracking, keep all other functionality the same"
```

### Problem: Cursor Doesn't Follow Existing Patterns
**Solution**: Reference specific files and patterns
```
✅ "Use the same component structure as FlashcardGame.tsx, including the same useEffect pattern for vocabulary initialization and the same CSS module import pattern"
```

### Problem: Cursor Creates Inconsistent Interfaces
**Solution**: Always reference the established types
```
✅ "This component must implement the GameProps interface from types/games.ts exactly as defined, with no modifications to the interface"
```

### Problem: Cursor Generates Non-functional Code
**Solution**: Ask for incremental building with testing
```
✅ "First create just the component structure with props and basic JSX, then we'll add the game logic step by step"
```

## File Naming and Organization Conventions

### Component Files
```
components/
  games/
    FlashcardGame/
      FlashcardGame.tsx          # Main component
      FlashcardGame.module.css   # Styles
      FlashcardGame.test.tsx     # Tests
      index.ts                   # Export
```

### Service Files
```
services/
  claudeAPI.ts          # API integration
  vocabParser.ts        # Data processing
  gameRegistry.ts       # Game management
  storage.ts           # Local storage
```

### Type Files
```
types/
  vocab.ts             # Vocabulary-related types
  games.ts             # Game system types
  api.ts               # API response types
  common.ts            # Shared utility types
```

This pattern-focused approach will help Cursor generate more consistent, maintainable code that follows your established architecture.