import { readFileSync } from 'fs';
import { join } from 'path';
import { NextApiRequest, NextApiResponse } from 'next';
import Papa from 'papaparse';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get the path to the rooms.csv file
    const filePath = join(process.cwd(), 'assets', 'rooms.csv');
    const fileContents = readFileSync(filePath, 'utf8');

    // Parse the CSV file into JSON
    const parsedData = Papa.parse(fileContents, { header: true, skipEmptyLines: true });

    // Transform CSV data into an object with room IDs as keys
    const rooms = parsedData.data.reduce((acc: any, room: any) => {
      if (room.id && room.title && room.description) {
        acc[room.id.trim()] = {
          title: room.title.trim(),
          description: room.description.trim(),
        };
      }
      return acc;
    }, {});

    // Return the JSON response
    res.status(200).json(rooms);
  } catch (error) {
    console.error('Error reading rooms.csv:', error);
    res.status(500).json({ error: 'Failed to load chat rooms.' });
  }
}
