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


    // Construir el payload correcto para Izipay
    // Espera recibir del frontend: orderId, amount, currency, firstName, lastName, email, documentType, document, phone, address, city, state, country
    // Opcional: productDescription, expirationDate, etc.
    const now = new Date();
    const defaultExpiration = new Date(now.getTime() + 24 * 60 * 60 * 1000); // +1 día
    const expirationDate = body.expirationDate || `${defaultExpiration.getFullYear()}-${(defaultExpiration.getMonth()+1).toString().padStart(2,'0')}-${defaultExpiration.getDate().toString().padStart(2,'0')} 23:59:00.000`;

    const payload = {
      merchantCode: IZIPAY_MERCHANT_CODE,
      productDescription: body.productDescription || `Pago pedido ${body.orderId || ''}`,
      amount: body.amount,
      currency: body.currency || 'PEN',
      expirationDate,
      wayOfUse: body.wayOfUse || 'INDIVIDUAL',
      email_Notification: body.email || '',
      payMethod: body.payMethod || 'CARD',
      referenceCode: body.orderId || body.referenceCode || '',
      languageUsed: body.languageUsed || 'ESP',
      urL_Terms_and_Conditions: body.urL_Terms_and_Conditions || 'https://www.izipay.pe/pdf/terminos-y-condiciones-formulario-pago',
      urlIpn: (body.urlIpn && typeof body.urlIpn === 'string' && !body.urlIpn.startsWith('https://'))
        ? 'https://' + body.urlIpn.replace(/^https?:\/\//, '')
        : (body.urlIpn || 'https://www.tu-web.com/notificaciones/'),
      billing: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phoneNumber: body.phone,
        street: body.address || '',
        postalCode: body.postalCode || '15074',
        city: body.city || '',
        state: body.state || '',
        country: body.country || 'PE',
        documentType: body.documentType,
        document: body.document
      },
      shipping: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phoneNumber: body.phone,
        street: body.address || '',
        postalCode: body.postalCode || '15074',
        city: body.city || '',
        state: body.state || '',
        country: body.country || 'PE',
        documentType: body.documentType,
        document: body.document
      },
      customFields: Array.isArray(body.customFields) ? body.customFields : []
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
      // Devolver el error de Izipay directamente al frontend para depuración
      return NextResponse.json({
        error: linkData.message || "No se pudo generar link de pago Izipay",
        izipayError: linkData,
        payloadEnviado: payload
      }, { status: 500 });
    }
    return NextResponse.json({ paymentLink: linkData.response.urL_PaymentLink, linkData });
  } catch (err) {
    console.error('[IZIPAY] Error interno generando link de pago:', err);
    return NextResponse.json({ error: "Error interno generando link de pago Izipay", details: err }, { status: 500 });
  }
}
