"use client";

import React, { useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al suscribirse");
      if (data.message === "already_subscribed") {
        toast("Ya estás suscrito con ese correo.", { icon: "ℹ️" });
      } else {
        setSubscribed(true);
        toast.success("¡Suscripción exitosa! Revisa tu correo.");
      }
    } catch (err: any) {
      toast.error(err.message || "Error al suscribirse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="overflow-hidden">
      <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
        <div className="relative z-1 overflow-hidden rounded-xl">
          {/* <!-- bg shapes --> */}
          <Image
            src="/images/shapes/newsletter-bg.jpg"
            alt="background illustration"
            className="absolute -z-1 w-full h-full left-0 top-0 rounded-xl"
            width={1170}
            height={200}
          />
          <div className="absolute -z-1 max-w-[523px] max-h-[243px] w-full h-full right-0 top-0 bg-gradient-1"></div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 px-4 sm:px-7.5 xl:pl-12.5 xl:pr-14 py-11">
            <div className="max-w-[491px] w-full">
              <h2 className="max-w-[399px] text-white font-bold text-lg sm:text-xl xl:text-heading-4 mb-3">
                ¡No te Pierdas las Últimas Tendencias y Ofertas!
              </h2>
              <p className="text-white">
                Regístrate para recibir noticias sobre las últimas ofertas y códigos de descuento
              </p>
            </div>

            <div className="max-w-[477px] w-full">
              {subscribed ? (
                <p className="text-white font-medium text-lg">
                  ✅ ¡Gracias! Te enviaremos las mejores ofertas.
                </p>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Ingresa tu correo"
                      required
                      disabled={loading}
                      className="w-full bg-gray-1 border border-gray-3 outline-none rounded-md placeholder:text-dark-4 py-3 px-5 disabled:opacity-60"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex justify-center py-3 px-7 text-white bg-blue font-medium rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? "Enviando..." : "Suscribirse"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
