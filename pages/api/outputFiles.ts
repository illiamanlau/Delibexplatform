import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs';
import { buildFileTree } from '../../utils/files';

const outputDir = path.join(process.cwd(), 'output');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { path: filePath } = req.query;
    
    try {
      if (filePath) {
        const fullPath = path.join(outputDir, filePath as string);
        const content = fs.readFileSync(fullPath, 'utf-8');
        return res.status(200).json({ content });
      }

      const fileTree = buildFileTree(outputDir);
      res.status(200).json(fileTree);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Operation failed' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}