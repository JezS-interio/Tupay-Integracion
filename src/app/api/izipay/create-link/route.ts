import { NextRequest, NextResponse } from "next/server";

const IZIPAY_MERCHANT_CODE = process.env.IZIPAY_MERCHANT_CODE!;
const IZIPAY_API_KEY = process.env.IZIPAY_API_KEY!;
const IZIPAY_LINK_URL = "https://sandbox-api-pw.izipay.pe/paymentlink/api/v1/process/generate";

// Utilidad para generar un transactionId único
function generateTransactionId() {
  return Date.now().toString() + Math.random().toString(36).substring(2, 8);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const transactionId = generateTransactionId();

    // LOG: Payload recibido
    console.log('[IZIPAY] Payload recibido en /api/izipay/create-link:', JSON.stringify(body, null, 2));

    const payload = {
      merchantCode: IZIPAY_MERCHANT_CODE,
      ...body
    };

    // LOG: Payload enviado a Izipay
    console.log('[IZIPAY] Payload enviado a Izipay:', JSON.stringify(payload, null, 2));

    const linkRes = await fetch(IZIPAY_LINK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": IZIPAY_API_KEY,
        "transactionId": transactionId,
      },
      body: JSON.stringify(payload)
    });
    const linkData = await linkRes.json();

    // LOG: Respuesta de Izipay
    console.log('[IZIPAY] Respuesta de Izipay:', JSON.stringify(linkData, null, 2));

    if (!linkRes.ok || !linkData.response?.urL_PaymentLink) {
      console.error('[IZIPAY] Error al generar link de pago:', linkData);
      return NextResponse.json({ error: "No se pudo generar link de pago Izipay", details: linkData }, { status: 500 });
    }
    return NextResponse.json({ paymentLink: linkData.response.urL_PaymentLink, linkData });
  } catch (err) {
    console.error('[IZIPAY] Error interno generando link de pago:', err);
    return NextResponse.json({ error: "Error interno generando link de pago Izipay", details: err }, { status: 500 });
  }
}
