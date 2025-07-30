import { type NextRequest, NextResponse } from "next/server";
import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { ChatMessages, ChatSessions } from "@/config/schema";
import { eq, asc } from "drizzle-orm";
import { db } from "@/config/db";
import { currentUser } from "@clerk/nextjs/server";

// Function to clean markdown formatting
function cleanMarkdownText(text: string): string {
  return (
    text
      // Remove bold formatting
      .replace(/\*\*(.*?)\*\*/g, "$1")
      // Remove italic formatting
      .replace(/\*(.*?)\*/g, "$1")
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, "")
      // Remove inline code
      .replace(/`([^`]+)`/g, "$1")
      // Remove headers
      .replace(/^#{1,6}\s+/gm, "")
      // Remove bullet points and convert to simple dashes
      .replace(/^\*\s+/gm, "• ")
      .replace(/^-\s+/gm, "• ")
      // Remove extra whitespace and normalize line breaks
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userEmail = user.primaryEmailAddress?.emailAddress;

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json(
        { error: "Google Gemini API key is not configured" },
        { status: 500 }
      );
    }

    const { messages, sessionId } = await req.json();

    let conversationHistory: any[] = [];

    // If sessionId is provided, fetch conversation history from database
    if (sessionId) {
      try {
        // Verify session belongs to user
        const session = await db
          .select()
          .from(ChatSessions)
          .where(eq(ChatSessions.id, Number.parseInt(sessionId)))
          .limit(1);

        if (session.length && session[0].userEmail === userEmail) {
          const dbMessages = await db
            .select()
            .from(ChatMessages)
            .where(eq(ChatMessages.sessionId, Number.parseInt(sessionId)))
            .orderBy(asc(ChatMessages.createdAt));

          // Convert database messages to AI SDK format
          conversationHistory = dbMessages.map((msg) => ({
            role: msg.sender === "user" ? "user" : "assistant",
            content: msg.content,
          }));
        }
      } catch (error) {
        console.error("Error fetching conversation history:", error);
      }
    }

    // Combine conversation history with new messages
    const allMessages = [...conversationHistory, ...messages];

    let fullResponseText = "";

    const result = await streamText({
      model: google("gemini-2.5-flash"),
      system: `You are a helpful AI health assistant. You provide general health information and guidance, but you always remind users that:
      
      1. You are not a replacement for professional medical advice
      2. Users should consult healthcare professionals for serious concerns
      3. In emergencies, they should contact emergency services immediately
      4. Your responses are for informational purposes only
      
      Be empathetic, helpful, and provide accurate health information while being clear about your limitations. Ask clarifying questions when needed to provide better assistance.
      
      You have access to the conversation history, so you can reference previous messages and maintain context throughout the conversation.
      
      Please provide responses in plain text format without markdown formatting. Use simple bullet points (•) for lists and avoid bold, italic, or other markdown syntax.`,
      messages: allMessages,
      maxTokens: 1000,
      onChunk: ({ chunk }) => {
        if (chunk.type === "text-delta") {
          fullResponseText += chunk.textDelta;
        }
      },
      onFinish: async (result) => {
        // Clean the AI response text
        const cleanedText = cleanMarkdownText(fullResponseText);

        // Save both user message and AI response to database if sessionId is provided
        if (sessionId) {
          try {
            const lastUserMessage = messages[messages.length - 1];

            // Save user message
            if (lastUserMessage) {
              await db.insert(ChatMessages).values({
                sessionId: Number.parseInt(sessionId),
                content: lastUserMessage.content,
                sender: "user",
                metadata: { tokens: result.usage?.promptTokens || 0 },
              });
            }

            // Save AI response (cleaned)
            await db.insert(ChatMessages).values({
              sessionId: Number.parseInt(sessionId),
              content: cleanedText,
              sender: "ai",
              metadata: {
                tokens: result.usage?.completionTokens || 0,
                model: "gemini-2.5-flash",
                finishReason: result.finishReason,
              },
            });

            // Update session timestamp
            await db
              .update(ChatSessions)
              .set({ updatedAt: new Date() })
              .where(eq(ChatSessions.id, Number.parseInt(sessionId)));
          } catch (error) {
            console.error("Error saving messages to database:", error);
          }
        }
      },
    });

    // Return the stream response directly
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
