#!/usr/bin/env node
/**
 * Upload scraped product images to Cloudflare R2
 */

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// R2 Configuration
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME;
const PUBLIC_URL = process.env.R2_PUBLIC_URL;

// Directory with downloaded images
const IMAGES_DIR = path.join(__dirname, 'downloaded_images');

/**
 * Extract product name from filename
 * E.g., "iPhone_15_Pro_Max_1_images.macrumors.com_dabc6a0b.jpg" -> "iPhone 15 Pro Max"
 */
function extractProductName(filename) {
  // Remove the number, domain, and hash from the end
  const match = filename.match(/^(.+?)_\d+_/);
  if (match) {
    return match[1].replace(/_/g, ' ');
  }
  return filename;
}

/**
 * Create a clean filename for R2
 * E.g., "iPhone 15 Pro Max" -> "iphone-15-pro-max"
 */
function createSlug(productName) {
  return productName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

/**
 * Upload a single image to R2
 */
async function uploadImage(filePath, filename) {
  try {
    const fileContent = fs.readFileSync(filePath);
    const productName = extractProductName(filename);
    const productSlug = createSlug(productName);

    // Determine file extension
    const ext = path.extname(filename);

    // Create R2 path: products/{product-slug}/{original-filename}
    const r2Path = `products/${productSlug}/${filename}`;

    // Determine content type
    let contentType = 'image/jpeg';
    if (ext === '.png') contentType = 'image/png';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.gif') contentType = 'image/gif';

    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: r2Path,
      Body: fileContent,
      ContentType: contentType,
    });

    await r2Client.send(command);

    const publicUrl = `${PUBLIC_URL}/${r2Path}`;
    return {
      filename,
      productName,
      r2Path,
      publicUrl,
      size: fileContent.length,
    };
  } catch (error) {
    console.error(`❌ Error uploading ${filename}:`, error.message);
    return null;
  }
}

/**
 * Main function
 */
async function main() {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║           📤 UPLOAD IMAGES TO CLOUDFLARE R2 📤            ║
╚═══════════════════════════════════════════════════════════╝
  `);

  // Check if images directory exists
  if (!fs.existsSync(IMAGES_DIR)) {
    console.error(`❌ Error: Directory not found: ${IMAGES_DIR}`);
    process.exit(1);
  }

  // Get all image files
  const files = fs.readdirSync(IMAGES_DIR).filter(f => {
    const ext = path.extname(f).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
  });

  console.log(`📁 Source: ${IMAGES_DIR}`);
  console.log(`🪣 Bucket: ${BUCKET_NAME}`);
  console.log(`🌐 Public URL: ${PUBLIC_URL}`);
  console.log(`📊 Found ${files.length} images to upload\n`);

  if (files.length === 0) {
    console.log('❌ No images found!');
    process.exit(0);
  }

  // Upload all images
  const results = [];
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < files.length; i++) {
    const filename = files[i];
    const filePath = path.join(IMAGES_DIR, filename);

    console.log(`[${i + 1}/${files.length}] Uploading: ${filename}`);

    const result = await uploadImage(filePath, filename);
    if (result) {
      const sizeMB = (result.size / 1024).toFixed(1);
      console.log(`   ✅ Uploaded to: ${result.r2Path} (${sizeMB}KB)`);
      results.push(result);
      successCount++;
    } else {
      failCount++;
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🎉 UPLOAD COMPLETE!`);
  console.log(`${'='.repeat(60)}`);
  console.log(`✅ Success: ${successCount} images`);
  if (failCount > 0) {
    console.log(`❌ Failed: ${failCount} images`);
  }
  console.log(`🌐 Base URL: ${PUBLIC_URL}/products/`);
  console.log(`${'='.repeat(60)}\n`);

  // Group by product
  const byProduct = {};
  results.forEach(r => {
    if (!byProduct[r.productName]) {
      byProduct[r.productName] = [];
    }
    byProduct[r.productName].push(r.publicUrl);
  });

  console.log('📦 Images by Product:\n');
  Object.entries(byProduct).forEach(([product, urls]) => {
    console.log(`${product}: ${urls.length} images`);
    urls.forEach((url, i) => {
      console.log(`   ${i + 1}. ${url}`);
    });
    console.log('');
  });

  // Save mapping to JSON file
  const mappingFile = path.join(__dirname, 'r2-image-mapping.json');
  fs.writeFileSync(mappingFile, JSON.stringify(byProduct, null, 2));
  console.log(`💾 Saved URL mapping to: ${mappingFile}\n`);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
