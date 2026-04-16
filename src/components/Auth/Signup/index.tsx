'use client';

import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import toast from "react-hot-toast";

const Signup = () => {
  const router = useRouter();
  const { signup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmContraseña: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate passwords match
    if (formData.password !== formData.confirmContraseña) {
      toast.error("Contraseñas do not match");
      setLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      toast.error("Contraseña must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      await signup(formData.email, formData.password, formData.name);
      toast.success("Account created successfully!");
      router.push("/");
    } catch (error) {
      // Error handling is done in AuthContext
      console.error("Sign up error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Breadcrumb title={"Signup"} pages={["Signup"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
            <div className="text-center mb-11">
              <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
                Create an Account
              </h2>
              <p>Enter your detail below</p>
            </div>

            <div>
              <form onSubmit={handleSubmit}>
                <div className="mb-5">
                  <label htmlFor="name" className="block mb-2.5">
                    Nombre Completo <span className="text-red">*</span>
                  </label>

                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ingresa tu nombre completo"
                    required
                    disabled={loading}
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="mb-5">
                  <label htmlFor="email" className="block mb-2.5">
                    Correo Electrónico <span className="text-red">*</span>
                  </label>

                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Ingresa tu correo electrónico"
                    required
                    disabled={loading}
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="mb-5">
                  <label htmlFor="password" className="block mb-2.5">
                    Contraseña <span className="text-red">*</span>
                  </label>

                  <input
                    type="password"
                    name="password"
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Ingresa tu contraseña"
                    autoComplete="on"
                    required
                    minLength={6}
                    disabled={loading}
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="mb-5.5">
                  <label htmlFor="confirmContraseña" className="block mb-2.5">
                    Confirmar Contraseña <span className="text-red">*</span>
                  </label>

                  <input
                    type="password"
                    name="confirmContraseña"
                    id="confirmContraseña"
                    value={formData.confirmContraseña}
                    onChange={handleChange}
                    placeholder="Confirma tu contraseña"
                    autoComplete="on"
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
                  {loading ? "Creando cuenta..." : "Crear Cuenta"}
                </button>

                <p className="text-center mt-6">
                  ¿Ya tienes una cuenta?
                  <Link
                    href="/signin"
                    className="text-dark ease-out duration-200 hover:text-blue pl-2"
                  >
                    Iniciar Sesión
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Signup;
