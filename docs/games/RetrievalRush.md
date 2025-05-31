# Retrieval Rush

## Overview
Retrieval Rush is a speaking practice game that helps users improve their Indonesian language skills through prompted responses and detailed AI feedback. The game focuses on real-world scenarios and provides specific, actionable feedback to help learners improve their language abilities.

## Game Flow
1. **Setup Phase**
   - User selects difficulty level (beginner/intermediate/advanced)
   - User chooses prompt language (English/Indonesian)
   - System generates contextual prompts using Claude AI

2. **Prompt Selection Phase**
   - User views a list of generated prompts
   - Each prompt shows category and estimated response time
   - User selects a prompt to respond to

3. **Response Phase**
   - User sees the selected prompt
   - User provides their response in Indonesian
   - No time limit - users can take as long as needed
   - Complete button to submit when ready

4. **Analysis Phase**
   - Two-column layout:
     - Left: Original prompt and user's response
     - Right: Detailed AI analysis
   - Analysis sections:
     - Strengths (specific examples of good language use)
     - Grammar Corrections (with explanations)
     - Areas for Improvement (actionable suggestions)
     - Cultural Tips (when relevant)
     - Suggested New Vocabulary (with context)
   - Option to try another prompt

## Technical Implementation

### Key Components
- `RetrievalRushGame.tsx`: Main game container and state management
- `SetupPhase.tsx`: Initial configuration
- `PromptSelectionPhase.tsx`: Prompt display and selection
- `ResponsePhase.tsx`: Response input
- `AnalysisPhase.tsx`: Feedback display

### Claude AI Integration
- Uses Claude 3 Haiku for:
  - Generating contextual prompts
  - Analyzing user responses
  - Providing specific feedback
- Structured JSON responses for consistent formatting
- Detailed prompt engineering for specific, actionable feedback

### Styling
- Clean, modern UI with card-based design
- Consistent spacing and typography
- Clear visual hierarchy
- Responsive layout

## Best Practices Learned

### Prompt Engineering
1. Be extremely specific in requirements
2. Provide examples of desired output
3. Structure prompts for consistent JSON responses
4. Include validation rules in the prompt
5. Request concrete examples instead of general advice

### UI/UX Design
1. Clear progression through game phases
2. Consistent visual language
3. Proper spacing and typography
4. Card-based layout for content organization
5. Clear feedback mechanisms

### Code Organization
1. Separate concerns by game phase
2. Consistent component structure
3. Reusable styles
4. Clear type definitions
5. Error handling at multiple levels

## Future Improvements
1. Expand prompt categories
2. Add difficulty-specific vocabulary suggestions
3. Implement progress tracking
4. Add speech-to-text capabilities
5. Include audio pronunciation examples

## How to Add New Features
1. Update `ClaudeService` prompt templates
2. Add new component in `components/Games/RetrievalRush/components`
3. Update game state management in `RetrievalRushGame.tsx`
4. Add corresponding styles in `RetrievalRushGame.module.css`
5. Update documentation 