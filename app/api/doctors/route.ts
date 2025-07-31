import { db } from "@/config/db";
import { Doctors, Users } from "@/config/schema";
import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Join Doctors with Users to get name, city, phone, etc.
    const doctors = await db
      .select({
        id: Doctors.email, // or a separate id if you have one
        name: Users.name,
        email: Doctors.email,
        specialization: Doctors.specialization,
        qualifications: Doctors.qualifications,
        licenseNumber: Doctors.licenseNumber,
        consultationFee: Doctors.consultationFee,
        workingHours: Doctors.workingHours,
        phoneNumber: Users.phoneNumber,
        city: Users.city,
        rating: Doctors.rating,
        reviewCount: Doctors.reviewCount,
      })
      .from(Doctors)
      .leftJoin(Users, eq(Doctors.email, Users.email))
      .orderBy(desc(Doctors.rating));
    return NextResponse.json({ doctors });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch doctors" },
      { status: 500 }
    );
  }
}
