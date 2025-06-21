import { NextApiRequest, NextApiResponse } from 'next';
import { fetchSchemesData } from '../../../lib/schemes-api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const schemes = await fetchSchemesData();
            res.status(200).json(schemes);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching schemes data', error });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}