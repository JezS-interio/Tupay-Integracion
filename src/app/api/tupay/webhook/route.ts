import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { tupayFetch } from '@/lib/tupay-fetch';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const OWNER_EMAIL = process.env.OWNER_EMAIL || 'testt31@outlook.com';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deposit_id } = body;

    if (!deposit_id) {
      return NextResponse.json({ received: true });
    }

    const apiKey = process.env.TUPAY_API_KEY!;
    const apiSignature = process.env.TUPAY_API_SIGNATURE!;
    const baseUrl = process.env.TUPAY_BASE_URL!;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!;
    const firebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY!;

    // Query TuPay for current deposit status
    const xDate = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
    const hmac = crypto.createHmac('sha256', apiSignature);
    hmac.update(xDate + apiKey);
    const authHash = hmac.digest('hex');

    const statusResponse = await tupayFetch(`${baseUrl}/v3/deposits/${deposit_id}`, {
      method: 'GET',
      headers: {
        'X-Login': apiKey,
        'X-Date': xDate,
        'Authorization': `TUPAY ${authHash}`,
        'Content-Type': 'application/json',
      },
    });

    if (!statusResponse.ok) {
      console.error('TuPay status check failed for deposit:', deposit_id);
      return NextResponse.json({ received: true });
    }

    const depositData = await statusResponse.json();
    const { status, invoice_id } = depositData;

    if (!invoice_id) {
      return NextResponse.json({ received: true });
    }

    // Map TuPay status to our payment status
    const paymentStatusMap: Record<string, string> = {
      'COMPLETED': 'paid',
      'EXPIRED': 'failed',
      'CANCELLED': 'failed',
      'PENDING': 'pending',
      'WAITING': 'pending',
      'IN_PROGRESS': 'pending',
      'HOLD': 'pending',
    };

    const newPaymentStatus = paymentStatusMap[status] || 'pending';
    const newOrderStatus = status === 'COMPLETED' ? 'processing' : undefined;

    // Update Firestore via REST API (no firebase-admin needed)
    const updateData: Record<string, unknown> = {
      fields: {
        paymentStatus: { stringValue: newPaymentStatus },
        updatedAt: { stringValue: new Date().toISOString() },
        tupayDepositId: { stringValue: String(deposit_id) },
        tupayStatus: { stringValue: status },
        ...(newOrderStatus ? { orderStatus: { stringValue: newOrderStatus } } : {}),
      },
    };

    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/orders/${invoice_id}?updateMask.fieldPaths=paymentStatus&updateMask.fieldPaths=updatedAt&updateMask.fieldPaths=tupayDepositId&updateMask.fieldPaths=tupayStatus${newOrderStatus ? '&updateMask.fieldPaths=orderStatus' : ''}&key=${firebaseApiKey}`;

    const firestoreRes = await fetch(firestoreUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });

    if (!firestoreRes.ok) {
      console.error('Firestore update failed:', await firestoreRes.text());
    }

    // Send owner notification email when payment is completed
    if (status === 'COMPLETED') {
      try {
        // Fetch full order data from Firestore
        const orderUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/orders/${invoice_id}?key=${firebaseApiKey}`;
        const orderRes = await fetch(orderUrl);
        let orderHtml = `<p>Orden <strong>${invoice_id}</strong> pagada via TuPay (deposit: ${deposit_id}).</p>`;

        if (orderRes.ok) {
          const orderDoc = await orderRes.json();
          const f = orderDoc.fields || {};
          const customerName = f.shippingAddress?.mapValue?.fields?.fullName?.stringValue || 'Cliente';
          const customerEmail = f.shippingAddress?.mapValue?.fields?.email?.stringValue || '';
          const total = f.total?.doubleValue || f.total?.integerValue || '';
          orderHtml = `
            <h2>¡Nuevo pago confirmado!</h2>
            <p><strong>Orden:</strong> ${invoice_id}</p>
            <p><strong>Cliente:</strong> ${customerName}${customerEmail ? ` (${customerEmail})` : ''}</p>
            ${total ? `<p><strong>Total:</strong> S/ ${Number(total).toFixed(2)}</p>` : ''}
            <p><strong>Método:</strong> TuPay</p>
            <p><strong>Deposit ID:</strong> ${deposit_id}</p>
          `;
        }

        await resend.emails.send({
          from: 'IntiTech <orders@intitechcorp.com>',
          to: [OWNER_EMAIL],
          subject: `✅ Pago confirmado - Orden ${invoice_id}`,
          html: orderHtml,
        });
      } catch (emailErr) {
        console.error('Failed to send owner notification email:', emailErr);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('TuPay webhook error:', error);
    return NextResponse.json({ received: true });
  }
}
