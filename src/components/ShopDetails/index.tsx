"use client";
import React, { use, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
import Newsletter from "../Common/Newsletter";
import RecentlyViewdItems from "./RecentlyViewd";
import { useAppSelector } from "@/redux/store";
import { fetchProductById } from "@/lib/firebase/products";
import { FirestoreProduct } from "@/types/product";
import { addItemToWishlistAsync } from "@/redux/features/wishlist-slice";
import { addItemToCart } from "@/redux/features/cart-slice";
import toast from "react-hot-toast";

const ShopDetails = () => {
  const searchParams = useSearchParams();
  const productId = searchParams.get('id');
  const dispatch = useDispatch<AppDispatch>();

  const [product, setProduct] = useState<FirestoreProduct | null>(null);
  const [loading, setLoading] = useState(true);

  const [previewImg, setPreviewImg] = useState(0);

  const [storage, setStorage] = useState("gb128");
  const [type, setType] = useState("active");
  const [quantity, setQuantity] = useState(1);

  // Filter out empty preview URLs
  const validPreviews = product?.imgs?.previews?.filter((url: string) => url && url.trim() !== "") || [];
  const currentImageUrl = validPreviews[previewImg] || product?.img || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%239ca3af'%3ENo Image Available%3C/text%3E%3C/svg%3E";

  const [imgError, setImgError] = useState(false);
  const placeholderSvg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%239ca3af'%3EImage Not Found%3C/text%3E%3C/svg%3E";

  // Reset image error when preview index or product changes
  useEffect(() => {
    setImgError(false);
  }, [previewImg, product?.id]);

  // Handler functions
  const handleAddToWishlist = () => {
    if (!product) return;

    dispatch(
      addItemToWishlistAsync({
        ...product,
        status: "available",
        quantity: 1,
      })
    );
    toast.success(`♥ ${product.title} agregado a la lista de deseos`);
  };

  const handleAddToCart = () => {
    if (!product) return;

    dispatch(
      addItemToCart({
        ...product,
        quantity: quantity,
      })
    );
    toast.success(`✓ ${product.title} agregado al carrito`);
  };

  const storages = [
    {
      id: "gb128",
      title: "128 GB",
    },
    {
      id: "gb256",
      title: "256 GB",
    },
    {
      id: "gb512",
      title: "521 GB",
    },
  ];

  const types = [
    {
      id: "active",
      title: "Activo",
    },

    {
      id: "inactive",
      title: "Inactivo",
    },
  ];

  // Fetch product from Firestore based on URL parameter
  useEffect(() => {
    const loadProduct = async () => {
      if (!productId) {
        setLoading(false);
        return;
      }

      try {
        const fetchedProduct = await fetchProductById(productId);
        setProduct(fetchedProduct);
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  return (
    <>
      <Breadcrumb title={"Shop Details"} pages={["shop details"]} />

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="text-dark">Loading product...</div>
        </div>
      ) : !product ? (
        <div className="flex justify-center py-20">
          <div className="text-dark">Product not found</div>
        </div>
      ) : (
        <>
          <section className="overflow-hidden relative pb-20 pt-5 lg:pt-20 xl:pt-28">
            <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
              <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-17.5">
                <div className="lg:max-w-[570px] w-full">
                  <div className="lg:min-h-[512px] rounded-lg shadow-1 bg-gray-2 p-4 sm:p-7.5 relative flex items-center justify-center">
                    <Image
                      src={imgError ? placeholderSvg : currentImageUrl}
                      alt="products-details"
                      width={400}
                      height={400}
                      className="object-contain"
                      unoptimized
                      onError={() => {
                        setImgError(true);
                      }}
                    />
                  </div>

                  {/* Thumbnails */}
                  {validPreviews.length > 1 && (
                    <div className="flex flex-wrap sm:flex-nowrap gap-4.5 mt-6">
                      {validPreviews.map((item, key) => (
                        <button
                          onClick={() => setPreviewImg(key)}
                          key={key}
                          className={`flex items-center justify-center w-15 sm:w-25 h-15 sm:h-25 overflow-hidden rounded-lg bg-gray-2 shadow-1 ease-out duration-200 border-2 hover:border-blue ${
                            key === previewImg
                              ? "border-blue"
                              : "border-transparent"
                          }`}
                        >
                          <Image
                            width={50}
                            height={50}
                            src={item}
                            alt="thumbnail"
                            className="object-contain"
                            unoptimized
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* <!-- product content --> */}
                <div className="max-w-[539px] w-full">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-semibold text-xl sm:text-2xl xl:text-custom-3 text-dark">
                      {product.title}
                    </h2>

                    {(() => {
                      const discount = Math.round(((product.price - product.discountedPrice) / product.price) * 100);
                      return discount > 0 && (
                        <div className="inline-flex font-medium text-custom-sm text-white bg-blue rounded py-0.5 px-2.5">
                          {discount}% DE DESCUENTO
                        </div>
                      );
                    })()}
                  </div>

                  <div className="flex flex-wrap items-center gap-5.5 mb-4.5">
                    <div className="flex items-center gap-2.5">
                      {/* <!-- stars --> */}
                      <div className="flex items-center gap-1">
                        <svg
                          className="fill-[#FFA645]"
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g clipPath="url(#clip0_375_9172)">
                            <path
                              d="M16.7906 6.72187L11.7 5.93438L9.39377 1.09688C9.22502 0.759375 8.77502 0.759375 8.60627 1.09688L6.30002 5.9625L1.23752 6.72187C0.871891 6.77812 0.731266 7.25625 1.01252 7.50938L4.69689 11.3063L3.82502 16.6219C3.76877 16.9875 4.13439 17.2969 4.47189 17.0719L9.05627 14.5687L13.6125 17.0719C13.9219 17.2406 14.3156 16.9594 14.2313 16.6219L13.3594 11.3063L17.0438 7.50938C17.2688 7.25625 17.1563 6.77812 16.7906 6.72187Z"
                              fill=""
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_375_9172">
                              <rect width="18" height="18" fill="white" />
                            </clipPath>
                          </defs>
                        </svg>

                        <svg
                          className="fill-[#FFA645]"
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g clipPath="url(#clip0_375_9172)">
                            <path
                              d="M16.7906 6.72187L11.7 5.93438L9.39377 1.09688C9.22502 0.759375 8.77502 0.759375 8.60627 1.09688L6.30002 5.9625L1.23752 6.72187C0.871891 6.77812 0.731266 7.25625 1.01252 7.50938L4.69689 11.3063L3.82502 16.6219C3.76877 16.9875 4.13439 17.2969 4.47189 17.0719L9.05627 14.5687L13.6125 17.0719C13.9219 17.2406 14.3156 16.9594 14.2313 16.6219L13.3594 11.3063L17.0438 7.50938C17.2688 7.25625 17.1563 6.77812 16.7906 6.72187Z"
                              fill=""
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_375_9172">
                              <rect width="18" height="18" fill="white" />
                            </clipPath>
                          </defs>
                        </svg>

                        <svg
                          className="fill-[#FFA645]"
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g clipPath="url(#clip0_375_9172)">
                            <path
                              d="M16.7906 6.72187L11.7 5.93438L9.39377 1.09688C9.22502 0.759375 8.77502 0.759375 8.60627 1.09688L6.30002 5.9625L1.23752 6.72187C0.871891 6.77812 0.731266 7.25625 1.01252 7.50938L4.69689 11.3063L3.82502 16.6219C3.76877 16.9875 4.13439 17.2969 4.47189 17.0719L9.05627 14.5687L13.6125 17.0719C13.9219 17.2406 14.3156 16.9594 14.2313 16.6219L13.3594 11.3063L17.0438 7.50938C17.2688 7.25625 17.1563 6.77812 16.7906 6.72187Z"
                              fill=""
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_375_9172">
                              <rect width="18" height="18" fill="white" />
                            </clipPath>
                          </defs>
                        </svg>

                        <svg
                          className="fill-[#FFA645]"
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g clipPath="url(#clip0_375_9172)">
                            <path
                              d="M16.7906 6.72187L11.7 5.93438L9.39377 1.09688C9.22502 0.759375 8.77502 0.759375 8.60627 1.09688L6.30002 5.9625L1.23752 6.72187C0.871891 6.77812 0.731266 7.25625 1.01252 7.50938L4.69689 11.3063L3.82502 16.6219C3.76877 16.9875 4.13439 17.2969 4.47189 17.0719L9.05627 14.5687L13.6125 17.0719C13.9219 17.2406 14.3156 16.9594 14.2313 16.6219L13.3594 11.3063L17.0438 7.50938C17.2688 7.25625 17.1563 6.77812 16.7906 6.72187Z"
                              fill=""
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_375_9172">
                              <rect width="18" height="18" fill="white" />
                            </clipPath>
                          </defs>
                        </svg>

                        <svg
                          className="fill-[#FFA645]"
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g clipPath="url(#clip0_375_9172)">
                            <path
                              d="M16.7906 6.72187L11.7 5.93438L9.39377 1.09688C9.22502 0.759375 8.77502 0.759375 8.60627 1.09688L6.30002 5.9625L1.23752 6.72187C0.871891 6.77812 0.731266 7.25625 1.01252 7.50938L4.69689 11.3063L3.82502 16.6219C3.76877 16.9875 4.13439 17.2969 4.47189 17.0719L9.05627 14.5687L13.6125 17.0719C13.9219 17.2406 14.3156 16.9594 14.2313 16.6219L13.3594 11.3063L17.0438 7.50938C17.2688 7.25625 17.1563 6.77812 16.7906 6.72187Z"
                              fill=""
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_375_9172">
                              <rect width="18" height="18" fill="white" />
                            </clipPath>
                          </defs>
                        </svg>
                      </div>

                      <span> (5 reseñas de clientes) </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g clipPath="url(#clip0_375_9221)">
                          <path
                            d="M10 0.5625C4.78125 0.5625 0.5625 4.78125 0.5625 10C0.5625 15.2188 4.78125 19.4688 10 19.4688C15.2188 19.4688 19.4688 15.2188 19.4688 10C19.4688 4.78125 15.2188 0.5625 10 0.5625ZM10 18.0625C5.5625 18.0625 1.96875 14.4375 1.96875 10C1.96875 5.5625 5.5625 1.96875 10 1.96875C14.4375 1.96875 18.0625 5.59375 18.0625 10.0312C18.0625 14.4375 14.4375 18.0625 10 18.0625Z"
                            fill="#22AD5C"
                          />
                          <path
                            d="M12.6875 7.09374L8.9688 10.7187L7.2813 9.06249C7.00005 8.78124 6.56255 8.81249 6.2813 9.06249C6.00005 9.34374 6.0313 9.78124 6.2813 10.0625L8.2813 12C8.4688 12.1875 8.7188 12.2812 8.9688 12.2812C9.2188 12.2812 9.4688 12.1875 9.6563 12L13.6875 8.12499C13.9688 7.84374 13.9688 7.40624 13.6875 7.12499C13.4063 6.84374 12.9688 6.84374 12.6875 7.09374Z"
                            fill="#22AD5C"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_375_9221">
                            <rect width="20" height="20" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>

                      <span className="text-green"> En Stock </span>
                    </div>
                  </div>

                  <h3 className="font-medium text-custom-1 mb-4.5">
                    <span className="text-sm sm:text-base text-dark">
                      Price: S/ {product.discountedPrice}
                    </span>
                    {product.price !== product.discountedPrice && (
                      <span className="line-through text-gray-500">
                        {" "}
                        S/ {product.price}{" "}
                      </span>
                    )}
                  </h3>

                  {/* Product Description */}
                  {product.description && (
                    <div className="mt-6 mb-6">
                      <h3 className="font-medium text-lg text-dark mb-3">Descripción:</h3>
                      <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                        {product.description}
                      </p>
                    </div>
                  )}

                  <form onSubmit={(e) => e.preventDefault()}>
                    <div className="flex flex-col gap-4.5 border-y border-gray-3 mt-7.5 mb-9 py-9">
                      {/* Only show smartphone-specific attributes for smartphones */}
                      {(product.category?.toLowerCase().includes('smartphone') ||
                        product.category?.toLowerCase().includes('phone')) && (
                        <>
                      {/* <!-- details item --> */}
                      <div className="flex items-center gap-4">
                        <div className="min-w-[65px]">
                          <h4 className="font-medium text-dark">Almacenamiento:</h4>
                        </div>

                        <div className="flex items-center gap-4">
                          {storages.map((item, key) => (
                            <label
                              key={key}
                              htmlFor={item.id}
                              className="flex cursor-pointer select-none items-center"
                            >
                              <div className="relative">
                                <input
                                  type="checkbox"
                                  name="storage"
                                  id={item.id}
                                  className="sr-only"
                                  onChange={() => setStorage(item.id)}
                                />

                                {/*  */}
                                <div
                                  className={`mr-2 flex h-4 w-4 items-center justify-center rounded border ${
                                    storage === item.id
                                      ? "border-blue bg-blue"
                                      : "border-gray-4"
                                  } `}
                                >
                                  <span
                                    className={
                                      storage === item.id
                                        ? "opacity-100"
                                        : "opacity-0"
                                    }
                                  >
                                    <svg
                                      width="24"
                                      height="24"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <rect
                                        x="4"
                                        y="4.00006"
                                        width="16"
                                        height="16"
                                        rx="4"
                                        fill="#3C50E0"
                                      />
                                      <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M16.3103 9.25104C16.471 9.41178 16.5612 9.62978 16.5612 9.85707C16.5612 10.0844 16.471 10.3024 16.3103 10.4631L12.0243 14.7491C11.8635 14.9098 11.6455 15.0001 11.4182 15.0001C11.191 15.0001 10.973 14.9098 10.8122 14.7491L8.24062 12.1775C8.08448 12.0158 7.99808 11.7993 8.00003 11.5745C8.00199 11.3498 8.09214 11.1348 8.25107 10.9759C8.41 10.8169 8.62499 10.7268 8.84975 10.7248C9.0745 10.7229 9.29103 10.8093 9.4527 10.9654L11.4182 12.931L15.0982 9.25104C15.2589 9.09034 15.4769 9.00006 15.7042 9.00006C15.9315 9.00006 16.1495 9.09034 16.3103 9.25104Z"
                                        fill="white"
                                      />
                                    </svg>
                                  </span>
                                </div>
                              </div>
                              {item.title}
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* // <!-- details item --> */}
                      <div className="flex items-center gap-4">
                        <div className="min-w-[65px]">
                          <h4 className="font-medium text-dark">Tipo:</h4>
                        </div>

                        <div className="flex items-center gap-4">
                          {types.map((item, key) => (
                            <label
                              key={key}
                              htmlFor={item.id}
                              className="flex cursor-pointer select-none items-center"
                            >
                              <div className="relative">
                                <input
                                  type="checkbox"
                                  name="storage"
                                  id={item.id}
                                  className="sr-only"
                                  onChange={() => setType(item.id)}
                                />

                                {/*  */}
                                <div
                                  className={`mr-2 flex h-4 w-4 items-center justify-center rounded border ${
                                    type === item.id
                                      ? "border-blue bg-blue"
                                      : "border-gray-4"
                                  } `}
                                >
                                  <span
                                    className={
                                      type === item.id
                                        ? "opacity-100"
                                        : "opacity-0"
                                    }
                                  >
                                    <svg
                                      width="24"
                                      height="24"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <rect
                                        x="4"
                                        y="4.00006"
                                        width="16"
                                        height="16"
                                        rx="4"
                                        fill="#3C50E0"
                                      />
                                      <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M16.3103 9.25104C16.471 9.41178 16.5612 9.62978 16.5612 9.85707C16.5612 10.0844 16.471 10.3024 16.3103 10.4631L12.0243 14.7491C11.8635 14.9098 11.6455 15.0001 11.4182 15.0001C11.191 15.0001 10.973 14.9098 10.8122 14.7491L8.24062 12.1775C8.08448 12.0158 7.99808 11.7993 8.00003 11.5745C8.00199 11.3498 8.09214 11.1348 8.25107 10.9759C8.41 10.8169 8.62499 10.7268 8.84975 10.7248C9.0745 10.7229 9.29103 10.8093 9.4527 10.9654L11.4182 12.931L15.0982 9.25104C15.2589 9.09034 15.4769 9.00006 15.7042 9.00006C15.9315 9.00006 16.1495 9.09034 16.3103 9.25104Z"
                                        fill="white"
                                      />
                                    </svg>
                                  </span>
                                </div>
                              </div>
                              {item.title}
                            </label>
                          ))}
                        </div>
                      </div>
                        </>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4.5">
                      <div className="flex items-center rounded-md border border-gray-3">
                        <button
                          aria-label="button for remove product"
                          className="flex items-center justify-center w-12 h-12 ease-out duration-200 hover:text-blue"
                          onClick={() =>
                            quantity > 1 && setQuantity(quantity - 1)
                          }
                        >
                          <svg
                            className="fill-current"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M3.33301 10.0001C3.33301 9.53984 3.7061 9.16675 4.16634 9.16675H15.833C16.2932 9.16675 16.6663 9.53984 16.6663 10.0001C16.6663 10.4603 16.2932 10.8334 15.833 10.8334H4.16634C3.7061 10.8334 3.33301 10.4603 3.33301 10.0001Z"
                              fill=""
                            />
                          </svg>
                        </button>

                        <span className="flex items-center justify-center w-16 h-12 border-x border-gray-4">
                          {quantity}
                        </span>

                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          aria-label="button for add product"
                          className="flex items-center justify-center w-12 h-12 ease-out duration-200 hover:text-blue"
                        >
                          <svg
                            className="fill-current"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M3.33301 10C3.33301 9.5398 3.7061 9.16671 4.16634 9.16671H15.833C16.2932 9.16671 16.6663 9.5398 16.6663 10C16.6663 10.4603 16.2932 10.8334 15.833 10.8334H4.16634C3.7061 10.8334 3.33301 10.4603 3.33301 10Z"
                              fill=""
                            />
                            <path
                              d="M9.99967 16.6667C9.53944 16.6667 9.16634 16.2936 9.16634 15.8334L9.16634 4.16671C9.16634 3.70647 9.53944 3.33337 9.99967 3.33337C10.4599 3.33337 10.833 3.70647 10.833 4.16671L10.833 15.8334C10.833 16.2936 10.4599 16.6667 9.99967 16.6667Z"
                              fill=""
                            />
                          </svg>
                        </button>
                      </div>

                      <button
                        onClick={handleAddToCart}
                        className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark"
                      >
                        Comprar Ahora
                      </button>

                      <button
                        onClick={handleAddToWishlist}
                        aria-label="Add to wishlist"
                        className="flex items-center justify-center w-12 h-12 rounded-md border border-gray-3 ease-out duration-200 hover:text-white hover:bg-dark hover:border-transparent"
                      >
                        <svg
                          className="fill-current"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M5.62436 4.42423C3.96537 5.18256 2.75 6.98626 2.75 9.13713C2.75 11.3345 3.64922 13.0283 4.93829 14.4798C6.00072 15.6761 7.28684 16.6677 8.54113 17.6346C8.83904 17.8643 9.13515 18.0926 9.42605 18.3219C9.95208 18.7366 10.4213 19.1006 10.8736 19.3649C11.3261 19.6293 11.6904 19.75 12 19.75C12.3096 19.75 12.6739 19.6293 13.1264 19.3649C13.5787 19.1006 14.0479 18.7366 14.574 18.3219C14.8649 18.0926 15.161 17.8643 15.4589 17.6346C16.7132 16.6677 17.9993 15.6761 19.0617 14.4798C20.3508 13.0283 21.25 11.3345 21.25 9.13713C21.25 6.98626 20.0346 5.18256 18.3756 4.42423C16.7639 3.68751 14.5983 3.88261 12.5404 6.02077C12.399 6.16766 12.2039 6.25067 12 6.25067C11.7961 6.25067 11.601 6.16766 11.4596 6.02077C9.40166 3.88261 7.23607 3.68751 5.62436 4.42423ZM12 4.45885C9.68795 2.39027 7.09896 2.1009 5.00076 3.05999C2.78471 4.07296 1.25 6.42506 1.25 9.13713C1.25 11.8027 2.3605 13.8361 3.81672 15.4758C4.98287 16.789 6.41022 17.888 7.67083 18.8586C7.95659 19.0786 8.23378 19.2921 8.49742 19.4999C9.00965 19.9037 9.55954 20.3343 10.1168 20.66C10.6739 20.9855 11.3096 21.25 12 21.25C12.6904 21.25 13.3261 20.9855 13.8832 20.66C14.4405 20.3343 14.9903 19.9037 15.5026 19.4999C15.7662 19.2921 16.0434 19.0786 16.3292 18.8586C17.5898 17.888 19.0171 16.789 20.1833 15.4758C21.6395 13.8361 22.75 11.8027 22.75 9.13713C22.75 6.42506 21.2153 4.07296 18.9992 3.05999C16.901 2.1009 14.3121 2.39027 12 4.45885Z"
                            fill=""
                          />
                        </svg>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </section>

          <RecentlyViewdItems />

          <Newsletter />
        </>
      )}
    </>
  );
};

export default ShopDetails;
