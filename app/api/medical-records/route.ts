import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { MedicalReports } from "@/config/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userEmail = searchParams.get("userEmail");

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
