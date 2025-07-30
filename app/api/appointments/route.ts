import { db } from "@/config/db";
import { Appointments } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq, and, or, lte, gt, lt, gte } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    doctorEmail,
    date,
    startTime,
    endTime,
    reason,
    notes,
    status = "pending",
  } = body;

  // Basic validation
  if (!doctorEmail || !date || !startTime || !endTime || !reason) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Check for slot conflict
  const conflict = await db
    .select()
    .from(Appointments)
    .where(
      and(
        eq(Appointments.doctorEmail, doctorEmail),
        eq(Appointments.date, date),
        or(
          // Overlapping start
          and(
            lte(Appointments.startTime, startTime),
            gt(Appointments.endTime, startTime)
          ),
          // Overlapping end
          and(
            lt(Appointments.startTime, endTime),
            gte(Appointments.endTime, endTime)
          ),
          // Enclosed
          and(
            gte(Appointments.startTime, startTime),
            lte(Appointments.endTime, endTime)
          )
        ),
        eq(Appointments.status, "pending")
      )
    );

  if (conflict.length > 0) {
    return NextResponse.json(
      { error: "This time slot is already booked." },
      { status: 409 }
    );
  }

  // Insert appointment
  await db.insert(Appointments).values({
    patientEmail: user.primaryEmailAddress?.emailAddress!,
    doctorEmail,
    date,
    startTime,
    endTime,
    reason,
    notes,
    status,
  });

  return NextResponse.json({ success: true });
}


