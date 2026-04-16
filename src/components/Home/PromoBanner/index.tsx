"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/firebase/config";
import { collection, query, where, limit, getDocs } from "firebase/firestore";

interface PromoProduct {
  id: number;
  title: string;
  price: number;
  discountedPrice: number;
  description?: string;
  imgs?: { previews?: string[] };
  img?: string;
}

const PromoBanner = () => {
  const [products, setProducts] = useState<PromoProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPromoProducts = async () => {
      try {
        // Fetch products marked for promo banners
        const q = query(
          collection(db, "products"),
          where("showInPromo", "==", true),
          where("isActive", "==", true),
          limit(3)
        );
        const snapshot = await getDocs(q);

        const promoProducts: PromoProduct[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          promoProducts.push({
            id: data.id,
            title: data.title,
            price: data.price,
            discountedPrice: data.discountedPrice,
            description: data.description,
            imgs: data.imgs,
            img: data.img,
          });
        });

        setProducts(promoProducts);
      } catch (error) {
        console.error("Error fetching promo products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPromoProducts();
  }, []);

  if (loading || products.length < 3) {
    return null; // Or return a loading skeleton
  }

  const mainProduct = products[0];
  const leftProduct = products[1];
  const rightProduct = products[2];

  const getImageUrl = (product: PromoProduct) =>
    product.imgs?.previews?.[0] || product.img || "/images/placeholder.png";

  const getDiscount = (product: PromoProduct) =>
    Math.round(((product.price - product.discountedPrice) / product.price) * 100);

  return (
    <section className="overflow-hidden py-20">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        {/* Main promo banner */}
        <div className="relative z-1 overflow-hidden rounded-lg bg-[#F5F5F7] py-12.5 lg:py-17.5 xl:py-22.5 px-4 sm:px-7.5 lg:px-14 xl:px-19 mb-7.5">
          <div className="max-w-[550px] w-full">
            <span className="block font-medium text-xl text-dark mb-3">
              {mainProduct.title}
            </span>

            {getDiscount(mainProduct) > 0 && (
              <h2 className="font-bold text-xl lg:text-heading-4 xl:text-heading-3 text-dark mb-5">
                UP TO {getDiscount(mainProduct)}% OFF
              </h2>
            )}

            <p className="line-clamp-3">
              {mainProduct.description || `Amazing deal on ${mainProduct.title}. Don't miss out!`}
            </p>

            <Link
              href={`/shop-details?id=${mainProduct.id}`}
              className="inline-flex font-medium text-custom-sm text-white bg-blue py-[11px] px-9.5 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5"
            >
              Buy Now
            </Link>
          </div>

          <div className="absolute bottom-0 right-4 lg:right-26 -z-1 w-[274px] h-[350px]">
            <Image
              src={getImageUrl(mainProduct)}
              alt={mainProduct.title}
              fill
              className="object-contain"
            />
          </div>
        </div>

        <div className="grid gap-7.5 grid-cols-1 lg:grid-cols-2">
          {/* Left promo banner */}
          <div className="relative z-1 overflow-hidden rounded-lg bg-[#DBF4F3] py-10 xl:py-16 px-4 sm:px-7.5 xl:px-10">
            <div className="absolute top-1/2 -translate-y-1/2 left-3 sm:left-10 -z-1 w-[241px] h-[241px]">
              <Image
                src={getImageUrl(leftProduct)}
                alt={leftProduct.title}
                fill
                className="object-contain"
              />
            </div>

            <div className="text-right ml-[180px] sm:ml-[220px]">
              <span className="block text-lg text-dark mb-1.5 line-clamp-2">
                {leftProduct.title}
              </span>

              <h2 className="font-bold text-xl lg:text-heading-4 text-dark mb-2.5">
                Special Deal
              </h2>

              {getDiscount(leftProduct) > 0 && (
                <p className="font-semibold text-custom-1 text-teal">
                  {getDiscount(leftProduct)}% de descuento
                </p>
              )}

              <Link
                href={`/shop-details?id=${leftProduct.id}`}
                className="inline-flex font-medium text-custom-sm text-white bg-teal py-2.5 px-8.5 rounded-md ease-out duration-200 hover:bg-teal-dark mt-9"
              >
                Grab Now
              </Link>
            </div>
          </div>

          {/* Right promo banner */}
          <div className="relative z-1 overflow-hidden rounded-lg bg-[#FFECE1] py-10 xl:py-16 px-4 sm:px-7.5 xl:px-10">
            <div className="absolute top-1/2 -translate-y-1/2 right-3 sm:right-8.5 -z-1 w-[200px] h-[200px]">
              <Image
                src={getImageUrl(rightProduct)}
                alt={rightProduct.title}
                fill
                className="object-contain"
              />
            </div>

            <div className="mr-[140px] sm:mr-[180px]">
              <span className="block text-lg text-dark mb-1.5 line-clamp-2">
                {rightProduct.title}
              </span>

              {getDiscount(rightProduct) > 0 && (
                <h2 className="font-bold text-xl lg:text-heading-4 text-dark mb-2.5">
                  Up to <span className="text-orange">{getDiscount(rightProduct)}%</span> off
                </h2>
              )}

              <p className="max-w-[285px] text-custom-sm line-clamp-2">
                {rightProduct.description || `Get this amazing ${rightProduct.title} at an unbeatable price.`}
              </p>

              <Link
                href={`/shop-details?id=${rightProduct.id}`}
                className="inline-flex font-medium text-custom-sm text-white bg-orange py-2.5 px-8.5 rounded-md ease-out duration-200 hover:bg-orange-dark mt-7.5"
              >
                Buy Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
