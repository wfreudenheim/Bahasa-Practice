# Cursor Development Session Guide

## Pre-Development Setup

### Required Files to Prepare
1. **Sample Vocabulary Files** (2-3 files, tab-separated format):
   ```
   laut	sea
   panas	hot
   pasir	sand
   ikan	fish
   ```

2. **Claude API Key**: Obtain from Anthropic Console

3. **Reference Games**: The HTML files you provided as implementation examples

## Session-by-Session Development Plan

### Session 1: Project Foundation
**Duration**: 1-2 hours  
**Goal**: Basic React app with vocabulary upload and parsing

#### Cursor Prompt:
```
Create a React TypeScript application for a Bahasa Indonesia vocabulary practice tool. Requirements:

1. Project Setup:
   - Use Create React App with TypeScript template
   - Install additional dependencies: styled-components OR CSS modules
   - Set up basic folder structure: components/, services/, types/, hooks/

2. Core Types (create types/vocab.ts):
   - VocabItem interface with indonesian, english, source, id fields
   - VocabSet interface with name, filename, items, lastModified, selected fields

3. Vocabulary Upload Component:
   - File input that accepts .txt files
   - Parse tab-separated values (indonesian\tenglish per line)
   - Display parsed vocabulary in a simple list
   - Show filename and word count

4. Basic Styling:
   - Clean, simple design
   - Centered layout with max-width container
   - Basic button and input styling

5. Test with this sample data:
   laut	sea
   panas	hot
   pasir	sand

The app should show uploaded vocabulary clearly and be ready for adding game components.
```

#### Expected Deliverables:
- Working React app with file upload
- Vocabulary parsing functionality
- Basic UI layout
- TypeScript interfaces defined

#### Validation Checklist:
- [ ] Can upload .txt file successfully
- [ ] Vocabulary displays correctly
- [ ] No console errors
- [ ] Clean, readable code structure

---

### Session 2: Sidebar and Tab System
**Duration**: 1-2 hours  
**Goal**: Multi-vocabulary selection and tab-based game launcher

#### Cursor Prompt:
```
Enhance the vocabulary app with a sidebar and tab system:

1. Layout Structure:
   - Create a two-panel layout: sidebar (30%) + main area (70%)
   - Sidebar contains vocabulary file management
   - Main area contains tab system for games

2. Vocabulary Sidebar Component:
   - List all uploaded vocabulary sets
   - Checkbox for each set to select/deselect
   - Show word count for each set
   - "Select All" / "Deselect All" buttons
   - Display total selected words count

3. Tab System Component:
   - Tab headers with close buttons
   - Tab content area
   - Default "Welcome" tab with instructions
   - Ability to open new game tabs (placeholder for now)

4. Vocabulary Selection Logic:
   - Combine selected vocabulary sets into single array
   - Remove duplicates based on indonesian word
   - Pass combined vocabulary to games

5. Game Launcher Component (placeholder):
   - Show available games as buttons
   - Display selected vocabulary count
   - "Coming Soon" placeholders for actual games

Update the layout to be more app-like with proper spacing and professional appearance.
```

#### Expected Deliverables:
- Sidebar with vocabulary management
- Tab system foundation
- Vocabulary selection logic
- Game launcher placeholder

#### Validation Checklist:
- [ ] Can select/deselect vocabulary sets
- [ ] Combined vocabulary count shows correctly
- [ ] Tabs can be opened and closed
- [ ] Layout is responsive and clean

---

### Session 3: First Game - Flashcards
**Duration**: 1-2 hours  
**Goal**: Complete flashcard game with game framework

#### Cursor Prompt:
```
Implement the flashcard game and establish the game framework:

1. Game Framework:
   - Create GameProps interface (vocabulary, config, onComplete, onExit)
   - Create GameResult interface (score, totalQuestions, timeSpent, gameType)
   - Create base game component structure

2. Flashcard Game Component:
   - Shows one vocabulary item at a time
   - Click to flip between Indonesian and English
   - Next/Previous navigation buttons
   - Progress indicator (X of Y cards)
   - Exit button that returns to launcher

3. Game Integration:
   - "Start Flashcards" button in game launcher
   - Opens flashcard game in new tab
   - Passes selected vocabulary to game
   - Tab shows game name and close button

4. Game State Management:
   - Track current card index
   - Handle card flipping animation (simple CSS transition)
   - Cycle through all vocabulary items
   - Basic completion tracking

5. Styling:
   - Card-like appearance for vocabulary display
   - Smooth flip animation
   - Clear navigation controls
   - Match the clean app aesthetic

Reference the flashcard HTML example I provided for interaction patterns.
```

#### Expected Deliverables:
- Working flashcard game
- Game framework interfaces
- Tab integration
- Flip animations

#### Validation Checklist:
- [ ] Flashcard game opens in new tab
- [ ] Can navigate through all vocabulary
- [ ] Flip animation works smoothly
- [ ] Can exit game and return to launcher
- [ ] Multiple games can run in different tabs

---

### Session 4: Matching Game
**Duration**: 1-2 hours  
**Goal**: Second game to validate framework modularity

#### Cursor Prompt:
```
Create a matching game to test the game framework's modularity:

1. Matching Game Component:
   - Two columns: Indonesian words (left) and English words (right)
   - Shuffle English words randomly
   - Click-based selection (not drag-and-drop for simplicity)
   - Click word in left column, then click matching word in right column
   - Correct matches turn green and become unclickable
   - Incorrect matches briefly turn red, then deselect
   - Score tracking and completion detection

2. Game Logic:
   - First click selects word (highlight in blue)
   - Second click on opposite column attempts match
   - If correct: both words turn green and lock
   - If incorrect: brief red flash, then deselect
   - Game completes when all words matched

3. Visual Design:
   - Two clear columns with headers
   - Word items look clickable (button-style)
   - Clear visual feedback for different states
   - Score display and progress indicator

4. Game Registration:
   - Add matching game to game launcher
   - Ensure it follows same GameProps interface
   - Test with different vocabulary sizes

5. Framework Validation:
   - Confirm both games can run simultaneously in different tabs
   - Verify vocabulary passing works correctly
   - Check tab management functionality

Use the word matching HTML example as reference for the interaction pattern.
```

#### Expected Deliverables:
- Working matching game
- Framework modularity validated
- Multiple games running simultaneously
- Score tracking

#### Validation Checklist:
- [ ] Matching game works correctly
- [ ] Can run both games at same time
- [ ] Score tracking functions
- [ ] Visual feedback is clear
- [ ] Framework handles multiple game types

---

### Session 5: Multiple Choice Quiz
**Duration**: 1-2 hours  
**Goal**: Third static game with question generation

#### Cursor Prompt:
```
Create a multiple choice quiz game with automatic question generation:

1. Quiz Game Component:
   - Show Indonesian word as question
   - Generate 4 multiple choice answers (1 correct + 3 wrong)
   - Track score and question progress
   - Timer for each question (optional)
   - Results summary at end

2. Question Generation Logic:
   - For each vocabulary item, use its English as correct answer
   - Select 3 random wrong answers from other vocabulary English words
   - Shuffle answer order randomly
   - Ensure no duplicate answers

3. Game Flow:
   - Show question counter (Question X of Y)
   - Display question with 4 answer choices
   - Click answer to select and move to next question
   - Show immediate feedback (correct/incorrect)
   - Final score screen with option to play again

4. Enhanced Features:
   - Configurable number of questions (5, 10, 15, or all)
   - Time limit per question (optional)
   - Score calculation (correct answers / total)
   - Review incorrect answers at end

5. UI Design:
   - Clear question display
   - Button-style answer choices
   - Progress bar
   - Professional quiz appearance

Ensure this follows the established game framework and can run alongside other games.
```

#### Expected Deliverables:
- Multiple choice quiz game
- Question generation logic
- Score tracking and results
- Configurable options

#### Validation Checklist:
- [ ] Questions generate correctly
- [ ] Answer randomization works
- [ ] Score calculation accurate
- [ ] Results screen shows properly
- [ ] Game integrates with framework

---

### Session 6: Claude API Integration Setup
**Duration**: 1-2 hours  
**Goal**: API integration and first AI-generated content

#### Cursor Prompt:
```
Integrate Claude API for AI-generated content:

1. API Service Setup:
   - Create ClaudeAPIService class
   - API key management (environment variable or user input)
   - Error handling for API calls
   - Rate limiting considerations

2. API Key Management:
   - Settings modal for API key input
   - Secure storage (localStorage with encryption if possible)
   - Connection test functionality
   - Clear error messages for invalid keys

3. Story Generation Function:
   - Generate short stories incorporating selected vocabulary
   - Configurable difficulty levels (beginner, intermediate, advanced)
   - Story length control (3-5 sentences)
   - Natural vocabulary integration

4. Test Implementation:
   - Simple story generator tool in the app
   - Input: selected vocabulary + difficulty level
   - Output: generated story displayed on screen
   - Error handling for API failures

5. Prompt Engineering:
   - Craft effective prompts for story generation
   - Ensure vocabulary words appear naturally in context
   - Control for appropriate difficulty level
   - Consistent output formatting

API endpoint: https://api.anthropic.com/v1/messages
Model: claude-3-sonnet-20240229

Test with a small vocabulary set to ensure integration works before building games around it.
```

#### Expected Deliverables:
- Claude API integration
- API key management
- Story generation functionality
- Error handling

#### Validation Checklist:
- [ ] API connection works
- [ ] Stories generate with vocabulary
- [ ] Error handling functions
- [ ] API key management secure
- [ ] Rate limiting respected

---

### Session 7: AI Fill-in-the-Blanks Game
**Duration**: 1-2 hours  
**Goal**: First AI-powered game

#### Cursor Prompt:
```
Create an AI-powered fill-in-the-blanks game:

1. AI Story Generation:
   - Generate stories with vocabulary words replaced by [BLANK] markers
   - Ensure 5-7 blanks per story using selected vocabulary
   - Parse response to separate story text and answer key
   - Handle API errors gracefully

2. Game Interface:
   - Display story with input fields for blanks
   - Word bank showing all possible answers (shuffled)
   - Click word bank items to fill blanks OR type directly
   - Clear/reset functionality for each blank

3. Answer Validation:
   - Check answers in real-time or on submit
   - Color coding: green for correct, red for incorrect
   - Show correct answers when complete
   - Score calculation based on correct answers

4. Game Flow:
   - Loading state while generating story
   - Generated story display with interactive blanks
   - Completion detection and results
   - Option to generate new story with same vocabulary

5. Error Handling:
   - Fallback to manual story creation if API fails
   - Clear user messaging for any errors
   - Retry functionality for failed generations

Reference the fill-in-the-blanks HTML example for interaction patterns. Ensure this integrates with the existing game framework.
```

#### Expected Deliverables:
- AI-powered fill-in-the-blanks game
- Story generation with vocabulary integration
- Interactive blank-filling interface
- Error handling and fallbacks

#### Validation Checklist:
- [ ] Stories generate with appropriate blanks
- [ ] Interactive filling works smoothly
- [ ] Answer validation accurate
- [ ] Error handling robust
- [ ] Game follows framework pattern

---

### Session 8: Reading Comprehension Game
**Duration**: 1-2 hours  
**Goal**: Advanced AI game with timed reading and questions

#### Cursor Prompt:
```
Create a reading comprehension game with AI-generated content:

1. Story Generation:
   - Generate longer stories (5-8 sentences) incorporating vocabulary
   - Stories should be cohesive and interesting
   - Appropriate for selected difficulty level
   - Include context that supports comprehension questions

2. Reading Phase:
   - Display full story for timed reading
   - Configurable reading time (30s, 60s, 90s)
   - Visual timer countdown
   - "Ready for Questions" button or automatic transition

3. Question Generation:
   - AI generates 3-5 multiple choice questions about the story
   - Mix of question types: vocabulary, comprehension, inference
   - Questions reference both story content and vocabulary usage
   - 4 answer choices per question with clear correct answer

4. Game Flow:
   - Vocabulary selection and difficulty setting
   - Story generation with loading state
   - Timed reading phase
   - Story disappears, questions appear
   - Results with score and review option

5. Advanced Features:
   - Option to re-read story during questions (with time penalty)
   - Question difficulty based on overall game difficulty
   - Detailed feedback explaining correct answers
   - Performance analytics (reading speed, comprehension accuracy)

Focus on creating engaging, educational content that truly tests comprehension skills.
```

#### Expected Deliverables:
- Reading comprehension game
- Timed reading interface
- AI question generation
- Comprehensive scoring system

#### Validation Checklist:
- [ ] Stories appropriate for difficulty level
- [ ] Timer functions correctly
- [ ] Questions test comprehension effectively
- [ ] Results provide meaningful feedback
- [ ] Game is engaging and educational

---

### Session 9: Vocabulary Set Generator
**Duration**: 1-2 hours  
**Goal**: AI-powered vocabulary creation tool

#### Cursor Prompt:
```
Create an AI-powered vocabulary set generator:

1. Theme-Based Generation:
   - Input field for vocabulary theme (e.g., "zoo animals", "kitchen items")
   - Difficulty level selection
   - Number of words to generate (10, 20, 50)
   - Generate Indonesian-English word pairs

2. AI Prompt Engineering:
   - Create effective prompts for vocabulary generation
   - Ensure appropriate difficulty levels
   - Request common, useful vocabulary
   - Format response as tab-separated pairs

3. Generation Interface:
   - Theme input with examples/suggestions
   - Configuration options (difficulty, count)
   - Generate button with loading state
   - Preview generated vocabulary before saving

4. Integration with Main App:
   - Save generated sets to vocabulary collection
   - Option to edit/modify generated words
   - Export as downloadable .txt file
   - Add to existing vocabulary selection system

5. Quality Controls:
   - Validate generated vocabulary format
   - Remove duplicates or inappropriate entries
   - Allow manual editing of generated sets
   - Option to regenerate individual entries

This tool should help users quickly create themed vocabulary sets for practice.
```

#### Expected Deliverables:
- Vocabulary generation interface
- Theme-based AI prompts
- Generated vocab integration
- Quality control features

#### Validation Checklist:
- [ ] Generates appropriate vocabulary
- [ ] Themes work as expected
- [ ] Integration with main app smooth
- [ ] Quality controls effective
- [ ] Export functionality works

---

## Session Management Best Practices

### Before Each Session
1. **Clear Objective**: Define exactly what will be built
2. **Success Criteria**: List specific validation points
3. **Reference Materials**: Have relevant HTML examples ready
4. **Test Data**: Prepare sample vocabulary files

### During Development
1. **Incremental Testing**: Test each feature as it's built
2. **Error Monitoring**: Check browser console regularly
3. **Code Quality**: Ensure TypeScript compliance
4. **Documentation**: Comment complex logic

### After Each Session
1. **Functionality Test**: Verify all requirements met
2. **Integration Test**: Ensure new features work with existing code
3. **Performance Check**: Monitor load times and responsiveness
4. **Code Review**: Check for best practices and maintainability

### Common Cursor Prompting Tips

#### Be Specific About Requirements
```
❌ "Add a game to the app"
✅ "Create a matching game component that displays Indonesian words in left column, English words in right column, with click-based selection and score tracking"
```

#### Reference Existing Code
```
✅ "Follow the same GameProps interface established in the flashcard game"
✅ "Use the same styling patterns as the vocabulary sidebar"
```

#### Provide Clear Examples
```
✅ "Like the matching game HTML example I provided"
✅ "Similar to flashcard flip animation but for answer selection"
```

#### Include Error Handling
```
✅ "Include error handling for API failures with user-friendly messages"
✅ "Validate vocabulary format and show helpful errors for invalid files"
```

### Troubleshooting Common Issues

#### API Integration Problems
- Check CORS settings
- Verify API key format
- Test with minimal example first
- Implement proper error boundaries

#### State Management Issues
- Use React DevTools to inspect state
- Ensure props are passed correctly
- Check for stale closures in useEffect

#### Styling Problems
- Use browser dev tools to inspect CSS
- Check for naming conflicts
- Ensure responsive design works

#### Performance Issues
- Profile with React DevTools Profiler
- Check for unnecessary re-renders
- Optimize large vocabulary lists

## Final Integration Checklist

### Core Functionality
- [ ] Upload and parse vocabulary files
- [ ] Select multiple vocabulary sets
- [ ] Launch games in tabs
- [ ] All static games work correctly
- [ ] AI games generate content properly
- [ ] Generate new vocabulary sets

### User Experience
- [ ] Clean, intuitive interface
- [ ] Clear error messages
- [ ] Responsive design
- [ ] Fast loading times
- [ ] Smooth interactions

### Code Quality
- [ ] TypeScript types complete
- [ ] Components well-structured
- [ ] Error handling comprehensive
- [ ] Code documented appropriately
- [ ] No console errors

### Testing
- [ ] Manual testing with real vocabulary
- [ ] Edge cases handled
- [ ] API failures gracefully managed
- [ ] Performance acceptable

This guide should give you everything needed to build the application systematically with Cursor, ensuring each session builds meaningfully on the previous work while maintaining code quality and user experience standards.