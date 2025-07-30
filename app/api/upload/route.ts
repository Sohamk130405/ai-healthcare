import { type NextRequest, NextResponse } from "next/server";
import { S3 } from "aws-sdk";
import { db } from "@/config/db";
import { medicalReport } from "@/config/schema";

const s3 = new S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

export async function POST(req: NextRequest) {
  // Parse multipart/form-data
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const userEmail = formData.get("userEmail") as string;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  // Read file buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Generate unique file name
  const fileName = `${Date.now()}-${file.name}`;

  try {
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

    const fileUrl = uploadResult.Location;

    // Call Mistral AI OCR API
    const mistralResponse = await fetch("https://api.mistral.ai/v1/ocr", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: "mistral-ocr-latest",
        id: "0",
        document: {
          document_url: fileUrl,
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
      const errorData = await mistralResponse.json();
      throw new Error(`Mistral AI OCR failed: ${JSON.stringify(errorData)}`);
    }

    const ocrData = await mistralResponse.json();

    // Process the Mistral AI response
    const processedData = {
      pages: ocrData.pages || [],
      documentAnnotation: ocrData.document_annotation
        ? JSON.parse(ocrData.document_annotation)
        : null,
      model: ocrData.model,
      usageInfo: ocrData.usage_info,
      fileUrl: fileUrl,
      fileName: file.name,
      uploadDate: new Date().toISOString(),
    };

    // Save to database if userEmail is provided
    if (userEmail) {
      await db.insert(medicalReport).values({
        email: userEmail,
        title: file.name,
        url: fileUrl,
        ocr: ocrData,
      });
    }

    return NextResponse.json({
      url: fileUrl,
      ocrResults: processedData,
    });
  } catch (err: any) {
    console.error("Upload or OCR error:", err);
    return NextResponse.json(
      { error: err.message || "Processing failed" },
      { status: 500 }
    );
  }
}
