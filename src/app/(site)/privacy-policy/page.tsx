import React from "react";
import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <>
      {/* Hero banner */}
      <div className="bg-[#F2F7FF] border-b border-gray-200 py-10">
        <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
          <p className="text-sm text-gray-500 mb-2">
            <Link href="/" className="hover:text-blue-600 transition">Inicio</Link>
            <span className="mx-2">›</span>
            <span className="text-dark font-medium">Política de Privacidad</span>
          </p>
          <h1 className="text-3xl xl:text-4xl font-bold text-dark">Política de Privacidad</h1>
          <p className="mt-2 text-gray-500 text-sm">Última actualización: Abril 2026</p>
        </div>
      </div>

      {/* Content */}
      <section className="bg-[#F8FAFF] py-14 min-h-[60vh]">
        <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
          <div className="bg-white rounded-[10px] shadow-sm overflow-hidden">

            {/* Intro */}
            <div className="px-8 pt-8 pb-6 border-b border-gray-100">
              <p className="text-gray-600 leading-relaxed">
                Esta Política de Privacidad describe cómo <strong>Intitech Solutions</strong> recopila, utiliza y protege
                los datos personales de los usuarios en cumplimiento con la normativa vigente en Perú (Ley N° 29733 —
                Ley de Protección de Datos Personales) y demás disposiciones aplicables.
              </p>
            </div>

            {/* Sections */}
            <div className="divide-y divide-gray-100">

              <div className="px-8 py-6">
                <h2 className="text-lg font-semibold text-dark mb-3">1. Datos que recopilamos</h2>
                <p className="text-gray-600 leading-relaxed mb-3">
                  Podemos recopilar la siguiente información cuando usas nuestro sitio o realizas una compra:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1.5 pl-2">
                  <li>Nombre completo y correo electrónico</li>
                  <li>Dirección de envío y número de teléfono</li>
                  <li>Información de pago (procesada de forma segura por pasarelas autorizadas)</li>
                  <li>Historial de compras y actividad en la plataforma</li>
                  <li>Datos técnicos: IP, tipo de navegador, páginas visitadas</li>
                </ul>
              </div>

              <div className="px-8 py-6">
                <h2 className="text-lg font-semibold text-dark mb-3">2. Finalidad del tratamiento</h2>
                <p className="text-gray-600 leading-relaxed mb-3">
                  Los datos recopilados se utilizan exclusivamente para:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1.5 pl-2">
                  <li>Procesar y gestionar tus pedidos y devoluciones</li>
                  <li>Enviarte confirmaciones, facturas y actualizaciones de envío</li>
                  <li>Mejorar la experiencia de uso y personalizar contenido</li>
                  <li>Cumplir con obligaciones legales y fiscales</li>
                  <li>Prevenir fraudes y proteger la seguridad de la plataforma</li>
                </ul>
              </div>

              <div className="px-8 py-6">
                <h2 className="text-lg font-semibold text-dark mb-3">3. Seguridad de los datos</h2>
                <p className="text-gray-600 leading-relaxed">
                  Adoptamos medidas técnicas y organizativas razonables para proteger tu información personal contra
                  acceso no autorizado, pérdida o divulgación. Las transacciones de pago son procesadas mediante
                  conexiones cifradas (TLS/SSL) y no almacenamos datos de tarjetas en nuestros servidores.
                </p>
              </div>

              <div className="px-8 py-6">
                <h2 className="text-lg font-semibold text-dark mb-3">4. Compartición con terceros</h2>
                <p className="text-gray-600 leading-relaxed">
                  No vendemos ni cedemos tus datos personales a terceros con fines comerciales. Podemos compartir
                  información estrictamente necesaria con proveedores de logística, pasarelas de pago y servicios de
                  infraestructura tecnológica que actúan bajo nuestras instrucciones y están sujetos a confidencialidad.
                </p>
              </div>

              <div className="px-8 py-6">
                <h2 className="text-lg font-semibold text-dark mb-3">5. Tus derechos</h2>
                <p className="text-gray-600 leading-relaxed mb-3">
                  Conforme a la ley peruana tienes derecho a:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1.5 pl-2">
                  <li><strong>Acceder</strong> a los datos personales que conservamos sobre ti</li>
                  <li><strong>Rectificar</strong> datos inexactos o incompletos</li>
                  <li><strong>Cancelar</strong> el tratamiento de tus datos cuando ya no sea necesario</li>
                  <li><strong>Oponerte</strong> al uso de tus datos con fines de marketing</li>
                </ul>
                <p className="text-gray-600 mt-3">
                  Para ejercer estos derechos escríbenos a{" "}
                  <a href="mailto:admin@intitechcorp.com" className="text-blue-600 hover:underline">admin@intitechcorp.com</a>.
                </p>
              </div>

              <div className="px-8 py-6">
                <h2 className="text-lg font-semibold text-dark mb-3">6. Cambios a esta política</h2>
                <p className="text-gray-600 leading-relaxed">
                  Podemos actualizar esta política periódicamente. Te notificaremos mediante un aviso en el sitio o por
                  correo electrónico ante cambios significativos. El uso continuado de la plataforma tras la publicación
                  de cambios implica tu aceptación.
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>
    </>
  );
}
