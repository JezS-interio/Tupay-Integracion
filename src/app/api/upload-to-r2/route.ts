// API route to upload all local images to R2
import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
// Helper function to get content type from file extension
function getContentType(filePath: string): string {
  const ext = filePath.toLowerCase().split('.').pop();
  const types: Record<string, string> = {
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
  };
  return types[ext || ''] || 'application/octet-stream';
}

// Initialize R2 client
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME!;
const PUBLIC_URL = process.env.R2_PUBLIC_URL!;

// Recursively get all image files
async function getAllImageFiles(dir: string, baseDir: string = dir): Promise<string[]> {
  const files: string[] = [];

  try {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        const subFiles = await getAllImageFiles(fullPath, baseDir);
        files.push(...subFiles);
      } else if (entry.isFile()) {
        // Only include image files
        const ext = entry.name.toLowerCase();
        if (ext.endsWith('.png') || ext.endsWith('.jpg') || ext.endsWith('.jpeg') || ext.endsWith('.gif') || ext.endsWith('.webp')) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
  }

  return files;
}

export async function POST() {
  const results = {
    success: 0,
    failed: 0,
    total: 0,
    uploads: [] as { file: string; url: string; status: 'success' | 'failed'; error?: string }[],
  };

  try {
    // Get all image files from public/images
    const publicImagesDir = join(process.cwd(), 'public', 'images');
    const imageFiles = await getAllImageFiles(publicImagesDir);

    results.total = imageFiles.length;

    console.log(`📤 Starting upload of ${imageFiles.length} images to R2...`);

    // Upload each file
    for (const filePath of imageFiles) {
      try {
        // Read file
        const fileBuffer = await readFile(filePath);

        // Get relative path for R2 key (e.g., "products/product-1.png")
        const relativePath = filePath
          .replace(publicImagesDir, '')
          .replace(/\\/g, '/')
          .replace(/^\//, '');

        // Determine content type
        const contentType = getContentType(filePath);

        // Upload to R2
        const command = new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: `images/${relativePath}`,
          Body: fileBuffer,
          ContentType: contentType,
        });

        await r2Client.send(command);

        const publicUrl = `${PUBLIC_URL}/images/${relativePath}`;

        results.success++;
        results.uploads.push({
          file: relativePath,
          url: publicUrl,
          status: 'success',
        });

        console.log(`✅ Uploaded: ${relativePath}`);
      } catch (error) {
        results.failed++;
        results.uploads.push({
          file: filePath,
          url: '',
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        console.error(`❌ Failed: ${filePath}`, error);
      }
    }

    console.log(`\n🎉 Upload complete! Success: ${results.success}, Failed: ${results.failed}`);

    return NextResponse.json({
      success: results.failed === 0,
      message: `Uploaded ${results.success} of ${results.total} images`,
      results,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        results,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to upload images to R2',
    endpoint: '/api/upload-to-r2',
    method: 'POST',
  });
}
