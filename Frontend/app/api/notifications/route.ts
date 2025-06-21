// api/notifications/route.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { sendNotification } from '../../../utils/notifications';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { message, farmers } = req.body;

    if (!message || !farmers) {
      return res.status(400).json({ error: 'Message and farmers are required' });
    }

    try {
      const results = await Promise.all(farmers.map(farmer => sendNotification(farmer, message)));
      return res.status(200).json({ success: true, results });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to send notifications', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}