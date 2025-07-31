import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { Doctors } from "@/config/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { doctorEmail, rating } = await req.json();

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

    const doctor = (
      await db.select().from(Doctors).where(eq(Doctors.email, doctorEmail))
    )[0];

    if (!doctor) {
      return NextResponse.json(
        { success: false, error: "Doctor not found." },
        { status: 404 }
      );
    }

    const currentTotalRating = (doctor.rating || 0) * (doctor.reviewCount || 0);
    const newReviewCount = (doctor.reviewCount || 0) + 1;
    const newAverageRating = (currentTotalRating + rating) / newReviewCount;

    await db
      .update(Doctors)
      .set({
        rating: Number.parseFloat(newAverageRating.toFixed(2)),
        reviewCount: newReviewCount,
      })
      .where(eq(Doctors.email, doctorEmail));

    return NextResponse.json(
      { success: true, message: "Doctor rating updated successfully." },
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
