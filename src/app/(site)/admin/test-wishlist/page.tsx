"use client";

import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch, useAppSelector } from "@/redux/store";
import {
  addItemToWishlistAsync,
  removeItemFromWishlistAsync,
  loadWishlist
} from "@/redux/features/wishlist-slice";
import { getSessionId } from "@/lib/firebase/wishlist";

export default function TestWishlistPage() {
  const [sessionId, setSessionId] = useState("");
  const [result, setResult] = useState<any>(null);
  const dispatch = useDispatch<AppDispatch>();
  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);

  useEffect(() => {
    const id = getSessionId();
    setSessionId(id);
  }, []);

  const handleTestAdd = async () => {
    try {
      setResult({ loading: true });

      const testProduct = {
        id: 999999,
        title: "Test Product",
        price: 100,
        discountedPrice: 80,
        quantity: 1,
        status: "available",
        imgs: {
          previews: ["/images/placeholder.png"],
        },
      };

      await dispatch(addItemToWishlistAsync(testProduct)).unwrap();

      setResult({
        success: true,
        message: "Product added successfully!",
      });
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message || "Unknown error",
      });
    }
  };

  const handleTestLoad = async () => {
    try {
      setResult({ loading: true });
      await dispatch(loadWishlist()).unwrap();
      setResult({
        success: true,
        message: "Wishlist loaded successfully!",
      });
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message || "Unknown error",
      });
    }
  };

  const handleTestRemove = async () => {
    try {
      setResult({ loading: true });
      await dispatch(removeItemFromWishlistAsync(999999)).unwrap();
      setResult({
        success: true,
        message: "Product removed successfully!",
      });
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message || "Unknown error",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-6">🧪 Wishlist Debug Tool</h1>

          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-semibold mb-2">Session ID:</p>
            <p className="text-xs font-mono break-all">{sessionId || "Loading..."}</p>
          </div>

          <div className="mb-6 p-4 bg-purple-50 rounded-lg">
            <p className="text-sm font-semibold mb-2">Current Wishlist Items:</p>
            <p className="text-lg font-bold">{wishlistItems.length} items</p>
            {wishlistItems.length > 0 && (
              <ul className="mt-2 text-sm">
                {wishlistItems.map((item) => (
                  <li key={item.id} className="text-gray-700">
                    {item.id} - {item.title}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-4 mb-6">
            <button
              onClick={handleTestAdd}
              className="w-full bg-green-500 text-white py-3 px-6 rounded-lg font-bold hover:bg-green-600"
            >
              ➕ Test Add to Wishlist
            </button>

            <button
              onClick={handleTestLoad}
              className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-bold hover:bg-blue-600"
            >
              🔄 Test Load Wishlist
            </button>

            <button
              onClick={handleTestRemove}
              className="w-full bg-red-500 text-white py-3 px-6 rounded-lg font-bold hover:bg-red-600"
            >
              ❌ Test Remove from Wishlist
            </button>
          </div>

          {result && (
            <div
              className={`p-6 rounded-lg ${
                result.loading
                  ? "bg-gray-100"
                  : result.success
                  ? "bg-green-100 border border-green-400"
                  : "bg-red-100 border border-red-400"
              }`}
            >
              {result.loading ? (
                <p className="text-gray-800 font-semibold">⏳ Processing...</p>
              ) : result.success ? (
                <p className="text-green-800 font-semibold">✅ {result.message}</p>
              ) : (
                <div>
                  <p className="text-red-800 font-semibold mb-2">
                    ❌ Error: {result.error}
                  </p>
                  <p className="text-xs text-red-600">Check browser console for details</p>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="font-semibold text-sm mb-2">🔍 Debugging Checklist:</p>
            <ul className="text-sm space-y-1">
              <li>✓ Firestore rules updated?</li>
              <li>✓ Browser console has no errors?</li>
              <li>✓ Firebase config is correct?</li>
              <li>✓ Check Firestore console for "wishlists" collection</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
