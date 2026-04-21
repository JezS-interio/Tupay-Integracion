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

    // Send confirmation email via Resend
    const emailHtml = await render(NewsletterEmail({ email: normalizedEmail }));

    // In test mode Resend only allows sending to the account owner email.
    // We notify the store owner instead until a domain is verified.
    const ownerEmail = process.env.RESEND_OWNER_EMAIL || 'testt31@outlook.com';

    const { error } = await resend.emails.send({
      from: 'IntiTech <onboarding@resend.dev>',
      to: [ownerEmail],
      subject: `Nuevo suscriptor: ${normalizedEmail}`,
      html: `<p>El correo <strong>${normalizedEmail}</strong> se suscribió al newsletter de IntiTech.</p>`,
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
