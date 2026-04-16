"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface Product {
  docId: string;
  id: number;
  title: string;
  category: string;
  brand: string;
  imageUrl: string;
  price: number;
  discountedPrice: number;
  description: string;
}

export default function VerifyProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [editMode, setEditMode] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedBrand, setEditedBrand] = useState("");
  const [editedCategory, setEditedCategory] = useState("");
  const [editedDescription, setEditedDescription] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/verify-products");
      const data = await response.json();

      if (data.success) {
        setProducts(data.products);
        if (data.products.length > 0) {
          const first = data.products[0];
          setEditedTitle(first.title);
          setEditedBrand(first.brand || "");
          setEditedCategory(first.category || "");
          setEditedDescription(first.description || "");
        }
      }
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const currentProduct = products[currentIndex];

  useEffect(() => {
    if (currentProduct) {
      setEditedTitle(currentProduct.title);
      setEditedBrand(currentProduct.brand || "");
      setEditedCategory(currentProduct.category || "");
      setEditedDescription(currentProduct.description || "");
      setEditMode(false);
      setResult(null);
    }
  }, [currentIndex, currentProduct]);

  const handleNext = () => {
    if (currentIndex < products.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSave = async () => {
    if (!currentProduct) return;

    setUpdating(true);
    setResult(null);

    try {
      const updates: any = {};

      if (editedTitle !== currentProduct.title) {
        updates.title = editedTitle;
      }
      if (editedBrand !== (currentProduct.brand || "")) {
        updates.brand = editedBrand;
      }
      if (editedCategory !== (currentProduct.category || "")) {
        updates.category = editedCategory;
      }
      if (editedDescription !== (currentProduct.description || "")) {
        updates.description = editedDescription;
      }

      if (Object.keys(updates).length === 0) {
        setResult({ success: true, message: "No changes to save" });
        setUpdating(false);
        return;
      }

      const response = await fetch("/api/verify-products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          docId: currentProduct.docId,
          updates,
        }),
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        const updatedProducts = [...products];
        updatedProducts[currentIndex] = {
          ...currentProduct,
          ...updates,
        };
        setProducts(updatedProducts);
        setEditMode(false);
      }
    } catch (error: any) {
      setResult({ success: false, error: error.message });
    } finally {
      setUpdating(false);
    }
  };

  const handleMarkCorrect = () => {
    setResult({ success: true, message: "Product verified ✓" });
    setTimeout(() => {
      handleNext();
    }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl">Loading products...</p>
      </div>
    );
  }

  if (!currentProduct) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl">No products found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-4">
          {/* Header with title and progress */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b">
            <h1 className="text-2xl font-bold">🔍 Product Verification</h1>
            <div className="text-base font-semibold">
              {currentIndex + 1} / {products.length}
            </div>
          </div>

          {/* Action Buttons - TOP OF PAGE */}
          <div className="mb-4 flex gap-3">
            {editMode ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={updating}
                  className="flex-1 bg-green-500 text-white py-3 px-6 rounded-lg font-bold hover:bg-green-600 disabled:opacity-50"
                >
                  {updating ? "Saving..." : "💾 Save Changes"}
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  className="flex-1 bg-gray-400 text-white py-3 px-6 rounded-lg font-bold hover:bg-gray-500"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleMarkCorrect}
                  className="flex-1 bg-green-500 text-white py-3 px-6 rounded-lg font-bold hover:bg-green-600"
                >
                  ✓ Correct - Next
                </button>
                <button
                  onClick={() => setEditMode(true)}
                  className="flex-1 bg-yellow-500 text-white py-3 px-6 rounded-lg font-bold hover:bg-yellow-600"
                >
                  ✏️ Edit Product
                </button>
              </>
            )}
          </div>

          {/* Result Message */}
          {result && (
            <div
              className={`mb-4 p-3 rounded-lg text-sm font-semibold ${
                result.success
                  ? "bg-green-100 text-green-800 border border-green-400"
                  : "bg-red-100 text-red-800 border border-red-400"
              }`}
            >
              {result.success ? `✅ ${result.message}` : `❌ ${result.error}`}
            </div>
          )}

          {/* Product Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Image */}
            <div>
              <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center h-80">
                <Image
                  src={currentProduct.imageUrl}
                  alt={currentProduct.title}
                  width={300}
                  height={300}
                  className="object-contain"
                />
              </div>
              <p className="text-sm text-gray-500 mt-2 text-center">
                Product ID: {currentProduct.id}
              </p>
            </div>

            {/* Right: Info */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold mb-1">Title:</label>
                {editMode ? (
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="w-full p-2 border rounded text-sm"
                  />
                ) : (
                  <p className="text-base font-medium">{currentProduct.title}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Brand:</label>
                {editMode ? (
                  <input
                    type="text"
                    value={editedBrand}
                    onChange={(e) => setEditedBrand(e.target.value)}
                    className="w-full p-2 border rounded text-sm"
                  />
                ) : (
                  <p className="text-base">{currentProduct.brand || "N/A"}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Category:</label>
                {editMode ? (
                  <input
                    type="text"
                    value={editedCategory}
                    onChange={(e) => setEditedCategory(e.target.value)}
                    className="w-full p-2 border rounded text-sm"
                  />
                ) : (
                  <p className="text-base">{currentProduct.category || "N/A"}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Description:</label>
                {editMode ? (
                  <textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    rows={3}
                    className="w-full p-2 border rounded text-sm"
                  />
                ) : (
                  <p className="text-sm text-gray-700">{currentProduct.description}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Price:</label>
                  <p className="text-base">${currentProduct.price}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Discounted:</label>
                  <p className="text-base">${currentProduct.discountedPrice}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation - Bottom */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="bg-gray-500 text-white py-2 px-6 rounded-lg font-bold hover:bg-gray-600 disabled:opacity-30"
            >
              ← Previous
            </button>

            <div className="text-gray-600 text-sm">
              Progress: {Math.round(((currentIndex + 1) / products.length) * 100)}%
            </div>

            <button
              onClick={handleNext}
              disabled={currentIndex === products.length - 1}
              className="bg-blue-500 text-white py-2 px-6 rounded-lg font-bold hover:bg-blue-600 disabled:opacity-30"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
