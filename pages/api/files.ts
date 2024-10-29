import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs';
import { buildFileTree, handleFileOperation } from '../../utils/files';

const assetsDir = path.join(process.cwd(), 'assets');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { path: filePath } = req.query;
    
    try {
      if (filePath) {
        const fullPath = path.join(assetsDir, filePath as string);
        const content = fs.readFileSync(fullPath, 'utf-8');
        return res.status(200).json({ content });
      }

      if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir);
      }
      
      const fileTree = buildFileTree(assetsDir);
      res.status(200).json(fileTree);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Operation failed' });
    }
  } else if (req.method === 'POST') {
    const { operation, path: filePath, name, content } = req.body;
    const fullPath = path.join(assetsDir, filePath || '');

    try {
      handleFileOperation(operation, fullPath, name, content);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error performing operation:', error);
      res.status(500).json({ error: 'Error performing operation' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}