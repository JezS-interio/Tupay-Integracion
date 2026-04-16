import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin (server-side only)
function getAdminDb() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
  return getFirestore();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deposit_id } = body;

    if (!deposit_id) {
      return NextResponse.json({ error: 'Missing deposit_id' }, { status: 400 });
    }

    // Query TuPay for current deposit status
    const apiKey = process.env.TUPAY_API_KEY!;
    const apiSignature = process.env.TUPAY_API_SIGNATURE!;
    const baseUrl = process.env.TUPAY_BASE_URL!;

    const xDate = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
    const { createHmac } = await import('crypto');
    const hmac = createHmac('sha256', apiSignature);
    hmac.update(xDate + apiKey);
    const authHash = hmac.digest('hex');

    const statusResponse = await fetch(`${baseUrl}/v3/deposits/${deposit_id}`, {
      method: 'GET',
      headers: {
        'X-Login': apiKey,
        'X-Date': xDate,
        'Authorization': `TUPAY ${authHash}`,
        'Content-Type': 'application/json',
      },
    });

    if (!statusResponse.ok) {
      console.error('TuPay status check failed:', deposit_id);
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

    // Update Firestore order
    try {
      const db = getAdminDb();
      const orderRef = db.collection('orders').doc(invoice_id);
      const updateData: Record<string, string> = {
        paymentStatus: newPaymentStatus,
        updatedAt: new Date().toISOString(),
        tupayDepositId: String(deposit_id),
        tupayStatus: status,
      };
      if (newOrderStatus) {
        updateData.orderStatus = newOrderStatus;
      }
      await orderRef.update(updateData);
    } catch (dbError) {
      console.error('Firestore update error:', dbError);
      // Return 200 so TuPay doesn't retry infinitely; log for manual fix
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('TuPay webhook error:', error);
    // Return 200 to avoid TuPay retries on parsing errors
    return NextResponse.json({ received: true });
  }
}
