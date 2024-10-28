// pages/api/readme.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { readFileSync } from 'fs';
import { join } from 'path';

export default (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const filePath = join(process.cwd(), 'README.md');
    const fileContent = readFileSync(filePath, 'utf-8');
    res.status(200).send(fileContent);
  } catch (error) {
    res.status(500).send('Error reading README.md');
  }
};