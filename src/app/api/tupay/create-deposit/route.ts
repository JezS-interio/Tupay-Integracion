export const runtime = 'nodejs';
// Bypass SSL for TuPay staging environment
if (process.env.TUPAY_ENVIRONMENT !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { tupayFetch, syncTupayServerTime, getTupayClockOffsetMs, setTupayClockOffsetMs, buildTupayDate } from '@/lib/tupay-fetch';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orderId,
      amount,
      currency = 'PEN',
      firstName,
      lastName,
      email,
      document,
      documentType = 'DNI',
      phone,
      successUrl,
      errorUrl,
      backUrl,
    } = body;

    if (!orderId || !amount || !firstName || !lastName || !email || !document) {
      const missing = { orderId: !orderId, amount: !amount, firstName: !firstName, lastName: !lastName, email: !email, document: !document };
      console.error('TuPay create-deposit missing fields:', missing, 'body:', body);
      return NextResponse.json(
        { error: 'Missing required fields', missing },
        { status: 400 }
      );
    }

    const apiKey = process.env.TUPAY_API_KEY!;
    const apiSignature = process.env.TUPAY_API_SIGNATURE!;
    const baseUrl = process.env.TUPAY_BASE_URL!;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin') || 'https://www.intitechcorp.com';

    // Sync server clock on cold start — cheap HEAD request avoids a failing deposit round-trip
    await syncTupayServerTime(baseUrl);

    const payload = {
      country: 'PE',
      currency,
      amount: Number(amount).toFixed(2),
      payment_method: 'XA',
      invoice_id: orderId,
      payer: {
        first_name: firstName,
        last_name: lastName,
        email,
        document,
        document_type: documentType,
        ...(phone ? { phone } : {}),
      },
      success_url: successUrl || `${appUrl}/payment/success?order=${orderId}`,
      error_url: errorUrl || `${appUrl}/payment/error?order=${orderId}`,
      back_url: backUrl || `${appUrl}/checkout`,
      notification_url: `${appUrl}/api/tupay/webhook`,
      test: false,
      mobile: false,
      request_payer_data_on_validation_failure: false,
    };

    const jsonPayload = JSON.stringify(payload);

    const buildHeaders = (date: string, key: string) => {
      const sig = crypto.createHmac('sha256', apiSignature);
      sig.update(date + apiKey + jsonPayload);
      return {
        'Content-Type': 'application/json',
        'X-Login': apiKey,
        'X-Date': date,
        'Authorization': `TUPAY ${sig.digest('hex')}`,
        'X-Idempotency-Key': key,
      };
    };

    let xDate = buildTupayDate(getTupayClockOffsetMs() ?? 0);
    const idempotencyKey = crypto.randomUUID();

    let response = await tupayFetch(`${baseUrl}/v3/deposits`, {
      method: 'POST',
      headers: buildHeaders(xDate, idempotencyKey),
      body: jsonPayload,
    });

    // Safety net: if clock skew still happens (e.g. HEAD probe didn't return Date header),
    // correct from the response and retry once
    if (response.status === 400) {
      const bodyClone = await response.clone().json().catch(() => null);
      if (bodyClone?.code === 103 || bodyClone?.type === 'INVALID_DATE_RANGE') {
        const serverDateHeader = response.headers.get('date');
        if (!process.env.TUPAY_DATE_OFFSET_SECONDS && serverDateHeader) {
          const offsetMs = new Date(serverDateHeader).getTime() - Date.now();
          setTupayClockOffsetMs(offsetMs);
          xDate = buildTupayDate(offsetMs);
          console.log('[TuPay] fallback clock correction, offset ms:', offsetMs, '→ xDate:', xDate);
        }
        const retryIdempotencyKey = crypto.randomUUID();
        response = await tupayFetch(`${baseUrl}/v3/deposits`, {
          method: 'POST',
          headers: buildHeaders(xDate, retryIdempotencyKey),
          body: jsonPayload,
        });
      }
    }

    const tupayData = await response.json();

    if (!response.ok) {
      console.error('TuPay API error:', tupayData);
      return NextResponse.json(
        { error: tupayData.message || 'TuPay API error', details: tupayData },
        { status: response.status }
      );
    }

    return NextResponse.json({
      redirect_url: tupayData.redirect_url,
      deposit_id: tupayData.deposit_id,
      checkout_type: tupayData.checkout_type,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error creating TuPay deposit:', message);
    return NextResponse.json(
      { error: message || 'Internal server error' },
      { status: 500 }
    );
  }
}
