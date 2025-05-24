import { VocabItem } from '../types/vocabulary';

export interface ClaudeConfig {
  paragraphs: number;
  difficulty: 'easy' | 'medium' | 'hard';
  customPrompt?: string;
}

export interface GeneratedContent {
  indonesian: string;
  english: string;
  usedVocabulary: string[];
}

export class ClaudeService {
  private baseUrl = 'https://api.anthropic.com/v1/messages';

  private calculateMaxTokens(paragraphs: number): number {
    // Estimate ~100 tokens per paragraph for each language, plus overhead
    return Math.min(300 + (paragraphs * 200), 1000);
  }

  private getApiKey(): string {
    const apiKey = process.env.NEXT_PUBLIC_CLAUDE_API_KEY;
    console.log('Available env vars:', process.env);
    console.log('Claude API Key available:', !!apiKey);
    
    if (!apiKey) {
      throw new Error('Claude API key not found. Please set NEXT_PUBLIC_CLAUDE_API_KEY in your environment variables or Vercel project settings.');
    }
    return apiKey;
  }

  async generateStory(vocabulary: VocabItem[], config: ClaudeConfig): Promise<GeneratedContent> {
    const prompt = this.buildPrompt(vocabulary, config);
    
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.getApiKey(),
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
        const errorData = await response.json().catch(() => null);
        throw new Error(`API request failed: ${response.statusText}${errorData ? ` - ${JSON.stringify(errorData)}` : ''}`);
      }

      const data = await response.json();
      return this.parseResponse(data);
    } catch (error) {
      console.error('Error generating story:', error);
      throw error;
    }
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
    console.log('Raw Claude response:', content); // Add logging to debug

    // More flexible section parsing
    const sections = content.split(/\[(INDONESIAN|ENGLISH|USED_VOCABULARY)\]/i).filter(Boolean);
    
    if (sections.length < 3) {
      throw new Error('Response missing required sections');
    }

    // Find the relevant sections, allowing for more flexible ordering
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

    return {
      indonesian,
      english,
      usedVocabulary
    };
  }
} 