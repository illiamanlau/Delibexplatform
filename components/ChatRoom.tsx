// components/ChatRoom.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Message, ChatRoomProps } from '../lib/types';

const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = Math.floor(Math.abs((Math.sin(hash) * 16777215) % 1) * 16777215).toString(16);
  return '#' + '0'.repeat(6 - color.length) + color;
};

const ChatRoom: React.FC<ChatRoomProps> = ({ roomId, title, description, userName, userEmail }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      const response = await fetch(`/api/messages?roomId=${roomId}`);
      const data = await response.json();
      setMessages(data);
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 500);
    return () => clearInterval(interval);
  }, [roomId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      const newMessage: Message = {
        roomId,
        name: userName,
        email: userEmail,
        content: message,
        timestamp: new Date().toISOString()
      };
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMessage),
      });
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.ctrlKey && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Fixed header */}
      <div className="bg-white p-4 shadow-md">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-gray-600">{description}</p>
      </div>
      
      {/* Scrollable chat area */}
      <div className="flex-grow overflow-y-auto p-4" ref={chatBoxRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`mb-4 flex ${msg.name === userName ? 'justify-end' : 'justify-start'}`}>
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-white mr-2"
              style={{ backgroundColor: stringToColor(msg.name) }}
            >
              {msg.name[0].toUpperCase()}
            </div>
            <div className={`max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl rounded-lg p-3 ${
              msg.name === userName ? 'bg-blue-100' : 'bg-white'
            }`}>
              <p className="font-bold">{msg.name}</p>
              <p className="whitespace-pre-wrap break-words">{msg.content}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Fixed footer with message input */}
      <div className="bg-white p-4 shadow-md">
        <form onSubmit={handleSendMessage} className="flex">
          <textarea
            ref={messageInputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message (Press Enter to send, Ctrl+Enter for new line)"
            className="flex-grow p-2 border rounded-l resize-none"
            rows={3}
          />
          <button type="submit" className="bg-blue-500 text-white p-2 rounded-r">
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatRoom;