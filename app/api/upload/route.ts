import { NextRequest, NextResponse } from "next/server";
import { S3 } from "aws-sdk";
import { getAuth } from "@clerk/nextjs/server";

const s3 = new S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

export async function POST(req: NextRequest) {
  // Parse multipart/form-data
  const formData = await req.formData();
  const file = formData.get("file") as File;
  
  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  // Read file buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Generate unique file name
  const fileName = `${Date.now()}-${file.name}`;

  // Upload to S3
  try {
    const uploadResult = await s3
      .upload({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
        ACL: "public-read",
      })
      .promise();

    return NextResponse.json({ url: uploadResult.Location });
  } catch (err: any) {
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
