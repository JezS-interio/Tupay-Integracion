import React from "react";
import Link from "next/link";

const faqs = [
  {
    category: "Pedidos y compras",
    items: [
      {
        q: "¿Cómo puedo realizar un pedido?",
        a: "Navega por nuestra tienda, selecciona el producto que deseas, elige las especificaciones (si aplica) y haz clic en 'Añadir al carrito'. Cuando estés listo, ve al carrito y sigue el proceso de pago.",
      },
      {
        q: "¿Puedo modificar o cancelar mi pedido?",
        a: "Puedes solicitar la modificación o cancelación de tu pedido dentro de las primeras 2 horas tras realizarlo escribiéndonos a admin@intitechcorp.com con tu número de pedido. Después de ese plazo el pedido puede estar en proceso de preparación.",
      },
      {
        q: "¿Qué métodos de pago aceptan?",
        a: "Aceptamos tarjetas de crédito/débito Visa y Mastercard, pagos mediante PayPal, Apple Pay y Google Pay. Todos los pagos se procesan de forma segura con cifrado TLS.",
      },
    ],
  },
  {
    category: "Envíos y entregas",
    items: [
      {
        q: "¿Cuánto demora el envío?",
        a: "Los tiempos dependen de tu ubicación. En Lima Metropolitana el envío suele tardar 2–4 días hábiles. Para provincias el plazo es de 4–7 días hábiles. Recibirás un correo con el número de seguimiento una vez despachado tu pedido.",
      },
      {
        q: "¿Tienen envío gratuito?",
        a: "Ofrecemos envío gratuito en pedidos superiores a S/ 150. Para pedidos de menor monto se aplicará una tarifa de envío calculada según tu ubicación en el proceso de pago.",
      },
      {
        q: "¿Puedo rastrear mi pedido?",
        a: "Sí. Una vez que tu pedido sea despachado recibirás un correo electrónico con el número de guía y el enlace para rastrearlo en tiempo real.",
      },
    ],
  },
  {
    category: "Devoluciones y reembolsos",
    items: [
      {
        q: "¿Cómo solicito una devolución?",
        a: "Contáctanos a admin@intitechcorp.com dentro de los 14 días hábiles posteriores a la recepción de tu pedido, indicando el número de pedido y el motivo de la devolución. Nuestro equipo te guiará en los siguientes pasos.",
      },
      {
        q: "¿En cuánto tiempo recibiré mi reembolso?",
        a: "Una vez que recibamos e inspeccionemos el producto devuelto, procesamos el reembolso en un plazo de 5–10 días hábiles. El abono aparecerá en tu medio de pago original.",
      },
    ],
  },
  {
    category: "Cuenta y soporte",
    items: [
      {
        q: "¿Cómo creo una cuenta?",
        a: "Haz clic en 'Account' en la parte superior del sitio y selecciona 'Iniciar Sesión / Registrarse'. Completa el formulario con tu nombre, correo y contraseña. Recibirás un correo de verificación para activar tu cuenta.",
      },
      {
        q: "Olvidé mi contraseña, ¿qué hago?",
        a: "En la pantalla de inicio de sesión encontrarás la opción '¿Olvidaste tu contraseña?'. Ingresa tu correo y te enviaremos un enlace para restablecerla.",
      },
      {
        q: "¿Cómo contacto al soporte?",
        a: "Puedes escribirnos a admin@intitechcorp.com o usar el formulario en nuestra página de Contacto. Respondemos en un plazo de 24–48 horas hábiles.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <>
      {/* Hero banner */}
      <div className="bg-[#F2F7FF] border-b border-gray-200 py-10">
        <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
          <p className="text-sm text-gray-500 mb-2">
            <Link href="/" className="hover:text-blue-600 transition">Inicio</Link>
            <span className="mx-2">›</span>
            <span className="text-dark font-medium">Preguntas Frecuentes</span>
          </p>
          <h1 className="text-3xl xl:text-4xl font-bold text-dark">Preguntas Frecuentes</h1>
          <p className="mt-2 text-gray-500 text-sm">Encuentra respuestas a las dudas más comunes sobre compras, envíos y soporte.</p>
        </div>
      </div>

      {/* Content */}
      <section className="bg-[#F8FAFF] py-14 min-h-[60vh]">
        <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0 space-y-6">
          {faqs.map((group) => (
            <div key={group.category} className="bg-white rounded-[10px] shadow-sm overflow-hidden">
              {/* Category header */}
              <div className="px-8 py-5 bg-[#F8FAFF] border-b border-gray-200">
                <h2 className="text-base font-semibold text-blue-700 uppercase tracking-wide">
                  {group.category}
                </h2>
              </div>
              {/* Items */}
              <div className="divide-y divide-gray-100">
                {group.items.map((item, idx) => (
                  <div key={idx} className="px-8 py-5">
                    <h3 className="font-semibold text-dark mb-1.5">{item.q}</h3>
                    <p className="text-gray-600 leading-relaxed text-sm">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Still have questions */}
          <div className="bg-blue-50 border border-blue-100 rounded-[10px] px-8 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="font-semibold text-dark mb-1">¿No encontraste lo que buscabas?</h3>
              <p className="text-gray-600 text-sm">Nuestro equipo está disponible para ayudarte de lunes a sábado.</p>
            </div>
            <a
              href="mailto:admin@intitechcorp.com"
              className="shrink-0 inline-block bg-blue-600 text-white text-sm font-medium px-6 py-2.5 rounded-md hover:bg-blue-700 transition"
            >
              Contactar soporte
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
