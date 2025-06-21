import { NextRequest, NextResponse } from "next/server";
import { SarvamAIClient } from "sarvamai";

const client = new SarvamAIClient({
  apiSubscriptionKey: process.env.SARVAM_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const result = await client.speechToText.transcribe(file, {
      model: "saarika:v2.5",
      language_code: "hi-IN",
    });

    return NextResponse.json({ transcript: result.transcript });
  } catch (error) {
    console.error("Speech-to-text error:", error);
    return NextResponse.json(
      { error: "Failed to process audio" },
      { status: 500 }
    );
  }
}
