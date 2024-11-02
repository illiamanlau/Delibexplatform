import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs';
import archiver from 'archiver';
import { buildFileTree } from '../../utils/files';

const outputDir = path.join(process.cwd(), 'output');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { path: filePath, download } = req.query;
    
    try {
      if (download === 'true') {
        const zipFilePath = path.join(outputDir, 'output.zip');
        const output = fs.createWriteStream(zipFilePath);
        const archive = archiver('zip', {
          zlib: { level: 9 }
        });

        output.on('close', () => {
          res.setHeader('Content-Disposition', 'attachment; filename=output.zip');
          res.setHeader('Content-Type', 'application/zip');
          const fileStream = fs.createReadStream(zipFilePath);
          fileStream.pipe(res);
          fileStream.on('end', () => {
            fs.unlinkSync(zipFilePath); // Clean up the zip file after download
          });
        });

        archive.on('error', (err) => {
          throw err;
        });

        archive.pipe(output);
        archive.directory(outputDir, false);
        archive.finalize();
        return;
      }

      if (filePath) {
        const fullPath = path.join(outputDir, filePath as string);
        const content = fs.readFileSync(fullPath, 'utf-8');
        return res.status(200).json({ content });
      }

      const fileTree = buildFileTree(outputDir);
      res.status(200).json(fileTree);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Operation failed' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}