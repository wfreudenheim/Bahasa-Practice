const fs = require('fs');
const path = require('path');

const VOCAB_DIRS = ['week01', 'week02', 'themes', 'advanced'];
const sourceDir = path.join(__dirname, '..', 'public', 'vocabulary');

// Create vocabulary directory if it doesn't exist
if (!fs.existsSync(sourceDir)) {
    fs.mkdirSync(sourceDir, { recursive: true });
}

// Process each vocabulary directory
VOCAB_DIRS.forEach(dirName => {
    const dirPath = path.join(sourceDir, dirName);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    // Get all .txt files in the directory
    const files = fs.readdirSync(dirPath)
        .filter(file => file.endsWith('.txt'));

    // Write index.json
    fs.writeFileSync(
        path.join(dirPath, 'index.json'),
        JSON.stringify(files, null, 2)
    );

    console.log(`Generated index.json for ${dirName} with ${files.length} files`);
}); 