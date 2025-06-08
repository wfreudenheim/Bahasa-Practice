const fs = require('fs');
const path = require('path');

const vocabRoot = path.join(__dirname, '..', 'public', 'vocabulary');
const outputDir = path.join(__dirname, '..', 'src', 'data');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

function readVocabularyFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    return content
        .trim()
        .split('\n')
        .map(line => {
            const [indonesian, english] = line.trim().split('\t');
            return { indonesian, english };
        });
}

function scanDirectory(dirPath) {
    const relativePath = path.relative(vocabRoot, dirPath);
    const publicPath = '/vocabulary' + (relativePath ? '/' + relativePath : '');
    const name = path.basename(dirPath);

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    const files = entries
        .filter(entry => entry.isFile() && entry.name.endsWith('.txt'))
        .map(entry => {
            const filePath = path.join(dirPath, entry.name);
            const words = readVocabularyFile(filePath);
            return {
                name: entry.name,
                path: `${publicPath}/${entry.name}`,
                words,
                wordCount: words.length,
                loaded: true
            };
        });

    const subfolders = entries
        .filter(entry => entry.isDirectory() && !entry.name.startsWith('.'))
        .map(entry => scanDirectory(path.join(dirPath, entry.name)));

    return {
        name,
        path: publicPath,
        files,
        subfolders,
        totalFiles: files.length + subfolders.reduce((sum, folder) => sum + folder.totalFiles, 0)
    };
}

// Generate the vocabulary data
const structure = {
    folders: [scanDirectory(vocabRoot)],
    totalFiles: 0,
    lastLoaded: new Date().toISOString()
};

// Update total files count
structure.totalFiles = structure.folders.reduce((sum, folder) => sum + folder.totalFiles, 0);

// Write the vocabulary data file
fs.writeFileSync(
    path.join(outputDir, 'vocabulary.json'),
    JSON.stringify(structure, null, 2)
);

console.log('Generated vocabulary data file successfully!'); 