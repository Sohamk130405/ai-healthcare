import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { MedicalReports } from "@/config/schema";
import { eq, desc } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userEmail = user.primaryEmailAddress?.emailAddress; // Replace with actual email from Clerk

    if (!userEmail) {
      return NextResponse.json(
        { error: "User email is required" },
        { status: 400 }
      );
    }

    // Fetch medical records for the user
    const records = await db
      .select()
      .from(MedicalReports)
      .where(eq(MedicalReports.userEmail, userEmail))
      .orderBy(desc(MedicalReports.uploadedAt));

    // Parse insights from JSON strings back to arrays
    const processedRecords = records.map((record) => ({
      ...record,
      insights:
        typeof record.insights === "string"
          ? JSON.parse(record.insights)
          : record.insights || [],
    }));

    return NextResponse.json({
      success: true,
      records: processedRecords,
    });
  } catch (error: any) {
    console.error("Error fetching medical records:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch medical records" },
      { status: 500 }
    );
  }
}
