//api/chat/route.ts

import { NextRequest, NextResponse } from "next/server";
import { ChatbotService } from "@/lib/chatbot-service";

const chatbot = new ChatbotService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, location, language } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    console.log("Chat API - Processing message:", message);

    // Process the message
    const result = await chatbot.processMessage(message, location);

    // Translate if needed
    let translatedResponse = result.response;
    if (language && language !== "en" && language !== "en-US") {
      try {
        translatedResponse = await chatbot.translateResponse(
          result.response,
          language
        );
      } catch (translationError) {
        console.error("Translation failed:", translationError);
        // Keep original response if translation fails
      }
    }

    console.log("Chat API - Sending response:", translatedResponse);

    return NextResponse.json({
      response: translatedResponse,
      originalResponse: result.response,
      weatherData: result.weatherData,
      marketData: result.marketData,
      appointmentScheduled: result.appointmentScheduled,
      needsAppointmentInfo: result.needsAppointmentInfo,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        response:
          "I'm sorry, I encountered a technical issue. Please try again in a moment.",
        error: "Failed to process message",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const history = chatbot.getConversationHistory();
    return NextResponse.json({ history });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat history" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    chatbot.clearHistory();
    return NextResponse.json({ message: "Chat history cleared" });
  } catch (error) {
    console.error("Error clearing chat history:", error);
    return NextResponse.json(
      { error: "Failed to clear chat history" },
      { status: 500 }
    );
  }
}
