import { NextApiRequest, NextApiResponse } from 'next';
import { SarvamAI } from 'sarvamai';

const client = new SarvamAI({
    api_subscription_key: process.env.SARVAM_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { text, languageCode } = req.body;

        try {
            const response = await client.text_to_speech.convert({
                text,
                target_language_code: languageCode,
            });

            res.status(200).json(response);
        } catch (error) {
            res.status(500).json({ error: 'Error converting text to speech' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}