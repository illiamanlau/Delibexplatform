import React, { useState } from "react";

const styles = {
  runButton: {
    backgroundColor: "green",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
    marginRight: "10px",
  },
  stopButton: {
    backgroundColor: "red",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
  },
  disabledInput: {
    backgroundColor: "#e0e0e0",
  },
};

const Replay: React.FC = () => {
  const [filePath, setFilePath] = useState("");
  const [speedup, setSpeedup] = useState(1.0);
  const [output, setOutput] = useState("");

  const handleScriptExecution = async (action: "start" | "stop") => {
    if (action === "start" && !filePath.endsWith(".csv")) {
      setOutput("Error: Please select a valid CSV file.");
      return;
    }

    const command = `python3 src/replay.py "${filePath}" --speedup ${speedup}`;
    try {
      const response = await fetch("/api/runScript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, command }),
      });
      const data = await response.json();
      setOutput(data.output || data.message);
    } catch (error) {
      console.error("Error executing script:", error);
      setOutput("Error executing script. Check console.");
    }
  };

  return (
    <div className="p-4 border rounded shadow-md">
      <h2 className="text-xl font-semibold mb-2">CSV Message Processor</h2>

      {/* File Input */}
      <div className="mb-4">
        <label className="block mb-2">
          <span className="font-semibold">CSV File Path:</span>
          <input
            type="text"
            value={filePath}
            onChange={(e) => setFilePath(e.target.value)}
            className="border p-1 ml-2 rounded w-80"
            placeholder="e.g., assets/example_conversation.csv, output/conversations/room4A.csv"
          />
        </label>
        <p className="text-gray-600 text-sm">
          Input file of the CSV conversation. The output ones are in output/conversations (like output/conversations/room4A.csv), the made up ones can be found in assets (like assets/example_conversation.csv)
        </p>
      </div>

      {/* Speedup Factor */}
      <div className="mb-4">
        <label className="block mb-2">
          <span className="font-semibold">Speedup Factor:</span>
          <input
            type="number"
            value={speedup}
            onChange={(e) => setSpeedup(parseFloat(e.target.value))}
            className="border p-1 ml-2 rounded w-20"
          />
        </label>
        <p className="text-gray-600 text-sm">
          Adjusts the message timing. 1.0 = normal speed, 2.0 = twice as fast.
        </p>
      </div>

      {/* Run/Stop Buttons */}
      <div className="mb-4 flex">
        <button onClick={() => handleScriptExecution("start")} style={styles.runButton}>
          Run
        </button>
        <button onClick={() => handleScriptExecution("stop")} style={styles.stopButton}>
          Stop
        </button>
      </div>

      {/* Command Preview */}
      <div className="mt-4">
        <h3 className="text-lg font-semibold">Command:</h3>
        <pre className="bg-gray-100 p-4 rounded">
          {filePath ? `python3 src/replay.py "${filePath}" --speedup ${speedup}` : "Select a file first"}
        </pre>
      </div>

      {/* Output */}
      <div className="mt-4">
        <h3 className="text-lg font-semibold">Output:</h3>
        <pre className="bg-gray-100 p-4 rounded">{output}</pre>
      </div>
    </div>
  );
};

export default Replay;
