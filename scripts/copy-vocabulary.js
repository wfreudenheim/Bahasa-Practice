const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '..', 'vocabulary');
const targetDir = path.join(__dirname, '..', 'public', 'vocabulary');

// Create target directory if it doesn't exist
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

// Function to copy directory recursively
function copyDir(src, dest) {
    // Create destination directory
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    // Read source directory
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// Copy vocabulary directory to public folder
copyDir(sourceDir, targetDir);

console.log('Vocabulary files copied to public folder successfully!'); 