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

  const handleDownloadClick = async () => {
    try {
      const response = await axios.get('/api/outputFiles', { params: { download: 'true' }, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'output.zip');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading zip file:', error);
    }
  };

  const renderFileTree = (nodes: FileNode[]) => {
    return nodes.map(node => (
      <div key={node.id} style={{ marginLeft: node.type === 'folder' ? 20 : 40 }}>
        {node.type === 'folder' ? (
          <div>
            <div
              onClick={() => handleFolderClick(node.path)}
              style={{ cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}
            >
              {expandedFolders.has(node.path) ? '▼' : '▶'} {node.name}
            </div>
            {expandedFolders.has(node.path) && node.children && renderFileTree(node.children)}
          </div>
        ) : (
          <div
            onClick={() => handleFileClick(node.path)}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            {node.name}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="file-explorer">
      <h1 className="text-xl font-bold mb-4">Output File Explorer</h1>
      <button onClick={handleDownloadClick} className="mb-4 p-2 bg-blue-500 text-white rounded">Download All Files</button>
      <div className="file-tree">{renderFileTree(fileTree)}</div>
      {fileContent && (
        <div className="file-content mt-4">
          <h2 className="text-lg font-bold">File Content</h2>
          <pre className="p-2 border rounded">{fileContent}</pre>
        </div>
      )}
    </div>
  );
};

export default ReadOnlyFileExplorer;