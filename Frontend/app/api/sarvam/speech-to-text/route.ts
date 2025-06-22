import { NextApiRequest, NextApiResponse } from 'next';
import { SarvamAI, SarvamAIClient } from 'sarvamai';

const client = new SarvamAIClient({
    apiSubscriptionKey: process.env.SARVAM_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { audioFile } = req.body;

        try {
            const response = await client.speechToText.transcribe(audioFile, {
                model: 'saarika:v2.5',
                language_code: 'hi-IN',
            });

            res.status(200).json(response);
        } catch (error) {
            res.status(500).json({ error: 'Error transcribing audio' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}