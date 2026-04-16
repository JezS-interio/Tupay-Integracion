import { NextResponse } from 'next/server';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export async function POST() {
  try {
    console.log('Starting to delete all products...');

    // Get all products
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);

    console.log(`Found ${snapshot.size} products to delete`);

    // Delete all products
    const deletePromises = snapshot.docs.map(async (document) => {
      await deleteDoc(doc(db, 'products', document.id));
      console.log(`Deleted product: ${document.id}`);
    });

    await Promise.all(deletePromises);

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${snapshot.size} products`,
      deletedCount: snapshot.size,
    });
  } catch (error) {
    console.error('Error deleting products:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete products'
      },
      { status: 500 }
    );
  }
}
