import React, { useState } from 'react';

const LLMBotTab: React.FC = () => {
  const [output, setOutput] = useState('');
  const [llmFlags, setLlmFlags] = useState({
    experimentName: 'verenetti',
    start: false,
    offline: false,
    speedup: false,
    speedupValue: 10,
  });

  const handleScriptExecution = async (action: 'start' | 'stop') => {
    const flags = [
      llmFlags.experimentName,
      llmFlags.start && '--start',
      llmFlags.offline && '--offline',
      llmFlags.speedup && `--speedup ${llmFlags.speedupValue}`,
    ].filter(Boolean);

    const command = `python3 main.py ${flags.join(' ')} 2>> error_log.txt`;
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
          <span className="font-semibold">Make bot faster by a factor of</span>
          <input
            type="number"
            value={llmFlags.speedupValue}
            onChange={(e) => setLlmFlags({ ...llmFlags, speedupValue: parseFloat(e.target.value) })}
            className="border p-1 ml-2 rounded w-20"
            disabled={!llmFlags.speedup}
          />
        </label>
      </div>
      <div className="flex space-x-2 mb-4 p-4 border rounded bg-gray-100">
        <button
          onClick={() => handleScriptExecution('start')}
          className="p-2 bg-green-500 text-white rounded"
        >
          Play
        </button>
        <button
          onClick={() => handleScriptExecution('stop')}
          className="p-2 bg-red-500 text-white rounded"
        >
          Stop
        </button>
      </div>
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Command:</h2>
        <pre className="bg-gray-100 p-4 rounded">{`python3 main.py ${flags.join(' ')} 2>> error_log.txt`}</pre>
      </div>
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Output:</h2>
        <pre className="bg-gray-100 p-4 rounded">{output}</pre>
      </div>
    </div>
  );
};

export default LLMBotTab;