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

export interface FillInStoryConfig {
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  sentenceCount: number;
  customPrompt?: string;
  blankCount: number;
}

export interface FillInStoryResponse {
  story: string;
  answers: string[];
  title: {
    indonesian: string;
    english: string;
  };
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

  private buildFillInStoryPrompt(vocabulary: VocabItem[], config: FillInStoryConfig): string {
    const vocabList = vocabulary.map(v => v.indonesian).join(', ');
    const { difficulty, sentenceCount, customPrompt, blankCount } = config;

    let prompt = `Create a fill-in-the-blank story in Indonesian using EXACTLY ${blankCount} words from this vocabulary list: ${vocabList}\n\n`;
    
    prompt += `First, provide a short title for the story in both Indonesian and English in this format:\nTITLE:\nIndonesian: (Indonesian title here)\nEnglish: (English translation here)\n\n`;

    if (customPrompt) {
      prompt += `Story context: ${customPrompt}\n\n`;
    }

    prompt += `Guidelines:
- Write ${sentenceCount} paragraph(s)
- Level: ${difficulty}
- Use EXACTLY ${blankCount} words from the vocabulary list
- For each vocabulary word you use, put it in double brackets like this: [[word]]
- Make sure the story flows naturally and makes sense
- Do not include any section markers or metadata within the story itself
- Start the story immediately after the title\n`;

    return prompt;
  }

  private parseFillInStoryResponse(response: any, expectedBlankCount: number): FillInStoryResponse {
    if (!response.content || !Array.isArray(response.content) || response.content.length === 0) {
      throw new Error('Invalid API response format');
    }

    const content = response.content[0].text;
    console.log('Raw Claude response:', content);

    // Extract title
    const titleMatch = content.match(/TITLE:\s*Indonesian:\s*(.*?)\s*English:\s*(.*?)(?:\n|$)/s);
    if (!titleMatch) {
      throw new Error('Failed to parse title section');
    }

    const title = {
      indonesian: titleMatch[1].trim(),
      english: titleMatch[2].trim()
    };

    // Remove title section to get just the story - using a more precise pattern
    const storyContent = content
      .replace(/TITLE:[\s\S]*?English:.*?\n/s, '')  // Remove the TITLE block
      .trim()  // Remove leading/trailing whitespace
      .replace(/^\n+/, '');  // Remove any leading newlines

    // Extract all words in double brackets
    const bracketMatches = storyContent.match(/\[\[(.*?)\]\]/g) || [];
    const answers = bracketMatches.map((match: string) => match.slice(2, -2).trim());

    // Log word count difference but don't throw error
    if (answers.length !== expectedBlankCount) {
      console.log(`Note: Story generated with ${answers.length} words (${expectedBlankCount} were requested). Proceeding with generated story.`);
    }

    // Validate that all answers are non-empty and properly formatted
    const invalidAnswers = answers.filter((answer: string) => !answer.trim());
    if (invalidAnswers.length > 0) {
      console.error('Invalid answers found:', invalidAnswers);
      throw new Error('Invalid answers detected in response');
    }

    // Replace [[word]] with [BLANK] to maintain compatibility with existing UI
    const story = storyContent.replace(/\[\[(.*?)\]\]/g, '[BLANK]');

    return {
      story,
      answers,
      title
    };
  }

  async generateFillInStory(vocabulary: VocabItem[], config: FillInStoryConfig): Promise<FillInStoryResponse> {
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const prompt = this.buildFillInStoryPrompt(vocabulary, config);
        
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
            max_tokens: 500,
            messages: [{
              role: 'user',
              content: prompt
            }],
            system: "Generate educational Indonesian language content with fill-in-the-blank exercises. Use double brackets [[word]] for vocabulary words."
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(`API request failed: ${response.statusText}${errorData ? ` - ${JSON.stringify(errorData)}` : ''}`);
        }

        const data = await response.json();
        return this.parseFillInStoryResponse(data, config.blankCount);
      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error);
        lastError = error as Error;
        
        if (attempt < maxRetries) {
          console.log(`Retrying... (attempt ${attempt + 1}/${maxRetries})`);
          continue;
        }
        
        throw new Error(`Failed to generate story after ${maxRetries} attempts: ${lastError.message}`);
      }
    }

    throw new Error('Unexpected end of generation attempts');
  }
} 