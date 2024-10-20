import React, { useState } from 'react';
import { useRouter } from 'next/router';
import LLMBotTab from './LLMBotTab';
import HaterbotTab from './HaterbotTab';
import FileExplorerTab from './FileExplorerTab';

const AdminPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('LLM bot');

  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'your_secure_password') {
      setAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  if (!authenticated) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          LLM bot
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
      </div>
      <div className="tab-content">
        {activeTab === 'LLM bot' && <LLMBotTab />}
        {activeTab === 'Haterbot' && <HaterbotTab />}
        {activeTab === 'File Explorer' && <FileExplorerTab />}
      </div>
    </div>
  );
};

export default AdminPage;