import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';
import { render } from '@react-email/render';
import OrderConfirmationEmail from '@/emails/OrderConfirmationEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const {
      email,
      userName,
      orderNumber,
      orderDate,
      items,
      subtotal,
      shipping,
      total,
      shippingAddress,
    } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const emailHtml = await render(OrderConfirmationEmail({
      userName,
      orderNumber,
      orderDate,
      items,
      subtotal,
      shipping,
      total,
      shippingAddress,
    }));

    const { data, error } = await resend.emails.send({
      from: 'IntiTech <orders@resend.dev>', // Change this to your verified domain
      to: [email],
      subject: `Order Confirmation - ${orderNumber || 'Your Order'}`,
      html: emailHtml,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    console.error('Send order confirmation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}
