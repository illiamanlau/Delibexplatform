import React, { useState } from 'react';

const HaterbotTab: React.FC = () => {
  const [output, setOutput] = useState('');
  const [haterbotFlags, setHaterbotFlags] = useState({
    freq: false,
    freqValue: 30.0,
    names: false,
    namesValue: 4,
  });

  const handleScriptExecution = async (action: 'start' | 'stop') => {
    const flags = [
      haterbotFlags.freq && `--freq ${haterbotFlags.freqValue}`,
      haterbotFlags.names && `--names ${haterbotFlags.namesValue}`,
    ].filter(Boolean);

    const command = `python3 hate_speech_generator.py ${flags.join(' ')} 2>> error_log.txt`;
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
  ].filter(Boolean);

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
          <span className="font-semibold">Send a hate message every</span>
          <input
            type="number"
            value={haterbotFlags.freqValue}
            onChange={(e) => setHaterbotFlags({ ...haterbotFlags, freqValue: parseFloat(e.target.value) })}
            className="border p-1 ml-2 rounded w-20"
            disabled={!haterbotFlags.freq}
          />
          <span className="font-semibold ml-2">seconds</span>
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
          <span className="font-semibold">Use</span>
          <input
            type="number"
            value={haterbotFlags.namesValue}
            onChange={(e) => setHaterbotFlags({ ...haterbotFlags, namesValue: parseInt(e.target.value) })}
            className="border p-1 ml-2 rounded w-20"
            disabled={!haterbotFlags.names}
          />
          <span className="font-semibold ml-2">different names</span>
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
        <pre className="bg-gray-100 p-4 rounded">{`python3 hate_speech_generator.py ${flags.join(' ')} 2>> error_log.txt`}</pre>
      </div>
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Output:</h2>
        <pre className="bg-gray-100 p-4 rounded">{output}</pre>
      </div>
    </div>
  );
};

export default HaterbotTab;