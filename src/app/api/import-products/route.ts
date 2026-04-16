import { NextResponse } from 'next/server';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import productsData from '../../../../products-import.json';

const R2_PUBLIC_URL = 'https://pub-2abf1fca1a994517beb3fb17c83b3094.r2.dev';

/**
 * Convert image filename to R2 URL
 */
function imageToR2Url(filename: string): string {
  // Assumes images were uploaded to /images/ folder in R2
  // Filenames like "iphone-15-pro-1.jpg" become full R2 URLs
  return `${R2_PUBLIC_URL}/images/products/${filename}`;
}

export async function POST() {
  const results = {
    total: 0,
    imported: 0,
    failed: 0,
    errors: [] as string[],
  };

  try {
    console.log('🚀 Starting product import with R2 URLs...\n');

    results.total = productsData.length;

    const productsRef = collection(db, 'products');

    for (const product of productsData) {
      try {
        // Convert image filenames to R2 URLs
        const r2Images = product.images.map((filename: string) => imageToR2Url(filename));

        // Prepare product data for Firestore
        const productData = {
          title: product.title,
          description: product.description,
          price: product.price,
          discountedPrice: product.discountedPrice,
          category: product.category,
          stock: product.stock,
          sku: product.sku,
          img: r2Images[0] || '', // Main image (first one)
          imgs: {
            previews: r2Images, // Components expect imgs.previews structure
          },
          isActive: product.isActive,
          isFeatured: product.isFeatured,
          isNewArrival: product.isNewArrival,
          isBestSeller: product.isBestSeller,
          rating: 0,
          createdAt: new Date().toISOString(),
        };

        // Add to Firestore
        await addDoc(productsRef, productData);

        console.log(`✅ Imported: ${product.title}`);
        console.log(`   Images: ${r2Images[0]}`);

        results.imported++;
      } catch (error) {
        console.error(`❌ Failed to import ${product.title}:`, error);
        results.failed++;
        results.errors.push(`${product.title}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    console.log('\n📊 Import Summary:');
    console.log(`   Total products: ${results.total}`);
    console.log(`   ✅ Imported: ${results.imported}`);
    console.log(`   ❌ Failed: ${results.failed}`);

    return NextResponse.json({
      success: results.failed === 0,
      message: `Imported ${results.imported} of ${results.total} products with R2 URLs`,
      results,
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Import failed',
        results,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to import products',
    endpoint: '/api/import-products',
    method: 'POST',
  });
}
