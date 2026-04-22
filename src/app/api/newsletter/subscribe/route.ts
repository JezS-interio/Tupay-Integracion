import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: 'Correo electrónico inválido' },
      { status: 400 }
    );
  }

  // Mock: en producción aquí se integrará el servicio de email marketing
  return NextResponse.json({ message: 'subscribed' }, { status: 200 });
}
