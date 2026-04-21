"use client";
import React from "react";
import Breadcrumb from "../Common/Breadcrumb";
import { useAppSelector } from "@/redux/store";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { clearWishlistAsync } from "@/redux/features/wishlist-slice";
import SingleItem from "./SingleItem";
import toast from "react-hot-toast";

export const Wishlist = () => {
  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);
  const dispatch = useDispatch<AppDispatch>();

  const handleClearWishlist = () => {
    if (wishlistItems.length === 0) {
      toast.error("La lista de deseos ya está vacía");
      return;
    }

    if (confirm("¿Estás seguro de que quieres limpiar toda tu lista de deseos?")) {
      dispatch(clearWishlistAsync());
      toast.success("Lista de deseos limpiada exitosamente");
    }
  };

  return (
    <>
      <Breadcrumb title={"Lista de Deseos"} pages={["Lista de Deseos"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-wrap items-center justify-between gap-5 mb-7.5">
            <h2 className="font-medium text-dark text-2xl">Tu Lista de Deseos</h2>
            <button
              onClick={handleClearWishlist}
              className="text-blue hover:text-blue-dark transition-colors"
            >
              Limpiar Lista de Deseos
            </button>
          </div>

          <div className="bg-white rounded-[10px] shadow-1">
            <div className="w-full overflow-x-auto">
              <div className="w-full">
                {/* <!-- table header --> */}
                <div className="flex items-center py-5.5 px-4 sm:px-10 gap-4">
                  <div className="flex-shrink-0 w-[38px]"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-dark">Producto</p>
                  </div>

                  <div className="flex-shrink-0 w-[120px] text-right">
                    <p className="text-dark">Precio Unitario</p>
                  </div>

                  <div className="flex-shrink-0 w-[160px] text-right">
                    <p className="text-dark">Acción</p>
                  </div>
                </div>

                {/* <!-- wish item --> */}
                {wishlistItems.map((item, key) => (
                  <SingleItem item={item} key={key} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
