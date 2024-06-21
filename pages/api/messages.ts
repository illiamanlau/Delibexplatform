// pages/api/messages.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { Message } from '../../types';
import fs from 'fs';
import path from 'path';

let messages: Message[] = [];

// Function to extract mentions from the message content
function extractMentions(content: string): string {
  const mentionRegex = /@\w+/g;
  const mentions = content.match(mentionRegex) || [];
  return mentions.join('');
}

// Function to append a message to the CSV file
function appendToCSV(message: Message) {
  const csvLine = `${message.roomId},${message.name},${message.email},${message.content.replace(/,/g, ';')},${new Date(message.timestamp).toLocaleString('en-GB', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit', 
    hour12: false 
}).replace(',', '')},${extractMentions(message.content)}\n`;  const csvPath = path.join(process.cwd(), 'conversations.csv');
  
  // If the file doesn't exist, create it with a header
  if (!fs.existsSync(csvPath)) {
    fs.writeFileSync(csvPath, 'roomId,name,email,content,timestamp,mentions\n');
  }
  
  // Append the new line to the CSV file
  fs.appendFileSync(csvPath, csvLine);
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
    
    // Append the new message to the CSV file
    appendToCSV(newMessage);
    
    res.status(201).json(newMessage);
  } else {
    res.status(405).end();
  }
}