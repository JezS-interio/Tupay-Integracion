"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase/config";
import { collection, getDocs, query, where, limit } from "firebase/firestore";

export default function CheckImagesPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Get some active products
        const q = query(
          collection(db, "products"),
          where("isActive", "==", true),
          limit(20)
        );
        const snapshot = await getDocs(q);
        const prods = snapshot.docs.map(doc => ({
          firestoreId: doc.id,
          ...doc.data()
        }));
        console.log("Fetched products for image check:", prods);
        setProducts(prods);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">Checking Product Images...</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Product Image Debug ({products.length} products)</h1>

      <div className="space-y-6">
        {products.map((product, idx) => {
          const hasImgs = Boolean(product.imgs);
          const hasPreviews = Boolean(product.imgs?.previews);
          const previewsCount = product.imgs?.previews?.length || 0;
          const hasImg = Boolean(product.img);
          const firstPreview = product.imgs?.previews?.[0];

          return (
            <div key={idx} className="border-2 p-6 rounded-lg bg-gray-50">
              <h3 className="font-bold text-lg mb-2">{product.title}</h3>
              <p className="text-sm text-gray-600 mb-3">
                ID: {product.id} | Firestore Doc ID: {product.firestoreId}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="font-semibold">Image Data Structure:</p>
                  <ul className="list-disc ml-6 mt-2">
                    <li>Has imgs object: {hasImgs ? "✅ Yes" : "❌ No"}</li>
                    <li>Has imgs.previews: {hasPreviews ? "✅ Yes" : "❌ No"}</li>
                    <li>Previews count: {previewsCount}</li>
                    <li>Has img field: {hasImg ? "✅ Yes" : "❌ No"}</li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold">URLs:</p>
                  <div className="mt-2 text-xs break-all">
                    {firstPreview && (
                      <div className="mb-2">
                        <strong>First preview URL:</strong>
                        <div className="bg-white p-2 rounded border mt-1">
                          {firstPreview}
                        </div>
                      </div>
                    )}
                    {product.img && (
                      <div>
                        <strong>img field URL:</strong>
                        <div className="bg-white p-2 rounded border mt-1">
                          {product.img}
                        </div>
                      </div>
                    )}
                    {!firstPreview && !product.img && (
                      <div className="text-red-600 font-semibold">
                        ⚠️ NO IMAGE URLS FOUND
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Try to render the image */}
              {firstPreview && (
                <div className="mt-4">
                  <p className="font-semibold mb-2">Image Test (using img tag):</p>
                  <div className="flex gap-4">
                    <img
                      src={firstPreview}
                      alt={product.title}
                      className="w-32 h-32 object-contain border-2 bg-white"
                      onError={(e) => {
                        console.error("Image failed to load:", firstPreview);
                        e.currentTarget.style.border = "2px solid red";
                      }}
                      onLoad={() => {
                        console.log("Image loaded successfully:", firstPreview);
                      }}
                    />
                    <div className="flex-1">
                      <p className="text-xs text-gray-600">
                        If the image shows here but not on the product pages, it's a Next.js Image component issue.
                        If it doesn't show here, the URL itself is invalid.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Show all preview URLs */}
              {product.imgs?.previews && product.imgs.previews.length > 1 && (
                <details className="mt-4">
                  <summary className="cursor-pointer font-semibold">
                    All Preview URLs ({product.imgs.previews.length})
                  </summary>
                  <ul className="mt-2 space-y-1 text-xs break-all">
                    {product.imgs.previews.map((url: string, i: number) => (
                      <li key={i} className="bg-white p-2 rounded border">
                        [{i}]: {url}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
