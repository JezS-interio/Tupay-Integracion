"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase/config";
import { collection, getDocs, doc, updateDoc, query, where, limit } from "firebase/firestore";
import Image from "next/image";

interface Product {
  id: string;
  docId: string;
  title: string;
  price: number;
  discountedPrice: number;
  featured: boolean;
  imgs?: { previews?: string[] };
  img?: string;
}

export default function SetFeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      // Get first 50 active products
      const q = query(
        collection(db, "products"),
        where("isActive", "==", true),
        limit(50)
      );
      const snapshot = await getDocs(q);

      const productsData: Product[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        productsData.push({
          docId: doc.id,
          id: data.id,
          title: data.title,
          price: data.price,
          discountedPrice: data.discountedPrice,
          featured: data.featured || false,
          imgs: data.imgs,
          img: data.img,
        });
      });

      setProducts(productsData);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatured = async (docId: string, currentFeatured: boolean) => {
    setUpdating(true);
    try {
      await updateDoc(doc(db, "products", docId), {
        featured: !currentFeatured,
      });

      // Update local state
      setProducts(
        products.map((p) =>
          p.docId === docId ? { ...p, featured: !currentFeatured } : p
        )
      );

      console.log(`✅ Updated featured status`);
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product");
    } finally {
      setUpdating(false);
    }
  };

  const featuredCount = products.filter((p) => p.featured).length;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">⭐ Set Featured Products</h1>
            <p className="text-gray-600">
              Select products to show on the homepage (right side)
            </p>
            <p className="text-sm text-blue-600 mt-2">
              Currently featured: {featuredCount} products
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading products...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map((product) => {
                const imageUrl =
                  product.imgs?.previews?.[0] ||
                  product.img ||
                  "/images/placeholder.png";
                const discount = Math.round(
                  ((product.price - product.discountedPrice) / product.price) * 100
                );

                return (
                  <div
                    key={product.docId}
                    className={`border-2 rounded-lg p-4 transition-all ${
                      product.featured
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex gap-4">
                      <div className="relative w-24 h-24 flex-shrink-0 bg-gray-100 rounded">
                        <Image
                          src={imageUrl}
                          alt={product.title}
                          fill
                          className="object-contain"
                        />
                      </div>

                      <div className="flex-1">
                        <h3 className="font-semibold text-dark mb-1 line-clamp-2">
                          {product.title}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-red font-bold">
                            ${product.discountedPrice}
                          </span>
                          <span className="text-gray-400 line-through text-sm">
                            ${product.price}
                          </span>
                          <span className="text-xs text-green-600">
                            {discount}% off
                          </span>
                        </div>

                        <button
                          onClick={() =>
                            toggleFeatured(product.docId, product.featured)
                          }
                          disabled={updating}
                          className={`w-full py-2 px-4 rounded font-medium transition-colors ${
                            product.featured
                              ? "bg-green-500 text-white hover:bg-green-600"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          } disabled:opacity-50`}
                        >
                          {product.featured ? "✓ Featured" : "Set as Featured"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No active products found</p>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="font-semibold mb-2">📌 How it works:</p>
            <ul className="text-sm space-y-1">
              <li>• Click "Set as Featured" to show a product on homepage</li>
              <li>• Up to 2 featured products will display on the right side</li>
              <li>• Featured products rotate randomly each page load</li>
              <li>• You can feature as many products as you want</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
