import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';
import { render } from '@react-email/render';
import AbandonedCartEmail from '@/emails/AbandonedCartEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email, userName, items, cartTotal } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart items are required' },
        { status: 400 }
      );
    }

    const checkoutUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://intitech-development.vercel.app'}/cart`;

    const emailHtml = await render(
      AbandonedCartEmail({
        userName,
        items,
        cartTotal,
        checkoutUrl,
      })
    );

    const { data, error } = await resend.emails.send({
      from: 'IntiTech <noreply@intitechcorp.com>',
      to: [email],
      subject: 'You left items in your cart!',
      html: emailHtml,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    console.error('Send abandoned cart email error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}
