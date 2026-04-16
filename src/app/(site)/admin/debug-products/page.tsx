"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function DebugProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(
          collection(db, "products"),
          where("category", "==", "Computers")
        );
        const snapshot = await getDocs(q);
        const prods = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(prods);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Debug: Computer Products ({products.length})</h1>

      <div className="space-y-4">
        {products.map((product, idx) => (
          <div key={idx} className="border p-4 rounded">
            <h3 className="font-bold">{product.title}</h3>
            <p>Price: ${product.price} | Discounted: ${product.discountedPrice}</p>
            <p>Category: {product.category}</p>
            <p>IsActive: {product.isActive ? "✅" : "❌"}</p>
            <p>Has imgs: {product.imgs ? "✅" : "❌"}</p>
            {product.imgs && (
              <p>Previews count: {product.imgs.previews?.length || 0}</p>
            )}
            {product.imgs?.previews?.[0] && (
              <img src={product.imgs.previews[0]} alt="" className="w-32 h-32 object-contain mt-2" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
