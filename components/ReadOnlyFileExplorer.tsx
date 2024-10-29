// components/ReadOnlyFileExplorer.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  path: string;
}

const ReadOnlyFileExplorer: React.FC = () => {
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchFileTree = async () => {
      try {
        const response = await axios.get('/api/outputFiles');
        setFileTree(response.data);
      } catch (error) {
        console.error('Error fetching file tree:', error);
      }
    };

    fetchFileTree();
  }, []);

  const handleFileClick = async (filePath: string) => {
    try {
      const response = await axios.get('/api/outputFiles', { params: { path: filePath } });
      setFileContent(response.data.content);
    } catch (error) {
      console.error('Error fetching file content:', error);
    }
  };

  const handleFolderClick = (folderPath: string) => {
    setExpandedFolders(prevState => {
      const newExpandedFolders = new Set(prevState);
      if (newExpandedFolders.has(folderPath)) {
        newExpandedFolders.delete(folderPath);
      } else {
        newExpandedFolders.add(folderPath);
      }
      return newExpandedFolders;
    });
  };

  const renderFileTree = (nodes: FileNode[]) => {
    return nodes.map(node => (
      <div key={node.id} style={{ marginLeft: node.type === 'folder' ? 20 : 40 }}>
        {node.type === 'folder' ? (
          <div>
            <div onClick={() => handleFolderClick(node.path)} style={{ cursor: 'pointer', fontWeight: 'bold' }}>
              {expandedFolders.has(node.path) ? '▼' : '▶'} {node.name}
            </div>
            {expandedFolders.has(node.path) && node.children && renderFileTree(node.children)}
          </div>
        ) : (
          <div onClick={() => handleFileClick(node.path)} style={{ cursor: 'pointer' }}>
            {node.name}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div>
      <h1>Output File Explorer</h1>
      <div>{renderFileTree(fileTree)}</div>
      {fileContent && (
        <div>
          <h2>File Content</h2>
          <pre>{fileContent}</pre>
        </div>
      )}
    </div>
  );
};

export default ReadOnlyFileExplorer;