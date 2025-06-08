import { NextApiRequest, NextApiResponse } from 'next';
import { VocabularyFolder, VocabularyFile } from '../../../types/vocabulary';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { path: urlPath } = req.query;
    const basePath = path.join(process.cwd(), 'public', 'vocabulary');
    
    try {
        const folderPath = urlPath 
            ? path.join(basePath, ...(Array.isArray(urlPath) ? urlPath : [urlPath]))
            : basePath;

        const folder = await scanFolder(folderPath);
        res.status(200).json(folder);
    } catch (error) {
        console.error('Error processing vocabulary request:', error);
        res.status(500).json({ error: 'Failed to process vocabulary request' });
    }
}

async function scanFolder(folderPath: string): Promise<VocabularyFolder> {
    const files: VocabularyFile[] = [];
    const subfolders: VocabularyFolder[] = [];
    const folderName = path.basename(folderPath);

    const entries = await fs.promises.readdir(folderPath, { withFileTypes: true });

    // Process files
    for (const entry of entries) {
        const entryPath = path.join(folderPath, entry.name);
        
        if (entry.isDirectory()) {
            const subfolder = await scanFolder(entryPath);
            subfolders.push(subfolder);
        } else if (entry.isFile() && entry.name.endsWith('.txt')) {
            const content = await fs.promises.readFile(entryPath, 'utf-8');
            const words = content
                .split('\n')
                .filter(line => line.trim())
                .map(line => {
                    const [indonesian, english] = line.split('\t').map(s => s.trim());
                    return { indonesian, english };
                });

            files.push({
                name: entry.name,
                path: entryPath,
                words,
                loaded: true,
                wordCount: words.length
            });
        }
    }

    // Calculate total files including subfolders
    const totalFiles = files.length + subfolders.reduce((sum, folder) => {
        return sum + (folder.totalFiles || 0);
    }, 0);

    return {
        name: folderName,
        path: folderPath,
        files,
        subfolders,
        totalFiles
    };
} 