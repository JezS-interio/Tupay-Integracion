// src/scripts/bulkImport.ts
// Bulk import products and banners from a folder
//
// FOLDER STRUCTURE:
// /import-data/
//   ├── products/
//   │   ├── images/
//   │   │   ├── product-1.jpg
//   │   │   ├── product-2.jpg
//   │   │   └── ...
//   │   └── products.json
//   └── banners/
//       ├── images/
//       │   ├── banner-1.jpg
//       │   ├── banner-2.jpg
//       │   └── ...
//       └── banners.json

import { uploadImage } from '@/lib/firebase/storage';
import { addProduct } from '@/lib/firebase/products';
import { addBanner } from '@/lib/firebase/banners';

interface ProductImport {
  title: string;
  description: string;
  price: number;
  discountedPrice?: number;
  category: string;
  stock: number;
  sku?: string;
  images: string[]; // Array of image filenames in /import-data/products/images/
  isActive?: boolean;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
}

interface BannerImport {
  title: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  badge?: string;
  image: string; // Image filename in /import-data/banners/images/
  order: number;
  isActive?: boolean;
}

/**
 * Upload a local image file to Firebase Storage
 */
async function uploadLocalImage(
  localPath: string,
  storagePath: string
): Promise<string> {
  try {
    // Fetch the image as blob from the public URL
    const response = await fetch(localPath);
    const blob = await response.blob();

    // Upload to Firebase Storage
    const downloadUrl = await uploadImage(blob, storagePath);
    return downloadUrl;
  } catch (error) {
    console.error(`Failed to upload ${localPath}:`, error);
    throw error;
  }
}

/**
 * Import products from JSON file
 */
export async function importProducts(
  productsData: ProductImport[]
): Promise<{ success: number; failed: number; errors: string[] }> {
  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  console.log(`📦 Starting import of ${productsData.length} products...`);

  for (const productData of productsData) {
    try {
      console.log(`\n📤 Processing: ${productData.title}`);

      // Upload images
      const thumbnails: string[] = [];
      const previews: string[] = [];

      for (let i = 0; i < productData.images.length; i++) {
        const imageFilename = productData.images[i];
        const localImagePath = `/import-data/products/images/${imageFilename}`;

        console.log(`  📷 Uploading image ${i + 1}/${productData.images.length}: ${imageFilename}`);

        // Upload to Firebase Storage
        const storagePath = `products/imported/${Date.now()}-${imageFilename}`;
        const imageUrl = await uploadLocalImage(
          window.location.origin + localImagePath,
          storagePath
        );

        // Add to thumbnails and previews
        thumbnails.push(imageUrl);
        previews.push(imageUrl);

        console.log(`  ✅ Uploaded: ${imageFilename}`);
      }

      // Generate slug
      const slug = productData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Create product
      const product = {
        title: productData.title,
        description: productData.description,
        price: productData.price,
        discountedPrice: productData.discountedPrice || productData.price,
        rating: 0,
        category: productData.category,
        stock: productData.stock,
        sku: productData.sku || `PRD-${Date.now()}`,
        slug,
        imgs: {
          thumbnails,
          previews,
        },
        isActive: productData.isActive !== false,
        isFeatured: productData.isFeatured || false,
        isNewArrival: productData.isNewArrival || false,
        isBestSeller: productData.isBestSeller || false,
      };

      const productId = await addProduct(product);

      if (productId) {
        console.log(`✅ Product created with ID: ${productId}`);
        success++;
      } else {
        console.error(`❌ Failed to create product: ${productData.title}`);
        errors.push(`Failed to create product: ${productData.title}`);
        failed++;
      }
    } catch (error: any) {
      console.error(`❌ Error processing ${productData.title}:`, error);
      errors.push(`${productData.title}: ${error.message}`);
      failed++;
    }
  }

  console.log(`\n✅ Import complete! Success: ${success}, Failed: ${failed}`);

  return { success, failed, errors };
}

/**
 * Import banners from JSON file
 */
export async function importBanners(
  bannersData: BannerImport[]
): Promise<{ success: number; failed: number; errors: string[] }> {
  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  console.log(`🎨 Starting import of ${bannersData.length} banners...`);

  for (const bannerData of bannersData) {
    try {
      console.log(`\n📤 Processing banner: ${bannerData.title}`);

      // Upload image
      const localImagePath = `/import-data/banners/images/${bannerData.image}`;
      console.log(`  📷 Uploading: ${bannerData.image}`);

      const storagePath = `banners/imported/${Date.now()}-${bannerData.image}`;
      const imageUrl = await uploadLocalImage(
        window.location.origin + localImagePath,
        storagePath
      );

      console.log(`  ✅ Uploaded: ${bannerData.image}`);

      // Create banner
      const banner = {
        title: bannerData.title,
        subtitle: bannerData.subtitle,
        description: bannerData.description,
        buttonText: bannerData.buttonText,
        buttonLink: bannerData.buttonLink,
        badge: bannerData.badge,
        imageUrl,
        order: bannerData.order,
        isActive: bannerData.isActive !== false,
      };

      const bannerId = await addBanner(banner);

      if (bannerId) {
        console.log(`✅ Banner created with ID: ${bannerId}`);
        success++;
      } else {
        console.error(`❌ Failed to create banner: ${bannerData.title}`);
        errors.push(`Failed to create banner: ${bannerData.title}`);
        failed++;
      }
    } catch (error: any) {
      console.error(`❌ Error processing ${bannerData.title}:`, error);
      errors.push(`${bannerData.title}: ${error.message}`);
      failed++;
    }
  }

  console.log(`\n✅ Import complete! Success: ${success}, Failed: ${failed}`);

  return { success, failed, errors };
}
