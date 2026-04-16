import { NextResponse } from 'next/server';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export async function GET() {
  try {
    const productsRef = collection(db, 'products');
    const q = query(
      productsRef,
      where('isActive', '==', true),
      where('isNewArrival', '==', true)
    );
    const snapshot = await getDocs(q);

    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      title: doc.data().title,
      img: doc.data().img,
      imgs: doc.data().imgs,
      isNewArrival: doc.data().isNewArrival,
    }));

    return NextResponse.json({
      success: true,
      count: snapshot.size,
      products,
    }, { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Check new arrivals error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check new arrivals',
      },
      { status: 500 }
    );
  }
}
