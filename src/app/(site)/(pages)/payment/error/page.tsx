"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");

  return (
    <section className="overflow-hidden py-20 bg-gray-2 min-h-screen flex items-center">
      <div className="max-w-[600px] w-full mx-auto px-4 sm:px-8 xl:px-0 text-center">
        <div className="bg-white shadow-1 rounded-[10px] p-10">
          <div className="flex justify-center mb-6">
            <div className="bg-red-100 rounded-full p-5">
              <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-dark mb-4">Pago No Completado</h1>
          <p className="text-dark-4 mb-4">
            Hubo un problema al procesar tu pago. Tu pedido está guardado y puedes intentarlo nuevamente.
          </p>
          {orderId && (
            <p className="text-dark-5 text-sm mb-6">
              Número de pedido: <span className="font-semibold text-dark">{orderId}</span>
            </p>
          )}
          <p className="text-dark-4 text-sm mb-8">
            Si el problema persiste, contáctanos por soporte.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/checkout"
              className="inline-block bg-blue text-white py-3 px-8 rounded-md hover:bg-blue-dark transition"
            >
              Intentar de nuevo
            </Link>
            <Link
              href="/"
              className="inline-block border border-gray-3 text-dark py-3 px-8 rounded-md hover:bg-gray-2 transition"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function PaymentErrorPage() {
  return (
    <Suspense>
      <ErrorContent />
    </Suspense>
  );
}
