import { NextApiRequest, NextApiResponse } from 'next';
import { exec, ChildProcess } from 'child_process';
import fs from 'fs';
import path from 'path';

// Store the current processes for LLMBot, HaterBot, and Replay Tool
let llmProcess: ChildProcess | null = null;
let haterbotProcess: ChildProcess | null = null;
let replayProcess: ChildProcess | null = null;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { action, command } = req.body;

    // Determine which process to manage based on the command
    const isLLMBot = command.includes('main.py');
    const isHaterBot = command.includes('hate_speech_generator.py');
    const isReplay = command.includes('replay.py');

    const currentProcess = isLLMBot ? llmProcess : isHaterBot ? haterbotProcess : isReplay ? replayProcess : null;

    // Ensure the output directory exists before running the command
    const errorLogDirectory = path.join(process.cwd(), 'output', 'error_logs');

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
        const scriptName = isLLMBot
          ? 'main.py'
          : isHaterBot
          ? 'hate_speech_generator.py'
          : 'replay.py';

        exec(`pkill -f ${scriptName}`, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error stopping script: ${error}`);
            return res.status(500).json({ message: 'Error stopping script', error: stderr });
          }
          if (isLLMBot) {
            llmProcess = null;
          } else if (isHaterBot) {
            haterbotProcess = null;
          } else {
            replayProcess = null;
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

      const fullCommand = command.replace(
        '2>> output/error_logs/error_log.txt',
        `2>> ${errorLogDirectory}/error_log.txt`
      );

      const newProcess = exec(fullCommand, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing script: ${error}`);
          if (isLLMBot) {
            llmProcess = null;
          } else if (isHaterBot) {
            haterbotProcess = null;
          } else {
            replayProcess = null;
          }
          return res.status(500).json({ error: 'Script execution failed', output: stderr });
        }
        if (isLLMBot) {
          llmProcess = null;
        } else if (isHaterBot) {
          haterbotProcess = null;
        } else {
          replayProcess = null;
        }
        res.status(200).json({ output: stdout });
      });

      newProcess.stdout?.on('data', (data) => console.log(`stdout: ${data}`));
      newProcess.stderr?.on('data', (data) => console.error(`stderr: ${data}`));

      if (isLLMBot) {
        llmProcess = newProcess;
      } else if (isHaterBot) {
        haterbotProcess = newProcess;
      } else {
        replayProcess = newProcess;
      }

      return res.status(200).json({ message: 'Script execution started.' });
    }
  }

  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
