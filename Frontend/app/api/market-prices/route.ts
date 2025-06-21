//api/market-prices/route.ts

import { NextRequest, NextResponse } from "next/server";
import { ChatbotService } from "../../../lib/chatbot-service";

const chatbotService = new ChatbotService();

export async function POST(request: NextRequest) {
  try {
    const { message, language, location } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required and must be a string" },
        { status: 400 }
      );
    }

    console.log("Chat API - Processing message:", message);

    // Process the message
    const result = await chatbotService.processMessage(message, location);

    let response = result.response;

    // Translate if language is specified and not English
    if (language && language !== "en-IN" && language !== "en") {
      try {
        response = await chatbotService.translateResponse(response, language);
      } catch (translationError) {
        console.error("Translation failed:", translationError);
        // Continue with original response if translation fails
      }
    }

    console.log("Chat API - Sending response:", response);

    return NextResponse.json({
      response,
      weatherData: result.weatherData,
      marketData: result.marketData,
      conversationHistory: chatbotService.getConversationHistory(),
    });
  } catch (error) {
    console.error("Chat API Error:", error);

    return NextResponse.json(
      {
        error:
          "Sorry, I'm having trouble processing your request right now. Please try again.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
