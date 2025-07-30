import { type NextRequest, NextResponse } from "next/server";

import { ChatSessions } from "@/config/schema";
import { eq, desc } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/config/db";

// GET - Fetch all chat sessions for a user
export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userEmail = user.primaryEmailAddress?.emailAddress!;

    // In a real app, you'd get user email from Clerk user data
    // For now, using a placeholder - you should implement proper user email retrieval

    const sessions = await db
      .select()
      .from(ChatSessions)
      .where(eq(ChatSessions.userEmail, userEmail))
      .orderBy(desc(ChatSessions.updatedAt));

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Error fetching chat sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

// POST - Create a new chat session
export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userEmail = user.primaryEmailAddress?.emailAddress!;

    const { title } = await req.json();

    const [newSession] = await db
      .insert(ChatSessions)
      .values({
        userEmail,
        title: title || "New Conversation",
        status: "active",
      })
      .returning();

    return NextResponse.json({ session: newSession });
  } catch (error) {
    console.error("Error creating chat session:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}
