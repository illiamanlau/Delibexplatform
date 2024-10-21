import { NextApiRequest, NextApiResponse } from 'next';
import { exec, ChildProcess } from 'child_process';

// Store the current processes for LLMBot and HaterBot
let llmProcess: ChildProcess | null = null;
let haterbotProcess: ChildProcess | null = null;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { action, command } = req.body;

    // Determine which process to manage based on the command
    const isLLMBot = command.includes('main.py');
    const currentProcess = isLLMBot ? llmProcess : haterbotProcess;

    if (action === 'stop') {
      if (currentProcess) {
        // Kill the process and all its child processes
        process.platform === 'win32' ? exec(`taskkill /pid ${currentProcess.pid} /T /F`) : currentProcess.kill('SIGTERM');
        if (isLLMBot) {
          llmProcess = null;
        } else {
          haterbotProcess = null;
        }
        return res.status(200).json({ message: 'Script execution stopped.' });
      }
      return res.status(400).json({ message: 'No script currently running.' });
    }

    if (action === 'start') {
      if (currentProcess) {
        return res.status(400).json({ message: 'A script is already running. Please stop it first.' });
      }

      const newProcess = exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing script: ${error}`);
          if (isLLMBot) {
            llmProcess = null;
          } else {
            haterbotProcess = null;
          }
          return res.status(500).json({ error: 'Script execution failed', output: stderr });
        }
        if (isLLMBot) {
          llmProcess = null;
        } else {
          haterbotProcess = null;
        }
        res.status(200).json({ output: stdout });
      });

      // Handle process output streams
      newProcess.stdout?.on('data', (data) => {
        console.log(`stdout: ${data}`);
      });

      newProcess.stderr?.on('data', (data) => {
        console.error(`stderr: ${data}`);
      });

      // Assign the new process to the appropriate variable
      if (isLLMBot) {
        llmProcess = newProcess;
      } else {
        haterbotProcess = newProcess;
      }

      // Start the process but don't wait for it to complete
      return res.status(200).json({ message: 'Script execution started.' });
    }
  }
  
  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}