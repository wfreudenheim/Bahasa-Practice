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
  private static readonly API_KEY = process.env.NEXT_PUBLIC_CLAUDE_API_KEY;
  private baseUrl = 'https://api.anthropic.com/v1/messages';
  private cache = new Map<string, GeneratedContent>();

  constructor() {
    if (!ClaudeService.API_KEY) {
      throw new Error('Claude API key not found in environment variables');
    }
  }

  private calculateMaxTokens(paragraphs: number): number {
    // Ensure enough tokens for both languages and formatting
    return Math.min(400 + (paragraphs * 200), 1000);
  }

  private getCacheKey(vocabulary: VocabItem[], config: ClaudeConfig): string {
    const vocabKey = vocabulary.map(v => v.indonesian).sort().join(',');
    return `${vocabKey}-${config.paragraphs}-${config.difficulty}-${config.customPrompt || ''}`;
  }

  private buildPrompt(vocabulary: VocabItem[], config: ClaudeConfig): string {
    const vocabList = vocabulary.map(v => v.indonesian).join(', ');
    const level = { easy: 'basic', medium: 'intermediate', hard: 'advanced' }[config.difficulty];

    return `Create ${config.paragraphs} ${level} paragraphs using: ${vocabList}${config.customPrompt ? '\nContext: ' + config.customPrompt : ''}\n\nFormat the output with proper dialogue spacing - each new speaker should start on a new line. Add blank lines between paragraphs.\n\n[INDONESIAN]\n[ENGLISH]\n[USED_VOCABULARY]`;
  }

  async generateStory(vocabulary: VocabItem[], config: ClaudeConfig): Promise<GeneratedContent> {
    const cacheKey = this.getCacheKey(vocabulary, config);
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    if (!ClaudeService.API_KEY) {
      throw new Error('Claude API key not found');
    }

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ClaudeService.API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      } as const,
      body: JSON.stringify({
        model: 'claude-3-7-sonnet-20250219',
        max_tokens: this.calculateMaxTokens(config.paragraphs),
        messages: [{
          role: 'user',
          content: this.buildPrompt(vocabulary, config)
        }],
        system: "Generate Indonesian educational content."
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(`API request failed: ${response.statusText}${errorData ? ` - ${JSON.stringify(errorData)}` : ''}`);
    }

    const data = await response.json();
    const result = this.parseResponse(data);
    
    // Cache the result
    this.cache.set(cacheKey, result);
    
    return result;
  }

  private parseResponse(response: any): GeneratedContent {
    if (!response.content || !Array.isArray(response.content) || response.content.length === 0) {
      throw new Error('Invalid API response format');
    }

    const content = response.content[0].text;
    console.log('Raw Claude response:', content);

    // Split into sections more reliably
    const sections = content.split(/\[([^\]]+)\]/g).filter(Boolean);
    
    // Initialize with empty values
    let indonesian = '';
    let english = '';
    let usedVocabulary: string[] = [];
    
    // Process each section
    for (let i = 0; i < sections.length; i++) {
      const currentSection = sections[i].trim();
      const nextSection = sections[i + 1]?.trim() || '';
      
      switch (currentSection.toUpperCase()) {
        case 'INDONESIAN':
          indonesian = nextSection
            .split('\n')
            .map((line: string) => line.trim())
            .filter((line: string) => line.length > 0)
            .join('\n');
          break;
          
        case 'ENGLISH':
          english = nextSection
            .split('\n')
            .map((line: string) => line.trim())
            .filter((line: string) => line.length > 0)
            .join('\n');
          break;
          
        case 'USED_VOCABULARY':
          // Extract vocabulary words more reliably
          usedVocabulary = nextSection
            .split(/[,\n]/) // Split by comma or newline
            .map((word: string) => word.trim())
            .filter((word: string) => word.length > 0);
          
          // If no vocabulary was explicitly listed, extract from Indonesian text
          if (usedVocabulary.length === 0 && indonesian) {
            usedVocabulary = indonesian
              .split(/[\s,.!?()"\n]+/) // Split by various delimiters
              .map((word: string) => word.trim())
              .filter((word: string) => word.length > 0);
          }
          break;
      }
    }

    // Validate the parsed content
    if (!indonesian || !english) {
      console.error('Parsed sections:', { indonesian, english, usedVocabulary });
      throw new Error('Failed to parse Indonesian or English sections from response');
    }

    // Ensure we have some vocabulary
    if (usedVocabulary.length === 0) {
      usedVocabulary = indonesian
        .split(/[\s,.!?()"\n]+/)
        .map((word: string) => word.trim())
        .filter((word: string) => word.length > 0);
    }

    return {
      indonesian,
      english,
      usedVocabulary
    };
  }
} 