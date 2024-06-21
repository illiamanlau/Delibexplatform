// pages/index.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [chatRoom, setChatRoom] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && email.trim() && chatRoom.trim()) {
      // Store user info in localStorage
      localStorage.setItem('userName', name);
      localStorage.setItem('userEmail', email);
      // Redirect to the specified chat room
      router.push(`/${chatRoom}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-400 to-purple-500">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Welcome to ChatApp</h1>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="w-full p-3 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full p-3 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          value={chatRoom}
          onChange={(e) => setChatRoom(e.target.value)}
          placeholder="Enter chat room (e.g., chat1)"
          className="w-full p-3 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 transition duration-300">
          Join Chat
        </button>
      </form>
    </div>
  );
}