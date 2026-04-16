// src/scripts/deleteAllProducts.ts
// Script to delete all products from Firestore
// Run this ONCE to clear out old products with hardcoded images

import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase/config';

const PRODUCTS_COLLECTION = 'products';

export const deleteAllProducts = async (): Promise<{
  success: boolean;
  message: string;
  deletedCount: number;
}> => {
  try {
    console.log('🗑️  Starting to delete all products...');

    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const snapshot = await getDocs(productsRef);

    const deletePromises = snapshot.docs.map((document) => {
      console.log(`Deleting: ${document.data().title} (ID: ${document.id})`);
      return deleteDoc(doc(db, PRODUCTS_COLLECTION, document.id));
    });

    await Promise.all(deletePromises);

    const deletedCount = snapshot.docs.length;

    console.log(`✅ Successfully deleted ${deletedCount} products!`);

    return {
      success: true,
      message: `Successfully deleted ${deletedCount} products!`,
      deletedCount,
    };
  } catch (error: any) {
    console.error('❌ Error deleting products:', error);
    return {
      success: false,
      message: `Failed to delete products: ${error.message}`,
      deletedCount: 0,
    };
  }
};
