import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, updateDoc } from 'firebase/firestore';

export async function POST() {
  try {
    const productsRef = collection(db, 'products');

    // Search for DJI Mavic 3 drone
    const q = query(
      productsRef,
      where('title', '>=', 'DJI Mavic 3'),
      where('title', '<=', 'DJI Mavic 3\uf8ff')
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return NextResponse.json(
        { error: 'DJI Mavic 3 drone not found' },
        { status: 404 }
      );
    }

    // Update all matching products
    const updates: Promise<void>[] = [];

    snapshot.forEach(doc => {
      console.log(`Disabling: ${doc.data().title}`);
      updates.push(
        updateDoc(doc.ref, {
          isActive: false,
          isFeatured: false,
        })
      );
    });

    await Promise.all(updates);

    return NextResponse.json({
      success: true,
      message: `Disabled ${snapshot.size} product(s) matching "DJI Mavic 3"`,
      products: snapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title,
      })),
    });
  } catch (error) {
    console.error('Error disabling drone:', error);
    return NextResponse.json(
      { error: 'Failed to disable product' },
      { status: 500 }
    );
  }
}
