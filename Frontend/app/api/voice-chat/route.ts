import { NextRequest, NextResponse } from 'next/server';
import { SarvamAIClient } from 'sarvamai';

const client = new SarvamAIClient({ 
  apiSubscriptionKey: process.env.SARVAM_API_KEY! 
});

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    const result = await client.chat.completions({
      messages: [
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const response = result.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.';

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Chat completion error:', error);
    return NextResponse.json({ error: 'Failed to get chat response' }, { status: 500 });
  }
}