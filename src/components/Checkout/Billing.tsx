"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { getUserProfile } from "@/lib/firebase/users";
import { UserProfile } from "@/types/user";

type SavedAddress = NonNullable<UserProfile["shippingAddress"]> & {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

const inputClass =
  "rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20";

const Billing = () => {
  const { user } = useAuth();
  const [savedAddress, setSavedAddress] = useState<SavedAddress | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoadingAddress(false);
      return;
    }
    getUserProfile(user.uid)
      .then((profile) => {
        const addr = profile?.shippingAddress;
        if (addr && addr.firstName) {
          setSavedAddress(addr as SavedAddress);
        }
        setLoadingAddress(false);
      })
      .catch(() => setLoadingAddress(false));
  }, [user?.uid]);

  const d = savedAddress;
  const emailDefault = d?.email || user?.email || "";

  return (
    <div className="mt-9">
      <h2 className="font-medium text-dark text-xl sm:text-2xl mb-5.5">
        Detalles de Facturación
      </h2>

      <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5">
        {loadingAddress ? (
          <p className="text-dark-5 py-4">Cargando...</p>
        ) : (
          <>
            <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
              <div className="w-full">
                <label htmlFor="firstName" className="block mb-2.5">
                  Nombre <span className="text-red">*</span>
                </label>
                <input type="text" name="firstName" id="firstName" placeholder="Juan" defaultValue={d?.firstName || ""} className={inputClass} />
              </div>
              <div className="w-full">
                <label htmlFor="lastName" className="block mb-2.5">
                  Apellido <span className="text-red">*</span>
                </label>
                <input type="text" name="lastName" id="lastName" placeholder="Pérez" defaultValue={d?.lastName || ""} className={inputClass} />
              </div>
            </div>

            <div className="mb-5">
              <label className="block mb-2.5">País/ Región</label>
              <input type="hidden" name="countryName" value="PE" />
              <p className={inputClass + " text-dark-4 cursor-not-allowed bg-gray-2"}>Perú</p>
            </div>

            <div className="mb-5">
              <label htmlFor="address" className="block mb-2.5">
                Dirección <span className="text-red">*</span>
              </label>
              <input type="text" name="address" id="address" placeholder="Número de casa y nombre de calle" defaultValue={d?.street || ""} className={inputClass} />
              <div className="mt-5">
                <input type="text" name="addressTwo" id="addressTwo" placeholder="Apartamento, suite, unidad, etc. (opcional)" defaultValue={d?.streetTwo || ""} className={inputClass} />
              </div>
            </div>

            <div className="mb-5">
              <label htmlFor="town" className="block mb-2.5">
                Ciudad <span className="text-red">*</span>
              </label>
              <input type="text" name="town" id="town" defaultValue={d?.city || ""} className={inputClass} />
            </div>

            <div className="mb-5">
              <label htmlFor="country" className="block mb-2.5">
                Departamento
              </label>
              <input type="text" name="country" id="country" defaultValue={d?.state || ""} className={inputClass} />
            </div>

            <div className="mb-5">
              <label htmlFor="phone" className="block mb-2.5">
                Teléfono <span className="text-red">*</span>
              </label>
              <input type="text" name="phone" id="phone" defaultValue={d?.phone || ""} className={inputClass} />
            </div>

            <div className="mb-5.5">
              <label htmlFor="email" className="block mb-2.5">
                Correo Electrónico <span className="text-red">*</span>
              </label>
              <input type="email" name="email" id="email" defaultValue={emailDefault} className={inputClass} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Billing;