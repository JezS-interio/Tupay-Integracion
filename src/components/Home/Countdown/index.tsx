"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";

interface DealProduct {
  id: number;
  title: string;
  description?: string;
  price: number;
  discountedPrice: number;
  imgs?: { previews?: string[] };
  img?: string;
}

const CounDown = () => {
  const [days, setDías] = useState(0);
  const [hours, setHoras] = useState(0);
  const [minutes, setMinutos] = useState(0);
  const [seconds, setSegundos] = useState(0);
  const [product, setProduct] = useState<DealProduct | null>(null);
  const [loading, setLoading] = useState(true);

  const deadline = "February, 1, 2026";

  const getTime = () => {
    const time = Date.parse(deadline) - Date.now();

    setDías(Math.floor(time / (1000 * 60 * 60 * 24)));
    setHoras(Math.floor((time / (1000 * 60 * 60)) % 24));
    setMinutos(Math.floor((time / 1000 / 60) % 60));
    setSegundos(Math.floor((time / 1000) % 60));
  };

  useEffect(() => {
    const fetchCleanProduct = async () => {
      try {
        // Products with transparent/clean backgrounds (no busy backgrounds)
        const goodProductKeywords = [
          "Google Pixel",
          "iPhone",
          "Samsung Galaxy",
          "Sony WH-",
          "AirPods",
          "Watch",
          "MacBook",
          "iPad",
          "Bose",
          "JBL",
          "Beats",
          "Kindle",
          "Nintendo Switch",
          "PlayStation",
          "Xbox",
          "GoPro",
          "DJI"
        ];

        const q = query(
          collection(db, "products"),
          where("isActive", "==", true)
        );
        const snapshot = await getDocs(q);

        const goodProducts: DealProduct[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          const discount = Math.round(((data.price - data.discountedPrice) / data.price) * 100);

          // Check if product matches any good keyword and has discount
          const hasGoodImage = goodProductKeywords.some(keyword =>
            data.title && data.title.includes(keyword)
          );

          if (hasGoodImage && discount > 0) {
            goodProducts.push({
              id: data.id,
              title: data.title,
              description: data.description,
              price: data.price,
              discountedPrice: data.discountedPrice,
              imgs: data.imgs,
              img: data.img,
            });
          }
        });

        // Pick random product from the good ones
        if (goodProducts.length > 0) {
          const randomProduct = goodProducts[Math.floor(Math.random() * goodProducts.length)];
          setProduct(randomProduct);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCleanProduct();

    // @ts-ignore
    const interval = setInterval(() => getTime(deadline), 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="overflow-hidden py-20">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="relative overflow-hidden z-1 rounded-lg bg-[#D0E9F3] p-4 sm:p-7.5 lg:p-10 xl:p-15">
          {loading ? (
            <div className="text-center py-20">Cargando oferta...</div>
          ) : !product ? (
            <div className="text-center py-20">Producto no disponible</div>
          ) : (
            <>
              <div className="max-w-[422px] w-full">
                <span className="block font-medium text-custom-1 text-blue mb-2.5">
                  ¡No te lo pierdas!
                </span>

                <h2 className="font-bold text-dark text-xl lg:text-heading-4 xl:text-heading-3 mb-3 line-clamp-2">
                  {product.title}
                </h2>

                {product.description && (
                  <p className="line-clamp-2 mb-3">{product.description}</p>
                )}

                {(() => {
                  const discount = Math.round(((product.price - product.discountedPrice) / product.price) * 100);
                  return discount > 0 && (
                    <p className="font-semibold text-lg text-blue">
                      ¡{discount}% de descuento!
                    </p>
                  );
                })()}

            {/* <!-- Countdown timer --> */}
            <div
              className="flex flex-wrap gap-6 mt-6"
              x-data="timer()"
              x-init="countdown()"
            >
              {/* <!-- timer day --> */}
              <div>
                <span
                  className="min-w-[64px] h-14.5 font-semibold text-xl lg:text-3xl text-dark rounded-lg flex items-center justify-center bg-white shadow-2 px-4 mb-2"
                  x-text="days"
                >
                  {" "}
                  {days < 10 ? "0" + days : days}{" "}
                </span>
                <span className="block text-custom-sm text-dark text-center">
                  Días
                </span>
              </div>

              {/* <!-- timer hours --> */}
              <div>
                <span
                  className="min-w-[64px] h-14.5 font-semibold text-xl lg:text-3xl text-dark rounded-lg flex items-center justify-center bg-white shadow-2 px-4 mb-2"
                  x-text="hours"
                >
                  {" "}
                  {hours < 10 ? "0" + hours : hours}{" "}
                </span>
                <span className="block text-custom-sm text-dark text-center">
                  Horas
                </span>
              </div>

              {/* <!-- timer minutes --> */}
              <div>
                <span
                  className="min-w-[64px] h-14.5 font-semibold text-xl lg:text-3xl text-dark rounded-lg flex items-center justify-center bg-white shadow-2 px-4 mb-2"
                  x-text="minutes"
                >
                  {minutes < 10 ? "0" + minutes : minutes}{" "}
                </span>
                <span className="block text-custom-sm text-dark text-center">
                  Minutos
                </span>
              </div>

              {/* <!-- timer seconds --> */}
              <div>
                <span
                  className="min-w-[64px] h-14.5 font-semibold text-xl lg:text-3xl text-dark rounded-lg flex items-center justify-center bg-white shadow-2 px-4 mb-2"
                  x-text="seconds"
                >
                  {seconds < 10 ? "0" + seconds : seconds}{" "}
                </span>
                <span className="block text-custom-sm text-dark text-center">
                  Segundos
                </span>
              </div>
            </div>
            {/* <!-- Countdown timer ends --> */}

                <Link
                  href={`/shop-details?id=${product.id}`}
                  className="inline-flex font-medium text-custom-sm text-white bg-blue py-3 px-9.5 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5"
                >
                  ¡Comprar Ahora!
                </Link>
              </div>

              {/* <!-- bg shapes --> */}
              <Image
                src="/images/countdown/countdown-bg.png"
                alt="bg shapes"
                className="hidden sm:block absolute right-0 bottom-0 -z-1"
                width={737}
                height={482}
              />

              {/* Product Image */}
              {(() => {
                const imageUrl = product.imgs?.previews?.[0] || product.img || "/images/placeholder.png";
                return (
                  <div className="hidden lg:block absolute right-4 xl:right-33 bottom-4 xl:bottom-10 -z-1 w-[411px] h-[376px]">
                    <Image
                      src={imageUrl}
                      alt={product.title}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                );
              })()}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default CounDown;
