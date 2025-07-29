import { db } from "@/config/db";
import { Users } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const user = await currentUser();

  try {
    const users = await db
      .select()
      .from(Users)
      // @ts-ignore
      .where(eq(Users.email, user?.primaryEmailAddress?.emailAddress));

    if (users?.length == 0) {
      const result = await db
        .insert(Users)
        .values({
          // @ts-ignore
          name: user?.fullName,
          email: user?.primaryEmailAddress?.emailAddress,
        })
        // @ts-ignore
        .returning({ Users });
      return NextResponse.json(result[0].Users);
    }

    return NextResponse.json(users[0]);
  } catch (error) {
    return NextResponse.json(error);
  }
}
