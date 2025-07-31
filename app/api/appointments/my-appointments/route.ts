import { db } from "@/config/db";
import { Appointments, Users, Doctors } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    // Join appointments with doctors and users to get doctor name and specialization
    const appointments = await db
      .select({
        id: Appointments.id,
        doctorName: Users.name,
        doctorSpecialization: Doctors.specialization,
        date: Appointments.date,
        startTime: Appointments.startTime,
        endTime: Appointments.endTime,
        status: Appointments.status,
        reason: Appointments.reason,
        hasRated: Appointments.hasRated,
        rating: Doctors.rating,
        reviewCount: Doctors.reviewCount,
        doctorEmail: Appointments.doctorEmail,
      })
      .from(Appointments)
      .leftJoin(Doctors, eq(Appointments.doctorEmail, Doctors.email))
      .leftJoin(Users, eq(Appointments.doctorEmail, Users.email))
      .where(
        eq(Appointments.patientEmail, user.primaryEmailAddress?.emailAddress!)
      )
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
