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
  disabledInput: {
    backgroundColor: '#e0e0e0', // Gray background for disabled input
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
    freq: false,
    freqValue: 10.0,
    names: false,
    namesValue: 4,
  });
  const [roomIds, setRoomIds] = useState("test,room1A,room1B,room2A,room2B,room3A,room3B,room4A,room4B");
  const [roomIdsError, setRoomIdsError] = useState('');

  useEffect(() => {
    setState((prevState) => ({ ...prevState, haterbotFlags }));
  }, [haterbotFlags, setState]);

  // State to store the output of the script
  const [output, setOutput] = useState('');

  // Function to handle the script execution
  const handleScriptExecution = async (action: 'start' | 'stop') => {
    const flags = [
      haterbotFlags.freq && `--freq ${haterbotFlags.freqValue}`,
      haterbotFlags.names && `--names ${haterbotFlags.namesValue}`,
      `--roomIds ${roomIds}`,
    ].filter(Boolean);

    const command = `python3 src/hate_speech_generator.py ${flags.join(' ')} 2>> output/haterbot_error_log.txt`;
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

  const flags = [
    haterbotFlags.freq && `--freq ${haterbotFlags.freqValue}`,
    haterbotFlags.names && `--names ${haterbotFlags.namesValue}`,
    `--roomIds ${roomIds}`,
  ].filter(Boolean);

  const handleRoomIdsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^[a-zA-Z0-9,._-]*$/.test(value)) {
      setRoomIds(value);
      setRoomIdsError('');
    } else {
      setRoomIdsError('Room IDs can only contain letters, digits, "-", and "_".');
    }
  };

  return (
    <div className="p-4 border rounded shadow-md">
      <div className="mb-4">
        <label className="block mb-2">
          <input
            type="checkbox"
            checked={haterbotFlags.freq}
            onChange={(e) => setHaterbotFlags({ ...haterbotFlags, freq: e.target.checked })}
            className="mr-2"
          />
          <span className="font-semibold">Send a hate message every </span>
          <input
            type="number"
            value={haterbotFlags.freqValue}
            onChange={(e) => setHaterbotFlags({ ...haterbotFlags, freqValue: parseFloat(e.target.value) })}
            className="border p-1 ml-2 rounded w-20"
            disabled={!haterbotFlags.freq}
            style={!haterbotFlags.freq ? styles.disabledInput : {}}
          />
          <span className="font-semibold ml-2"> seconds</span>
        </label>
      </div>
      <div className="mb-4">
        <label className="block mb-2">
          <input
            type="checkbox"
            checked={haterbotFlags.names}
            onChange={(e) => setHaterbotFlags({ ...haterbotFlags, names: e.target.checked })}
            className="mr-2"
          />
          <span className="font-semibold">Use </span>
          <input
            type="number"
            value={haterbotFlags.namesValue}
            onChange={(e) => setHaterbotFlags({ ...haterbotFlags, namesValue: parseInt(e.target.value) })}
            className="border p-1 ml-2 rounded w-20"
            disabled={!haterbotFlags.names}
            style={!haterbotFlags.names ? styles.disabledInput : {}}
          />
          <span className="font-semibold ml-2"> different names</span>
        </label>
      </div>
      <div className="mb-4">
        <label className="block mb-2">
          <span className="font-semibold">List of rooms (comma-separated, with no spaces in between) where the haterbots will be activated: </span>
          <input
            type="text"
            value={roomIds}
            onChange={handleRoomIdsChange}
            className="border p-1 ml-2 rounded w-full"
          />
          {roomIdsError && <div style={styles.errorText}>{roomIdsError}</div>}
        </label>
      </div>
      <div className="flex space-x-2 mb-4 p-4 border rounded bg-gray-100">
        <button
          onClick={() => handleScriptExecution('start')}
          style={styles.runButton}
          disabled={!!roomIdsError}
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
        <pre className="bg-gray-100 p-4 rounded">{`python3 src/hate_speech_generator.py ${flags.join(' ')} 2>> output/haterbot_error_log.txt`}</pre>
      </div>
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Output:</h2>
        <pre className="bg-gray-100 p-4 rounded">{output}</pre>
      </div>
    </div>
  );
};

export default HaterbotTab;