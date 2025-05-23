# Sample Data and Prompt Templates

## Sample Vocabulary Files

### Basic Vocabulary (basic_words.txt)
```
laut	sea
panas	hot
pasir	sand
ikan	fish
matahari	sun
angin	wind
ombak	wave
pantai	beach
air	water
biru	blue
```

### Food Vocabulary (makanan.txt)
```
nasi	rice
ayam	chicken
ikan	fish
sayur	vegetables
buah	fruit
air	water
minum	drink
makan	eat
manis	sweet
pedas	spicy
enak	delicious
lapar	hungry
```

### Family Vocabulary (keluarga.txt)
```
keluarga	family
ayah	father
ibu	mother
anak	child
kakak	older sibling
adik	younger sibling
nenek	grandmother
kakek	grandfather
paman	uncle
bibi	aunt
sepupu	cousin
```

### Animals Vocabulary (hewan.txt)
```
kucing	cat
anjing	dog
burung	bird
gajah	elephant
harimau	tiger
singa	lion
monyet	monkey
ular	snake
ikan	fish
kuda	horse
sapi	cow
kambing	goat
```

## Claude API Prompt Templates

### Story Generation Prompts

#### Basic Story Generation
```
Generate a short story in Bahasa Indonesia suitable for {difficulty} learners. The story should be {sentence_count} sentences long and naturally incorporate these vocabulary words: {vocabulary_list}.

Requirements:
- Use simple, clear grammar appropriate for {difficulty} level
- Make the story interesting and coherent
- Include all vocabulary words naturally in context
- Avoid complex grammatical structures if difficulty is 'beginner'

Return only the story text without additional commentary.

Vocabulary to include: {word_list}
Difficulty level: {difficulty}
```

#### Contextual Story Generation
```
Create a story in Bahasa Indonesia about {context} for {difficulty} level learners. 

Story requirements:
- {sentence_count} sentences long
- Incorporate these vocabulary words naturally: {vocabulary_list}
- Make it engaging and educational
- Use appropriate grammar for {difficulty} level

Context: {context} (e.g., "a day at the beach", "cooking dinner", "visiting the zoo")
Vocabulary: {word_list}

Return only the story text.
```

### Fill-in-the-Blanks Generation
```
Create a fill-in-the-blanks exercise in Bahasa Indonesia for {difficulty} learners.

Instructions:
1. Write a coherent story of {sentence_count} sentences
2. Replace exactly {blank_count} words with [BLANK] markers
3. Choose blanks from this vocabulary list: {vocabulary_list}
4. Ensure the story makes sense even with blanks
5. Use appropriate grammar for {difficulty} level

Format your response exactly like this:
STORY: [Your story with [BLANK] markers where words should go]
ANSWERS: [comma-separated list of the words that fill the blanks, in order]

Example format:
STORY: Hari ini saya pergi ke [BLANK]. Di sana saya melihat [BLANK] yang besar.
ANSWERS: pantai, ombak

Vocabulary to use: {word_list}
Number of blanks needed: {blank_count}
```

### Reading Comprehension Generation
```
Create a reading comprehension exercise in Bahasa Indonesia for {difficulty} learners.

Requirements:
1. Write an engaging story of {sentence_count} sentences incorporating these vocabulary words: {vocabulary_list}
2. Create {question_count} multiple-choice questions about the story
3. Include different question types: vocabulary meaning, plot comprehension, inference
4. Each question should have 4 answer choices with only one correct answer
5. Use appropriate language complexity for {difficulty} level

Format your response exactly like this:
STORY: [Your complete story here]

QUESTIONS:
Q1: [Question text]
A) [Option A]
B) [Option B] 
C) [Option C]
D) [Option D]
CORRECT: [A, B, C, or D]

Q2: [Question text]
A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]
CORRECT: [A, B, C, or D]

[Continue for all questions]

Vocabulary to include: {word_list}
Difficulty: {difficulty}
```

### Vocabulary Set Generation
```
Generate a vocabulary list in Bahasa Indonesia on the theme of "{theme}" suitable for {difficulty} level learners.

Requirements:
- Create exactly {word_count} vocabulary pairs
- Include common, useful words related to {theme}
- Appropriate difficulty for {difficulty} learners
- Mix of nouns, verbs, and adjectives where relevant
- Avoid overly complex or rare words

Format each entry as: indonesian_word	english_translation

Example format:
kucing	cat
makan	eat
besar	big

Theme: {theme}
Word count: {word_count}
Difficulty: {difficulty}

Return only the vocabulary pairs, one per line, tab-separated.
```

## Configuration Templates

### Game Difficulty Settings
```typescript
export const difficultyConfigs = {
  beginner: {
    sentenceCount: 3,
    maxWordsPerSentence: 8,
    vocabularyPercentage: 0.7, // Use 70% of selected vocab
    timeMultiplier: 1.5, // Extra time for beginners
    questionTypes: ['vocabulary', 'basic_comprehension']
  },
  intermediate: {
    sentenceCount: 5,
    maxWordsPerSentence: 12,
    vocabularyPercentage: 0.8,
    timeMultiplier: 1.0,
    questionTypes: ['vocabulary', 'comprehension', 'simple_inference']
  },
  advanced: {
    sentenceCount: 7,
    maxWordsPerSentence: 15,
    vocabularyPercentage: 0.9,
    timeMultiplier: 0.8, // Less time for challenge
    questionTypes: ['vocabulary', 'comprehension', 'inference', 'analysis']
  }
};
```

### Story Context Suggestions
```typescript
export const storyContexts = {
  beach: "a day at the beach with family",
  food: "preparing and eating a meal",
  family: "spending time with family members",
  animals: "visiting a zoo or farm",
  school: "a typical day at school",
  shopping: "going to the market or store",
  travel: "taking a trip or journey",
  home: "daily activities at home",
  nature: "exploring the outdoors",
  sports: "playing games and sports"
};
```

## API Response Parsing Utilities

### Fill-in-the-Blanks Parser
```typescript
interface ParsedFillInBlanks {
  story: string;
  answers: string[];
  blanks: { position: number; answer: string }[];
}

export function parseFillInBlanksResponse(response: string): ParsedFillInBlanks {
  const lines = response.split('\n');
  let story = '';
  let answers: string[] = [];
  
  for (const line of lines) {
    if (line.startsWith('STORY:')) {
      story = line.substring(6).trim();
    } else if (line.startsWith('ANSWERS:')) {
      answers = line.substring(8).trim().split(',').map(a => a.trim());
    }
  }
  
  // Find blank positions
  const blanks: { position: number; answer: string }[] = [];
  let answerIndex = 0;
  let searchStart = 0;
  
  while (true) {
    const blankPos = story.indexOf('[BLANK]', searchStart);
    if (blankPos === -1) break;
    
    blanks.push({
      position: blankPos,
      answer: answers[answerIndex] || ''
    });
    
    answerIndex++;
    searchStart = blankPos + 7; // '[BLANK]' length
  }
  
  return { story, answers, blanks };
}
```

### Reading Comprehension Parser
```typescript
interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface ParsedComprehension {
  story: string;
  questions: Question[];
}

export function parseComprehensionResponse(response: string): ParsedComprehension {
  const sections = response.split('STORY:');
  if (sections.length < 2) throw new Error('Invalid response format');
  
  const storySection = sections[1].split('QUESTIONS:');
  const story = storySection[0].trim();
  
  if (storySection.length < 2) throw new Error('No questions found');
  
  const questionsText = storySection[1];
  const questions = parseQuestions(questionsText);
  
  return { story, questions };
}

function parseQuestions(questionsText: string): Question[] {
  const questions: Question[] = [];
  const lines = questionsText.split('\n').filter(line => line.trim());
  
  let currentQuestion: Partial<Question> = {};
  
  for (const line of lines) {
    if (line.match(/^Q\d+:/)) {
      if (currentQuestion.question) {
        questions.push(currentQuestion as Question);
        currentQuestion = {};
      }
      currentQuestion.question = line.substring(line.indexOf(':') + 1).trim();
      currentQuestion.options = [];
    } else if (line.match(/^[A-D]\)/)) {
      const option = line.substring(2).trim();
      currentQuestion.options = currentQuestion.options || [];
      currentQuestion.options.push(option);
    } else if (line.startsWith('CORRECT:')) {
      currentQuestion.correctAnswer = line.substring(8).trim();
    }
  }
  
  if (currentQuestion.question) {
    questions.push(currentQuestion as Question);
  }
  
  return questions;
}
```

## Error Handling Templates

### API Error Messages
```typescript
export const apiErrorMessages = {
  invalidApiKey: "Invalid API key. Please check your Claude API key in settings.",
  rateLimitExceeded: "Too many requests. Please wait a moment and try again.",
  networkError: "Connection error. Please check your internet connection.",
  invalidResponse: "Received invalid response from AI. Please try again.",
  quotaExceeded: "API quota exceeded. Please check your Claude account.",
  serverError: "Server error occurred. Please try again later.",
  unknownError: "An unexpected error occurred. Please try again."
};

export function getErrorMessage(error: any): string {
  if (error.status === 401) return apiErrorMessages.invalidApiKey;
  if (error.status === 429) return apiErrorMessages.rateLimitExceeded;
  if (error.status >= 500) return apiErrorMessages.serverError;
  if (!navigator.onLine) return apiErrorMessages.networkError;
  
  return apiErrorMessages.unknownError;
}
```

### Validation Functions
```typescript
export function validateVocabularyFile(content: string): string[] {
  const errors: string[] = [];
  const lines = content.split('\n').filter(line => line.trim());
  
  if (lines.length === 0) {
    errors.push("File appears to be empty");
    return errors;
  }
  
  lines.forEach((line, index) => {
    const parts = line.split('\t');
    if (parts.length !== 2) {
      errors.push(`Line ${index + 1}: Expected Indonesian word [TAB] English word`);
    } else {
      if (!parts[0].trim()) {
        errors.push(`Line ${index + 1}: Missing Indonesian word`);
      }
      if (!parts[1].trim()) {
        errors.push(`Line ${index + 1}: Missing English word`);
      }
    }
  });
  
  return errors;
}

export function validateApiResponse(response: string, expectedFormat: string): boolean {
  switch (expectedFormat) {
    case 'story':
      return response.length > 10 && !response.includes('ERROR');
    case 'fill-in-blanks':
      return response.includes('STORY:') && response.includes('ANSWERS:');
    case 'comprehension':
      return response.includes('STORY:') && response.includes('QUESTIONS:');
    default:
      return true;
  }
}
```

## Testing Data Sets

### Small Test Set (5 words)
```
laut	sea
panas	hot
ikan	fish
biru	blue
air	water
```

### Medium Test Set (15 words)
```
laut	sea
panas	hot
pasir	sand
ikan	fish
matahari	sun
angin	wind
ombak	wave
pantai	beach
air	water
biru	blue
besar	big
kecil	small
indah	beautiful
senang	happy
pergi	go
```

### Large Test Set (50+ words)
Use combination of all the vocabulary files above for comprehensive testing.

## Cursor Testing Prompts

### Component Testing Prompt
```
Add comprehensive testing for the [COMPONENT_NAME] component:

1. Unit Tests:
   - Test component renders correctly with valid props
   - Test user interactions (clicks, input changes)
   - Test error states and edge cases
   - Test accessibility features

2. Integration Tests:
   - Test component with different vocabulary sets
   - Test API integration if applicable
   - Test state management integration

3. Test Data:
   Use these sample vocabulary items for testing:
   [Include relevant sample data]

4. Test Coverage:
   - All major user paths
   - Error conditions
   - Loading states
   - Empty states

Follow React Testing Library best practices and ensure tests are maintainable.
```

This comprehensive set of templates and sample data should provide everything needed to build and test the vocabulary practice application systematically.