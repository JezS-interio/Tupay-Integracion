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

const BillingForm = ({ defaults }: { defaults?: Partial<SavedAddress> }) => (
  <>
    <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
      <div className="w-full">
        <label htmlFor="firstName" className="block mb-2.5">
          Nombre <span className="text-red">*</span>
        </label>
        <input type="text" name="firstName" id="firstName" placeholder="Juan" defaultValue={defaults?.firstName || ""} className={inputClass} />
      </div>
      <div className="w-full">
        <label htmlFor="lastName" className="block mb-2.5">
          Apellido <span className="text-red">*</span>
        </label>
        <input type="text" name="lastName" id="lastName" placeholder="Pérez" defaultValue={defaults?.lastName || ""} className={inputClass} />
      </div>
    </div>

    <div className="mb-5">
      <label htmlFor="companyName" className="block mb-2.5">
        Nombre de la Empresa
      </label>
      <input type="text" name="companyName" id="companyName" defaultValue={defaults?.companyName || ""} className={inputClass} />
    </div>

    <div className="mb-5">
      <label htmlFor="countryName" className="block mb-2.5">
        País/ Región <span className="text-red">*</span>
      </label>
      <div className="relative">
        <select name="countryName" defaultValue={defaults?.country || "PE"} className="w-full bg-gray-1 rounded-md border border-gray-3 text-dark-4 py-3 pl-5 pr-9 duration-200 appearance-none outline-none focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20">
          <option value="PE">Perú</option>
          <option value="AR">Argentina</option>
          <option value="CL">Chile</option>
          <option value="CO">Colombia</option>
          <option value="MX">México</option>
          <option value="US">Estados Unidos</option>
        </select>
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-4">
          <svg className="fill-current" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.41469 5.03569L2.41467 5.03571L2.41749 5.03846L7.76749 10.2635L8.0015 10.492L8.23442 10.2623L13.5844 4.98735L13.5844 4.98735L13.5861 4.98569C13.6809 4.89086 13.8199 4.89087 13.9147 4.98569C14.0092 5.08024 14.0095 5.21864 13.9155 5.31345C13.9152 5.31373 13.915 5.31401 13.9147 5.31429L8.16676 10.9622L8.16676 10.9622L8.16469 10.9643C8.06838 11.0606 8.02352 11.0667 8.00039 11.0667C7.94147 11.0667 7.89042 11.0522 7.82064 10.9991L2.08526 5.36345C1.99127 5.26865 1.99154 5.13024 2.08609 5.03569C2.18092 4.94086 2.31986 4.94086 2.41469 5.03569Z" fill="" stroke="" strokeWidth="0.666667" />
          </svg>
        </span>
      </div>
    </div>

    <div className="mb-5">
      <label htmlFor="address" className="block mb-2.5">
        Dirección <span className="text-red">*</span>
      </label>
      <input type="text" name="address" id="address" placeholder="Número de casa y nombre de calle" defaultValue={defaults?.street || ""} className={inputClass} />
      <div className="mt-5">
        <input type="text" name="addressTwo" id="addressTwo" placeholder="Apartamento, suite, unidad, etc. (opcional)" defaultValue={defaults?.streetTwo || ""} className={inputClass} />
      </div>
    </div>

    <div className="mb-5">
      <label htmlFor="town" className="block mb-2.5">
        Ciudad <span className="text-red">*</span>
      </label>
      <input type="text" name="town" id="town" defaultValue={defaults?.city || ""} className={inputClass} />
    </div>

    <div className="mb-5">
      <label htmlFor="country" className="block mb-2.5">
        Departamento
      </label>
      <input type="text" name="country" id="country" defaultValue={defaults?.state || ""} className={inputClass} />
    </div>

    <div className="mb-5">
      <label htmlFor="phone" className="block mb-2.5">
        Teléfono <span className="text-red">*</span>
      </label>
      <input type="text" name="phone" id="phone" defaultValue={defaults?.phone || ""} className={inputClass} />
    </div>

    <div className="mb-5.5">
      <label htmlFor="email" className="block mb-2.5">
        Correo Electrónico <span className="text-red">*</span>
      </label>
      <input type="email" name="email" id="email" defaultValue={defaults?.email || ""} className={inputClass} />
    </div>
  </>
);

const Billing = () => {
  const { user } = useAuth();
  const [savedAddress, setSavedAddress] = useState<SavedAddress | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [showForm, setShowForm] = useState(false);

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

  const hasAddress = savedAddress !== null;
  const showFullForm = !hasAddress || showForm;

  return (
    <div className="mt-9">
      <h2 className="font-medium text-dark text-xl sm:text-2xl mb-5.5">
        Detalles de Facturación
      </h2>

      <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5">
        {loadingAddress ? (
          <p className="text-dark-5 py-4">Cargando...</p>
        ) : showFullForm ? (
          <>
            <BillingForm defaults={showForm && savedAddress ? savedAddress : undefined} />
            {hasAddress && (
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-blue text-sm hover:underline mt-3"
              >
                ← Usar dirección guardada
              </button>
            )}
          </>
        ) : (
          <>
            {/* Hidden inputs so FormData picks up saved address values */}
            <input type="hidden" name="firstName" value={savedAddress!.firstName} />
            <input type="hidden" name="lastName" value={savedAddress!.lastName} />
            <input type="hidden" name="email" value={savedAddress!.email} />
            <input type="hidden" name="phone" value={savedAddress!.phone} />
            <input type="hidden" name="address" value={savedAddress!.street} />
            <input type="hidden" name="addressTwo" value={savedAddress!.streetTwo || ""} />
            <input type="hidden" name="town" value={savedAddress!.city} />
            <input type="hidden" name="country" value={savedAddress!.state || ""} />
            <input type="hidden" name="countryName" value={savedAddress!.country || "PE"} />

            {/* Saved address summary */}
            <div className="mb-5 p-4 bg-gray-1 rounded-md border border-gray-3">
              <p className="font-medium text-dark mb-1">
                {savedAddress!.firstName} {savedAddress!.lastName}
              </p>
              <p className="text-custom-sm text-dark-4">
                {savedAddress!.street}{savedAddress!.streetTwo ? `, ${savedAddress!.streetTwo}` : ""}
              </p>
              <p className="text-custom-sm text-dark-4">
                {savedAddress!.city}{savedAddress!.state ? `, ${savedAddress!.state}` : ""}
              </p>
              <p className="text-custom-sm text-dark-4">
                {savedAddress!.phone} · {savedAddress!.email}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="text-blue text-sm hover:underline"
            >
              ¿Enviar a una dirección diferente?
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Billing;