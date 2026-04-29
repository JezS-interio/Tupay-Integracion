import { NextRequest, NextResponse } from "next/server";

// TODO: Usa variables de entorno reales para producción
const IZIPAY_MERCHANT_CODE = process.env.IZIPAY_MERCHANT_CODE!;
const IZIPAY_API_KEY = process.env.IZIPAY_API_KEY!;
const IZIPAY_AUTH_URL = "https://sandbox-api-pw.izipay.pe/security/api/v1/session/generate";
const IZIPAY_LINK_URL = "https://sandbox-api-pw.izipay.pe/paymentlink/api/v1/process/generate";

// Utilidad para generar un transactionId único
function generateTransactionId() {
  return Date.now().toString() + Math.random().toString(36).substring(2, 8);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Espera: productDescription, amount, currency, expirationDate, wayOfUse, email_Notification, payMethod, referenceCode, languageUsed, urL_Terms_and_Conditions, urlIpn, billing, shipping, customFields
    const transactionId = generateTransactionId();

    // 1. Obtener token de sesión
    const authRes = await fetch(IZIPAY_AUTH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": IZIPAY_API_KEY,
        "transactionId": transactionId,
      },
      body: JSON.stringify({
        merchantCode: IZIPAY_MERCHANT_CODE,
        orderNumber: IZIPAY_MERCHANT_CODE,
        amount: "0.00"
      })
    });
    const authData = await authRes.json();
    if (!authRes.ok || !authData.token) {
      return NextResponse.json({ error: "No se pudo obtener token de sesión Izipay", details: authData }, { status: 500 });
    }
    const sessionToken = authData.token;

    // 2. Generar link de pago
    const linkRes = await fetch(IZIPAY_LINK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${sessionToken}`,
        "transactionId": transactionId,
      },
      body: JSON.stringify({
        merchantCode: IZIPAY_MERCHANT_CODE,
        ...body // El resto de los datos del pedido
      })
    });
    const linkData = await linkRes.json();
    if (!linkRes.ok || !linkData.response?.urL_PaymentLink) {
      return NextResponse.json({ error: "No se pudo generar link de pago Izipay", details: linkData }, { status: 500 });
    }
    return NextResponse.json({ paymentLink: linkData.response.urL_PaymentLink, linkData });
  } catch (err) {
    return NextResponse.json({ error: "Error interno generando link de pago Izipay", details: err }, { status: 500 });
  }
}
