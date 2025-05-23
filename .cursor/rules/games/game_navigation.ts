import { defineRule } from '@cursor-io/rules';

export default defineRule({
  name: 'game_navigation',
  description: 'Enforces consistent game navigation patterns',
  validate: (context) => {
    const content = context.file.content;
    
    // Check for GameView component structure
    if (context.file.path.includes('GameView')) {
      const requiredProps = [
        'gameType',
        'onBack',
        'selectedWordCount'
      ];
      
      const missingProps = requiredProps.filter(prop => !content.includes(prop));
      
      if (missingProps.length > 0) {
        return {
          valid: false,
          message: `GameView must include required props: ${missingProps.join(', ')}`
        };
      }
      
      if (!content.includes('back-button') || !content.includes('game-header')) {
        return {
          valid: false,
          message: 'GameView must include back navigation and header structure'
        };
      }
    }
    
    // Check for game selection structure
    if (content.includes('game-button') || content.includes('handleGameSelect')) {
      const requiredElements = [
        'selectedWordCount',
        'handleGameSelect',
        'handleBackToGames',
        'game-button'
      ];
      
      const missingElements = requiredElements.filter(el => !content.includes(el));
      
      if (missingElements.length > 0) {
        return {
          valid: false,
          message: `Game selection must include: ${missingElements.join(', ')}`
        };
      }
    }
    
    return { valid: true };
  }
}); 