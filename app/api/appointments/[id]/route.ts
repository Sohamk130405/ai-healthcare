import { db } from "@/config/db";
import { Appointments } from "@/config/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await req.json();
  const { status, notes } = body;

  if (!status) {
    return NextResponse.json(
      { success: false, error: "Status is required" },
      { status: 400 }
    );
  }

  try {
    const result = await db
      .update(Appointments)
      .set({
        status,
        ...(notes !== undefined ? { notes } : {}),
      })
      .where(eq(Appointments.id, Number(id)));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update appointment",
      },
      { status: 500 }
    );
  }
}
