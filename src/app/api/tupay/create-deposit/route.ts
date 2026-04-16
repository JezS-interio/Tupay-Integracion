export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import https from 'https';

function httpsPost(
  url: string,
  headers: Record<string, string>,
  body: string,
  rejectUnauthorized = true
): Promise<{ ok: boolean; status: number; data: unknown }> {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request(
      {
        hostname: u.hostname,
        port: u.port || 443,
        path: u.pathname + u.search,
        method: 'POST',
        headers,
        rejectUnauthorized,
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => { raw += chunk; });
        res.on('end', () => {
          try {
            const data = JSON.parse(raw);
            resolve({ ok: (res.statusCode ?? 0) >= 200 && (res.statusCode ?? 0) < 300, status: res.statusCode ?? 0, data });
          } catch {
            reject(new Error(`Failed to parse TuPay response: ${raw}`));
          }
        });
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

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
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const apiKey = process.env.TUPAY_API_KEY!;
    const apiSignature = process.env.TUPAY_API_SIGNATURE!;
    const baseUrl = process.env.TUPAY_BASE_URL!;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin') || 'https://tupay-integracion.vercel.app';
    const isStaging = process.env.TUPAY_ENVIRONMENT !== 'production';

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
      test: isStaging,
      mobile: false,
      request_payer_data_on_validation_failure: false,
    };

    const jsonPayload = JSON.stringify(payload);

    const xDate = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
    const idempotencyKey = crypto.randomUUID();

    const signatureInput = xDate + apiKey + jsonPayload;
    const hmac = crypto.createHmac('sha256', apiSignature);
    hmac.update(signatureInput);
    const authHash = hmac.digest('hex');

    const reqHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(jsonPayload).toString(),
      'X-Login': apiKey,
      'X-Date': xDate,
      'Authorization': `TUPAY ${authHash}`,
      'X-Idempotency-Key': idempotencyKey,
    };

    const response = await httpsPost(
      `${baseUrl}/v3/deposits`,
      reqHeaders,
      jsonPayload,
      !isStaging // rejectUnauthorized: false en staging
    );

    const tupayData = response.data as Record<string, unknown>;

    if (!response.ok) {
      console.error('TuPay API error:', tupayData);
      return NextResponse.json(
        { error: (tupayData.message as string) || 'TuPay API error', details: tupayData },
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
