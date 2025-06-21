import { NextRequest, NextResponse } from "next/server";
import { SarvamAIClient } from "sarvamai";

const client = new SarvamAIClient({
  apiSubscriptionKey: process.env.SARVAM_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    const result = await client.textToSpeech.convert({
      text,
      target_language_code: "hi-IN",
      speaker: "anushka",
    });

    const audio = result.audios[0];

    return NextResponse.json({ audio });
  } catch (error) {
    console.error("Text-to-speech error:", error);
    return NextResponse.json(
      { error: "Failed to generate speech" },
      { status: 500 }
    );
  }
}
