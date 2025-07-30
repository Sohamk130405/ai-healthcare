import { type NextRequest, NextResponse } from "next/server";
import { streamText } from "ai";
import { google } from "@ai-sdk/google";

export async function POST(req: NextRequest) {
  try {
    // Check if API key is available
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json(
        { error: "Google Gemini API key is not configured" },
        { status: 500 }
      );
    }

    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    const result = await streamText({
      model: google("gemini-2.5-flash"),
      system: `You are a helpful AI health assistant. You provide general health information and guidance, but you always remind users that:
      
      1. You are not a replacement for professional medical advice
      2. Users should consult healthcare professionals for serious concerns
      3. In emergencies, they should contact emergency services immediately
      4. Your responses are for informational purposes only
      
      Be empathetic, helpful, and provide accurate health information while being clear about your limitations. Ask clarifying questions when needed to provide better assistance.`,
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        error:
          "Failed to process chat request. Please check your API configuration.",
      },
      { status: 500 }
    );
  }
}
