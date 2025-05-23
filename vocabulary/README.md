# Vocabulary File Format and Organization

## File Structure
- Each vocabulary file should be a `.txt` file
- One vocabulary pair per line
- Format: `indonesian_word english_translation` (tab-separated)
- Use UTF-8 encoding
- No blank lines
- No comments

## Folder Organization
- `week01/`: Beginner vocabulary for first week
- `week02/`: Intermediate vocabulary for second week
- `themes/`: Thematic vocabulary sets (beach, animals, etc.)
- `advanced/`: Advanced vocabulary for experienced learners

## Adding New Files
1. Create a `.txt` file in the appropriate folder
2. Follow the tab-separated format
3. Commit and push changes
4. Files will be automatically available in the app

## Example Format
```
halo	hello
selamat pagi	good morning
terima kasih	thank you
```

## Validation Rules
1. Each line must have exactly one tab character separating Indonesian and English
2. No empty lines allowed
3. No special characters except standard Indonesian diacritics
4. File must use UTF-8 encoding
5. File must end with a newline

## Best Practices
1. Group related vocabulary in the same file
2. Keep files to a reasonable size (50-200 words recommended)
3. Use clear, descriptive filenames
4. Include common variations where applicable
5. Order words by theme or difficulty within each file 