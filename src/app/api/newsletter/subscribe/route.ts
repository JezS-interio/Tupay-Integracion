import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';
import { render } from '@react-email/render';
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

    // Send confirmation email to the subscriber
    const emailHtml = await render(NewsletterEmail({ email: normalizedEmail }));

    const { error } = await resend.emails.send({
      from: 'IntiTech <noreply@intitechcorp.com>',
      to: [normalizedEmail],
      subject: '¡Suscripción confirmada! Bienvenido a IntiTech',
      html: emailHtml,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'subscribed' }, { status: 200 });
  } catch (error: any) {
    console.error('Newsletter subscribe error:', error);
    return NextResponse.json(
      { error: error.message || 'Error al suscribirse' },
      { status: 500 }
    );
  }
}
