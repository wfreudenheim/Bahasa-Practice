# Bahasa Indonesia Vocabulary Practice Tool

A modular, browser-based vocabulary practice application for Indonesian language learning that integrates local vocabulary files for dynamic content generation.

## Features

- Organized vocabulary management with folder hierarchy
- Multiple vocabulary selection and combination
- Responsive design optimized for both desktop and mobile devices:
  - Full iOS support with safe area insets
  - Smooth mobile menu transitions
  - Touch-optimized interface
  - Consistent state management across screen sizes
- Interactive learning games and exercises:
  - Flashcard Practice Game:
    - Randomized vocabulary presentation
    - Toggle between Indonesian-first and English-first display
    - Progress tracking with "Got it" / "Need practice" buttons
    - Automatic removal of mastered words from practice set
    - Reset functionality to restore full word set
    - Simple card-flip animations for smooth learning experience
    - Mobile-responsive design
  - More games coming soon:
    - Matching Game (Connect words)
    - Quiz Game (Multiple choice)
    - AI-Generated Practice Games
- Progress tracking and spaced repetition
- Modern, responsive user interface

## Recent Updates

### Mobile Interface Improvements (Latest)
- Enhanced mobile menu functionality with proper close button visibility
- Added iOS-specific optimizations:
  - Safe area insets for notches and home indicators
  - Proper viewport height handling
  - Smooth scrolling behavior
- Improved selection state persistence between mobile and desktop views
- Fixed vocabulary list scrolling issues on mobile
- Enhanced search functionality with proper folder expansion

### Desktop Interface
- Maintained consistent layout and spacing
- Fixed text cropping issues in selection summary
- Optimized sidebar width and content display
- Improved overall responsiveness

## Vocabulary System

This app uses vocabulary files stored in the `/vocabulary` folder. Files are organized by learning progression and themes:

- `week01/`: Beginner vocabulary for first week
- `week02/`: Intermediate vocabulary for second week
- `themes/`: Thematic vocabulary sets (beach, animals, etc.)
- `advanced/`: Advanced vocabulary for experienced learners

### Adding Vocabulary
1. Navigate to `/vocabulary` folder
2. Choose appropriate subfolder (week01, themes, etc.)
3. Create or edit .txt files using tab-separated format
4. Commit changes - files are automatically available in app

For detailed instructions on vocabulary file format and organization, see [vocabulary/README.md](vocabulary/README.md).

## Getting Started

### Prerequisites
- Node.js 14.0.0 or later
- npm 6.0.0 or later

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/bahasa-vocab-app.git
cd bahasa-vocab-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Available Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm test`
Launches the test runner in interactive watch mode

### `npm run build`
Builds the app for production to the `build` folder

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Learn More

- [Project Roadmap](ROADMAP.md)
- [Documentation](docs/)

## Game Development Guide

### Game Setup Component

The GameSetup component provides a standardized configuration interface for all games. Here's how to use it:

```typescript
interface GameConfig {
    wordCount: number;
    timeLimit: number;
    numberOfParagraphs?: number;
    storyComplexity?: 'easy' | 'medium' | 'hard';
}

// Example usage in your game component:
const YourGame: React.FC = () => {
    const handleConfigSubmit = (config: GameConfig) => {
        // Initialize your game with the config
    };

    return (
        <GameSetup
            onConfigSubmit={handleConfigSubmit}
            defaultConfig={{
                wordCount: 20,
                timeLimit: 120,
                numberOfParagraphs: 1,
                storyComplexity: 'medium'
            }}
            maxWordCount={selectedWords.length} // Respects available words
            showStoryOptions={true} // Optional for story-based games
        />
    );
};
```

### Timer Component

The Timer component provides a standardized timer interface with consistent positioning and styling:

```typescript
interface TimerProps {
    duration: number;
    mode?: 'countdown' | 'stopwatch';
    onComplete?: () => void;
    onTick?: (time: number) => void;
    autoStart?: boolean;
}

// Example usage in your game component:
const YourGame: React.FC = () => {
    return (
        <div className="game-container">
            <div className="timer-section">
                <Timer
                    duration={120}
                    mode="countdown"
                    onComplete={() => handleGameComplete()}
                    onTick={(time) => handleTimeTick(time)}
                    autoStart={true}
                />
            </div>
            {/* Your game content */}
        </div>
    );
};
```

### Game Component Guidelines

When creating a new game, follow these guidelines:

1. Game Setup:
   - Use the GameSetup component for configuration
   - Respect the selected vocabulary count
   - Provide sensible default values
   - Include game-specific options when needed

2. Timer Integration:
   - Place timer in top-right corner
   - Use the standard Timer component
   - Handle timer events appropriately
   - Implement pause/resume logic

3. Layout Structure:
   - Maintain consistent header with back navigation
   - Keep timer visible during scrolling
   - Use responsive design patterns
   - Follow established styling conventions

4. State Management:
   - Track game progress
   - Handle configuration changes
   - Manage timer state
   - Implement proper cleanup

For detailed implementation examples, see the GameSetupTest component in the source code.

# Environment Setup

## Claude API Configuration

This application uses the Claude API for generating Indonesian language content. To set up your environment:

1. Get your Claude API key from Anthropic
2. Run the setup script:
   ```bash
   chmod +x scripts/setup-env.sh
   ./scripts/setup-env.sh
   ```
   Or manually create a `.env` file with:
   ```
   CLAUDE_API_KEY=your_api_key_here
   ```
3. Never commit your `.env` file to version control

The application will automatically use the API key from your environment variables.

## Token Usage and Optimization

The application uses Claude 3 Haiku for efficient, cost-effective content generation:

- Base tokens: 300
- Additional tokens per paragraph: 200
- Maximum cap: 1000
- Optimized prompt structure
- Minimal formatting instructions

This configuration balances quality and cost, typically using about 1-2 cents per request.

## Mobile Development Guidelines

When contributing to the mobile interface, follow these guidelines:

1. iOS Safe Areas:
   - Use `env(safe-area-inset-*)` for proper spacing
   - Implement `-webkit-fill-available` for height calculations
   - Handle notch and home indicator areas

2. Touch Targets:
   - Minimum size of 44x44px for interactive elements
   - Proper spacing between touch targets
   - Clear visual feedback on interaction

3. Mobile Menu:
   - Smooth transitions for opening/closing
   - Proper z-index management
   - Background overlay with pointer events
   - Visible close button with adequate touch area

4. Scrolling:
   - Implement `-webkit-overflow-scrolling: touch`
   - Handle momentum scrolling properly
   - Maintain fixed elements during scroll

5. Responsive Design:
   - Use mobile-first approach
   - Implement proper breakpoints
   - Test on various screen sizes
   - Ensure consistent behavior across devices
