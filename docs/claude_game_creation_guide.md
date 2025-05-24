# Claude-Based Game Development Guide

## Key Learnings from Fill-in-Story Implementation

### 1. Handling Claude's Output Variability

#### Best Practices
- Design for flexibility in Claude's responses rather than expecting exact formats
- Use robust parsing that can handle variations in output
- Include fallback behaviors for unexpected response formats
- Focus on game functionality over exact numerical requirements

```typescript
// Example: Flexible response parsing
const parseClaudeResponse = (response: string) => {
  try {
    // Try primary parsing strategy
    const result = primaryParser(response);
    return result;
  } catch {
    // Fallback to more lenient parsing
    return fallbackParser(response);
  }
};
```

### 2. Game Setup Structure

#### Component Organization
```typescript
interface AIGameProps {
  words: VocabItem[];
  onBack: () => void;
  config?: GameConfig;
}

const AIGame: React.FC<AIGameProps> = ({ words, onBack, config }) => {
  // 1. Setup Phase
  const [gameState, setGameState] = useState({
    phase: 'setup',
    // ... other state
  });

  // 2. Content Generation Phase
  const initializeGame = async (config: GameConfig) => {
    setGameState(prev => ({ ...prev, phase: 'generating' }));
    try {
      const content = await generateContent(words, config);
      setGameState(prev => ({
        ...prev,
        phase: 'playing',
        content
      }));
    } catch (error) {
      handleError(error);
    }
  };

  // 3. Game Play Phase
  const renderContent = () => {
    switch (gameState.phase) {
      case 'setup': return <GameSetup />;
      case 'generating': return <LoadingState />;
      case 'playing': return <GameContent />;
      case 'error': return <ErrorState />;
    }
  };
};
```

### 3. Claude Service Integration

#### Prompt Design
- Keep prompts simple and focused
- Include clear format instructions
- Provide examples in the prompt
- Use JSON or easily parseable formats

```typescript
const buildPrompt = (words: VocabItem[], config: GameConfig) => `
Create a story in Indonesian using these words: ${words.map(w => w.indonesian).join(', ')}

Requirements:
- Difficulty level: ${config.difficulty}
- Length: ${config.sentenceCount} sentences
- Format: Return a JSON object with:
  - story: the story text
  - blanks: array of words to remove
  - title: { indonesian, english }

Example output:
{
  "story": "Saya pergi ke pasar...",
  "blanks": ["pergi", "pasar"],
  "title": {
    "indonesian": "Perjalanan ke Pasar",
    "english": "Trip to the Market"
  }
}`;
```

#### Error Handling
```typescript
const handleClaudeError = async (error: Error, retryCount = 0) => {
  if (retryCount >= 3) {
    return fallbackContent();
  }
  
  if (error instanceof ParseError) {
    // Retry with more explicit formatting instructions
    return generateWithEnhancedPrompt();
  }
  
  if (error instanceof RateLimitError) {
    await delay(1000);
    return retry();
  }
};
```

### 4. Game Registry Integration

#### Registration
```typescript
GameRegistry.register({
  id: 'ai-game',
  name: 'AI Game Name',
  description: 'Game description',
  component: AIGameComponent,
  category: 'ai-generated',
  requiresAI: true,
  minWords: 3,  // Keep minimum requirements reasonable
  maxWords: 50  // Set generous maximums for flexibility
});
```

### 5. Development Workflow

1. **Start with Setup Screen**
   - Implement GameSetup component first
   - Test configuration options
   - Ensure proper state management

2. **Claude Integration**
   - Start with simple prompts
   - Test response formats
   - Implement robust parsing
   - Add fallback behaviors

3. **Game Logic**
   - Build core gameplay mechanics
   - Implement scoring system
   - Add timer integration

4. **Polish & UX**
   - Add loading states
   - Implement error handling
   - Add retry mechanisms
   - Polish transitions

## Recent Updates & Progress

### Completed Features
1. Fill-in-Story Game
   - Core implementation
   - Bilingual titles
   - Custom story context
   - Improved layout
   - Flexible word count handling

### Improvements Made
1. Game Registry
   - Updated word limits for flexibility
   - Improved game availability logic

### Best Practices Established
1. Claude Integration
   - Robust response parsing
   - Error handling patterns
   - Retry mechanisms

2. UI/UX
   - Consistent loading states
   - Clear error messages
   - Smooth transitions

## Future Game Development Checklist

1. [ ] Review this guide
2. [ ] Set up basic game structure
3. [ ] Implement GameSetup component
4. [ ] Design Claude prompts
5. [ ] Implement response parsing
6. [ ] Add error handling
7. [ ] Build core game mechanics
8. [ ] Polish UI/UX
9. [ ] Test edge cases
10. [ ] Register in GameRegistry 