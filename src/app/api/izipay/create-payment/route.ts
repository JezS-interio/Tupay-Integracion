import { NextRequest, NextResponse } from "next/server";

const IZIPAY_API_KEY = process.env.IZIPAY_API_KEY!;
// Usar siempre el endpoint sandbox para pruebas
const IZIPAY_TOKENIZATION_URL = "https://sandbox-api-pw.izipay.pe/gateway/api/v1/proxy-cors/https://sandbox-api-pw.izipay.pe/tokenization/external/api/v1/tokens";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Validación básica de campos requeridos
    const requiredFields = [
      "merchantCode",
      "orderNumber",
      "datetimeTerminalTransaction",
      "card",
      "cardHolder",
      "buyer",
      "billingAddress",
      "clientIp"
    ];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // transactionId único por transacción
    const transactionId = body.transactionId || `${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // LOG: Mostrar el payload recibido
    console.log('[Izipay] Payload recibido:', JSON.stringify(body, null, 2));

    const izipayRes = await fetch(IZIPAY_TOKENIZATION_URL, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Authorization": IZIPAY_API_KEY,
        "Content-Type": "application/json",
        "transactionId": transactionId,
      },
      body: JSON.stringify({
        ...body,
        transactionId,
      }),
    });

    const izipayData = await izipayRes.json();

    // LOG: Mostrar respuesta completa de Izipay
    console.log('[Izipay] Respuesta completa:', JSON.stringify(izipayData, null, 2));

    if (!izipayRes.ok || izipayData.code !== "00") {
      return NextResponse.json({ error: izipayData.message || "Error al tokenizar tarjeta en Izipay", details: izipayData }, { status: 400 });
    }

    // Devolver el token generado
    return NextResponse.json({ token: izipayData.response?.token?.token, izipayData });
  } catch (error) {
    return NextResponse.json({ error: "Error interno en el servidor", details: error }, { status: 500 });
  }
}
