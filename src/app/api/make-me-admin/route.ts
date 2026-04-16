import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';

/**
 * Make current user admin
 * Only works on localhost for security
 */
export async function POST(request: NextRequest) {
  try {
    // Only allow on localhost
    const hostname = request.headers.get('host') || '';
    if (!hostname.includes('localhost') && !hostname.includes('127.0.0.1')) {
      return NextResponse.json(
        { error: 'Only available on localhost' },
        { status: 403 }
      );
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId required' },
        { status: 400 }
      );
    }

    // Get user document
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user to admin
    await setDoc(userRef, { isAdmin: true }, { merge: true });

    return NextResponse.json({
      success: true,
      message: `User ${userId} is now an admin!`,
      userId,
    });
  } catch (error) {
    console.error('Error making user admin:', error);
    return NextResponse.json(
      { error: 'Failed to make user admin' },
      { status: 500 }
    );
  }
}
