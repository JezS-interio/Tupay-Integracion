import { db } from '@/lib/firebase/config';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

/**
 * Delete all products from Firestore
 */
async function deleteAllProducts() {
  console.log('\n' + '█'.repeat(80));
  console.log('🗑️  DELETE ALL PRODUCTS');
  console.log('█'.repeat(80));
  console.log('\n⚠️  WARNING: This will permanently delete ALL products from Firestore!\n');

  try {
    // Get all products
    console.log('📦 Fetching all products...');
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);

    const totalProducts = snapshot.size;

    if (totalProducts === 0) {
      console.log('✅ No products found. Database is already empty.');
      return;
    }

    console.log(`Found ${totalProducts} product(s) to delete.\n`);

    // Delete each product
    let deleted = 0;
    let failed = 0;

    for (const productDoc of snapshot.docs) {
      try {
        await deleteDoc(doc(db, 'products', productDoc.id));
        deleted++;

        // Show progress
        if (deleted % 10 === 0 || deleted === totalProducts) {
          console.log(`🗑️  Deleted ${deleted}/${totalProducts} products...`);
        }
      } catch (error) {
        console.error(`❌ Failed to delete product ${productDoc.id}:`, error);
        failed++;
      }
    }

    // Summary
    console.log('\n' + '█'.repeat(80));
    console.log('📊 DELETION SUMMARY');
    console.log('█'.repeat(80));
    console.log(`✅ Deleted: ${deleted}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📦 Total: ${totalProducts}`);
    console.log('█'.repeat(80) + '\n');

    if (deleted === totalProducts) {
      console.log('✅ All products deleted successfully!\n');
    } else {
      console.log('⚠️  Some products failed to delete. Check errors above.\n');
    }
  } catch (error) {
    console.error('\n❌ Error during deletion:', error);
    process.exit(1);
  }
}

/**
 * Run the deletion
 */
if (require.main === module) {
  console.log('\nStarting in 3 seconds... Press Ctrl+C to cancel.\n');

  setTimeout(() => {
    deleteAllProducts()
      .then(() => {
        console.log('✅ Deletion completed!');
        process.exit(0);
      })
      .catch((error) => {
        console.error('❌ Deletion failed:', error);
        process.exit(1);
      });
  }, 3000);
}

export { deleteAllProducts };
