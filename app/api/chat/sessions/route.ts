import { type NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { ChatSessions } from "@/config/schema";
import { eq, desc } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

// GET - Fetch all chat sessions for the authenticated user
export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userEmail = user.primaryEmailAddress?.emailAddress!; // Replace with actual email from Clerk

    const sessions = await db
      .select()
      .from(ChatSessions)
      .where(eq(ChatSessions.userEmail, userEmail))
      .orderBy(desc(ChatSessions.updatedAt));

    return NextResponse.json({ success: true, sessions });
  } catch (error) {
    console.error("Error fetching chat sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat sessions" },
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
    const userEmail = user.primaryEmailAddress?.emailAddress!; // Replace with actual email from Clerk
    const { title, medicalReportIds } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const [newSession] = await db
      .insert(ChatSessions)
      .values({
        userEmail,
        title,
        medicalReportIds: medicalReportIds || null, // Store selected report IDs
      })
      .returning();

    return NextResponse.json({ success: true, session: newSession });
  } catch (error) {
    console.error("Error creating chat session:", error);
    return NextResponse.json(
      { error: "Failed to create chat session" },
      { status: 500 }
    );
  }
}
