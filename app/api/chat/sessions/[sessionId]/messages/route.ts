import { type NextRequest, NextResponse } from "next/server";
import { ChatMessages, ChatSessions } from "@/config/schema";
import { eq, asc } from "drizzle-orm";
import {currentUser } from "@clerk/nextjs/server";
import { db } from "@/config/db";



// GET - Fetch all messages for a chat session
export async function GET(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userEmail = user.primaryEmailAddress?.emailAddress; 

    const sessionId = Number.parseInt(params.sessionId);

    // Verify session belongs to user
    const session = await db
      .select()
      .from(ChatSessions)
      .where(eq(ChatSessions.id, sessionId))
      .limit(1);

    if (!session.length || session[0].userEmail !== userEmail) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const messages = await db
      .select()
      .from(ChatMessages)
      .where(eq(ChatMessages.sessionId, sessionId))
      .orderBy(asc(ChatMessages.createdAt));

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// POST - Add a new message to the session
export async function POST(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
     const user = await currentUser();
     if (!user) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
     }
    const userEmail = user.primaryEmailAddress?.emailAddress; // Replace with actual email from Clerk


    const sessionId = Number.parseInt(params.sessionId);
    const { content, sender, metadata } = await req.json();

    // Verify session belongs to user
    const session = await db
      .select()
      .from(ChatSessions)
      .where(eq(ChatSessions.id, sessionId))
      .limit(1);

    if (!session.length || session[0].userEmail !== userEmail) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const [newMessage] = await db
      .insert(ChatMessages)
      .values({
        sessionId,
        content,
        sender,
        metadata,
      })
      .returning();

    // Update session's updatedAt timestamp
    await db
      .update(ChatSessions)
      .set({ updatedAt: new Date() })
      .where(eq(ChatSessions.id, sessionId));

    return NextResponse.json({ message: newMessage });
  } catch (error) {
    console.error("Error saving message:", error);
    return NextResponse.json(
      { error: "Failed to save message" },
      { status: 500 }
    );
  }
}
