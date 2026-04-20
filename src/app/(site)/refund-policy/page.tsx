import React from "react";
import Link from "next/link";

export default function RefundPolicy() {
  return (
    <>
      {/* Hero banner */}
      <div className="bg-[#F2F7FF] border-b border-gray-200 py-10">
        <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
          <p className="text-sm text-gray-500 mb-2">
            <Link href="/" className="hover:text-blue-600 transition">Inicio</Link>
            <span className="mx-2">›</span>
            <span className="text-dark font-medium">Política de Reembolso</span>
          </p>
          <h1 className="text-3xl xl:text-4xl font-bold text-dark">Política de Reembolso</h1>
          <p className="mt-2 text-gray-500 text-sm">Última actualización: Abril 2026</p>
        </div>
      </div>

      {/* Content */}
      <section className="bg-[#F8FAFF] py-14 min-h-[60vh]">
        <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
          <div className="bg-white rounded-[10px] shadow-sm overflow-hidden">

            <div className="px-8 pt-8 pb-6 border-b border-gray-100">
              <p className="text-gray-600 leading-relaxed">
                En <strong>Intitech Solutions</strong> queremos que estés completamente satisfecho con tu compra.
                Si por alguna razón no es así, esta política explica cómo gestionar devoluciones y reembolsos
                de forma transparente y justa.
              </p>
            </div>

            <div className="divide-y divide-gray-100">

              <div className="px-8 py-6">
                <h2 className="text-lg font-semibold text-dark mb-3">1. Plazo para solicitar devolución</h2>
                <p className="text-gray-600 leading-relaxed">
                  Puedes solicitar una devolución dentro de los <strong>14 días hábiles</strong> siguientes a la
                  recepción del producto. Pasado ese plazo, no se aceptarán solicitudes de devolución salvo
                  que el producto presente defectos de fábrica cubiertos por garantía.
                </p>
              </div>

              <div className="px-8 py-6">
                <h2 className="text-lg font-semibold text-dark mb-3">2. Condiciones del producto</h2>
                <p className="text-gray-600 leading-relaxed mb-3">
                  Para que la devolución sea aceptada, el producto debe:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1.5 pl-2">
                  <li>Estar en su estado original, sin uso ni daños causados por el cliente</li>
                  <li>Incluir todos sus accesorios, manuales y embalaje original</li>
                  <li>No haber sido activado, desbloqueado o configurado de forma permanente</li>
                  <li>Contar con el número de pedido o comprobante de compra</li>
                </ul>
              </div>

              <div className="px-8 py-6">
                <h2 className="text-lg font-semibold text-dark mb-3">3. Proceso de devolución</h2>
                <ol className="list-decimal list-inside text-gray-600 space-y-2 pl-2">
                  <li>Escríbenos a <a href="mailto:admin@intitechcorp.com" className="text-blue-600 hover:underline">admin@intitechcorp.com</a> indicando tu número de pedido y el motivo de la devolución.</li>
                  <li>Nuestro equipo revisará la solicitud y te responderá en un máximo de <strong>3 días hábiles</strong>.</li>
                  <li>Si la devolución es aprobada, recibirás instrucciones para el envío del producto.</li>
                  <li>Una vez recibido e inspeccionado el artículo, procesaremos el reembolso en un plazo de <strong>5–10 días hábiles</strong>.</li>
                </ol>
              </div>

              <div className="px-8 py-6">
                <h2 className="text-lg font-semibold text-dark mb-3">4. Método de reembolso</h2>
                <p className="text-gray-600 leading-relaxed">
                  El reembolso se realizará por el mismo medio de pago utilizado en la compra original. En caso de
                  que eso no sea posible, coordinaremos con el cliente la mejor alternativa disponible.
                </p>
              </div>

              <div className="px-8 py-6">
                <h2 className="text-lg font-semibold text-dark mb-3">5. Productos no reembolsables</h2>
                <ul className="list-disc list-inside text-gray-600 space-y-1.5 pl-2">
                  <li>Productos con daños causados por mal uso del cliente</li>
                  <li>Artículos con sellos de seguridad rotos sin justificación</li>
                  <li>Productos digitales o con licencia activada</li>
                  <li>Ofertas finales o productos marcados como "sin devolución"</li>
                </ul>
              </div>

              <div className="px-8 py-6">
                <h2 className="text-lg font-semibold text-dark mb-3">6. Garantía de fábrica</h2>
                <p className="text-gray-600 leading-relaxed">
                  Los productos con defectos de fábrica están cubiertos por la garantía del fabricante. En estos casos
                  te ayudamos a gestionar el proceso con el fabricante o distribuidor autorizado.
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>
    </>
  );
}
