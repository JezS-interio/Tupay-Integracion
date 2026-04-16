#!/usr/bin/env node

/**
 * Upload new product images to Cloudflare R2
 * Reads from scripts/new_products/ directory
 */

const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

// R2 Configuration
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
  console.error("❌ Error: Missing R2 credentials in .env.local");
  console.error("Required: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME");
  process.exit(1);
}

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

async function uploadToR2(filePath, key) {
  try {
    const fileContent = fs.readFileSync(filePath);

    // Determine content type
    const ext = path.extname(filePath).toLowerCase();
    let contentType = "application/octet-stream";
    if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
    else if (ext === ".png") contentType = "image/png";
    else if (ext === ".webp") contentType = "image/webp";

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: fileContent,
      ContentType: contentType,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error(`  ❌ Failed: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log("🚀 Upload New Products to R2\n");
  console.log("=" .repeat(60));

  const imagesDir = path.join(__dirname, "new_products");

  if (!fs.existsSync(imagesDir)) {
    console.error(`❌ Error: Directory not found: ${imagesDir}`);
    console.error("Run download-and-prepare-products.py first!");
    process.exit(1);
  }

  // Get all image files (excluding JSON)
  const files = fs.readdirSync(imagesDir)
    .filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
    });

  console.log(`📁 Found ${files.length} images to upload\n`);

  let successCount = 0;
  let failCount = 0;
  const uploadedFiles = [];

  for (let i = 0; i < files.length; i++) {
    const filename = files[i];
    const filePath = path.join(imagesDir, filename);
    const r2Key = `products/${filename}`;

    console.log(`[${i + 1}/${files.length}] Uploading: ${filename}`);

    const success = await uploadToR2(filePath, r2Key);

    if (success) {
      successCount++;
      const publicUrl = `https://pub-2abf1fca1a994517beb3fb17c83b3094.r2.dev/${r2Key}`;
      uploadedFiles.push({ filename, url: publicUrl });
      console.log(`  ✅ Uploaded: ${publicUrl}\n`);
    } else {
      failCount++;
    }
  }

  // Save mapping file
  const mappingPath = path.join(imagesDir, "r2-urls.json");
  fs.writeFileSync(mappingPath, JSON.stringify(uploadedFiles, null, 2));

  console.log("=" .repeat(60));
  console.log(`🎉 COMPLETE!`);
  console.log(`✅ Uploaded: ${successCount}/${files.length} images`);
  if (failCount > 0) {
    console.log(`❌ Failed: ${failCount}`);
  }
  console.log(`📄 URL mapping saved to: ${mappingPath}`);
  console.log();
  console.log("📌 Next step:");
  console.log("Go to: http://localhost:3000/admin/import-new-products");
  console.log("to import these products to Firestore");
}

main().catch(console.error);
