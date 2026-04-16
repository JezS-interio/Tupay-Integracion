"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/config";
import { collection, query, where, limit, getDocs } from "firebase/firestore";
import Link from "next/link";

// Import Swiper styles
import "swiper/css/pagination";
import "swiper/css";

import Image from "next/image";

interface CarouselProduct {
  id: number;
  title: string;
  description?: string;
  price: number;
  discountedPrice: number;
  imgs?: {
    previews?: string[];
  };
  img?: string;
}

const HeroCarousal = () => {
  const [products, setProducts] = useState<CarouselProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        // Fetch featured products from Firebase
        const q = query(
          collection(db, "products"),
          where("featured", "==", true),
          where("isActive", "==", true),
          limit(3)
        );
        const snapshot = await getDocs(q);

        const fetchedProducts: CarouselProduct[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          fetchedProducts.push({
            id: data.id,
            title: data.title,
            description: data.description,
            price: data.price,
            discountedPrice: data.discountedPrice,
            imgs: data.imgs,
            img: data.img,
          });
        });

        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Error loading carousel products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[510px] bg-gray-100">
        <div className="text-dark">Cargando productos...</div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[510px] bg-gray-100">
        <div className="text-center">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-bold text-dark mb-2">Sin Productos Destacados</h3>
          <p className="text-gray-600">Marca productos como destacados desde el admin</p>
        </div>
      </div>
    );
  }

  return (
    <Swiper
      spaceBetween={30}
      centeredSlides={true}
      autoplay={{
        delay: 3500,
        disableOnInteraction: false,
      }}
      pagination={{
        clickable: true,
      }}
      modules={[Autoplay, Pagination]}
      className="hero-carousel h-full min-h-[510px]"
    >
      {products.map((product, index) => {
        const imageUrl = product.imgs?.previews?.[0] || product.img || '/images/placeholder.png';
        const discount = Math.round(((product.price - product.discountedPrice) / product.price) * 100);
        const hasDiscount = discount > 0;

        return (
          <SwiperSlide key={product.id} className="h-full">
            <div className="flex items-center justify-center pt-6 sm:pt-0 flex-col-reverse sm:flex-row h-full">
              <div className="max-w-[394px] py-10 sm:py-15 lg:py-24.5 pl-4 sm:pl-7.5 lg:pl-12.5">
                {hasDiscount && (
                  <div className="flex items-center gap-4 mb-7.5 sm:mb-10">
                    <span className="block font-semibold text-heading-3 sm:text-heading-1 text-blue">
                      {discount}% OFF
                    </span>
                  </div>
                )}

                <h1 className="font-semibold text-dark text-xl sm:text-3xl mb-3">
                  <Link href={`/shop-details?id=${product.id}`}>{product.title}</Link>
                </h1>

                {hasDiscount && (
                  <h2 className="text-lg text-gray-600 mb-2">Oferta por tiempo limitado</h2>
                )}

                {product.description && (
                  <p className="mb-6 line-clamp-3">{product.description}</p>
                )}

                <Link
                  href={`/shop-details?id=${product.id}`}
                  className="inline-flex font-medium text-white text-custom-sm rounded-md bg-dark py-3 px-9 ease-out duration-200 hover:bg-blue mt-10"
                >
                  Ver Detalles
                </Link>
              </div>

              <div className="relative w-[500px] h-full max-h-[510px]">
                <Image
                  src={imageUrl}
                  alt={product.title}
                  fill
                  className="object-contain"
                  quality={100}
                  priority={index === 0}
                />
              </div>
            </div>
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
};

export default HeroCarousal;
