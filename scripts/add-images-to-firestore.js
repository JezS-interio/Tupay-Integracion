#!/usr/bin/env node
/**
 * Add scraped R2 images to Firestore products
 * Creates new products or updates existing ones
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require('../serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Load the R2 image mapping
const mappingPath = path.join(__dirname, 'r2-image-mapping.json');
const imageMapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));

/**
 * Determine category based on product name
 */
function getCategory(productName) {
  const lower = productName.toLowerCase();

  if (lower.includes('iphone') || lower.includes('galaxy s') || lower.includes('pixel') || lower.includes('oneplus')) {
    return 'Smartphones';
  }
  if (lower.includes('macbook') || lower.includes('laptop') || lower.includes('xps') || lower.includes('thinkpad') || lower.includes('spectre') || lower.includes('zephyrus') || lower.includes('blade')) {
    return 'Laptops';
  }
  if (lower.includes('ipad') || lower.includes('galaxy tab') || lower.includes('surface pro')) {
    return 'Tablets';
  }
  if (lower.includes('watch') || lower.includes('fitbit')) {
    return 'Smartwatches';
  }
  if (lower.includes('airpods') || lower.includes('headphones') || lower.includes('buds') || lower.includes('wh-')) {
    return 'Audio';
  }
  if (lower.includes('mouse') || lower.includes('keyboard') || lower.includes('mx')) {
    return 'Accessories';
  }
  if (lower.includes('camera') || lower.includes('eos') || lower.includes('nikon') || lower.includes('sony a7') || lower.includes('gopro')) {
    return 'Cameras';
  }
  if (lower.includes('drone') || lower.includes('dji')) {
    return 'Drones';
  }
  if (lower.includes('switch') || lower.includes('playstation') || lower.includes('xbox') || lower.includes('steam deck')) {
    return 'Gaming';
  }
  if (lower.includes('powercore') || lower.includes('charger') || lower.includes('ssd') || lower.includes('sandisk')) {
    return 'Accessories';
  }
  if (lower.includes('tv') || lower.includes('soundbar') || lower.includes('sonos') || lower.includes('echo') || lower.includes('nest') || lower.includes('ring') || lower.includes('hue') || lower.includes('dyson')) {
    return 'Smart Home';
  }

  return 'Electronics';
}

/**
 * Generate a reasonable price based on category and product name
 */
function generatePrice(productName, category) {
  const lower = productName.toLowerCase();

  // High-end products
  if (lower.includes('pro max') || lower.includes('ultra') || lower.includes('mark ii')) {
    return Math.floor(Math.random() * 500) + 1000; // $1000-1500
  }
  if (lower.includes('pro') || lower.includes('m3') || lower.includes('m2')) {
    return Math.floor(Math.random() * 400) + 800; // $800-1200
  }

  // By category
  if (category === 'Smartphones') {
    return Math.floor(Math.random() * 400) + 600; // $600-1000
  }
  if (category === 'Laptops') {
    return Math.floor(Math.random() * 600) + 1000; // $1000-1600
  }
  if (category === 'Tablets') {
    return Math.floor(Math.random() * 400) + 400; // $400-800
  }
  if (category === 'Smartwatches') {
    return Math.floor(Math.random() * 200) + 250; // $250-450
  }
  if (category === 'Audio') {
    return Math.floor(Math.random() * 200) + 150; // $150-350
  }
  if (category === 'Cameras') {
    return Math.floor(Math.random() * 1000) + 1500; // $1500-2500
  }
  if (category === 'Gaming') {
    return Math.floor(Math.random() * 200) + 300; // $300-500
  }

  // Default
  return Math.floor(Math.random() * 300) + 100; // $100-400
}

/**
 * Generate product description
 */
function generateDescription(productName, category) {
  return `${productName} - High-quality ${category.toLowerCase()} with cutting-edge technology and premium design. Experience superior performance and reliability.`;
}

/**
 * Create or update a product in Firestore
 */
async function addProductToFirestore(productName, imageUrls) {
  try {
    const category = getCategory(productName);
    const price = generatePrice(productName, category);
    const discountedPrice = Math.floor(price * 0.85); // 15% discount

    // Create slug from product name
    const slug = productName.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    // Check if product already exists
    const existingProductQuery = await db.collection('products')
      .where('title', '==', productName)
      .limit(1)
      .get();

    const productData = {
      title: productName,
      slug: slug,
      price: price,
      discountedPrice: discountedPrice,
      description: generateDescription(productName, category),
      category: category,
      images: imageUrls,
      stock: Math.floor(Math.random() * 50) + 10, // 10-60 items in stock
      rating: (Math.random() * 1.5 + 3.5).toFixed(1), // 3.5-5.0 rating
      reviews: Math.floor(Math.random() * 500) + 50, // 50-550 reviews
      featured: Math.random() > 0.7, // 30% chance of being featured
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (!existingProductQuery.empty) {
      // Update existing product
      const doc = existingProductQuery.docs[0];
      await doc.ref.update({
        images: imageUrls,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return { action: 'updated', id: doc.id };
    } else {
      // Create new product
      const docRef = await db.collection('products').add(productData);
      return { action: 'created', id: docRef.id };
    }
  } catch (error) {
    console.error(`Error processing ${productName}:`, error.message);
    return { action: 'failed', error: error.message };
  }
}

/**
 * Main function
 */
async function main() {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║        🔥 ADD IMAGES TO FIRESTORE PRODUCTS 🔥             ║
╚═══════════════════════════════════════════════════════════╝
  `);

  const products = Object.entries(imageMapping);
  console.log(`📦 Found ${products.length} products with images\n`);

  let created = 0;
  let updated = 0;
  let failed = 0;

  for (let i = 0; i < products.length; i++) {
    const [productName, imageUrls] = products[i];

    console.log(`[${i + 1}/${products.length}] Processing: ${productName}`);
    console.log(`   Images: ${imageUrls.length}`);

    const result = await addProductToFirestore(productName, imageUrls);

    if (result.action === 'created') {
      console.log(`   ✅ Created new product (ID: ${result.id})`);
      created++;
    } else if (result.action === 'updated') {
      console.log(`   ✅ Updated existing product (ID: ${result.id})`);
      updated++;
    } else {
      console.log(`   ❌ Failed: ${result.error}`);
      failed++;
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`🎉 COMPLETE!`);
  console.log(`${'='.repeat(60)}`);
  console.log(`✅ Created: ${created} products`);
  console.log(`✅ Updated: ${updated} products`);
  if (failed > 0) {
    console.log(`❌ Failed: ${failed} products`);
  }
  console.log(`📊 Total: ${created + updated} products in database`);
  console.log(`${'='.repeat(60)}\n`);

  console.log('🌐 All products now have R2 image URLs!');
  console.log('🔍 Check your Firestore console to verify\n');

  process.exit(0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
