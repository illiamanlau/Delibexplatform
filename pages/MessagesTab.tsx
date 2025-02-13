import React, { useState, useEffect } from 'react';
import axios from 'axios';

const styles: { [key: string]: React.CSSProperties } = {
  sendButton: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '5px 10px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    marginLeft: '10px',
    textDecoration: 'none',
    display: 'inline-block',
  },
  deleteButton: {
    backgroundColor: 'red',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    marginLeft: '10px',
  },
  input: {
    padding: '10px',
    width: '100%',
    height: '120px', // Adjusted to fit approximately 8 lines
    marginBottom: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
  container: {
    marginBottom: '20px',
    display: 'flex',
    flexDirection: 'column' as 'column',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  nameInput: {
    padding: '5px',
    width: '50%',
    marginBottom: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
  }
};

const MessagesTab: React.FC = () => {
  const [message, setMessage] = useState('');
  const [rooms, setRooms] = useState<string[]>([]);
  const [displayName, setDisplayName] = useState('LauraIllia');

  useEffect(() => {
    // Fetch existing chat rooms from the API
    const fetchRooms = async () => {
      try {
        const response = await axios.get('/api/rooms'); // Ensure the API exists and responds correctly
        const roomIds = Object.keys(response.data); // Extract room IDs from object keys
        setRooms(roomIds);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    };
    fetchRooms();
  }, []);

  const handleSendMessage = async () => {
    if (!message.trim()) {
      alert('Message cannot be empty.');
      return;
    }

    const confirmed = window.confirm('Are you sure you want to send this message to all rooms?');
    if (!confirmed) return;

    try {
      await Promise.all(
        rooms.map(roomId =>
          axios.post('/api/messages', {
            roomId,
            name: displayName,
            email: 'system@chat.com',
            content: message,
            timestamp: Date.now(),
          })
        )
      );
      alert('Message sent to all rooms.');
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message.');
    }
  };

  const handleRemoveMessages = async () => {
    const confirmed = window.confirm('Are you sure you want to delete all messages?');
    if (!confirmed) return;

    try {
      await axios.delete('/api/messages');
      alert('All messages have been removed.');
    } catch (error) {
      console.error('Error removing messages:', error);
      alert('Failed to remove messages.');
    }
  };

  return (
    <div className="p-4">
      {/* Display Name Selection */}
      <div style={styles.container}>
        <label>Display Name:</label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          style={styles.nameInput}
        />
      </div>

      {/* Send Message to All Rooms */}
      <div style={styles.container}>
        <h2>Send Message to All Rooms</h2>
        <textarea
          placeholder="Enter your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={styles.input}
        />
        <div style={styles.buttonContainer}>
          <button onClick={handleSendMessage} style={styles.sendButton}>Send</button>
        </div>
      </div>

      {/* Delete All Messages */}
      <div>
        <h2>Delete All Messages</h2>
        <button onClick={handleRemoveMessages} style={styles.deleteButton}>Delete All Messages</button>
      </div>
    </div>
  );
};

export default MessagesTab;
