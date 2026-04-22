"use client";
import React, { useEffect, useState } from "react";
import SingleItem from "./SingleItem";
import Image from "next/image";
import { fetchBestSellers } from "@/lib/firebase/products";
import { FirestoreProduct } from "@/types/product";

const BestSeller = () => {
  const [products, setProducts] = useState<FirestoreProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchBestSellers(5);
        setProducts(data);
      } catch (error) {
        console.error("Error loading best sellers:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <section className="overflow-hidden">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        {/* <!-- section title --> */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <span className="flex items-center gap-2.5 font-medium text-dark mb-1.5">
              <Image
                src="/images/icons/icon-07.svg"
                alt="icon"
                width={17}
                height={17}
              />
              This Month
            </span>
            <h2 className="font-semibold text-xl xl:text-heading-5 text-dark">
              Más Vendidos
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="text-dark">Loading products...</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5 items-stretch">
            {/* <!-- Más Vendidos item --> */}
            {products.map((item, key) => (
              <SingleItem item={item} key={key} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BestSeller;
