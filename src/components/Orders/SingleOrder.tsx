import React, { useState } from "react";
import OrderActions from "./OrderActions";
import OrderModal from "./OrderModal";
import { Order } from "@/types/order";

const paymentStatusConfig = (status: string) => {
  switch (status) {
    case "paid":
      return { label: "Pagado", className: "text-green bg-green-light-6" };
    case "failed":
      return { label: "Fallido", className: "text-red bg-red-light-6" };
    case "refunded":
      return { label: "Reembolsado", className: "text-blue bg-blue-light-5" };
    default:
      return { label: "Pendiente", className: "text-yellow bg-yellow-light-4" };
  }
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
  const [showDetails, setShowDetails] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const toggleDetails = () => setShowDetails(!showDetails);
  const toggleEdit = () => setShowEdit(!showEdit);
  const toggleModal = (status: boolean) => {
    setShowDetails(status);
    setShowEdit(status);
  };

  const { label, className } = paymentStatusConfig(orderItem.paymentStatus);
  const formattedDate = formatDate(orderItem.createdAt);
  const formattedTotal = `S/ ${Number(orderItem.total).toFixed(2)}`;

  return (
    <>
      {!smallView && (
        <div className="items-center justify-between border-t border-gray-3 py-5 px-7.5 hidden md:flex">
          <div className="min-w-[111px]">
            <p className="text-custom-sm text-red">
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
            <p className="text-custom-sm text-dark">{formattedTotal}</p>
          </div>
          <div className="flex gap-5 items-center">
            <OrderActions toggleDetails={toggleDetails} toggleEdit={toggleEdit} />
          </div>
        </div>
      )}

      {smallView && (
        <div className="block md:hidden">
          <div className="py-4.5 px-7.5">
            <div className="">
              <p className="text-custom-sm text-dark">
                <span className="font-bold pr-2">Pedido:</span> #
                {orderItem.orderId.slice(-8)}
              </p>
            </div>
            <div className="">
              <p className="text-custom-sm text-dark">
                <span className="font-bold pr-2">Fecha:</span> {formattedDate}
              </p>
            </div>
            <div className="">
              <p className="text-custom-sm text-dark">
                <span className="font-bold pr-2">Estado:</span>{" "}
                <span className={`inline-block text-custom-sm py-0.5 px-2.5 rounded-[30px] ${className}`}>
                  {label}
                </span>
              </p>
            </div>
            <div className="">
              <p className="text-custom-sm text-dark">
                <span className="font-bold pr-2">Total:</span> {formattedTotal}
              </p>
            </div>
            <div className="">
              <p className="text-custom-sm text-dark flex items-center">
                <span className="font-bold pr-2">Acciones:</span>{" "}
                <OrderActions toggleDetails={toggleDetails} toggleEdit={toggleEdit} />
              </p>
            </div>
          </div>
        </div>
      )}

      <OrderModal
        showDetails={showDetails}
        showEdit={showEdit}
        toggleModal={toggleModal}
        order={orderItem}
      />
    </>
  );
};

export default SingleOrder;
