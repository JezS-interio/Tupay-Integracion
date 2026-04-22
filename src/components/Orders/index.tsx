import React, { useEffect, useState } from "react";
import SingleOrder from "./SingleOrder";
import { useAuth } from "@/app/context/AuthContext";
import { getUserOrders } from "@/lib/firebase/orders";
import { Order } from "@/types/order";

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    getUserOrders(user.uid)
      .then((data) => setOrders(data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [user?.uid]);

  return (
    <>
      <div className="w-full overflow-x-auto">
        <div className="min-w-[650px]">
          {orders.length > 0 && (
            <div className="items-center justify-between py-4.5 px-7.5 hidden md:flex">
              <div className="min-w-[111px]">
                <p className="text-custom-sm text-dark">Pedido</p>
              </div>
              <div className="min-w-[175px]">
                <p className="text-custom-sm text-dark">Fecha</p>
              </div>
              <div className="min-w-[128px]">
                <p className="text-custom-sm text-dark">Estado de Pago</p>
              </div>
              <div className="min-w-[113px]">
                <p className="text-custom-sm text-dark">Total</p>
              </div>
              <div className="min-w-[113px]">
                <p className="text-custom-sm text-dark">Acción</p>
              </div>
            </div>
          )}
          {loading ? (
            <p className="py-9.5 px-4 sm:px-7.5 xl:px-10">Cargando pedidos...</p>
          ) : orders.length > 0 ? (
            orders.map((orderItem, key) => (
              <SingleOrder key={key} orderItem={orderItem} smallView={false} />
            ))
          ) : (
            <p className="py-9.5 px-4 sm:px-7.5 xl:px-10">
              No tienes pedidos aún.
            </p>
          )}
        </div>

        {!loading &&
          orders.map((orderItem, key) => (
            <SingleOrder key={key} orderItem={orderItem} smallView={true} />
          ))}
      </div>
    </>
  );
};

export default Orders;
