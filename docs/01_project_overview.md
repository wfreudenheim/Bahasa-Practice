# Bahasa Indonesia Vocabulary Practice Tool - Project Overview

## Application Purpose and Vision

This application addresses a fundamental challenge in language learning: the gap between memorizing vocabulary in isolation and using those words meaningfully in context. Traditional flashcard apps excel at rote memorization but often fail to help learners develop genuine comprehension and contextual understanding. This tool bridges that gap by combining systematic vocabulary practice with dynamic, AI-generated contextual exercises that make learning both more effective and engaging.

The core philosophy centers on **contextual learning through variety**. Rather than drilling the same vocabulary through repetitive flashcards, learners encounter their words across multiple game types and contexts—from basic recognition exercises to AI-generated stories that weave vocabulary into meaningful narratives. This multi-modal approach mirrors how we naturally acquire language: through repeated exposure in varied, meaningful contexts.

**The Learning Journey**: A typical session begins with the learner selecting thematic vocabulary sets (perhaps "beach vocabulary" and "family words" for a story about a family beach trip). They might start with flashcards for basic recognition, progress to a matching game for reinforcement, then engage with an AI-generated story that naturally incorporates their vocabulary, followed by comprehension questions that test understanding beyond mere translation. This progression from recognition → recall → contextual understanding → comprehension mirrors effective pedagogical practice.

**Design Philosophy - "Friction-Free Learning"**: The application prioritizes immediate access to practice over complex features. No user accounts, no elaborate progress tracking systems, no overwhelming interfaces. The learner's cognitive load should be entirely focused on language acquisition, not navigating software. The workflow is intentionally linear: select vocabulary → choose practice mode → learn. Every decision removes barriers between the learner and their practice session.

**AI as Learning Accelerator**: The integration of Claude API represents a paradigm shift from static educational content to dynamic, personalized learning experiences. Traditional vocabulary apps rely on pre-written content that may not align with a learner's specific vocabulary set or interests. Here, AI generates fresh content tailored to exactly the words the learner is studying, creating relevant, contextual practice that feels purposeful rather than arbitrary.

## Design Principles

### 1. **Modularity as Educational Philosophy**
The plugin-style game architecture reflects a core belief about learning: different learners benefit from different practice modalities, and the same learner benefits from variety over time. By making each game type completely independent, the application can evolve with new pedagogical insights without architectural constraints. A new game idea becomes a single component implementation rather than a system overhaul.

### 2. **Content Personalization Through AI**
Rather than providing one-size-fits-all learning materials, the application generates content specifically for the learner's current vocabulary set. This ensures that every practice session is relevant and that learners encounter their specific words in fresh, varied contexts rather than generic examples.

### 3. **Immediate Utility Over Complex Features**
The application prioritizes getting learners into effective practice quickly over sophisticated user management or analytics. Features that don't directly enhance the learning experience are intentionally excluded in favor of simplicity and speed of access.

### 4. **Vocabulary-Centric Architecture**
Unlike many language learning apps that organize around lessons or levels, this application organizes around vocabulary sets. This reflects how many serious language learners actually study: they accumulate vocabulary lists from various sources (textbooks, conversations, reading) and need flexible ways to practice these personalized collections.

### 5. **Progressive Complexity**
The game types are designed to scaffold learning from basic recognition to complex comprehension. Static games provide reliable practice patterns, while AI games introduce the unpredictability and contextual richness that characterizes real language use.

## Architectural Influences

The technical architecture directly serves these educational goals:

**Component Modularity** enables rapid iteration on new learning modalities without system disruption. Educational research constantly reveals new effective practice methods; the architecture should accommodate pedagogical innovation.

**Vocabulary-as-Data** treats vocabulary sets as the primary application data, with games as interchangeable processors of that data. This separation allows the same vocabulary to be practiced through completely different modalities without data duplication or transformation complexity.

**AI Integration as a Service Layer** keeps AI functionality separate from core game logic, allowing for graceful degradation when AI services are unavailable and easy experimentation with different AI providers or prompting strategies.

**Session-Based State Management** reflects the reality of how people practice languages: in focused sessions with specific goals, rather than as part of long-term application state. This simplifies the architecture while matching natural learning patterns.

## Project Vision
A modular, browser-based vocabulary practice application for Indonesian language learning that integrates with Google Drive for vocabulary storage and uses AI for dynamic content generation. The application transforms vocabulary practice from rote memorization into engaging, contextual learning experiences that adapt to the learner's specific needs and vocabulary sets.

## Core Features

### 1. Vocabulary Management
- **File Upload**: Support for tab-separated Indonesian-English vocabulary files
- **Google Drive Integration** (Phase 4): Direct access to vocabulary file hierarchy
- **Multi-Selection**: Choose multiple vocabulary lists for combined practice sessions
- **Data Processing**: Parse and combine selected vocabularies for games

### 2. Modular Game System
- **Plugin Architecture**: Each game is an independent component
- **Shared Interface**: All games receive standardized vocabulary data
- **Tab-Based UI**: Multiple games can run simultaneously in different tabs
- **Game Registry**: Easy addition of new game types

### 3. Game Types

#### Static Games (No AI Required)
- **Flashcards**: Basic flip-card vocabulary practice
- **Matching**: Connect Indonesian words with English translations
- **Multiple Choice**: Select correct translations from options
- **Fill-in-the-Blanks**: Complete stories with provided word bank

#### AI-Generated Games (Claude API)
- **Story Generation**: Create stories incorporating selected vocabulary
- **AI Fill-in-the-Blanks**: Generate stories with vocabulary gaps
- **Reading Comprehension**: Timed reading followed by multiple-choice questions
- **Vocabulary Set Creation**: AI-generated themed vocabulary lists

### 4. User Experience Goals
- **Simple & Clean**: Focus on learning without UI complexity
- **Quick Launch**: Fast access to practice sessions
- **Functional Design**: Prioritize usability over visual flair
- **Modular Workflow**: Select vocab → Choose game → Practice

## Technical Specifications

### Technology Stack
- **Frontend**: React with TypeScript
- **Styling**: CSS Modules or Tailwind CSS
- **API Integration**: Claude API for AI features
- **Storage**: Browser localStorage (Phase 1), Google Drive API (Phase 4)
- **Testing**: Jest + React Testing Library

### Data Model
```typescript
interface VocabItem {
  indonesian: string;
  english: string;
  source?: string;  // filename origin
}

interface VocabSet {
  name: string;
  items: VocabItem[];
  lastModified: Date;
}

interface GameConfig {
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  timeLimit?: number;
  wordCount?: number;
  selectedWords?: VocabItem[];
}
```

### Performance Requirements
- **Vocabulary Scale**: Max 100 words per game session
- **Total Database**: <10,000 words
- **Load Time**: <2 seconds for game initialization
- **Memory**: All vocab can reside in browser memory

## Development Phases

### Phase 1: Core Infrastructure (Sessions 1-3)
**Goal**: Basic vocabulary management and one working game

#### Session 1: Project Setup
- Create React TypeScript application
- Implement vocabulary data model
- Build file upload and parsing system
- Create basic vocabulary display component

#### Session 2: UI Foundation
- Implement sidebar for vocabulary file management
- Create tab system for multiple games
- Build vocabulary selection interface
- Add basic styling framework

#### Session 3: First Game Implementation
- Create game framework interface
- Implement flashcard game component
- Add game registration system
- Test complete workflow: upload → select → play

### Phase 2: Static Games Expansion (Sessions 4-6)
**Goal**: Multiple game options without AI dependency

#### Session 4: Matching Game
- Word-to-translation matching interface
- Drag-and-drop or click-based interaction
- Scoring and feedback system

#### Session 5: Multiple Choice Quiz
- Question generation from vocabulary
- Answer option randomization
- Progress tracking and results

#### Session 6: Fill-in-the-Blanks
- User-provided text with vocabulary gaps
- Word bank interface
- Answer validation

### Phase 3: AI Integration (Sessions 7-9)
**Goal**: Dynamic content generation using Claude API

#### Session 7: Claude API Setup
- API key management
- Prompt template system
- Story generation for vocabulary practice

#### Session 8: AI-Powered Games
- AI fill-in-the-blanks game
- Dynamic story generation with vocabulary integration
- Difficulty level controls

#### Session 9: Reading Comprehension
- Timed reading interface
- AI-generated comprehension questions
- Results analysis and feedback

### Phase 4: Advanced Features (Future)
- Google Drive API integration
- Progress tracking and analytics
- Spaced repetition algorithms
- Export to Anki format

## Success Metrics
- **Functionality**: All games work reliably with test vocabulary
- **Performance**: Smooth interaction without lag
- **Modularity**: New games can be added in single sessions
- **User Experience**: Clear workflow from vocab selection to practice
- **Code Quality**: Clean, maintainable, well-documented code

## File Organization Strategy
```
src/
├── components/
│   ├── layout/
│   │   ├── Sidebar/
│   │   ├── TabContainer/
│   │   └── Header/
│   ├── games/
│   │   ├── Flashcards/
│   │   ├── Matching/
│   │   ├── MultipleChoice/
│   │   └── FillInBlanks/
│   └── shared/
│       ├── VocabUpload/
│       ├── VocabSelector/
│       └── GameLauncher/
├── services/
│   ├── vocabParser.ts
│   ├── claudeAPI.ts
│   └── gameRegistry.ts
├── hooks/
│   ├── useVocab.ts
│   ├── useGames.ts
│   └── useLocalStorage.ts
├── types/
│   ├── vocab.ts
│   ├── games.ts
│   └── api.ts
└── utils/
    ├── gameHelpers.ts
    └── constants.ts
```

## Testing Strategy
- **Unit Tests**: Vocabulary parsing, game logic, utility functions
- **Integration Tests**: Game framework, API integration
- **Manual Testing**: User workflow validation with real vocabulary files
- **Sample Data**: Consistent test vocabulary sets for development

## Cursor Development Guidelines
- **Single Focus**: Each session targets one specific component or feature
- **Clear Interfaces**: Define input/output contracts before implementation
- **Incremental Building**: Each session builds on previous work
- **Reference Examples**: Use provided HTML games as implementation guides
- **Test Early**: Validate each component before moving to next feature