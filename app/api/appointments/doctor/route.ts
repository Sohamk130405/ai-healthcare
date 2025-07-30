import { db } from "@/config/db";
import { Appointments, Users } from "@/config/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const doctorEmail = searchParams.get("doctorEmail");

  if (!doctorEmail) {
    return NextResponse.json(
      { success: false, error: "Missing doctorEmail" },
      { status: 400 }
    );
  }

  try {
    // Join appointments with users to get patient name
    const appointments = await db
      .select({
        id: Appointments.id,
        patientEmail: Appointments.patientEmail,
        patientName: Users.name,
        date: Appointments.date,
        startTime: Appointments.startTime,
        endTime: Appointments.endTime,
        status: Appointments.status,
        reason: Appointments.reason,
        notes: Appointments.notes,
        createdAt: Appointments.createdAt,
      })
      .from(Appointments)
      .leftJoin(Users, eq(Appointments.patientEmail, Users.email))
      .where(eq(Appointments.doctorEmail, doctorEmail))
      .orderBy(Appointments.date, Appointments.startTime);

    return NextResponse.json({ success: true, appointments });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch appointments",
      },
      { status: 500 }
    );
  }
}

