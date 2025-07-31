import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { Doctors, Appointments } from "@/config/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { doctorEmail, rating, appointmentId } = await req.json();

    if (
      !doctorEmail ||
      typeof rating !== "number" ||
      rating < 1 ||
      rating > 5
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid input: doctorEmail and rating (1-5) are required.",
        },
        { status: 400 }
      );
    }

    // Check if doctor exists
    const doctor = (
      await db.select().from(Doctors).where(eq(Doctors.email, doctorEmail))
    )[0];

    if (!doctor) {
      return NextResponse.json(
        { success: false, error: "Doctor not found." },
        { status: 404 }
      );
    }

    // Update appointment to mark as rated if appointmentId is provided
    if (appointmentId) {
      await db
        .update(Appointments)
        .set({ hasRated: true })
        .where(eq(Appointments.id, appointmentId));
    }

    // Calculate new average rating
    const currentTotalRating = (doctor.rating || 0) * (doctor.reviewCount || 0);
    const newReviewCount = (doctor.reviewCount || 0) + 1;
    const newAverageRating = (currentTotalRating + rating) / newReviewCount;

    // Update doctor's rating and review count
    await db
      .update(Doctors)
      .set({
        rating: Number.parseFloat(newAverageRating.toFixed(2)),
        reviewCount: newReviewCount,
      })
      .where(eq(Doctors.email, doctorEmail));

    return NextResponse.json(
      {
        success: true,
        message: "Doctor rating updated successfully.",
        newRating: Number.parseFloat(newAverageRating.toFixed(2)),
        reviewCount: newReviewCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error rating doctor:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update doctor rating." },
      { status: 500 }
    );
  }
}
