import { db } from "@/config/db";
import { Users, Patients, Doctors } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { userType, ...formData } = body;

  try {
    // Update Users table
    await db
      .update(Users)
      .set({
        phoneNumber: formData.phone,
        isProfileCompleted: true,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        address: formData.address,
        city: formData.city,
      })
      // @ts-ignore
      .where(eq(Users.email, user.primaryEmailAddress?.emailAddress));

    if (userType === "patient") {
      // Upsert into Patients
      await db.insert(Patients).values({
        email: user.primaryEmailAddress?.emailAddress || "",
        medicalCondition: {
          pastIllnesses: formData.pastIllnesses,
          chronicConditions: formData.chronicConditions,
          surgeries: formData.surgeries,
          allergies: formData.allergies,
          vaccinationRecords: formData.vaccinationRecords,
          familyHistory: formData.familyHistory,
        },
      });
    } else if (userType === "doctor") {
      // Upsert into Doctors
      await db.insert(Doctors).values({
        email: user.primaryEmailAddress?.emailAddress || "",
        specialization: formData.specialization,
        qualifications: formData.education,
        licenseNumber: formData.licenseNumber,
        consultationFee: formData.consultationFee,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Profile update failed" },
      { status: 500 }
    );
  }
}
