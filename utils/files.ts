import fs from 'fs';
import path from 'path';

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  path: string;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const buildFileTree = (basePath: string, relativePath: string = ''): FileNode[] => {
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

export const handleFileOperation = (operation: string, fullPath: string, name?: string, content?: string) => {
  switch (operation) {
    case 'createFolder':
      const newFolderPath = path.join(fullPath, name!);
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
      const newPath = path.join(path.dirname(fullPath), name!);
      fs.renameSync(fullPath, newPath);
      break;

    case 'writeFile':
      fs.writeFileSync(fullPath, content!);
      break;
      
    default:
      throw new Error('Invalid operation');
  }
};