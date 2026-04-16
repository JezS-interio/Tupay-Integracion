"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase/config";
import { collection, getDocs, query, where } from "firebase/firestore";
import Image from "next/image";

export default function CheckFeaturedPage() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      // Get featured products
      const featuredQuery = query(
        collection(db, "products"),
        where("featured", "==", true)
      );
      const featuredSnapshot = await getDocs(featuredQuery);
      const featured: any[] = [];
      featuredSnapshot.forEach((doc) => {
        featured.push({ docId: doc.id, ...doc.data() });
      });

      // Get all products
      const allSnapshot = await getDocs(collection(db, "products"));
      const all: any[] = [];
      allSnapshot.forEach((doc) => {
        all.push({ docId: doc.id, ...doc.data() });
      });

      setFeaturedProducts(featured);
      setAllProducts(all);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-2">🔍 Debug Featured Products</h1>
          <p className="text-gray-600 mb-6">
            Check which products are featured
          </p>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-3xl font-bold text-blue-600">
                    {allProducts.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Products</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-3xl font-bold text-green-600">
                    {featuredProducts.length}
                  </div>
                  <div className="text-sm text-gray-600">Featured Products</div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="text-3xl font-bold text-purple-600">
                    {allProducts.filter((p) => p.isActive).length}
                  </div>
                  <div className="text-sm text-gray-600">Active Products</div>
                </div>
              </div>

              {/* Featured Products */}
              <div>
                <h2 className="text-2xl font-bold mb-4">
                  Featured Products ({featuredProducts.length})
                </h2>

                {featuredProducts.length === 0 ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                    <p className="text-yellow-800 font-semibold">
                      ⚠️ No products are featured!
                    </p>
                    <p className="text-sm text-yellow-700 mt-2">
                      Go to{" "}
                      <a
                        href="/admin/auto-feature"
                        className="underline font-semibold"
                      >
                        Auto-Feature
                      </a>{" "}
                      to feature some products
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {featuredProducts.map((product) => {
                      const imageUrl =
                        product.imgs?.previews?.[0] ||
                        product.img ||
                        "/images/placeholder.png";

                      return (
                        <div
                          key={product.docId}
                          className="border-2 border-green-500 rounded-lg p-4 bg-green-50"
                        >
                          <div className="relative w-full h-32 mb-3 bg-white rounded">
                            <Image
                              src={imageUrl}
                              alt={product.title || "Product"}
                              fill
                              className="object-contain"
                            />
                          </div>
                          <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                            {product.title}
                          </h3>
                          <p className="text-xs text-gray-600">
                            ID: {product.id}
                          </p>
                          <p className="text-sm font-bold text-green-600 mt-1">
                            ${product.discountedPrice} (was ${product.price})
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Refresh Button */}
              <button
                onClick={loadProducts}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700"
              >
                🔄 Refresh
              </button>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="font-semibold mb-2">📌 How featured products work:</p>
                <ul className="text-sm space-y-1">
                  <li>• Products must have <code className="bg-white px-1 rounded">featured: true</code></li>
                  <li>• Products must have <code className="bg-white px-1 rounded">isActive: true</code></li>
                  <li>• Homepage shows 2 random featured products on the right</li>
                  <li>• If you see products here, try hard refresh on homepage (Ctrl+Shift+R)</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
