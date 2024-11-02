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
  linkButton: {
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
  disabledInput: {
    backgroundColor: '#e0e0e0', // Gray background for disabled input
  },
};

// LLMBotTab component for managing the LLM bot settings and execution
const LLMBotTab: React.FC = () => {
  const { state, setState } = useTabState();
  const [llmFlags, setLlmFlags] = useState(state.llmFlags || {
    experimentName: 'verenetti',
    start: false,
    offline: false,
    speedup: false,
    speedupValue: 10,
    model: 'llama3-8b-8192',
  });

  useEffect(() => {
    setState((prevState) => ({ ...prevState, llmFlags }));
  }, [llmFlags, setState]);

  // State to store the output of the script
  const [output, setOutput] = useState('');

  // Function to handle the script execution
  const handleScriptExecution = async (action: 'start' | 'stop') => {
    const flags = [
      llmFlags.experimentName,
      llmFlags.start && '--start',
      llmFlags.offline && '--offline',
      llmFlags.speedup && `--speedup ${llmFlags.speedupValue}`,
      `--model ${llmFlags.model}`,
    ].filter(Boolean);

    const command = `python3 src/main.py ${flags.join(' ')} 2>> output/error_logs/llm_bot_error_log.txt`;
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
    llmFlags.experimentName,
    llmFlags.start && '--start',
    llmFlags.offline && '--offline',
    llmFlags.speedup && `--speedup ${llmFlags.speedupValue}`,
    `--model ${llmFlags.model}`,
  ].filter(Boolean);

  return (
    <div className="p-4 border rounded shadow-md">
      <div className="mb-4">
        <label className="block mb-2">
          <span className="mr-2 font-semibold">Experiment Name</span>
          <input
            type="text"
            value={llmFlags.experimentName}
            onChange={(e) => setLlmFlags({ ...llmFlags, experimentName: e.target.value })}
            className="border p-1 rounded w-40 ml-2"
          />
        </label>
      </div>
      <div className="mb-4">
        <label className="block mb-2">
          <input
            type="checkbox"
            checked={llmFlags.start}
            onChange={(e) => setLlmFlags({ ...llmFlags, start: e.target.checked })}
            className="mr-2"
          />
          <span className="font-semibold">Make the bot send an initial message when started</span>
        </label>
      </div>
      <div className="mb-4">
        <label className="block mb-2">
          <input
            type="checkbox"
            checked={llmFlags.offline}
            onChange={(e) => setLlmFlags({ ...llmFlags, offline: e.target.checked })}
            className="mr-2"
          />
          <span className="font-semibold">Ignore the LLM to just send a default message</span>
        </label>
      </div>
      <div className="mb-4">
        <label className="block mb-2">
          <input
            type="checkbox"
            checked={llmFlags.speedup}
            onChange={(e) => setLlmFlags({ ...llmFlags, speedup: e.target.checked })}
            className="mr-2"
          />
          <span className="font-semibold">Make bot faster by a factor of </span>
          <input
            type="number"
            value={llmFlags.speedupValue}
            onChange={(e) => setLlmFlags({ ...llmFlags, speedupValue: parseFloat(e.target.value) })}
            className="border p-1 ml-2 rounded w-12" // Adjusted width for 4 characters
            disabled={!llmFlags.speedup}
            style={!llmFlags.speedup ? styles.disabledInput : {}}
          />
        </label>
      </div>
      <div className="mb-4">
        <label className="block mb-2">
          <span className="font-semibold">Specify model </span>
          <input
            type="text"
            value={llmFlags.model}
            onChange={(e) => setLlmFlags({ ...llmFlags, model: e.target.value })}
            className="border p-1 ml-2 rounded w-40"
          />
          <a
            href="https://console.groq.com/docs/models"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.linkButton}
          >
            List of Groq models
          </a>
          <a
            href="https://platform.openai.com/docs/models"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.linkButton}
          >
            List of OpenAI models
          </a>
        </label>
      </div>
      <div className="flex space-x-2 mb-4 p-4 border rounded bg-gray-100">
        <button
          onClick={() => handleScriptExecution('start')}
          style={styles.runButton}
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
        <pre className="bg-gray-100 p-4 rounded">{`python3 src/main.py ${flags.join(' ')} 2>> output/error_logs/llm_bot_error_log.txt`}</pre>
      </div>
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Output:</h2>
        <pre className="bg-gray-100 p-4 rounded">{output}</pre>
      </div>
    </div>
  );
};

export default LLMBotTab;