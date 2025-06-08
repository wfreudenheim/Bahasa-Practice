const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());

function scanDirectory(dirPath) {
    const relativePath = path.relative(path.join(__dirname, 'vocabulary'), dirPath);
    const publicPath = '/vocabulary' + (relativePath ? '/' + relativePath : '');
    const name = path.basename(dirPath);

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    const files = entries
        .filter(entry => entry.isFile() && entry.name.endsWith('.txt'))
        .map(entry => ({
            name: entry.name,
            path: `${publicPath}/${entry.name}`,
            words: [],
            wordCount: 0,
            loaded: false
        }));

    const subfolders = entries
        .filter(entry => entry.isDirectory() && !entry.name.startsWith('.'))
        .map(entry => scanDirectory(path.join(dirPath, entry.name)));

    return {
        name,
        path: publicPath,
        files,
        subfolders,
        totalFiles: files.length + subfolders.reduce((sum, folder) => sum + (folder.totalFiles || 0), 0)
    };
}

// API endpoint to get vocabulary structure
app.get('/api/vocabulary', (req, res) => {
    try {
        const vocabRoot = path.join(__dirname, 'vocabulary');
        const structure = scanDirectory(vocabRoot);
        res.json(structure);
    } catch (error) {
        console.error('Error scanning vocabulary directory:', error);
        res.status(500).json({ error: 'Failed to scan vocabulary directory' });
    }
});

// API endpoint to get vocabulary file content
app.get('/api/vocabulary/*', (req, res) => {
    try {
        const filePath = path.join(__dirname, 'vocabulary', req.params[0]);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found' });
        }

        const content = fs.readFileSync(filePath, 'utf-8');
        res.type('text/plain').send(content);
    } catch (error) {
        console.error('Error reading vocabulary file:', error);
        res.status(500).json({ error: 'Failed to read vocabulary file' });
    }
});

app.listen(port, () => {
    console.log(`Vocabulary server running on port ${port}`);
}); 