# Bahasa Indonesia Vocabulary Practice Tool - Claude Game Creation Guide

## Project Overview

This is a modular, browser-based vocabulary practice application for Indonesian language learning that integrates AI for dynamic content generation. The application transforms vocabulary practice from rote memorization into engaging, contextual learning experiences that adapt to the learner's specific vocabulary sets.

### Core Philosophy
- **Contextual Learning Through Variety**: Users encounter vocabulary across multiple game types and contexts
- **Friction-Free Learning**: Immediate access to practice without complex features or barriers
- **AI as Learning Accelerator**: Dynamic, personalized content generation tailored to specific vocabulary
- **Modular Architecture**: Each game is an independent component following standardized patterns

### AI-Driven Learning Experience
The application leverages the Claude API to transform static vocabulary lists into dynamic, contextual learning experiences. Rather than simply presenting words in isolation, the system:

1. **Dynamic Content Generation**
   - Generates stories incorporating selected vocabulary
   - Creates contextual examples for each word
   - Produces fill-in-the-blank exercises
   - Crafts multiple-choice questions
   - Generates reading comprehension passages

2. **Adaptive Difficulty**
   - Adjusts content complexity based on learner level
   - Varies sentence structure and length
   - Controls vocabulary density in generated content
   - Provides scaffolded learning experiences

3. **Content Types**
   - Short stories using vocabulary in context
   - Dialogues demonstrating word usage
   - Situational scenarios (e.g., at the market, family gathering)
   - News-style articles for advanced practice
   - Personal narratives for relatable context

4. **Interactive Elements**
   - Real-time content generation during gameplay
   - Dynamic hint systems
   - Contextual feedback on user responses
   - Adaptive follow-up exercises

## Current System Architecture

### 1. User Interface Flow
1. **Vocabulary Selection**
   - Left sidebar displays available vocabulary sets
   - Users can upload tab-separated vocabulary files
   - Multiple sets can be selected simultaneously
   - Real-time word count and set summary displayed

2. **Game Selection**
   - Main content area shows available games
   - Games grouped by category (Static/AI-Generated)
   - Each game shows description and requirements
   - Games disabled if vocabulary requirements not met

3. **Game Setup**
   - Standardized configuration interface
   - Word count selection (respects available words)
   - Time limit configuration
   - Game-specific options (e.g., difficulty, paragraphs)

4. **Game Play**
   - Consistent header with back navigation
   - Timer in top-right corner (when applicable)
   - Clear game instructions
   - Progress indicators
   - Score tracking

### 2. Component Structure
```
src/
├── components/
│   ├── layout/
│   │   ├── Sidebar/          # Vocabulary selection
│   │   ├── TabContainer/     # Game container
│   │   └── Header/          # Navigation and status
│   ├── games/
│   │   ├── Flashcards/      # Basic card flip game
│   │   ├── Matching/        # Word matching game
│   │   ├── MultipleChoice/  # Quiz game
│   │   └── FillInBlanks/    # Gap-fill exercises
│   └── shared/
│       ├── VocabUpload/     # File upload handling
│       ├── VocabSelector/   # Word set selection
│       └── GameLauncher/    # Game initialization
├── services/
│   ├── vocabParser.ts      # Vocabulary processing
│   ├── claudeAPI.ts        # AI integration
│   └── gameRegistry.ts     # Game management
├── hooks/
│   ├── useVocab.ts         # Vocabulary state
│   ├── useGames.ts         # Game state
│   └── useLocalStorage.ts  # Persistence
```

### 3. Core Components

#### VocabularySelector
- Manages vocabulary file upload
- Handles set selection/deselection
- Provides word count summary
- Validates vocabulary format

#### GameRegistry
- Maintains list of available games
- Handles game registration
- Filters games by vocabulary requirements
- Manages game metadata

#### Timer Component
- Standardized timer interface
- Supports countdown/stopwatch modes
- Pause/resume functionality
- Visual feedback states

#### GameSetup Component
```typescript
interface GameSetupProps {
    onConfigSubmit: (config: GameConfig) => void;
    defaultConfig?: GameConfig;
    showStoryOptions?: boolean;
    minWordCount?: number;
    maxWordCount?: number;
    minTimeLimit?: number;
    maxTimeLimit?: number;
}
```

### 4. AI Integration System

#### Claude API Service
The system uses Claude 3 Haiku for efficient, cost-effective content generation:

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
```

#### Content Generation Patterns

1. **Basic Story Generation**
   ```typescript
   const content = await claudeService.generateStory(vocabulary, {
     paragraphs: 2,
     difficulty: 'easy'
   });
   ```

2. **Custom Context Story**
   ```typescript
   const content = await claudeService.generateStory(vocabulary, {
     paragraphs: 3,
     difficulty: 'medium',
     customPrompt: 'Create a dialogue at a restaurant'
   });
   ```

#### Output Format
The service generates content in a structured format:

```
[INDONESIAN]
(Indonesian text with proper formatting and dialogue spacing)

[ENGLISH]
(English translation with matching formatting)

[USED_VOCABULARY]
(List of vocabulary words used in the text)
```

#### Formatting Guidelines
- Each new line of dialogue starts on a new line
- Blank lines separate different speakers
- Proper spacing around punctuation marks
- Consistent paragraph breaks
- Parallel formatting between Indonesian and English texts

#### Token Usage Optimization
- Base tokens: 300
- Additional tokens per paragraph: 200
- Maximum cap: 1000
- Optimized prompt structure
- Minimal formatting instructions
- Efficient response parsing

#### Environment Setup
1. Create a `.env` file in the project root
2. Add your Claude API key:
   ```
   CLAUDE_API_KEY=your_claude_api_key_here
   ```
3. Never commit the actual API key to version control

#### Error Handling
```typescript
try {
  const content = await claudeService.generateStory(vocabulary, config);
  // Process the generated content
} catch (error) {
  console.error('Story generation failed:', error);
  // Implement appropriate fallback or error messaging
}
```

## Creating Game Concepts for Cursor Implementation

When proposing a game concept that will be implemented by Cursor, structure your response to include these key sections:

### 1. Game Overview
- **Name**: A clear, descriptive name for the game
- **Category**: static | ai-generated | hybrid
- **Difficulty Levels**: What difficulty options are available
- **Minimum Words Required**: Minimum vocabulary needed
- **Learning Focus**: What aspect of language learning this targets
- **AI Integration Type**: How AI generates/adapts content
- **Content Generation Strategy**: What types of content are needed

### 2. Gameplay Mechanics
- Detailed description of how the game works
- Step-by-step player actions
- Scoring system
- Win/loss conditions
- Time management (if applicable)
- AI content generation timing (pre-game, during play, or both)
- Content adaptation based on player performance
- Fallback mechanics for AI failures
- Content caching/reuse strategy

### 3. AI Integration
- Detailed prompt structures for each content type
- Response parsing and validation
- Error handling and fallback content
- Rate limiting and optimization
- Content caching strategy
- Real-time vs. pre-generated content decisions

### 4. Technical Requirements
- Special configuration options needed
- UI components required
- State management needs
- Timer requirements
- Any special vocabulary processing

### 5. User Experience
- Game flow from start to finish
- Visual feedback systems
- Progress indicators
- Error states and recovery
- Help/tutorial system

## Implementation Process

### Phase 1: Cursor-Ready Game Specification

When you've developed a game concept, create a Cursor implementation prompt with this structure:

```markdown
GOAL: Implement [Game Name] following established patterns

REQUIREMENTS:
1. Component Structure
   - File organization (component, styles, tests)
   - Required interfaces and types
   - State management approach

2. Integration Points
   - GameRegistry registration
   - Timer component usage
   - GameSetup configuration
   - Vocabulary handling

3. Game-Specific Logic
   - Core game mechanics
   - Scoring system
   - Progress tracking
   - Error handling

4. AI Integration (if applicable)
   - Prompt templates
   - Response parsing
   - Error recovery
   - Fallback modes

5. AI Content Generation
   - Prompt templates for each content type
   - Response parsing and validation
   - Error handling and fallbacks
   - Content caching strategy
   - Rate limiting implementation

6. Content Management
   - Pre-game content generation
   - Real-time content updates
   - Caching and persistence
   - Fallback content system

CONSTRAINTS:
- Must use established interfaces (GameProps, GameConfig)
- Must follow component layout patterns
- Must handle all error states
- Must use CSS modules for styling

REFERENCE:
- Follow FlashcardGame component structure
- Use GameSetup configuration pattern
- Implement standard timer positioning
- Match existing styling patterns

VALIDATION:
- Component renders with test vocabulary
- Configuration options work correctly
- Timer integration functions properly
- Game completion reports score
- Error states handled gracefully
```

### Phase 2: Component Creation

Cursor will implement the game in this order:

1. **Base Structure**
   - Create component files
   - Set up interfaces
   - Implement basic layout
   - Add GameRegistry entry

2. **Core Logic**
   - Implement game mechanics
   - Add state management
   - Set up event handlers
   - Create helper functions

3. **UI Implementation**
   - Add game interface
   - Implement timer
   - Create progress indicators
   - Style components

4. **Integration**
   - Connect to vocabulary system
   - Implement scoring
   - Add error handling
   - Test game flow

### Phase 3: AI Integration

For AI-powered games, Cursor will implement:

1. **Content Generation System**
   ```typescript
   class GameContentGenerator {
     private cache: Map<string, GeneratedContent>;
     
     async generateContent(
       type: ContentType,
       vocabulary: VocabItem[],
       config: ContentConfig
     ): Promise<GeneratedContent> {
       // Check cache
       const cacheKey = this.getCacheKey(type, vocabulary, config);
       if (this.cache.has(cacheKey)) {
         return this.cache.get(cacheKey)!;
       }
       
       // Generate new content
       try {
         const content = await ClaudeAPIService.generate(type, vocabulary, config);
         this.cache.set(cacheKey, content);
         return content;
       } catch (error) {
         return this.getFallbackContent(type, vocabulary, config);
       }
     }
   }
   ```

2. **Game-Specific Prompts**
   ```typescript
   const promptTemplates = {
     story: `Generate a short story in Bahasa Indonesia that naturally incorporates these vocabulary words: {words}.
            The story should be appropriate for {level} learners and be {length} sentences long.
            Theme: {theme}`,
     
     questions: `Create {count} multiple-choice questions about this story: {story}
                Each question should test understanding of these vocabulary words: {words}
                Include 4 options per question, with one correct answer.`,
     
     fillInBlanks: `Create a paragraph using these words: {words}
                    Replace {count} key vocabulary words with [BLANK].
                    Provide the list of removed words in order.`
   };
   ```

3. **Response Processing**
   ```typescript
   class ContentProcessor {
     parseStory(response: string): ProcessedStory {
       // Process story response
     }
     
     parseQuestions(response: string): Question[] {
       // Process questions response
     }
     
     parseFillInBlanks(response: string): FillInBlanksExercise {
       // Process fill-in-the-blanks response
     }
   }
   ```

4. **Error Recovery**
   ```typescript
   class ErrorHandler {
     async handleGenerationError(error: Error, type: ContentType, params: ContentParams): Promise<Content> {
       if (error instanceof RateLimitError) {
         return await this.handleRateLimit(type, params);
       }
       if (error instanceof InvalidResponseError) {
         return await this.retryGeneration(type, params);
       }
       return this.getFallbackContent(type, params);
     }
   }
   ```

## Best Practices for Cursor Implementation

### 1. Component Structure
```typescript
// GameComponent.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { GameProps, GameResult } from '../../types/games';
import { VocabItem } from '../../types/vocab';
import styles from './GameComponent.module.css';

interface GameState {
  // Game-specific state
}

const GameComponent: React.FC<GameProps> = ({
  vocabulary,
  config,
  onComplete,
  onExit
}) => {
  // Implementation
};
```

### 2. Error Handling
```typescript
try {
  const response = await ClaudeAPIService.generateContent(params);
  return response;
} catch (error) {
  if (error instanceof APIError) {
    throw new Error(`AI Generation failed: ${error.message}`);
  }
  throw new Error('AI service temporarily unavailable');
}
```

### 3. Styling Pattern
```css
.gameContainer {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
}

.gameHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.gameContent {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
```

## Validation Checklist

Before submitting a game concept for Cursor implementation, ensure:

1. **Technical Completeness**
   - All required interfaces defined
   - State management specified
   - Error handling covered
   - AI integration detailed (if applicable)

2. **User Experience**
   - Clear game flow defined
   - All user interactions specified
   - Error states handled
   - Help/tutorial needs identified

3. **Integration Requirements**
   - Vocabulary handling specified
   - Timer usage defined
   - Configuration options listed
   - Scoring system detailed

4. **Implementation Guidance**
   - Component structure clear
   - Reference patterns identified
   - Style requirements specified
   - Testing approach outlined

When proposing a new game concept, please follow this structure exactly. This ensures that Cursor has all the necessary information to implement the game following established patterns and best practices. 