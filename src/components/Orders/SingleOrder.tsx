import React, { useState } from "react";
import { Order } from "@/types/order";

const paymentStatusConfig = (paymentStatus: string) => {
  if (paymentStatus === "paid") {
    return { label: "Realizado", className: "text-green bg-green-light-6" };
  }
  return { label: "Pendiente", className: "text-yellow bg-yellow-light-4" };
};

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const SingleOrder = ({ orderItem, smallView }: { orderItem: Order; smallView: boolean }) => {
  const [expanded, setExpanded] = useState(false);

  const { label, className } = paymentStatusConfig(orderItem.paymentStatus);
  const formattedDate = formatDate(orderItem.createdAt);
  const formattedTotal = `S/ ${Number(orderItem.total).toFixed(2)}`;

  const productsSummary = orderItem.items
    ?.map((item) => `${item.title}${item.quantity > 1 ? ` x${item.quantity}` : ""}`)
    .join(", ") || "";

  return (
    <>
      {/* Desktop */}
      {!smallView && (
        <div className="border-t border-gray-3">
          <div
            className="items-center justify-between py-5 px-7.5 hidden md:flex cursor-pointer hover:bg-gray-1 transition-colors"
            onClick={() => setExpanded(!expanded)}
          >
            <div className="min-w-[111px]">
              <p className="text-custom-sm text-red font-medium">
                #{orderItem.orderId.slice(-8)}
              </p>
            </div>
            <div className="min-w-[175px]">
              <p className="text-custom-sm text-dark">{formattedDate}</p>
            </div>
            <div className="min-w-[128px]">
              <p className={`inline-block text-custom-sm py-0.5 px-2.5 rounded-[30px] ${className}`}>
                {label}
              </p>
            </div>
            <div className="min-w-[113px]">
              <p className="text-custom-sm text-dark font-medium">{formattedTotal}</p>
            </div>
            <div className="min-w-[113px]">
              <p className="text-custom-sm text-dark-4 truncate max-w-[200px]">{productsSummary}</p>
            </div>
          </div>

          {/* Expanded product detail */}
          {expanded && (
            <div className="hidden md:block px-7.5 pb-5 bg-gray-1 border-t border-gray-3">
              <p className="text-custom-sm font-medium text-dark mt-4 mb-2">Productos del pedido:</p>
              <div className="flex flex-col gap-2">
                {orderItem.items?.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-custom-sm text-dark-2">
                    <span>{item.title}</span>
                    <span className="text-dark-4">x{item.quantity} — S/ {(item.discountedPrice * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <p className="text-custom-sm text-dark-4 mt-3">
                Método de pago: <span className="text-dark">{orderItem.paymentMethod}</span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Mobile */}
      {smallView && (
        <div className="block md:hidden border-t border-gray-3">
          <div
            className="py-4.5 px-7.5 cursor-pointer"
            onClick={() => setExpanded(!expanded)}
          >
            <p className="text-custom-sm text-dark">
              <span className="font-bold pr-2">Pedido:</span>#{orderItem.orderId.slice(-8)}
            </p>
            <p className="text-custom-sm text-dark">
              <span className="font-bold pr-2">Fecha:</span>{formattedDate}
            </p>
            <p className="text-custom-sm text-dark">
              <span className="font-bold pr-2">Estado:</span>
              <span className={`inline-block text-custom-sm py-0.5 px-2.5 rounded-[30px] ${className}`}>
                {label}
              </span>
            </p>
            <p className="text-custom-sm text-dark">
              <span className="font-bold pr-2">Total:</span>{formattedTotal}
            </p>
          </div>
          {expanded && (
            <div className="px-7.5 pb-4 bg-gray-1">
              <p className="text-custom-sm font-medium text-dark mb-2">Productos:</p>
              <div className="flex flex-col gap-1">
                {orderItem.items?.map((item, i) => (
                  <div key={i} className="flex justify-between text-custom-sm text-dark-2">
                    <span>{item.title}</span>
                    <span className="text-dark-4">x{item.quantity} — S/ {(item.discountedPrice * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default SingleOrder;
