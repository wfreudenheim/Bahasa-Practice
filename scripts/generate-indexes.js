const fs = require('fs');
const path = require('path');

function generateIndexForFolder(folderPath) {
  const entries = fs.readdirSync(folderPath, { withFileTypes: true });
  
  const structure = {
    files: [],
    folders: []
  };

  for (const entry of entries) {
    if (entry.name === 'index.json') continue;
    
    if (entry.isDirectory()) {
      structure.folders.push(entry.name);
      // Recursively generate index for subfolder
      generateIndexForFolder(path.join(folderPath, entry.name));
    } else if (entry.isFile() && entry.name.endsWith('.txt')) {
      structure.files.push({
        name: entry.name,
        size: fs.statSync(path.join(folderPath, entry.name)).size
      });
    }
  }

  // Write index.json
  fs.writeFileSync(
    path.join(folderPath, 'index.json'),
    JSON.stringify(structure, null, 2)
  );
}

// Start from the vocabulary directory in public
const vocabularyPath = path.join(process.cwd(), 'public', 'vocabulary');

// Create vocabulary directory if it doesn't exist
if (!fs.existsSync(vocabularyPath)) {
  fs.mkdirSync(vocabularyPath, { recursive: true });
}

// Generate root index.json
const rootStructure = {
  folders: fs.readdirSync(vocabularyPath, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
};

fs.writeFileSync(
  path.join(vocabularyPath, 'index.json'),
  JSON.stringify(rootStructure, null, 2)
);

// Generate indexes for all subfolders
rootStructure.folders.forEach(folder => {
  generateIndexForFolder(path.join(vocabularyPath, folder));
}); 