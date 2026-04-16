// src/scripts/migrateProducts.ts
// Run this script ONCE to migrate products to Firestore
// Usage: Create a page that runs this on button click, or run via API route

import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase/config';
import shopData from '../components/Shop/shopData';
import { FirestoreProduct } from '@/types/product';

// Category mapping based on product titles
const getCategoryFromTitle = (title: string): string => {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('gamepad') || lowerTitle.includes('mouse')) return 'Accessories';
  if (lowerTitle.includes('iphone')) return 'Smartphones';
  if (lowerTitle.includes('imac') || lowerTitle.includes('macbook')) return 'Computers';
  if (lowerTitle.includes('watch')) return 'Wearables';
  if (lowerTitle.includes('ipad')) return 'Tablets';
  if (lowerTitle.includes('router')) return 'Networking';
  return 'Electronics';
};

// Generate slug from title
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// Generate SKU
const generateSKU = (id: number, category: string): string => {
  const categoryCode = category.substring(0, 3).toUpperCase();
  return `${categoryCode}-${String(id).padStart(4, '0')}`;
};

// Sample descriptions
const descriptions = [
  'High-quality gaming accessory with ergonomic design and responsive controls. Perfect for extended gaming sessions.',
  'Premium smartphone with advanced features, stunning display, and powerful performance. Stay connected in style.',
  'Professional-grade computer with cutting-edge technology. Ideal for creative work and productivity.',
  'Portable and powerful device with exceptional battery life. Your perfect companion for work and entertainment.',
  'Advanced wearable technology with health tracking and smart features. Monitor your fitness goals effortlessly.',
  'Premium peripheral designed for professionals. Enhanced productivity with superior build quality.',
  'Versatile tablet with stunning display and powerful performance. Perfect for creativity and entertainment.',
  'High-performance networking device with advanced features. Reliable connectivity for your home or office.',
];

/**
 * Convert local image paths to Firebase Storage URLs
 * @param imgs - Product images object with local paths
 * @param urlMapping - Mapping of local paths to Firebase Storage URLs
 * @returns Updated images object with Firebase Storage URLs
 */
const convertImagesToStorageUrls = (
  imgs: { thumbnails?: string[]; previews: string[] } | undefined,
  urlMapping: Record<string, string>
): { thumbnails?: string[]; previews: string[] } | undefined => {
  if (!imgs) return undefined;

  return {
    thumbnails: imgs.thumbnails?.map((path) => urlMapping[path] || path),
    previews: imgs.previews.map((path) => urlMapping[path] || path),
  };
};

export const migrateProducts = async (
  urlMapping?: Record<string, string>
): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('🚀 Starting product migration...');

    const productsRef = collection(db, 'products');

    for (let i = 0; i < shopData.length; i++) {
      const product = shopData[i];
      const category = getCategoryFromTitle(product.title);
      const slug = generateSlug(product.title);
      const sku = generateSKU(product.id, category);

      // Convert images to Firebase Storage URLs if mapping is provided
      const imgs = urlMapping
        ? convertImagesToStorageUrls(product.imgs, urlMapping)
        : product.imgs;

      const firestoreProduct: Omit<FirestoreProduct, 'id'> = {
        title: product.title,
        description: descriptions[i] || 'Premium quality product with excellent features.',
        price: product.price,
        discountedPrice: product.discountedPrice,
        rating: product.rating,
        category,
        stock: Math.floor(Math.random() * 50) + 10, // Random stock between 10-60
        sku,
        slug,
        imgs,
        isActive: true,
        isFeatured: i < 3, // First 3 products are featured
        isNewArrival: i < 4, // First 4 products are new arrivals
        isBestSeller: [0, 2, 5, 6].includes(i), // Products 1, 3, 6, 7 are best sellers
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Use product ID as document ID for consistency
      const docRef = doc(productsRef, String(product.id));
      await setDoc(docRef, firestoreProduct);

      console.log(`✅ Migrated: ${product.title} (ID: ${product.id})`);
    }

    const usingStorage = urlMapping ? ' with Firebase Storage URLs' : '';
    console.log(`🎉 Migration completed successfully${usingStorage}!`);
    return {
      success: true,
      message: `Successfully migrated ${shopData.length} products to Firestore${usingStorage}!`,
    };
  } catch (error: any) {
    console.error('❌ Migration failed:', error);
    return {
      success: false,
      message: `Migration failed: ${error.message}`,
    };
  }
};
