import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { password } = req.body;
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

  if (password === adminPassword) {
    res.status(200).json({ authenticated: true });
  } else {
    res.status(401).json({ authenticated: false });
  }
}