"use client";

import React, { useEffect, useState } from "react";
import HeroCarousel from "./HeroCarousel";
import HeroFeature from "./HeroFeature";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/firebase/config";
import { collection, query, where, limit, getDocs } from "firebase/firestore";

interface FeaturedProduct {
  id: number;
  title: string;
  price: number;
  discountedPrice: number;
  imgs?: {
    previews?: string[];
  };
  img?: string;
}

const Hero = () => {
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        // Get active products
        const q = query(
          collection(db, "products"),
          where("isActive", "==", true),
          limit(50)
        );
        const snapshot = await getDocs(q);

        const allProducts: FeaturedProduct[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          // Calculate discount percentage
          const discountPercent = Math.round(((data.price - data.discountedPrice) / data.price) * 100);
          // Only include products with actual discounts (at least 1%)
          if (data.price > data.discountedPrice && discountPercent > 0) {
            allProducts.push({
              id: data.id,
              title: data.title,
              price: data.price,
              discountedPrice: data.discountedPrice,
              imgs: data.imgs,
              img: data.img,
            });
          }
        });

        // Shuffle and pick 2 random products with discounts
        const shuffled = allProducts.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 2);

        setFeaturedProducts(selected);
      } catch (error) {
        console.error("Error fetching discounted products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <section className="overflow-hidden pb-10 lg:pb-12.5 xl:pb-15 pt-57.5 sm:pt-45 lg:pt-30 xl:pt-51.5 bg-[#E5EAF4]">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="flex flex-wrap gap-5">
          <div className="xl:max-w-[757px] w-full">
            <div className="relative z-1 rounded-[10px] bg-white overflow-hidden h-full">
              {/* <!-- bg shapes --> */}
              <Image
                src="/images/hero/hero-bg.png"
                alt="hero bg shapes"
                className="absolute right-0 bottom-0 -z-1"
                width={534}
                height={520}
              />

              <HeroCarousel />
            </div>
          </div>

          <div className="xl:max-w-[393px] w-full">
            <div className="flex flex-col sm:flex-row xl:flex-col gap-5 h-full">
              {loading ? (
                // Loading skeleton
                <>
                  <div className="w-full flex-1 relative rounded-[10px] bg-white p-4 sm:p-7.5 animate-pulse">
                    <div className="h-32 bg-gray-200 rounded"></div>
                  </div>
                  <div className="w-full flex-1 relative rounded-[10px] bg-white p-4 sm:p-7.5 animate-pulse">
                    <div className="h-32 bg-gray-200 rounded"></div>
                  </div>
                </>
              ) : featuredProducts.length > 0 ? (
                // Show real featured products
                featuredProducts.map((product, index) => {
                  // Filter out empty preview URLs
                  const validPreviews = product.imgs?.previews?.filter((url: string) => url && url.trim() !== "");
                  const hasValidImage = validPreviews?.[0] || product.img;
                  const imageUrl = hasValidImage || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect width='200' height='200' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E";
                  const discount = Math.round(((product.price - product.discountedPrice) / product.price) * 100);

                  return (
                    <div key={product.id} className="w-full flex-1 relative rounded-[10px] bg-white p-4 sm:p-6">
                      <div className="flex flex-col h-full">
                        <h2 className="font-semibold text-dark text-base sm:text-lg mb-3 line-clamp-3 min-h-[3.6rem]">
                          <Link href={`/shop-details?id=${product.id}`}>
                            {product.title}
                          </Link>
                        </h2>

                        <div className="flex items-center justify-between gap-3 mt-auto">
                          <div className="flex-1">
                            {discount > 0 && (
                              <p className="font-medium text-dark-4 text-xs sm:text-sm mb-1.5">
                                {discount}% de descuento - tiempo limitado
                              </p>
                            )}
                            <div className="flex items-baseline gap-2 flex-wrap">
                              <span className="font-medium text-xl sm:text-2xl text-red">
                                S/ {product.discountedPrice.toFixed(0)}
                              </span>
                              {discount > 0 && (
                                <span className="font-medium text-base sm:text-lg text-dark-4 line-through">
                                  S/ {product.price.toFixed(0)}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="relative w-[160px] h-[160px] sm:w-[200px] sm:h-[200px] flex-shrink-0">
                            <Image
                              src={imageUrl}
                              alt={product.title}
                              fill
                              className="object-contain"
                              unoptimized
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                // Fallback if no featured products
                <>
                  <div className="w-full flex-1 relative rounded-[10px] bg-white p-4 sm:p-7.5">
                    <div className="flex items-center justify-center h-full text-gray-400">
                      No featured products yet
                    </div>
                  </div>
                  <div className="w-full flex-1 relative rounded-[10px] bg-white p-4 sm:p-7.5">
                    <div className="flex items-center justify-center h-full text-gray-400">
                      Add featured products from admin
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* <!-- Hero features --> */}
      <HeroFeature />
    </section>
  );
};

export default Hero;
