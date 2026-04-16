'use client';

import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import React, { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";

const ForgotContraseña = () => {
  const { resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setCorreo] = useState("");
  const [emailSent, setCorreoSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await resetPassword(email);
      setCorreoSent(true);
    } catch (error) {
      // Error handling is done in AuthContext
      console.error("Contraseña reset error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Breadcrumb title={"Forgot Contraseña"} pages={["Forgot Contraseña"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
            {!emailSent ? (
              <>
                <div className="text-center mb-11">
                  <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
                    Forgot Your Contraseña?
                  </h2>
                  <p>Enter your email address and we&apos;ll send you a reset link</p>
                </div>

                <div>
                  <form onSubmit={handleSubmit}>
                    <div className="mb-5">
                      <label htmlFor="email" className="block mb-2.5">
                        Correo Address
                      </label>

                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={email}
                        onChange={(e) => setCorreo(e.target.value)}
                        placeholder="Enter your email"
                        required
                        disabled={loading}
                        className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex justify-center font-medium text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue mt-7.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Enviando..." : "Enviar Enlace de Recuperación"}
                    </button>

                    <p className="text-center mt-6">
                      ¿Recuerdas tu contraseña?
                      <Link
                        href="/signin"
                        className="text-dark ease-out duration-200 hover:text-blue pl-2"
                      >
                        Iniciar Sesión
                      </Link>
                    </p>
                  </form>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="mx-auto w-20 h-20 rounded-full bg-green/10 flex items-center justify-center mb-6">
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 40 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M16.6667 20L18.3334 21.6667L23.3334 16.6667M33.3334 20C33.3334 27.3638 27.3638 33.3333 20 33.3333C12.6362 33.3333 6.66669 27.3638 6.66669 20C6.66669 12.6362 12.6362 6.66667 20 6.66667C27.3638 6.66667 33.3334 12.6362 33.3334 20Z"
                      stroke="#22AD5C"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-3">
                  Revisa Tu Correo
                </h2>
                <p className="text-dark-4 mb-8">
                  Hemos enviado un enlace de recuperación a <strong>{email}</strong>
                </p>
                <p className="text-dark-4 text-sm mb-8">
                  ¿No recibiste el correo? Revisa tu carpeta de spam o intenta de nuevo
                </p>

                <div className="flex flex-col sm:flex-row gap-3.5">
                  <button
                    onClick={() => {
                      setCorreoSent(false);
                      setCorreo("");
                    }}
                    className="flex-1 font-medium text-dark bg-gray-1 border border-gray-3 py-3 px-6 rounded-lg ease-out duration-200 hover:bg-gray-2"
                  >
                    Intentar de Nuevo
                  </button>
                  <Link
                    href="/signin"
                    className="flex-1 font-medium text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue text-center"
                  >
                    Volver a Iniciar Sesión
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default ForgotContraseña;
