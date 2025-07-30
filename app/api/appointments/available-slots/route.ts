import { db } from "@/config/db";
import { Appointments } from "@/config/schema";
import { and, eq, ne } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const doctorEmail = searchParams.get("doctorEmail");
  const date = searchParams.get("date");

  if (!doctorEmail || !date) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  // Get all appointments for this doctor and date that are not cancelled
  const appointments = await db
    .select({
      startTime: Appointments.startTime,
      endTime: Appointments.endTime,
    })
    .from(Appointments)
    .where(
      and(
        eq(Appointments.doctorEmail, doctorEmail),
        ne(Appointments.status, "cancelled"),
        eq(Appointments.date, date)
      )
    );

  // Return array of booked time ranges
  return NextResponse.json({ appointments });
}
