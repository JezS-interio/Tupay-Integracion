"use client";

import { useState } from "react";

export default function PopulateBrandsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handlePopulate = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/populate-brands", {
        method: "POST",
      });

      const data = await response.json();
      setResult(data);
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
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-2">🏷️ Populate Product Brands</h1>
          <p className="text-gray-600 mb-6">
            Extract brand names from product titles and populate the brand field
          </p>

          <button
            onClick={handlePopulate}
            disabled={loading}
            className="w-full bg-teal-500 text-white py-4 px-6 rounded-lg font-bold text-lg
              hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? "🔄 Processing..." : "🏷️ Populate All Brands"}
          </button>

          {result && (
            <div
              className={`mt-6 rounded-lg p-6 ${
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
                  {result.updatedProducts && result.updatedProducts.length > 0 && (
                    <div className="bg-white rounded p-4 mb-3 max-h-96 overflow-y-auto">
                      <p className="font-semibold mb-2 text-sm">Updated Products:</p>
                      <ul className="text-sm space-y-1">
                        {result.updatedProducts.map((item: string, idx: number) => (
                          <li key={idx} className="text-gray-700">
                            {idx + 1}. {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p className="text-sm text-green-700">
                    Refresh any product detail page to see the updated brand!
                  </p>
                </div>
              ) : (
                <p className="text-red-800 font-semibold">
                  ❌ Error: {result.error || result.message}
                </p>
              )}
            </div>
          )}

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="font-semibold mb-2 text-sm">📌 What this does:</p>
            <ul className="text-sm space-y-1">
              <li>• Scans all products in the database</li>
              <li>• Extracts brand name from product title (usually first word)</li>
              <li>• Handles multi-word brands like "Mr. Coffee", "Black+Decker"</li>
              <li>• Updates the brand field in Firestore</li>
              <li>• Skips products that already have a brand set</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
