// src/scripts/uploadImagesToStorage.ts
// This script uploads all local images to Firebase Storage
// Run this from a component or API route

import { uploadImageFromUrl } from '@/lib/firebase/storage';

// Product images to upload
const productImages = [
  // Product 1
  '/images/products/product-1-sm-1.png',
  '/images/products/product-1-sm-2.png',
  '/images/products/product-1-bg-1.png',
  '/images/products/product-1-bg-2.png',
  // Product 2
  '/images/products/product-2-sm-1.png',
  '/images/products/product-2-sm-2.png',
  '/images/products/product-2-bg-1.png',
  '/images/products/product-2-bg-2.png',
  // Product 3
  '/images/products/product-3-sm-1.png',
  '/images/products/product-3-sm-2.png',
  '/images/products/product-3-bg-1.png',
  '/images/products/product-3-bg-2.png',
  // Product 4
  '/images/products/product-4-sm-1.png',
  '/images/products/product-4-sm-2.png',
  '/images/products/product-4-bg-1.png',
  '/images/products/product-4-bg-2.png',
  // Product 5
  '/images/products/product-5-sm-1.png',
  '/images/products/product-5-sm-2.png',
  '/images/products/product-5-bg-1.png',
  '/images/products/product-5-bg-2.png',
  // Product 6
  '/images/products/product-6-sm-1.png',
  '/images/products/product-6-sm-2.png',
  '/images/products/product-6-bg-1.png',
  '/images/products/product-6-bg-2.png',
  // Product 7
  '/images/products/product-7-sm-1.png',
  '/images/products/product-7-sm-2.png',
  '/images/products/product-7-bg-1.png',
  '/images/products/product-7-bg-2.png',
  // Product 8
  '/images/products/product-8-sm-1.png',
  '/images/products/product-8-sm-2.png',
  '/images/products/product-8-bg-1.png',
  '/images/products/product-8-bg-2.png',
];

// Category images to upload
const categoryImages = [
  '/images/categories/categories-01.png',
  '/images/categories/categories-02.png',
  '/images/categories/categories-03.png',
  '/images/categories/categories-04.png',
  '/images/categories/categories-05.png',
  '/images/categories/categories-06.png',
  '/images/categories/categories-07.png',
];

/**
 * Upload product images to Firebase Storage
 */
export const uploadProductImages = async (): Promise<{
  success: boolean;
  uploaded: number;
  failed: number;
  urls: Record<string, string>;
}> => {
  const results: Record<string, string> = {};
  let uploaded = 0;
  let failed = 0;

  console.log('🚀 Starting product images upload...');

  for (const imagePath of productImages) {
    try {
      // Get the full URL for the image
      const imageUrl = `${window.location.origin}${imagePath}`;

      // Extract filename from path
      const filename = imagePath.split('/').pop() || '';

      // Create storage path
      const storagePath = `products/${filename}`;

      console.log(`📤 Uploading: ${filename}...`);

      // Upload to Firebase Storage
      const downloadUrl = await uploadImageFromUrl(imageUrl, storagePath);

      results[imagePath] = downloadUrl;
      uploaded++;

      console.log(`✅ Uploaded: ${filename}`);
    } catch (error) {
      console.error(`❌ Failed to upload ${imagePath}:`, error);
      failed++;
    }
  }

  console.log(`🎉 Product images upload completed! Uploaded: ${uploaded}, Failed: ${failed}`);

  return {
    success: failed === 0,
    uploaded,
    failed,
    urls: results,
  };
};

/**
 * Upload category images to Firebase Storage
 */
export const uploadCategoryImages = async (): Promise<{
  success: boolean;
  uploaded: number;
  failed: number;
  urls: Record<string, string>;
}> => {
  const results: Record<string, string> = {};
  let uploaded = 0;
  let failed = 0;

  console.log('🚀 Starting category images upload...');

  for (const imagePath of categoryImages) {
    try {
      // Get the full URL for the image
      const imageUrl = `${window.location.origin}${imagePath}`;

      // Extract filename from path
      const filename = imagePath.split('/').pop() || '';

      // Create storage path
      const storagePath = `categories/${filename}`;

      console.log(`📤 Uploading: ${filename}...`);

      // Upload to Firebase Storage
      const downloadUrl = await uploadImageFromUrl(imageUrl, storagePath);

      results[imagePath] = downloadUrl;
      uploaded++;

      console.log(`✅ Uploaded: ${filename}`);
    } catch (error) {
      console.error(`❌ Failed to upload ${imagePath}:`, error);
      failed++;
    }
  }

  console.log(`🎉 Category images upload completed! Uploaded: ${uploaded}, Failed: ${failed}`);

  return {
    success: failed === 0,
    uploaded,
    failed,
    urls: results,
  };
};

/**
 * Upload all images (products + categories) to Firebase Storage
 */
export const uploadAllImages = async () => {
  console.log('🚀 Starting complete image migration to Firebase Storage...\n');

  // Upload product images
  const productResults = await uploadProductImages();

  console.log('\n');

  // Upload category images
  const categoryResults = await uploadCategoryImages();

  console.log('\n📊 Migration Summary:');
  console.log(`Products - Uploaded: ${productResults.uploaded}, Failed: ${productResults.failed}`);
  console.log(`Categories - Uploaded: ${categoryResults.uploaded}, Failed: ${categoryResults.failed}`);

  return {
    products: productResults,
    categories: categoryResults,
    allUrls: {
      ...productResults.urls,
      ...categoryResults.urls,
    },
  };
};
