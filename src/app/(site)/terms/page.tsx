import React from "react";
import Link from "next/link";

export default function TermsPage() {
  return (
    <>
      {/* Hero banner */}
      <div className="bg-[#F2F7FF] border-b border-gray-200 py-10">
        <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
          <p className="text-sm text-gray-500 mb-2">
            <Link href="/" className="hover:text-blue-600 transition">Inicio</Link>
            <span className="mx-2">›</span>
            <span className="text-dark font-medium">Términos de Uso</span>
          </p>
          <h1 className="text-3xl xl:text-4xl font-bold text-dark">Términos de Uso</h1>
          <p className="mt-2 text-gray-500 text-sm">Última actualización: Abril 2026</p>
        </div>
      </div>

      {/* Content */}
      <section className="bg-[#F8FAFF] py-14 min-h-[60vh]">
        <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
          <div className="bg-white rounded-[10px] shadow-sm overflow-hidden">

            <div className="px-8 pt-8 pb-6 border-b border-gray-100">
              <p className="text-gray-600 leading-relaxed">
                Estos Términos de Uso regulan el acceso y la utilización del sitio web de <strong>Intitech Solutions</strong>.
                Al navegar o realizar compras en nuestra plataforma, aceptas íntegramente las condiciones descritas a continuación.
              </p>
            </div>

            <div className="divide-y divide-gray-100">

              <div className="px-8 py-6">
                <h2 className="text-lg font-semibold text-dark mb-3">1. Aceptación de los términos</h2>
                <p className="text-gray-600 leading-relaxed">
                  El acceso y uso de este sitio implica la aceptación plena de los presentes Términos de Uso.
                  Si no estás de acuerdo con alguno de los puntos, te pedimos que no utilices la plataforma.
                  Intitech se reserva el derecho de modificar estos términos en cualquier momento.
                </p>
              </div>

              <div className="px-8 py-6">
                <h2 className="text-lg font-semibold text-dark mb-3">2. Uso permitido</h2>
                <p className="text-gray-600 leading-relaxed mb-3">
                  El sitio debe utilizarse exclusivamente para fines personales y lícitos. Queda estrictamente prohibido:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1.5 pl-2">
                  <li>Utilizar el sitio para actividades ilegales o fraudulentas</li>
                  <li>Intentar acceder sin autorización a sistemas o datos de Intitech</li>
                  <li>Copiar, redistribuir o modificar contenidos protegidos sin permiso expreso</li>
                  <li>Publicar información falsa o engañosa en el proceso de compra</li>
                  <li>Interferir con el funcionamiento normal de la plataforma</li>
                </ul>
              </div>

              <div className="px-8 py-6">
                <h2 className="text-lg font-semibold text-dark mb-3">3. Propiedad intelectual</h2>
                <p className="text-gray-600 leading-relaxed">
                  Todos los contenidos del sitio —incluyendo textos, imágenes, logotipos, diseño y código— son propiedad
                  de Intitech Solutions o de sus licenciantes y están protegidos por la legislación de derechos de autor.
                  Queda prohibida su reproducción total o parcial sin autorización escrita.
                </p>
              </div>

              <div className="px-8 py-6">
                <h2 className="text-lg font-semibold text-dark mb-3">4. Cuentas de usuario</h2>
                <p className="text-gray-600 leading-relaxed">
                  Al crear una cuenta eres responsable de mantener la confidencialidad de tus credenciales y de todas
                  las actividades realizadas desde tu cuenta. Debes notificarnos de inmediato ante cualquier uso no
                  autorizado a través de <a href="mailto:admin@intitechcorp.com" className="text-blue-600 hover:underline">admin@intitechcorp.com</a>.
                </p>
              </div>

              <div className="px-8 py-6">
                <h2 className="text-lg font-semibold text-dark mb-3">5. Limitación de responsabilidad</h2>
                <p className="text-gray-600 leading-relaxed">
                  Intitech no será responsable por daños indirectos, pérdida de datos o interrupciones del servicio
                  derivadas de causas ajenas a su control razonable, incluyendo fallas de conectividad, eventos de
                  fuerza mayor o actos de terceros.
                </p>
              </div>

              <div className="px-8 py-6">
                <h2 className="text-lg font-semibold text-dark mb-3">6. Ley aplicable</h2>
                <p className="text-gray-600 leading-relaxed">
                  Estos términos se rigen por las leyes de la República del Perú. Cualquier controversia derivada de su
                  interpretación o cumplimiento se someterá a los tribunales competentes de Lima, Perú.
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>
    </>
  );
}
