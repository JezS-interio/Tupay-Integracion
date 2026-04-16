// Test API route to verify R2 connection
import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

export async function GET() {
  try {
    // Initialize R2 client
    const r2Client = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT!,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });

    const bucketName = process.env.R2_BUCKET_NAME!;
    const publicUrl = process.env.R2_PUBLIC_URL!;

    // Test 1: Upload a simple test file
    const testContent = `R2 Connection Test - ${new Date().toISOString()}`;
    const testFileName = 'test/connection-test.txt';

    const uploadCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: testFileName,
      Body: testContent,
      ContentType: 'text/plain',
    });

    await r2Client.send(uploadCommand);

    // Test 2: List objects in the bucket
    const listCommand = new ListObjectsV2Command({
      Bucket: bucketName,
      MaxKeys: 10,
    });

    const listResult = await r2Client.send(listCommand);

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'R2 connection successful!',
      config: {
        bucketName,
        publicUrl,
        endpoint: process.env.R2_ENDPOINT,
      },
      test: {
        uploaded: testFileName,
        publicUrl: `${publicUrl}/${testFileName}`,
        objectsInBucket: listResult.Contents?.length || 0,
        recentObjects: listResult.Contents?.slice(0, 5).map(obj => obj.Key) || [],
      },
    });
  } catch (error) {
    console.error('R2 Connection Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error,
      },
      { status: 500 }
    );
  }
}
