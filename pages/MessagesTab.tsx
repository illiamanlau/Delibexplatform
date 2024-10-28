import React from 'react';
import axios from 'axios';

// Define the CSS styles for the buttons directly in the component file
const styles = {
  stopButton: {
    backgroundColor: 'red',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    // Add a hover effect for better user experience
    ':hover': {
      backgroundColor: 'darkred',
    },
  },
};

const MessagesTab: React.FC = () => {
  const handleRemoveMessages = async () => {
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
      <button
        onClick={handleRemoveMessages}
        style={styles.stopButton}
      >
        Remove All Messages
      </button>
    </div>
  );
};

export default MessagesTab;