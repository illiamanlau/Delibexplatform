import { NextApiRequest, NextApiResponse } from 'next';
import { exec, ChildProcess } from 'child_process';
import fs from 'fs';
import path from 'path';

// Store the current processes for LLMBot and HaterBot
let llmProcess: ChildProcess | null = null;
let haterbotProcess: ChildProcess | null = null;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { action, command } = req.body;

    // Determine which process to manage based on the command
    const isLLMBot = command.includes('main.py');
    const currentProcess = isLLMBot ? llmProcess : haterbotProcess;

    // Ensure the output directory exists before running the command
    const errorLogDirectory = path.join(process.cwd(), 'output', 'error_logs');

    // Create the directory if it doesn't exist
    try {
      if (!fs.existsSync(errorLogDirectory)) {
        fs.mkdirSync(errorLogDirectory, { recursive: true });
      }
    } catch (error) {
      console.error('Error creating directory:', error);
      return res.status(500).json({ message: 'Error creating log directory', error });
    }

    if (action === 'stop') {
      if (currentProcess) {
        // Kill all instances of the specific script
        const scriptName = isLLMBot ? 'main.py' : 'hate_speech_generator.py';
        exec(`pkill -f ${scriptName}`, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error stopping scripts: ${error}`);
            return res.status(500).json({ message: 'Error stopping scripts', error: stderr });
          }
          if (isLLMBot) {
            llmProcess = null;
          } else {
            haterbotProcess = null;
          }
          return res.status(200).json({ message: 'Script execution stopped.' });
        });
      } else {
        return res.status(400).json({ message: 'No script currently running.' });
      }
    }

    if (action === 'start') {
      if (currentProcess) {
        return res.status(400).json({ message: 'A script is already running. Please stop it first.' });
      }

      // Use absolute paths for the error log file and command execution
      const fullCommand = command.replace(
        '2>> output/error_logs/haterbot_error_log.txt',
        `2>> ${errorLogDirectory}/haterbot_error_log.txt`
      );

      const newProcess = exec(fullCommand, (error, stdout, stderr) => {
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
