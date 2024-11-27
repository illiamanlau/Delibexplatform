import React, { useState, useEffect } from 'react';
import { useTabState } from '../context/TabStateContext';

// Define the CSS styles for the buttons directly in the component file
const styles = {
  runButton: {
    backgroundColor: 'green',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    marginRight: '10px', // Add extra separation between buttons
    // Add a hover effect for better user experience
    ':hover': {
      backgroundColor: 'darkgreen',
    },
  },
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
  errorText: {
    color: 'red',
    fontSize: '14px',
    marginTop: '5px',
  },
};

// HaterbotTab component for managing the Haterbot settings and execution
const HaterbotTab: React.FC = () => {
  const { state, setState } = useTabState();
  const [haterbotFlags, setHaterbotFlags] = useState(state.haterbotFlags || {
    freqValue: 40.0,
    namesValue: 'John,Peter,Giulia,Marcus',
    roomIds: "test,room1A,room1B,room2A,room2B,room3A,room3B,room4A,room4B",
  });
  const [roomIdsError, setRoomIdsError] = useState('');
  const [namesError, setNamesError] = useState('');

  useEffect(() => {
    setState((prevState) => ({ ...prevState, haterbotFlags }));
  }, [haterbotFlags, setState]);

  // State to store the output of the script
  const [output, setOutput] = useState('');

  // Function to handle the script execution
  const handleScriptExecution = async (action: 'start' | 'stop') => {
    const flags = [
      `--freq ${haterbotFlags.freqValue}`,
      `--names "${haterbotFlags.namesValue}"`,
      `--roomIds ${haterbotFlags.roomIds}`,
    ].filter(Boolean);

    const command = `python3 src/hate_speech_generator.py ${flags.join(' ')} 2>> output/error_logs/haterbot_error_log.txt`;
    try {
      const response = await fetch('/api/runScript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, command }),
      });
      const data = await response.json();
      setOutput(data.output || data.message);
    } catch (error) {
      console.error('Error executing script:', error);
      setOutput('Error executing script. Please check the console for details.');
    }
  };

  const handleRoomIdsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^[a-zA-Z0-9,._-]*$/.test(value)) {
      setHaterbotFlags(prev => ({ ...prev, roomIds: value }));
      setRoomIdsError('');
    } else {
      setRoomIdsError('Room IDs can only contain letters, digits, "-", and "_".');
    }
  };

  const handleNamesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Validate names: comma-separated names, allowing trailing comma
    if (/^[a-zA-Z0-9]+(,[a-zA-Z0-9]+)*,?$/.test(value) || value === '') {
      setHaterbotFlags(prev => ({ ...prev, namesValue: value }));
      setNamesError('');
    } else {
      setNamesError('Names must contain only letters and commas, with no spaces.');
    }
  };

  return (
    <div className="p-4 border rounded shadow-md">
      <div className="mb-4">
        <div>
          <span className="font-semibold">Send hate message every </span>
          <input
            type="number"
            value={haterbotFlags.freqValue}
            onChange={(e) => setHaterbotFlags(prev => ({ ...prev, freqValue: parseFloat(e.target.value) }))}
            className="border p-1 ml-2 rounded w-20"
          />
          <span className="font-semibold ml-2"> seconds</span>
        </div>
        <p className="text-gray-600 text-sm mt-2">
          This refers to the overall hate message frequency across all names, not per individual name.
        </p>
      </div>
      
      <div className="mb-4">
        <label className="block mb-2">
          <span className="font-semibold">Haterbot names (comma-separated): </span>
          <input
            type="text"
            value={haterbotFlags.namesValue}
            onChange={handleNamesChange}
            className="border p-1 ml-2 rounded w-full"
            placeholder="Hans,Peter,Martin,Klaus"
          />
          {namesError && <div style={styles.errorText}>{namesError}</div>}
        </label>
        <p className="text-gray-600 text-sm">
          Provide a list of names to be used by haterbots. Names should be comma-separated, and contain letters and digits, with no spaces.
        </p>
      </div>
      
      <div className="mb-4">
        <label className="block mb-2">
          <span className="font-semibold">List of rooms (comma-separated, with no spaces in between): </span>
          <input
            type="text"
            value={haterbotFlags.roomIds}
            onChange={handleRoomIdsChange}
            className="border p-1 ml-2 rounded w-full"
          />
          {roomIdsError && <div style={styles.errorText}>{roomIdsError}</div>}
        </label>
        <p className="text-gray-600 text-sm">
          Specify the rooms where haterbots will be activated. Use comma-separated room identifiers without spaces.
        </p>
      </div>
      
      <div className="flex space-x-2 mb-4 p-4 border rounded bg-gray-100">
        <button
          onClick={() => handleScriptExecution('start')}
          style={styles.runButton}
          disabled={!!roomIdsError || !!namesError}
        >
          Run
        </button>
        <button
          onClick={() => handleScriptExecution('stop')}
          style={styles.stopButton}
        >
          Stop
        </button>
      </div>
      
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Command:</h2>
        <pre className="bg-gray-100 p-4 rounded">{`python3 src/hate_speech_generator.py ${
          [
            `--freq ${haterbotFlags.freqValue}`,
            `--names "${haterbotFlags.namesValue}"`,
            `--roomIds ${haterbotFlags.roomIds}`
          ].join(' ')
        } 2>> output/error_logs/haterbot_error_log.txt`}</pre>
      </div>
      
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Output:</h2>
        <pre className="bg-gray-100 p-4 rounded">{output}</pre>
      </div>
    </div>
  );
};

export default HaterbotTab;