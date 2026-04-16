#!/usr/bin/env node
/**
 * Backup Firestore products to JSON file
 * Run this before making major changes to the database
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

async function backupProducts() {
  console.log('🔥 Starting Firestore backup...\n');

  try {
    const snapshot = await db.collection('products').get();

    const products = [];
    snapshot.forEach(doc => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Create backup directory if it doesn't exist
    const backupDir = path.join(__dirname, '../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Create timestamped backup file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `firestore-backup-${timestamp}.json`);

    fs.writeFileSync(backupFile, JSON.stringify(products, null, 2));

    console.log(`✅ Backup complete!`);
    console.log(`📦 Products backed up: ${products.length}`);
    console.log(`📁 Backup file: ${backupFile}\n`);

    // Also copy the current R2 mapping
    const r2MappingSource = path.join(__dirname, 'r2-image-mapping.json');
    const r2MappingBackup = path.join(backupDir, `r2-image-mapping-${timestamp}.json`);

    if (fs.existsSync(r2MappingSource)) {
      fs.copyFileSync(r2MappingSource, r2MappingBackup);
      console.log(`✅ R2 mapping backed up!`);
      console.log(`📁 Mapping file: ${r2MappingBackup}\n`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Backup failed:', error);
    process.exit(1);
  }
}

backupProducts();
