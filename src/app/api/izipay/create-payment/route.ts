import { NextRequest, NextResponse } from "next/server";

// TODO: Reemplaza estos valores con los de producción o usa variables de entorno
const IZIPAY_API_KEY = process.env.IZIPAY_API_KEY!;
const IZIPAY_API_SECRET = process.env.IZIPAY_API_SECRET!;
const IZIPAY_BASE_URL = process.env.IZIPAY_BASE_URL || "https://api.micuentaweb.pe";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orderId,
      amount,
      currency = "PEN",
      firstName,
      lastName,
      email,
      document,
      documentType = "DNI",
      phone,
    } = body;

    // Validación básica
    if (!orderId || !amount || !firstName || !lastName || !email || !document) {
      const missing = { orderId: !orderId, amount: !amount, firstName: !firstName, lastName: !lastName, email: !email, document: !document };
      return NextResponse.json({ error: "Missing required fields", missing }, { status: 400 });
    }

    // Construir el payload según la documentación de Izipay
    const paymentPayload = {
      amount: {
        currency,
        total: Number(amount),
      },
      orderId,
      customer: {
        firstName,
        lastName,
        email,
        document,
        documentType,
        phone,
      },
      // Agrega aquí otros campos requeridos por Izipay
      // ...
      // URLs de retorno (ajusta según tu frontend)
      redirectUrls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?order=${orderId}`,
        error: `${process.env.NEXT_PUBLIC_APP_URL}/payment/error?order=${orderId}`,
        cancel: `${process.env.NEXT_PUBLIC_APP_URL}/checkout`,
      },
    };

    // Llamada a la API de Izipay (ejemplo: crear link de pago)
    // Construir header de autenticación según si hay secret o no
    let authHeader: string;
    if (IZIPAY_API_SECRET && IZIPAY_API_SECRET.length > 0) {
      // Autenticación Basic con key:secret
      authHeader = `Basic ${Buffer.from(`${IZIPAY_API_KEY}:${IZIPAY_API_SECRET}`).toString("base64")}`;
    } else {
      // Si no hay secret, usar solo la API Key (Bearer o custom, según doc de Izipay)
      // Aquí se usa Bearer por defecto, ajusta si la doc indica otro esquema
      authHeader = `Bearer ${IZIPAY_API_KEY}`;
    }

    const izipayRes = await fetch(`${IZIPAY_BASE_URL}/api-payment/V4/Charge/CreatePayment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader,
      },
      body: JSON.stringify(paymentPayload),
    });

    const izipayData = await izipayRes.json();

    if (!izipayRes.ok || !izipayData.redirectUrl) {
      return NextResponse.json({ error: izipayData.errorMessage || "Error al crear el pago en Izipay", details: izipayData }, { status: 400 });
    }

    // Devolver la URL de pago para redirigir al usuario
    return NextResponse.json({ redirect_url: izipayData.redirectUrl });
  } catch (error) {
    return NextResponse.json({ error: "Error interno en el servidor", details: error }, { status: 500 });
  }
}
