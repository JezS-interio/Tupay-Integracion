import React, { useState } from "react";
import Image from "next/image";

interface PaymentMethodProps {
  selectedPayment: string;
  onPaymentChange: (method: string) => void;
  document: string;
  onDocumentChange: (value: string) => void;
  documentType: string;
  onDocumentTypeChange: (value: string) => void;
}

const PaymentMethod = ({
  selectedPayment,
  onPaymentChange,
  document,
  onDocumentChange,
  documentType,
  onDocumentTypeChange,
}: PaymentMethodProps) => {
  const payment = selectedPayment;
  const setPayment = onPaymentChange;
  return (
    <div className="bg-white shadow-1 rounded-[10px] mt-7.5">
      <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
        <h3 className="font-medium text-xl text-dark">Método de Pago</h3>
      </div>

      <div className="p-4 sm:p-8.5">
        <div className="flex flex-col gap-3">
          {/* TuPay */}
          <label
            htmlFor="tupay"
            className="flex cursor-pointer select-none items-center gap-4"
          >
            <div className="relative">
              <input
                type="checkbox"
                name="tupay"
                id="tupay"
                className="sr-only"
                onChange={() => setPayment("tupay")}
              />
              <div
                className={`flex h-4 w-4 items-center justify-center rounded-full ${
                  payment === "tupay"
                    ? "border-4 border-blue"
                    : "border border-gray-4"
                }`}
              ></div>
            </div>
            <div
              className={`rounded-md border-[0.5px] py-3.5 px-5 ease-out duration-200 hover:bg-gray-2 hover:border-transparent hover:shadow-none min-w-[240px] ${
                payment === "tupay"
                  ? "border-transparent bg-gray-2"
                  : "border-gray-4 shadow-1"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-blue text-lg">TuPay</span>
                <div className="border-l border-gray-4 pl-3">
                  <p className="text-sm">Pago online seguro</p>
                  <p className="text-xs text-dark-5">Yape, Plin, BCP, BBVA, Visa, Mastercard</p>
                </div>
              </div>
            </div>
          </label>

          {/* Cash on Delivery */}
          <label
            htmlFor="cash"
            className="flex cursor-pointer select-none items-center gap-4"
          >
            <div className="relative">
              <input
                type="checkbox"
                name="cash"
                id="cash"
                className="sr-only"
                onChange={() => setPayment("cash")}
              />
              <div
                className={`flex h-4 w-4 items-center justify-center rounded-full ${
                  payment === "cash"
                    ? "border-4 border-blue"
                    : "border border-gray-4"
                }`}
              ></div>
            </div>
            <div
              className={`rounded-md border-[0.5px] py-3.5 px-5 ease-out duration-200 hover:bg-gray-2 hover:border-transparent hover:shadow-none min-w-[240px] ${
                payment === "cash"
                  ? "border-transparent bg-gray-2"
                  : "border-gray-4 shadow-1"
              }`}
            >
              <div className="flex items-center">
                <div className="pr-2.5">
                  <Image src="/images/checkout/cash.svg" alt="cash" width={21} height={21} />
                </div>
                <div className="border-l border-gray-4 pl-2.5">
                  <p>Contra entrega</p>
                </div>
              </div>
            </div>
          </label>
        </div>

        {/* DNI field — required only for TuPay */}
        {payment === "tupay" && (
          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <div className="sm:w-36">
              <label htmlFor="documentType" className="block text-sm mb-1.5 text-dark">
                Tipo Doc.
              </label>
              <select
                id="documentType"
                name="documentType"
                value={documentType}
                onChange={(e) => onDocumentTypeChange(e.target.value)}
                className="w-full rounded-md border border-gray-3 bg-gray-1 text-dark px-3 py-2.5 outline-none focus:border-transparent focus:ring-2 focus:ring-blue/20"
              >
                <option value="DNI">DNI</option>
                <option value="CE">CE</option>
                <option value="RUC">RUC</option>
                <option value="PASS">Pasaporte</option>
              </select>
            </div>
            <div className="flex-1">
              <label htmlFor="payerDocument" className="block text-sm mb-1.5 text-dark">
                Número de documento <span className="text-red">*</span>
              </label>
              <input
                type="text"
                id="payerDocument"
                name="payerDocument"
                value={document}
                onChange={(e) => onDocumentChange(e.target.value)}
                placeholder={documentType === "DNI" ? "8 dígitos" : "Número de documento"}
                className="w-full rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 px-5 py-2.5 outline-none focus:border-transparent focus:ring-2 focus:ring-blue/20"
                required={payment === "tupay"}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentMethod;
