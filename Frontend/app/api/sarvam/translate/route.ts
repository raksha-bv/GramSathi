import { NextApiRequest, NextApiResponse } from 'next';
import { SarvamAI, SarvamAIClient } from 'sarvamai';

const client = new SarvamAIClient({
    apiSubscriptionKey: process.env.SARVAM_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { text, targetLanguage } = req.body;

        try {
            const response = await client.text.translate({
                input: text,
                source_language_code: 'auto',
                target_language_code: targetLanguage,
                speaker_gender: 'Male',
            });

            res.status(200).json(response);
        } catch (error) {
            res.status(500).json({ error: 'Translation failed' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}