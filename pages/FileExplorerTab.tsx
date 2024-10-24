import React, { useState, useEffect } from 'react';
import { Folder, File, ChevronRight, ChevronDown, Plus, Trash, Edit2, Copy, FileText } from 'lucide-react';

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  path: string;
}

const FileExplorer = () => {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingFile, setEditingFile] = useState<{ path: string; content: string } | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/files');
      if (!response.ok) throw new Error('Failed to fetch files');
      const data = await response.json();
      setFiles(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching files');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // Handle Ctrl+S for saving
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's' && editingFile) {
        e.preventDefault();
        handleSaveFile();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingFile]);

  // Prompt user before leaving if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (unsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [unsavedChanges]);

  const handleOpenFile = async (path: string) => {
    try {
      const response = await fetch(`/api/files?action=read&path=${encodeURIComponent(path)}`);
      if (!response.ok) throw new Error('Failed to read file');
      const { content } = await response.json();
      setEditingFile({ path, content });
      setUnsavedChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error reading file');
    }
  };

  const handleSaveFile = async () => {
    if (!editingFile) return;
  
    try {
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: 'writeFile', // Correct operation name
          path: editingFile.path,
          content: editingFile.content
        })
      });
  
      if (!response.ok) throw new Error('Failed to save file');
      setUnsavedChanges(false);
      await fetchFiles(); // Refresh the file list after saving
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving file');
    }
  };

  const handleNewFile = async (parentPath: string = '') => {
    const fileName = prompt('Enter file name:');
    if (!fileName) return;

    try {
      const fullPath = parentPath ? `${parentPath}/${fileName}` : fileName;
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: 'save',
          path: fullPath,
          content: '' // Create an empty file
        })
      });

      if (!response.ok) throw new Error('Failed to create file');
      await fetchFiles();
      // Open the new file automatically
      handleOpenFile(fullPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating file');
    }
  };

  const handleNewFolder = async (parentPath: string = '') => {
    const folderName = prompt('Enter folder name:');
    if (!folderName) return;

    try {
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: 'createFolder',
          path: parentPath,
          name: folderName,
          type: 'folder'
        })
      });

      if (!response.ok) throw new Error('Failed to create folder');
      await fetchFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating folder');
    }
  };

  const handleDelete = async (path: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: 'delete',
          path
        })
      });

      if (!response.ok) throw new Error('Failed to delete item');
      if (editingFile?.path === path) {
        setEditingFile(null);
      }
      await fetchFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting item');
    }
  };

  const handleRename = async (path: string, oldName: string) => {
    const newName = prompt('Enter new name:', oldName);
    if (!newName || newName === oldName) return;

    try {
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: 'rename',
          path,
          name: newName
        })
      });

      if (!response.ok) throw new Error('Failed to rename item');
      if (editingFile?.path === path) {
        setEditingFile(null);
      }
      await fetchFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error renaming item');
    }
  };

  const handleCopy = async (path: string, name: string) => {
    const newName = prompt(`Enter new name for copy of ${name}:`);
    if (!newName) return;

    try {
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: 'copy',
          path,
          name: newName
        })
      });

      if (!response.ok) throw new Error('Failed to copy item');
      await fetchFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error copying item');
    }
  };

  const toggleFolder = (id: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedFolders(newExpanded);
  };

  const renderFileTree = (nodes: FileNode[], level = 0) => {
    return nodes.map(node => (
      <div key={node.id} className="select-none">
        <div
          className={`flex items-center p-1 hover:bg-gray-100 ${
            selectedItem === node.id ? 'bg-blue-100' : ''
          }`}
          style={{ paddingLeft: `${level * 20}px` }}
          onClick={() => {
            setSelectedItem(node.id);
            if (node.type === 'file') {
              handleOpenFile(node.path);
            }
          }}
        >
          {node.type === 'folder' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFolder(node.id);
              }}
              className="p-1"
            >
              {expandedFolders.has(node.id) ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}
          {node.type === 'folder' ? (
            <Folder className="w-4 h-4 text-blue-500 mr-2" />
          ) : (
            <File className="w-4 h-4 text-gray-500 mr-2" />
          )}
          <span>{node.name}</span>
          {selectedItem === node.id && (
            <div className="ml-auto flex gap-2">
              {node.type === 'folder' && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNewFolder(node.path);
                    }}
                    className="p-1 hover:bg-gray-200 rounded"
                    title="New Folder"
                  >
                    <Folder className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNewFile(node.path);
                    }}
                    className="p-1 hover:bg-gray-200 rounded"
                    title="New File"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                </>
              )}
              <button
                className="p-1 hover:bg-gray-200 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(node.path, node.name);
                }}
                title="Copy"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                className="p-1 hover:bg-gray-200 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(node.path);
                }}
                title="Delete"
              >
                <Trash className="w-4 h-4" />
              </button>
              <button
                className="p-1 hover:bg-gray-200 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRename(node.path, node.name);
                }}
                title="Rename"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        {node.type === 'folder' &&
          expandedFolders.has(node.id) &&
          node.children &&
          renderFileTree(node.children, level + 1)}
      </div>
    ));
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="flex h-screen">
      <div className="w-80 border-r overflow-auto">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">File Explorer</h2>
            <div className="flex gap-2">
              <button
                onClick={() => handleNewFile()}
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                title="New File"
              >
                <FileText className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleNewFolder()}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                title="New Folder"
              >
                <Folder className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="border rounded">
            {renderFileTree(files)}
          </div>
        </div>
      </div>
      
      {editingFile && (
        <div className="flex-1 flex flex-col p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">{editingFile.path}</h2>
            <button
              onClick={handleSaveFile}
              className={`px-4 py-2 rounded ${
                unsavedChanges 
                  ? 'bg-blue-500 text-white hover:bg-blue-600' 
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              Save
            </button>
          </div>
          <textarea
            className="flex-1 p-4 border rounded font-mono"
            value={editingFile.content}
            onChange={(e) => {
              setEditingFile({ ...editingFile, content: e.target.value });
              setUnsavedChanges(true);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default FileExplorer;