/**
 * Migration script to update all product images to use R2 URLs
 * Run this once to update all existing products in Firestore
 */

import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

const R2_PUBLIC_URL = 'https://pub-2abf1fca1a994517beb3fb3094.r2.dev';

/**
 * Convert local image path to R2 URL
 */
function convertToR2Url(localPath: string): string {
  if (!localPath) return '';

  // If already an R2 URL, return as-is
  if (localPath.startsWith('https://pub-')) {
    return localPath;
  }

  // Remove leading slash and /images/ prefix if present
  let path = localPath.replace(/^\//, '').replace(/^images\//, '');

  // Return full R2 URL
  return `${R2_PUBLIC_URL}/images/${path}`;
}

/**
 * Migrate all products to use R2 URLs
 */
export async function migrateProductImagesToR2() {
  try {
    console.log('🚀 Starting migration of product images to R2 URLs...\n');

    // Get all products from Firestore
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);

    const results = {
      total: snapshot.size,
      updated: 0,
      skipped: 0,
      failed: 0,
      errors: [] as string[],
    };

    console.log(`Found ${results.total} products\n`);

    // Update each product
    for (const productDoc of snapshot.docs) {
      const productData = productDoc.data();
      const productId = productDoc.id;

      try {
        // Check if product has images that need migration
        const hasLocalImages =
          (productData.img && productData.img.startsWith('/images')) ||
          (productData.imgs && productData.imgs.some((img: string) => img.startsWith('/images')));

        if (!hasLocalImages) {
          console.log(`⏭️  Skipping ${productId} (already using R2 URLs)`);
          results.skipped++;
          continue;
        }

        // Prepare update data
        const updates: any = {};

        // Update main image (img)
        if (productData.img && productData.img.startsWith('/images')) {
          updates.img = convertToR2Url(productData.img);
        }

        // Update image array (imgs)
        if (productData.imgs && Array.isArray(productData.imgs)) {
          updates.imgs = productData.imgs.map((img: string) => {
            if (img.startsWith('/images')) {
              return convertToR2Url(img);
            }
            return img;
          });
        }

        // Only update if there are changes
        if (Object.keys(updates).length > 0) {
          const productRef = doc(db, 'products', productId);
          await updateDoc(productRef, updates);

          console.log(`✅ Updated ${productId}`);
          if (updates.img) console.log(`   Main: ${updates.img}`);
          if (updates.imgs) console.log(`   Images: ${updates.imgs.length} updated`);

          results.updated++;
        } else {
          results.skipped++;
        }
      } catch (error) {
        console.error(`❌ Failed to update ${productId}:`, error);
        results.failed++;
        results.errors.push(`${productId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Print summary
    console.log('\n📊 Migration Summary:');
    console.log(`   Total products: ${results.total}`);
    console.log(`   ✅ Updated: ${results.updated}`);
    console.log(`   ⏭️  Skipped: ${results.skipped}`);
    console.log(`   ❌ Failed: ${results.failed}`);

    if (results.errors.length > 0) {
      console.log('\n⚠️  Errors:');
      results.errors.forEach((error) => console.log(`   - ${error}`));
    }

    console.log('\n✨ Migration complete!');

    return results;
  } catch (error) {
    console.error('💥 Migration failed:', error);
    throw error;
  }
}

// Example usage (uncomment to run):
// migrateProductImagesToR2()
//   .then((results) => console.log('Done!', results))
//   .catch((error) => console.error('Error:', error));
