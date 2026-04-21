import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';
import { render } from '@react-email/render';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import NewsletterEmail from '@/emails/NewsletterEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

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

    // Check if already subscribed
    const subscriberRef = doc(db, 'newsletter_subscribers', normalizedEmail);
    const existing = await getDoc(subscriberRef);

    if (existing.exists()) {
      return NextResponse.json(
        { message: 'already_subscribed' },
        { status: 200 }
      );
    }

    // Save subscriber to Firestore
    await setDoc(subscriberRef, {
      email: normalizedEmail,
      subscribedAt: Timestamp.now(),
      active: true,
    });

    // Send confirmation email
    const emailHtml = await render(NewsletterEmail({ email: normalizedEmail }));

    await resend.emails.send({
      from: 'IntiTech <onboarding@resend.dev>',
      to: [normalizedEmail],
      subject: '¡Suscripción confirmada! Bienvenido a IntiTech',
      html: emailHtml,
    });

    return NextResponse.json({ message: 'subscribed' }, { status: 200 });
  } catch (error: any) {
    console.error('Newsletter subscribe error:', error);
    return NextResponse.json(
      { error: error.message || 'Error al suscribirse' },
      { status: 500 }
    );
  }
}
