// src/lib/firebase/storage.ts
// Using Cloudflare R2 (S3-compatible) instead of Firebase Storage
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

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

/**
 * Upload an image file to Cloudflare R2
 * @param file - The file to upload
 * @param path - The storage path (e.g., 'products/product-1.png')
 * @returns The public URL of the uploaded file
 */
export const uploadImage = async (
  file: File | Blob,
  path: string
): Promise<string> => {
  try {
    // Get arrayBuffer from File/Blob (works in browser)
    const arrayBuffer = await file.arrayBuffer();

    // Determine content type
    const contentType = file instanceof File ? file.type : 'application/octet-stream';

    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: path,
      Body: new Uint8Array(arrayBuffer),
      ContentType: contentType,
    });

    await r2Client.send(command);

    // Return public URL
    const publicUrl = `${PUBLIC_URL}/${path}`;
    return publicUrl;
  } catch (error) {
    console.error('Error uploading image to R2:', error);
    throw error;
  }
};

/**
 * Upload an image from a URL (useful for migrating existing images)
 * @param imageUrl - The URL of the image to upload
 * @param storagePath - The destination path in R2
 * @returns The public URL of the uploaded file
 */
export const uploadImageFromUrl = async (
  imageUrl: string,
  storagePath: string
): Promise<string> => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    return await uploadImage(blob, storagePath);
  } catch (error) {
    console.error('Error uploading image from URL:', error);
    throw error;
  }
};

/**
 * Delete an image from R2
 * @param path - The storage path of the file to delete
 */
export const deleteImage = async (path: string): Promise<void> => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: path,
    });

    await r2Client.send(command);
  } catch (error) {
    console.error('Error deleting image from R2:', error);
    throw error;
  }
};

/**
 * Get public URL for an existing image
 * @param path - The storage path of the file
 * @returns The public URL
 */
export const getImageUrl = async (path: string): Promise<string> => {
  // For R2, we just construct the public URL
  // No need to fetch from the API
  return `${PUBLIC_URL}/${path}`;
};

/**
 * List all files in a storage directory
 * @param path - The storage directory path
 * @returns Array of file paths
 */
export const listFiles = async (path: string) => {
  try {
    // Note: Listing files requires ListObjectsV2Command
    // For now, return empty array - implement if needed
    console.warn('listFiles not implemented for R2 yet');
    return [];
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
};
