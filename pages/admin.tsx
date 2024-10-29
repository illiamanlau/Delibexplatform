import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import LLMBotTab from './LLMBotTab';
import HaterbotTab from './HaterbotTab';
import FileExplorerTab from './FileExplorerTab';
import DocumentationTab from './DocumentationTab';
import MessagesTab from './MessagesTab';
import ReadOnlyFileExplorer from '../components/ReadOnlyFileExplorer'; // Import the ReadOnlyFileExplorer component
import { useTabState } from '../context/TabStateContext';

// AdminPage component for managing the admin panel and authentication
const AdminPage: React.FC = () => {
  // State to track authentication status and store the password input
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [inputPassword, setInputPassword] = useState('');

  // State to track the active tab
  const [activeTab, setActiveTab] = useState('LLM bot');

  const { state, setState } = useTabState();

  // Function to handle login form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/login', { password: inputPassword });
      if (response.data.authenticated) {
        setAuthenticated(true);
      } else {
        alert('Incorrect password');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during login');
    }
  };

  useEffect(() => {
    setState((prevState) => ({ ...prevState, activeTab }));
  }, [activeTab, setState]);

  if (!authenticated) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="password"
            value={inputPassword}
            onChange={(e) => setInputPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full p-2 border rounded"
          />
          <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      <div className="tabs flex space-x-4 mb-4">
        <button
          onClick={() => setActiveTab('LLM bot')}
          className={`p-2 rounded ${activeTab === 'LLM bot' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          LLM Bot
        </button>
        <button
          onClick={() => setActiveTab('Haterbot')}
          className={`p-2 rounded ${activeTab === 'Haterbot' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Haterbot
        </button>
        <button
          onClick={() => setActiveTab('File Explorer')}
          className={`p-2 rounded ${activeTab === 'File Explorer' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          File Explorer
        </button>
        <button
          onClick={() => setActiveTab('Documentation')}
          className={`p-2 rounded ${activeTab === 'Documentation' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Documentation
        </button>
        <button
          onClick={() => setActiveTab('Messages')}
          className={`p-2 rounded ${activeTab === 'Messages' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Messages
        </button>
        <button
          onClick={() => setActiveTab('Output Explorer')}
          className={`p-2 rounded ${activeTab === 'Output Explorer' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Output Explorer
        </button>
      </div>
      <div className="tab-content">
        {activeTab === 'LLM bot' && <LLMBotTab />}
        {activeTab === 'Haterbot' && <HaterbotTab />}
        {activeTab === 'File Explorer' && <FileExplorerTab />}
        {activeTab === 'Documentation' && <DocumentationTab />}
        {activeTab === 'Messages' && <MessagesTab />}
        {activeTab === 'Output Explorer' && <ReadOnlyFileExplorer />} {/* Ensure the correct folder path */}
      </div>
    </div>
  );
};

export default AdminPage;