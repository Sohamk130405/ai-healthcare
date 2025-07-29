// api/parse-and-route/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, age, sex } = body;

    if (!text || !age || !sex) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1. Call the /parse endpoint to analyze the user's text
    const parseResponse = await fetch("https://api.infermedica.com/v3/parse", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "App-Id": process.env.INFERMEDICA_API_ID!,
        "App-Key": process.env.INFERMEDICA_API_KEY!,
      },
      body: JSON.stringify({
        text,
        age: { value: age },
        sex,
      }),
    });

    if (!parseResponse.ok) {
      const errorText = await parseResponse.text();
      return NextResponse.json(
        { error: `Infermedica API error (parse): ${errorText}` },
        { status: parseResponse.status }
      );
    }

    const parsedData = await parseResponse.json();
    const mentions = parsedData.mentions;

    if (mentions.length === 0) {
      return NextResponse.json({
        question: {
          type: "single",
          text: "I couldn't identify any symptoms. Could you please describe how you're feeling in more detail?",
          items: [],
        },
        conditions: [],
      });
    }

    // 2. Call the /diagnosis endpoint to start the interview
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
          evidence: mentions.map((mention: any) => ({
            id: mention.id,
            choice_id: mention.choice_id,
            source: "initial",
          })),
        }),
      }
    );

    if (!diagnosisResponse.ok) {
      const errorText = await diagnosisResponse.text();
      return NextResponse.json(
        { error: `Infermedica API error (diagnosis): ${errorText}` },
        { status: diagnosisResponse.status }
      );
    }

    const diagnosisData = await diagnosisResponse.json();

    // Return the first question and the initial evidence array to the frontend
    return NextResponse.json({
      question: diagnosisData.question,
      evidence: mentions.map((mention: any) => ({
        id: mention.id,
        choice_id: mention.choice_id,
        source: "initial",
      })),
      ...diagnosisData,
    });
  } catch (error) {
    console.error("Error in parse-and-diagnose route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
