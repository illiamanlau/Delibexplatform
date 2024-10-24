// pages/api/files.ts
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  path: string;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const buildFileTree = (basePath: string, relativePath: string = ''): FileNode[] => {
  const fullPath = path.join(basePath, relativePath);
  const items = fs.readdirSync(fullPath);
  
  return items.map(item => {
    const itemPath = path.join(relativePath, item);
    const fullItemPath = path.join(basePath, itemPath);
    const stats = fs.statSync(fullItemPath);
    
    if (stats.isDirectory()) {
      return {
        id: generateId(),
        name: item,
        type: 'folder',
        children: buildFileTree(basePath, itemPath),
        path: itemPath
      };
    }
    
    return {
      id: generateId(),
      name: item,
      type: 'file',
      path: itemPath
    };
  });
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { path: filePath } = req.query;
    
    try {
      if (filePath) {
        // Read file content
        const fullPath = path.join(process.cwd(), 'assets', filePath as string);
        const content = fs.readFileSync(fullPath, 'utf-8');
        return res.status(200).json({ content });
      }

      const assetsDir = path.join(process.cwd(), 'assets');
      
      // Create assets directory if it doesn't exist
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
    const { operation, path: filePath, name, type, content } = req.body;
    const fullPath = path.join(process.cwd(), 'assets', filePath || '');

    try {
      switch (operation) {
        case 'createFolder':
          const newFolderPath = path.join(fullPath, name);
          fs.mkdirSync(newFolderPath);
          break;
          
        case 'delete':
          if (fs.statSync(fullPath).isDirectory()) {
            fs.rmdirSync(fullPath, { recursive: true });
          } else {
            fs.unlinkSync(fullPath);
          }
          break;
          
        case 'rename':
          const newPath = path.join(path.dirname(fullPath), name);
          fs.renameSync(fullPath, newPath);
          break;

        case 'writeFile':
          fs.writeFileSync(fullPath, content);
          break;
          
        default:
          return res.status(400).json({ error: 'Invalid operation' });
      }
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error performing operation:', error);
      res.status(500).json({ error: 'Error performing operation' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}