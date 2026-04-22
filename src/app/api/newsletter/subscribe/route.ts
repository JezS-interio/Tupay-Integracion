import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Correo electrónico inválido' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const subRef = doc(db, 'newsletter_subscribers', normalizedEmail);
    const existing = await getDoc(subRef);

    if (existing.exists()) {
      return NextResponse.json({ message: 'already_subscribed' }, { status: 200 });
    }

    await setDoc(subRef, {
      email: normalizedEmail,
      subscribedAt: new Date().toISOString(),
    });

    return NextResponse.json({ message: 'subscribed' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al suscribirse' },
      { status: 500 }
    );
  }
}
