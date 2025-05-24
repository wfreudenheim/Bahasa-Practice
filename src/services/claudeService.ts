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
    // In Create React App, environment variables are prefixed with REACT_APP_
    const apiKey = process.env.REACT_APP_CLAUDE_API;
    
    console.log('Environment Debug:');
    console.log('Available env vars:', Object.keys(process.env).filter(key => key.startsWith('REACT_APP_')));
    console.log('API Key exists:', !!apiKey);
    
    if (!apiKey) {
      throw new Error(
        'Claude API key not found. Please ensure:\n' +
        '1. REACT_APP_CLAUDE_API is set in .env file\n' +
        '2. The environment variable starts with REACT_APP_\n' +
        '3. You have restarted the development server after adding the environment variable'
      );
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

    let prompt = `Create a conversation using these Indonesian words: ${vocabList}\n\n`;
    
    if (config.customPrompt) {
      prompt += `Context: ${config.customPrompt}\n\n`;
    }

    prompt += `Guidelines:
- Write ${config.paragraphs} exchanges between speakers
- Level: ${difficultyMap[config.difficulty]}
- Format the response in exactly this structure:
[INDONESIAN]
(Full Indonesian conversation here)

[ENGLISH]
(Full English translation here)

[USED_VOCABULARY]
(List of used words)

Do not include any section markers or vocabulary lists within the conversation text itself.`;

    return prompt;
  }

  private parseResponse(response: any): GeneratedContent {
    if (!response.content || !Array.isArray(response.content) || response.content.length === 0) {
      throw new Error('Invalid API response format');
    }

    const content = response.content[0].text;
    console.log('Raw Claude response:', content);

    // Extract the main sections with more flexible matching
    const indonesianMatch = content.match(/\[INDONESIAN\]\s*([\s\S]*?)(?=\s*\[ENGLISH\]|$)/);
    const englishMatch = content.match(/\[ENGLISH\]\s*([\s\S]*?)(?=\s*\[USED_VOCABULARY\]|$)/);

    if (!indonesianMatch || !englishMatch) {
      console.error('Failed to parse sections. Content:', content);
      throw new Error('Failed to parse one or more required sections from Claude response');
    }

    const indonesian = indonesianMatch[1].trim();
    const english = englishMatch[1].trim();

    // Extract vocabulary from the content itself since the [USED_VOCABULARY] section might be missing
    const usedVocabulary = Array.from(
      new Set(
        (content.match(/\b\w+\b/g) || [])
          .filter((word: string) => word.length > 2) // Filter out short words
          .filter((word: string) => {
            // Only include words that appear in both Indonesian and English sections
            const wordRegex = new RegExp(`\\b${word}\\b`, 'i');
            return indonesian.match(wordRegex) && english.match(wordRegex);
          })
      )
    ) as string[];

    if (!indonesian || !english) {
      console.error('Parsed sections:', { indonesian, english, usedVocabulary });
      throw new Error('One or more required sections are empty');
    }

    return {
      indonesian,
      english,
      usedVocabulary
    };
  }
} 