"use client";
import React from "react";
import Breadcrumb from "../Common/Breadcrumb";
import { useAuth } from "@/app/context/AuthContext";

const Contact = () => {
  const { user } = useAuth();
  return (
    <>
      <Breadcrumb title={"Contacto"} pages={["Contacto"]} />

      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col xl:flex-row gap-7.5">
            <div className="xl:max-w-[370px] w-full bg-white rounded-xl shadow-1">
              <div className="py-5 px-4 sm:px-7.5 border-b border-gray-3">
                <p className="font-medium text-xl text-dark">
                  Información de Contacto
                </p>
              </div>

              <div className="p-4 sm:p-7.5">
                <div className="flex flex-col gap-4">
                  <p className="flex items-center gap-4">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 22 22"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M9.11365 2.97913H12.8837C14.5684 2.97911 15.9027 2.9791 16.947 3.1195C18.0217 3.26399 18.8916 3.56843 19.5776 4.25443C20.2636 4.94043 20.568 5.8103 20.7125 6.88502C20.8529 7.9293 20.8529 9.26363 20.8529 10.9482V11.0517C20.8529 12.7363 20.8529 14.0706 20.7125 15.1149C20.568 16.1896 20.2636 17.0595 19.5776 17.7455C18.8916 18.4315 18.0217 18.7359 16.947 18.8804C15.9027 19.0208 14.5684 19.0208 12.8837 19.0208H9.11366C7.42904 19.0208 6.09471 19.0208 5.05043 18.8804C3.97571 18.7359 3.10584 18.4315 2.41984 17.7455C1.73384 17.0595 1.4294 16.1896 1.28491 15.1149C1.14451 14.0706 1.14452 12.7363 1.14453 11.0517V10.9482C1.14452 9.26363 1.14451 7.9293 1.28491 6.88502C1.4294 5.8103 1.73384 4.94043 2.41984 4.25443C3.10584 3.56843 3.97571 3.26399 5.05043 3.1195C6.09471 2.9791 7.42904 2.97911 9.11365 2.97913ZM5.23364 4.48224C4.31139 4.60623 3.78005 4.83876 3.39211 5.2267C3.00417 5.61465 2.77164 6.14599 2.64764 7.06824C2.52099 8.01026 2.51953 9.25204 2.51953 11C2.51953 12.7479 2.52099 13.9897 2.64764 14.9317C2.77164 15.8539 3.00417 16.3853 3.39211 16.7732C3.78005 17.1612 4.31139 17.3937 5.23364 17.5177C6.17567 17.6443 7.41745 17.6458 9.16536 17.6458H12.832C14.58 17.6458 15.8217 17.6443 16.7638 17.5177C17.686 17.3937 18.2173 17.1612 18.6053 16.7732C18.9932 16.3853 19.2258 15.8539 19.3498 14.9317C19.4764 13.9897 19.4779 12.7479 19.4779 11C19.4779 9.25204 19.4764 8.01026 19.3498 7.06824C19.2258 6.14599 18.9932 5.61465 18.6053 5.2267C18.2173 4.83876 17.686 4.60623 16.7638 4.48224C15.8217 4.35559 14.58 4.35413 12.832 4.35413H9.16537C7.41745 4.35413 6.17567 4.35559 5.23364 4.48224ZM4.97055 6.89317C5.21362 6.60148 5.64713 6.56207 5.93883 6.80514L7.91781 8.4543C8.77303 9.16697 9.36678 9.66017 9.86807 9.98258C10.3533 10.2947 10.6824 10.3994 10.9987 10.3994C11.315 10.3994 11.6441 10.2947 12.1293 9.98258C12.6306 9.66017 13.2244 9.16697 14.0796 8.4543L16.0586 6.80514C16.3503 6.56207 16.7838 6.60148 17.0269 6.89317C17.2699 7.18486 17.2305 7.61837 16.9388 7.86145L14.9254 9.53932C14.1129 10.2164 13.4543 10.7652 12.8731 11.139C12.2677 11.5284 11.678 11.7744 10.9987 11.7744C10.3194 11.7744 9.72973 11.5284 9.12428 11.139C8.54306 10.7652 7.88452 10.2164 7.07203 9.53933L5.05857 7.86145C4.76688 7.61837 4.72747 7.18486 4.97055 6.89317Z"
                        fill="#3C50E0"
                      />
                    </svg>
                    Nombre: {user?.displayName || user?.email?.split('@')[0] || 'No has iniciado sesión'}
                  </p>

                </div>
              </div>
            </div>

            <div className="xl:max-w-[770px] w-full bg-white rounded-xl shadow-1 p-4 sm:p-7.5 xl:p-10">
              <form>
                <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
                  <div className="w-full">
                    <label htmlFor="firstName" className="block mb-2.5">
                      Nombre <span className="text-red">*</span>
                    </label>

                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      placeholder="Juan"
                      className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    />
                  </div>

                  <div className="w-full">
                    <label htmlFor="lastName" className="block mb-2.5">
                      Apellido <span className="text-red">*</span>
                    </label>

                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      placeholder="Pérez"
                      className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    />
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
                  <div className="w-full">
                    <label htmlFor="subject" className="block mb-2.5">
                      Asunto
                    </label>

                    <input
                      type="text"
                      name="subject"
                      id="subject"
                      placeholder="Escribe tu asunto"
                      className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    />
                  </div>

                  <div className="w-full">
                    <label htmlFor="phone" className="block mb-2.5">
                      Teléfono
                    </label>

                    <input
                      type="text"
                      name="phone"
                      id="phone"
                      placeholder="Ingresa tu teléfono"
                      className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    />
                  </div>
                </div>

                <div className="mb-7.5">
                  <label htmlFor="message" className="block mb-2.5">
                    Mensaje
                  </label>

                  <textarea
                    name="message"
                    id="message"
                    rows={5}
                    placeholder="Escribe tu mensaje"
                    className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full p-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark"
                >
                  Enviar Mensaje
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
