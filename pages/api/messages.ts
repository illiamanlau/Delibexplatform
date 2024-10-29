import { NextApiRequest, NextApiResponse } from 'next';
import { Message } from '../../lib/types';
import fs from 'fs';
import path from 'path';

let messages: Message[] = [];

// Function to extract mentions from the message content
function extractMentions(content: string): string {
  const mentionRegex = /@\w+/g;
  const mentions = content.match(mentionRegex) || [];
  return mentions.join('');
}

// Function to append a message to the room-specific CSV file
function appendToCSV(message: Message) {
  const csvLine = `${message.roomId},${message.name},${message.email},${message.content.replace(/,/g, ';')},${new Date(message.timestamp).toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(',', '')},${extractMentions(message.content)}\n`;

  const conversationsDir = path.join(process.cwd(), 'output/conversations');
  
  // Create the conversations directory if it doesn't exist
  if (!fs.existsSync(conversationsDir)) {
    fs.mkdirSync(conversationsDir, { recursive: true });
  }

  const csvPath = path.join(conversationsDir, `${message.roomId}.csv`);

  // If the file doesn't exist, create it with a header
  if (!fs.existsSync(csvPath)) {
    fs.writeFileSync(csvPath, 'roomId,name,email,content,timestamp,mentions\n');
  }

  // Append the new line to the room-specific CSV file
  fs.appendFileSync(csvPath, csvLine);
}

// Function to delete all messages
function deleteAllMessages() {
  messages = [];
  const conversationsDir = path.join(process.cwd(), 'conversations');

  // Delete all files in the conversations directory
  if (fs.existsSync(conversationsDir)) {
    fs.readdirSync(conversationsDir).forEach(file => {
      fs.unlinkSync(path.join(conversationsDir, file));
    });
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { roomId } = req.query;
    if (typeof roomId !== 'string') {
      return res.status(400).json({ error: 'Invalid room ID' });
    }
    const roomMessages = messages.filter(msg => msg.roomId === roomId);
    res.status(200).json(roomMessages);
  } else if (req.method === 'POST') {
    const newMessage: Message = req.body;
    messages.push(newMessage);
    // Append the new message to the room-specific CSV file
    appendToCSV(newMessage);
    res.status(201).json(newMessage);
  } else if (req.method === 'DELETE') {
    deleteAllMessages();
    res.status(200).json({ message: 'All messages have been deleted.' });
  } else {
    res.status(405).end();
  }
}