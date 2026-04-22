import React, { useEffect, useState } from "react";
import SingleOrder from "./SingleOrder";
import { useAuth } from "@/app/context/AuthContext";
import { Order } from "@/types/order";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    // Real-time listener — no orderBy to avoid requiring composite index
    const q = query(
      collection(db, "orders"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: Order[] = [];
        snapshot.forEach((doc) => data.push(doc.data() as Order));
        // Sort client-side by date desc
        data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(data);
        setLoading(false);
      },
      (err) => {
        console.error("Orders snapshot error:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
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
                <p className="text-custom-sm text-dark">Estado</p>
              </div>
              <div className="min-w-[113px]">
                <p className="text-custom-sm text-dark">Total</p>
              </div>
              <div className="min-w-[113px]">
                <p className="text-custom-sm text-dark">Productos</p>
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
