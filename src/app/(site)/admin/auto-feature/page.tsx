"use client";

import { useState } from "react";

export default function AutoFeaturePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAutoFeature = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/auto-feature-products", {
        method: "POST",
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        console.log("✅ Featured products:", data.products);
      }
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-2">⭐ Auto-Feature Products</h1>
          <p className="text-gray-600 mb-6">
            Automatically select random products to feature on homepage
          </p>

          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p className="font-semibold mb-2">📌 What this does:</p>
              <ul className="text-sm space-y-1">
                <li>• Picks 8 random products from your store</li>
                <li>• Marks them as "featured"</li>
                <li>• They'll appear on homepage right side</li>
                <li>• 2 featured products show randomly each page load</li>
              </ul>
            </div>

            <button
              onClick={handleAutoFeature}
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-4 px-6 rounded-lg font-bold text-lg
                hover:from-yellow-500 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed
                transition-all shadow-lg"
            >
              {loading ? "⏳ Selecting Products..." : "⭐ Auto-Feature 8 Products"}
            </button>

            {result && (
              <div
                className={`rounded-lg p-6 ${
                  result.success
                    ? "bg-green-100 border border-green-400"
                    : "bg-red-100 border border-red-400"
                }`}
              >
                {result.success ? (
                  <div>
                    <p className="text-green-800 font-semibold mb-3">
                      ✅ {result.message}
                    </p>
                    <div className="bg-white rounded p-4">
                      <p className="font-semibold mb-2 text-sm">Featured Products:</p>
                      <ul className="text-sm space-y-1">
                        {result.products.map((p: any, idx: number) => (
                          <li key={idx} className="text-gray-700">
                            {idx + 1}. {p.title} - ${p.price}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <p className="text-sm text-green-700 mt-4">
                      Go to{" "}
                      <a href="/" className="underline font-semibold">
                        Homepage
                      </a>{" "}
                      to see them!
                    </p>
                  </div>
                ) : (
                  <p className="text-red-800 font-semibold">
                    ❌ Error: {result.error || result.message}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
