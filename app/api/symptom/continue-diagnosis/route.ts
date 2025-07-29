import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { age, sex, evidence } = body;

    if (!age || !sex || !evidence) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const diagnosisResponse = await fetch(
      "https://api.infermedica.com/v3/diagnosis",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "App-Id": process.env.INFERMEDICA_API_ID!,
          "App-Key": process.env.INFERMEDICA_API_KEY!,
        },
        body: JSON.stringify({
          sex: sex,
          age: {
            value: age,
          },
          evidence: evidence,
        }),
      }
    );

    if (!diagnosisResponse.ok) {
      const errorText = await diagnosisResponse.text();
      return NextResponse.json(
        { error: `Infermedica API error : ${errorText}` },
        { status: diagnosisResponse.status }
      );
    }

    const diagnosisData = await diagnosisResponse.json();

    return NextResponse.json(diagnosisData);
  } catch (error) {
    console.error("Error in continue-diagnosis route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
