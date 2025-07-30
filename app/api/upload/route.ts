import { type NextRequest, NextResponse } from "next/server";
import { S3 } from "aws-sdk";
import { db } from "@/config/db";
import { MedicalReports } from "@/config/schema";

const s3 = new S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

export async function POST(req: NextRequest) {
  try {
    // Parse multipart/form-data
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const userEmail = formData.get("userEmail") as string;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!userEmail) {
      return NextResponse.json(
        { error: "User email is required" },
        { status: 400 }
      );
    }

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate unique file name
    const fileName = `${Date.now()}-${file.name}`;

    // Upload to S3
    const uploadResult = await s3
      .upload({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
        ACL: "public-read",
      })
      .promise();

    // Call Mistral AI OCR API
    const mistralResponse = await fetch("https://api.mistral.ai/v1/ocr", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistral-ocr-latest",
        id: "0",
        document: {
          document_url: uploadResult.Location,
        },
        include_image_base64: true,
        image_limit: 0,
        image_min_size: 0,
        bbox_annotation_format: {
          type: "text",
          json_schema: {
            name: "string",
            description: "string",
            schema: {},
            strict: false,
          },
        },
        document_annotation_format: {
          type: "json_schema",
          json_schema: {
            name: "string",
            description: "string",
            schema: {},
            strict: false,
          },
        },
      }),
    });

    if (!mistralResponse.ok) {
      throw new Error(`Mistral API error: ${mistralResponse.statusText}`);
    }

    const ocrResult = await mistralResponse.json();

    // Extract text from all pages
    const extractedText =
      ocrResult.pages?.map((page: any) => page.markdown).join("\n\n") || "";

    // Generate insights based on document content
    const insights = generateInsights(
      extractedText,
      ocrResult.document_annotation
    );

    // Determine report type based on content
    const reportType = determineReportType(extractedText, file.name);

    // Save to database
    const savedRecord = await db
      .insert(MedicalReports)
      .values({
        reportName: file.name,
        reportUrl: uploadResult.Location,
        reportType: reportType,
        fileSize: file.size,
        fileType: file.type,
        extractedText: extractedText,
        structuredData: JSON.stringify(ocrResult.document_annotation),
        insights: insights,
        userEmail: userEmail,
      })
      .returning();

    return NextResponse.json({
      success: true,
      url: uploadResult.Location,
      record: savedRecord[0],
      ocrResult: {
        extractedText,
        structuredData: ocrResult.document_annotation,
        insights,
        pages: ocrResult.pages,
      },
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}

function generateInsights(
  extractedText: string,
  structuredData: any
): string[] {
  const insights: string[] = [];
  const text = extractedText.toLowerCase();

  // Medical insights
  if (
    text.includes("blood") ||
    text.includes("hemoglobin") ||
    text.includes("glucose")
  ) {
    insights.push("Blood test results detected - monitor values regularly");
  }

  if (text.includes("normal") && text.includes("range")) {
    insights.push("Results appear to be within normal ranges");
  }

  if (text.includes("high") || text.includes("elevated")) {
    insights.push("Some elevated values detected - consult with your doctor");
  }

  if (text.includes("prescription") || text.includes("medication")) {
    insights.push(
      "Medication information found - follow dosage instructions carefully"
    );
  }

  // Educational insights
  if (
    text.includes("tutorial") ||
    text.includes("assignment") ||
    text.includes("question")
  ) {
    insights.push(
      "Educational content detected - review for learning purposes"
    );
  }

  if (insights.length === 0) {
    insights.push(
      "Document processed successfully - review content for important information"
    );
  }

  return insights;
}

function determineReportType(extractedText: string, fileName: string): string {
  const text = extractedText.toLowerCase();
  const name = fileName.toLowerCase();

  if (text.includes("blood") || text.includes("lab") || name.includes("lab")) {
    return "lab_report";
  }

  if (
    text.includes("prescription") ||
    text.includes("medication") ||
    name.includes("prescription")
  ) {
    return "prescription";
  }

  if (
    text.includes("x-ray") ||
    name.includes("xray") ||
    name.includes("x-ray")
  ) {
    return "x-ray";
  }

  if (text.includes("mri") || name.includes("mri")) {
    return "mri";
  }

  if (
    text.includes("tutorial") ||
    text.includes("assignment") ||
    text.includes("dbms")
  ) {
    return "educational";
  }

  if (
    text.includes("medical") ||
    text.includes("doctor") ||
    text.includes("patient")
  ) {
    return "medical";
  }

  return "general";
}
