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
    // Espera: productDescription, amount, currency, expirationDate, wayOfUse, email_Notification, payMethod, referenceCode, languageUsed, urL_Terms_and_Conditions, urlIpn, billing, shipping, customFields
    const transactionId = generateTransactionId();

    // 1. Generar link de pago directamente (no requiere sesión previa)
    const payload = {
      merchantCode: IZIPAY_MERCHANT_CODE,
      ...body // El resto de los datos del pedido, debe incluir todos los campos requeridos por Izipay
    };
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
    if (!linkRes.ok || !linkData.response?.urL_PaymentLink) {
      return NextResponse.json({ error: "No se pudo generar link de pago Izipay", details: linkData }, { status: 500 });
    }
    return NextResponse.json({ paymentLink: linkData.response.urL_PaymentLink, linkData });
  } catch (err) {
    return NextResponse.json({ error: "Error interno generando link de pago Izipay", details: err }, { status: 500 });
  }
}
