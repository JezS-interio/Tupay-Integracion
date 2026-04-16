import { NextResponse } from 'next/server';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export async function GET() {
  try {
    const productsRef = collection(db, 'products');
    const q = query(productsRef, limit(3));
    const snapshot = await getDocs(q);

    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      count: snapshot.size,
      products,
    });
  } catch (error) {
    console.error('Check products error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check products',
      },
      { status: 500 }
    );
  }
}
