# Cursor Rules Strategy for Vocabulary Tool

## Philosophy: Building a "Standard Library" of Rules

Instead of treating Cursor as a simple code generator, we'll build a comprehensive "stdlib" of rules that teach Cursor about our specific project patterns, requirements, and conventions. This approach transforms Cursor from a reactive coding assistant into a proactive development partner that understands our architecture deeply.

## Core Strategy

### 1. **Requirements-First Development**
Every session starts with detailed requirements discussion, numbered and documented, so we can reference specific requirements when steering corrections.

### 2. **Rule-Driven Learning**
When Cursor gets something right (especially after correction), immediately ask it to create or update a rule capturing that learning. This prevents repeating the same corrections.

### 3. **Composable Rule System**
Build rules that work together like Unix pipes - small, focused rules that can be combined for complex behaviors.

## Essential Rule Categories for Our Project

### Project Architecture Rules

#### Component Structure Rule
```markdown
---
description: React Game Component Structure
globs: src/components/games/**/*.tsx
---
# Game Component Structure

Enforces consistent structure for all game components in the vocabulary practice tool.

<rule>
name: game_component_structure
description: Standard structure for game components
filters:
  - type: file_path
    pattern: "src/components/games/.*\\.tsx$"
  - type: content
    pattern: "interface.*Props"

actions:
  - type: enforce_structure
    template: |
      import React, { useState, useEffect, useCallback } from 'react';
      import { GameProps, GameResult } from '../../../types/games';
      import { VocabItem } from '../../../types/vocab';
      import styles from './ComponentName.module.css';

      interface ComponentState {
        // Component-specific state
      }

      const ComponentName: React.FC<GameProps> = ({
        vocabulary,
        config,
        onComplete,
        onExit
      }) => {
        // State declarations
        // Effect hooks
        // Event handlers (memoized with useCallback)
        // Early returns for edge cases
        // Main render
      };

      export default ComponentName;

  - type: suggest
    message: |
      Game components must follow this structure:
      1. Import React hooks, types, and styles
      2. Define component-specific interfaces
      3. Use GameProps interface exactly as defined
      4. Memoize event handlers with useCallback
      5. Handle edge cases with early returns
      6. Export as default

metadata:
  priority: critical
  version: 1.0
</rule>
```

#### TypeScript Interface Consistency
```markdown
---
description: Vocabulary Tool TypeScript Interfaces
globs: src/types/**/*.ts, src/**/*.tsx
---
# TypeScript Interface Consistency

Ensures all components use the established type system correctly.

<rule>
name: typescript_interface_consistency
description: Enforce consistent use of established interfaces
filters:
  - type: content
    pattern: "(VocabItem|GameProps|GameResult|GameConfig)"
  - type: file_extension
    pattern: "\\.(ts|tsx)$"

actions:
  - type: reject
    conditions:
      - pattern: "interface VocabItem"
        message: "Do not redefine VocabItem. Import from types/vocab.ts"
      - pattern: "interface GameProps"
        message: "Do not redefine GameProps. Import from types/games.ts"

  - type: enforce
    message: |
      Always import established interfaces:
      ```typescript
      import { VocabItem, VocabSet } from '../types/vocab';
      import { GameProps, GameResult, GameConfig } from '../types/games';
      ```

      Never redefine these core interfaces in components.

metadata:
  priority: high
  version: 1.0
</rule>
```

### Game Registration Rule
```markdown
---
description: Game Registration System
globs: src/components/games/**/*.tsx
---
# Game Registration System

Automatically register new games in the GameRegistry.

<rule>
name: game_registration
description: Auto-register new game components
filters:
  - type: file_create
    pattern: "src/components/games/.*/.*\\.tsx$"
  - type: content
    pattern: "export default.*Game"

actions:
  - type: execute
    command: |
      # Extract game name and details
      GAME_NAME=$(basename "$FILE" .tsx)
      GAME_ID=$(echo "$GAME_NAME" | sed 's/Game$//' | tr '[:upper:]' '[:lower:]')
      
      # Add to game registry
      echo "
      GameRegistry.register({
        id: '$GAME_ID',
        name: '$(echo $GAME_ID | sed 's/.*/\L&/; s/[a-z]*/\u&/g')',
        description: 'Practice vocabulary with $GAME_ID',
        component: $GAME_NAME,
        category: 'static', // Update to 'ai-generated' if needed
        minWords: 1
      });" >> src/services/gameRegistry.ts

  - type: suggest
    message: |
      New game component detected. To complete integration:
      
      1. Update the game registration in gameRegistry.ts
      2. Set correct category ('static' or 'ai-generated')
      3. Set appropriate minWords/maxWords if needed
      4. Add game description
      5. Export component from games/index.ts

metadata:
  priority: high
  version: 1.0
</rule>
```

### AI Integration Rules

#### Claude API Error Handling
```markdown
---
description: Claude API Error Handling
globs: src/services/claudeAPI.ts, src/components/games/**/*AI*.tsx
---
# Claude API Error Handling

Standardizes error handling for all Claude API interactions.

<rule>
name: claude_api_error_handling
description: Consistent error handling for Claude API calls
filters:
  - type: content
    pattern: "(ClaudeAPI|claude|anthropic)"
  - type: function_call
    pattern: "generateStory|generateQuestions|generateVocab"

actions:
  - type: enforce_pattern
    template: |
      try {
        const response = await ClaudeAPIService.methodName(params);
        return response;
      } catch (error) {
        if (error instanceof APIError) {
          throw new Error(`AI Generation failed: ${error.message}`);
        }
        throw new Error('AI service temporarily unavailable. Please try again.');
      }

  - type: suggest
    message: |
      All Claude API calls must:
      1. Use try-catch blocks
      2. Check for APIError instances
      3. Provide user-friendly error messages
      4. Never expose raw API errors to users
      5. Offer fallback options when possible

metadata:
  priority: critical
  version: 1.0
</rule>
```

### Development Workflow Rules

#### Automatic Testing
```markdown
---
description: Automatic Test Generation
globs: src/components/**/*.tsx
---
# Automatic Test Generation

Generates tests for new components automatically.

<rule>
name: auto_test_generation
description: Create tests for new components
filters:
  - type: file_create
    pattern: "src/components/.*\\.tsx$"
  - type: content
    pattern: "export default"

actions:
  - type: create_file
    path: "${FILE_DIR}/${COMPONENT_NAME}.test.tsx"
    template: |
      import React from 'react';
      import { render, screen, fireEvent } from '@testing-library/react';
      import ${COMPONENT_NAME} from './${COMPONENT_NAME}';
      
      const mockProps = {
        // Add appropriate mock props based on component type
      };
      
      describe('${COMPONENT_NAME}', () => {
        it('renders without crashing', () => {
          render(<${COMPONENT_NAME} {...mockProps} />);
          expect(screen.getByTestId('${COMPONENT_NAME.toLowerCase()}')).toBeInTheDocument();
        });
        
        // Add more tests based on component functionality
      });

  - type: suggest
    message: "Test file created. Add specific test cases for component functionality."

metadata:
  priority: medium
  version: 1.0
</rule>
```

#### Commit Automation
```markdown
---
description: Vocabulary Tool Commit Automation
globs: *
---
# Automated Commits for Vocabulary Tool

Automatically commits successful changes with descriptive messages.

<rule>
name: vocab_tool_commits
description: Auto-commit successful changes with conventional commit format
filters:
  - type: event
    pattern: "build_success|test_pass"
  - type: file_change
    pattern: "*"

actions:
  - type: execute
    command: |
      # Determine change type based on file and content
      CHANGE_TYPE=""
      case "$FILE" in
        src/components/games/*) CHANGE_TYPE="feat"; SCOPE="games";;
        src/services/*) CHANGE_TYPE="feat"; SCOPE="services";;
        src/types/*) CHANGE_TYPE="refactor"; SCOPE="types";;
        *.test.*) CHANGE_TYPE="test"; SCOPE="testing";;
        *.md) CHANGE_TYPE="docs"; SCOPE="docs";;
        *) CHANGE_TYPE="chore"; SCOPE="misc";;
      esac
      
      # Create descriptive commit message
      case "$CHANGE_DESCRIPTION" in
        *"game"*|*"Game"*) MESSAGE="add new vocabulary practice game";;
        *"API"*|*"api"*) MESSAGE="improve API integration";;
        *"fix"*|*"Fix"*) MESSAGE="fix vocabulary tool functionality";;
        *) MESSAGE="update vocabulary practice tool";;
      esac
      
      git add "$FILE"
      git commit -m "$CHANGE_TYPE($SCOPE): $MESSAGE"

metadata:
  priority: high
  version: 1.0
</rule>
```

## Session Workflow with Rules

### 1. **Start Each Session with Context**
```
CONTEXT: Continuing vocabulary tool development
CURRENT STATE: [Brief description of what's built]
TODAY'S GOAL: [Specific objective]
ACTIVE RULES: [Mention key rules that should be applied]

REQUIREMENTS:
1. [Numbered requirement 1]
2. [Numbered requirement 2]
3. [Numbered requirement 3]
```

### 2. **Implementation with Rule Awareness**
```
Implement requirement #2 following these rules:
- Use the game_component_structure rule for component layout
- Apply typescript_interface_consistency for all types
- Follow claude_api_error_handling for any AI integration

After implementation, update or create rules for any new patterns we establish.
```

### 3. **Post-Implementation Rule Updates**
```
The implementation worked well. Please create/update a rule that captures:
- The specific pattern we used for [functionality]
- How to handle [edge case] we encountered
- The naming convention we established for [components]

Add this to our stdlib so future implementations are consistent.
```

## Rule Evolution Strategy

### Phase 1: Foundation Rules (Sessions 1-3)
- Component structure rules
- TypeScript interface consistency
- Basic file organization
- Test generation automation

### Phase 2: Game System Rules (Sessions 4-6)
- Game registration automation
- Game component patterns
- State management conventions
- UI consistency rules

### Phase 3: AI Integration Rules (Sessions 7-9)
- Claude API interaction patterns
- Error handling standardization
- Prompt template management
- Response parsing conventions

### Phase 4: Advanced Rules (Future)
- Performance optimization patterns
- Accessibility requirements
- Deployment automation
- Cross-game compatibility

## Benefits for Our Vocabulary Tool

1. **Consistency**: Every game component follows the same patterns
2. **Speed**: Cursor knows our conventions and applies them automatically
3. **Quality**: Rules enforce error handling, testing, and type safety
4. **Scalability**: New developers (or future you) can quickly understand the patterns
5. **Evolution**: The stdlib grows smarter with each session

## Implementation Instructions for Cursor

When starting development:

1. **Create the rules directory structure**:
   ```
   .cursor/rules/
   ├── architecture/
   ├── games/
   ├── ai-integration/
   └── workflow/
   ```

2. **Ask Cursor to implement each rule as needed**:
   "Create a rule that enforces our game component structure pattern"

3. **Update rules after corrections**:
   "That fix worked perfectly. Update the error handling rule to include this pattern"

4. **Compose rules for complex tasks**:
   "Use the game component structure + TypeScript consistency + auto-testing rules to create the matching game"

This approach transforms Cursor from a code generator into a domain-specific development partner that understands your vocabulary tool's architecture, patterns, and requirements deeply.

# Bahasa Indonesia Vocabulary Practice Tool - Development Roadmap

### Game Navigation Rules
```markdown
---
description: Game Navigation Patterns
globs: src/components/GameView/*.tsx, src/components/MainContent/*.tsx
---
# Game Navigation System

Enforces consistent navigation patterns for the vocabulary practice games.

<rule>
name: game_navigation_patterns
description: Standard navigation structure for games
filters:
  - type: file_path
    pattern: "(GameView|MainContent).*\\.tsx$"
  - type: content
    pattern: "(game-button|handleGameSelect)"

actions:
  - type: enforce_structure
    template: |
      // GameView Component Structure
      interface GameViewProps {
        gameType: GameType;
        onBack: () => void;
        selectedWordCount: number;
      }

      // Navigation Header
      <div className="game-header">
        <button className="back-button" onClick={onBack}>
          ← Back to games
        </button>
        <div className="game-info">
          <h2>{gameType}</h2>
          <p>{selectedWordCount} words selected</p>
        </div>
      </div>

      // Game Selection Structure
      <div className="game-section">
        <h3>Category Title</h3>
        <div className="game-grid">
          <button 
            className="game-button ${gameType}"
            onClick={() => handleGameSelect('${gameType}')}
          >
            <h4>Game Title</h4>
            <p>Description</p>
          </button>
        </div>
      </div>

  - type: suggest
    message: |
      Game navigation must follow these patterns:
      1. Consistent back button placement and styling
      2. Game type and word count display in header
      3. Grouped game selection by category
      4. Semantic button styling with proper color contrast
      5. Clear visual feedback for interactions

metadata:
  priority: high
  version: 1.0
</rule>
```

### Learnings from Session 2

1. **Navigation State Management**
   - Keep navigation state at the appropriate component level
   - Use clear prop interfaces for navigation callbacks
   - Maintain consistent back navigation patterns
   - Show relevant context in game headers

2. **Game Selection UI**
   - Group games by category for clear organization
   - Use consistent button styling and layout
   - Provide clear visual feedback
   - Maintain accessibility with proper contrast
   - Show game descriptions for better UX

3. **Component Communication**
   - Pass game type and word count through props
   - Use callback props for navigation
   - Maintain consistent prop naming
   - Handle edge cases (no words selected, etc.)