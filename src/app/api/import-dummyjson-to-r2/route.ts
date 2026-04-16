import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, getDocs, deleteDoc } from 'firebase/firestore';

interface DummyJSONProduct {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  sku: string;
  thumbnail: string;
  images: string[];
}

const CATEGORIES_TO_FETCH = [
  'smartphones',
  'laptops',
  'tablets',
  'mens-watches',
  'womens-watches',
  'mobile-accessories'
];

// Initialize R2 client
const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://pub-2abf1fca1a994517beb3fb17c83b3094.r2.dev';
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'intitech-products';

// Function to download image from URL
async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${url}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Function to get content type from URL
function getContentType(url: string): string {
  if (url.endsWith('.webp')) return 'image/webp';
  if (url.endsWith('.png')) return 'image/png';
  if (url.endsWith('.jpg') || url.endsWith('.jpeg')) return 'image/jpeg';
  if (url.endsWith('.gif')) return 'image/gif';
  return 'application/octet-stream';
}

// Function to upload image to R2
async function uploadToR2(buffer: Buffer, key: string, contentType: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await s3Client.send(command);
  return `${R2_PUBLIC_URL}/${key}`;
}

// Function to download and upload a single image
async function processImage(imageUrl: string, productId: number, index: number, isThumb: boolean = false): Promise<string> {
  const buffer = await downloadImage(imageUrl);
  const contentType = getContentType(imageUrl);
  const extension = imageUrl.split('.').pop() || 'webp';

  const filename = isThumb
    ? `product-${productId}-thumb.${extension}`
    : `product-${productId}-${index}.${extension}`;

  const key = `images/products/${filename}`;

  return await uploadToR2(buffer, key, contentType);
}

// Fetch products from DummyJSON
async function fetchDummyJSONProducts() {
  const allProducts: DummyJSONProduct[] = [];

  for (const category of CATEGORIES_TO_FETCH) {
    const response = await fetch(`https://dummyjson.com/products/category/${category}`);
    const data = await response.json();
    allProducts.push(...data.products);
  }

  return allProducts;
}

// Transform product with R2 URLs
function transformToFirestoreProduct(dummyProduct: DummyJSONProduct, r2Thumbnail: string, r2Images: string[]) {
  const discountedPrice = dummyProduct.price * (1 - dummyProduct.discountPercentage / 100);

  const categoryMap: Record<string, string> = {
    'smartphones': 'Smartphones',
    'laptops': 'Computers',
    'tablets': 'Tablets',
    'mens-watches': 'Wearables',
    'womens-watches': 'Wearables',
    'mobile-accessories': 'Accessories'
  };

  return {
    title: dummyProduct.title,
    description: dummyProduct.description,
    price: parseFloat(dummyProduct.price.toFixed(2)),
    discountedPrice: parseFloat(discountedPrice.toFixed(2)),
    category: categoryMap[dummyProduct.category] || 'Electronics',
    stock: dummyProduct.stock,
    sku: dummyProduct.sku,
    rating: dummyProduct.rating,
    brand: dummyProduct.brand,
    img: r2Thumbnail,
    imgs: {
      thumbnails: r2Images,
      previews: r2Images
    },
    isActive: true,
    isFeatured: dummyProduct.rating >= 4.5,
    isNewArrival: dummyProduct.id % 3 === 0,
    isBestSeller: dummyProduct.rating >= 4.7,
    createdAt: new Date().toISOString()
  };
}

export async function POST() {
  try {
    const logs: string[] = [];

    logs.push('Starting DummyJSON to R2 import...\n');

    // Step 1: Fetch products from DummyJSON
    logs.push('Step 1: Fetching products from DummyJSON...');
    const dummyProducts = await fetchDummyJSONProducts();
    logs.push(`✓ Fetched ${dummyProducts.length} products\n`);

    // Step 2: Delete existing products
    logs.push('Step 2: Deleting existing products...');
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    logs.push(`✓ Deleted ${snapshot.size} existing products\n`);

    // Step 3: Download images and upload to R2
    logs.push('Step 3: Downloading and uploading images to R2...');
    let processedProducts = 0;
    let totalImages = 0;

    for (const product of dummyProducts) {
      try {
        // Download and upload thumbnail
        const r2Thumbnail = await processImage(product.thumbnail, product.id, 0, true);
        totalImages++;

        // Download and upload all preview images
        const r2Images: string[] = [];
        for (let i = 0; i < product.images.length; i++) {
          const r2Url = await processImage(product.images[i], product.id, i + 1);
          r2Images.push(r2Url);
          totalImages++;
        }

        // Import product to Firestore with R2 URLs
        const firestoreProduct = transformToFirestoreProduct(product, r2Thumbnail, r2Images);
        await addDoc(productsRef, firestoreProduct);

        processedProducts++;
        logs.push(`✓ [${processedProducts}/${dummyProducts.length}] ${product.title}`);
      } catch (error: any) {
        logs.push(`✗ Failed: ${product.title} - ${error.message}`);
      }
    }

    logs.push(`\n✅ Import complete!`);
    logs.push(`- Products imported: ${processedProducts}`);
    logs.push(`- Images uploaded to R2: ${totalImages}`);
    logs.push(`- All images now served from your R2 bucket`);

    return NextResponse.json({
      success: true,
      message: logs.join('\n'),
      stats: {
        products: processedProducts,
        images: totalImages
      }
    });
  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to import products' },
      { status: 500 }
    );
  }
}
